<?php

namespace App\Services\Stripe;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingService;
use Carbon\CarbonImmutable;
use Stripe\Event;

class StripeWebhookProcessor
{
    public function __construct(private readonly BillingService $billing) {}

    public function handle(Event $event): void
    {
        match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($event),
            'invoice.paid' => $this->handleInvoicePaid($event),
            'invoice.payment_failed' => $this->handleInvoicePaymentFailed($event),
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted' => $this->handleSubscriptionEvent($event),
            default => null,
        };
    }

    private function handleCheckoutCompleted(Event $event): void
    {
        $session = $event->data->object;
        $userId = (int) data_get($session, 'metadata.user_id', 0);
        $sessionId = (string) ($session->id ?? '');

        if ($userId <= 0 || $sessionId === '') {
            return;
        }

        $user = User::query()->find($userId);

        if ($user === null) {
            return;
        }

        $this->billing->finalizeCheckout($user, $sessionId);
    }

    private function handleInvoicePaid(Event $event): void
    {
        $invoice = $event->data->object;
        $subscriptionId = (string) ($invoice->subscription ?? '');

        if ($subscriptionId === '') {
            return;
        }

        $subscription = Subscription::query()->where('stripe_subscription_id', $subscriptionId)->first();

        if ($subscription === null) {
            return;
        }

        $subscription->forceFill(['status' => 'active'])->save();
    }

    private function handleInvoicePaymentFailed(Event $event): void
    {
        $invoice = $event->data->object;
        $subscriptionId = (string) ($invoice->subscription ?? '');

        if ($subscriptionId === '') {
            return;
        }

        $subscription = Subscription::query()->where('stripe_subscription_id', $subscriptionId)->first();

        if ($subscription === null) {
            return;
        }

        $subscription->forceFill(['status' => 'past_due'])->save();
    }

    private function handleSubscriptionEvent(Event $event): void
    {
        $payload = $event->data->object;
        $subscriptionId = (string) ($payload->id ?? '');
        $customerId = (string) ($payload->customer ?? '');

        if ($subscriptionId === '' || $customerId === '') {
            return;
        }

        $subscription = Subscription::query()
            ->where('stripe_subscription_id', $subscriptionId)
            ->orWhere('stripe_customer_id', $customerId)
            ->first();

        if ($subscription === null) {
            return;
        }

        $user = $subscription->user;
        $plan = $subscription->plan;

        if ($user === null || $plan === null) {
            return;
        }

        $status = (string) ($payload->status ?? $subscription->status);
        $previousStatus = (string) ($subscription->status ?? '');
        $previousPeriodEnd = $subscription->current_period_ends_at;
        $periodStart = $this->timestampToCarbon(data_get($payload, 'current_period_start'));
        $periodEnd = $this->timestampToCarbon(data_get($payload, 'current_period_end'));
        $limits = $this->billing->limitsFor($plan);
        $renewed = $periodEnd !== null
            && ($previousPeriodEnd === null || $periodEnd->greaterThan(CarbonImmutable::instance($previousPeriodEnd)));

        $searchUsed = $renewed ? 0 : (int) data_get($subscription->metadata, 'subscription.search_limits.used', 0);
        $videoBookmarksUsed = $renewed ? 0 : $this->billing->videoBookmarkCount($user);
        $searchBookmarksUsed = \App\Models\CustomKeywordSearch::query()
            ->where('user_id', $user->id)
            ->where('is_watchlisted', true)
            ->count();
        $videoAnalysisUsed = $renewed ? 0 : (int) data_get($subscription->metadata, 'subscription.video_analysis.used', 0);

        $subscription->forceFill([
            'stripe_customer_id' => $customerId,
            'stripe_subscription_id' => $subscriptionId,
            'status' => $status,
            'current_period_starts_at' => $periodStart,
            'current_period_ends_at' => $periodEnd,
            'trial_started_at' => $status === 'trialing'
                ? ($subscription->trial_started_at ?? $periodStart ?? now())
                : $subscription->trial_started_at,
            'trial_completed_at' => $previousStatus === 'trialing' && $status !== 'trialing' && $subscription->trial_completed_at === null
                ? now()
                : $subscription->trial_completed_at,
            'canceled_at' => $status === 'canceled' ? now() : null,
            'metadata' => [
                'plan_slug' => $plan->slug,
                'settings' => [
                    'cta' => (string) data_get($plan->metadata, 'settings.cta', 'Choose plan'),
                    'popular' => (bool) data_get($plan->metadata, 'settings.popular', false),
                ],
                'subscription' => [
                    'trialEnabled' => (bool) ($limits['trialEnabled'] ?? false),
                    'search_limits' => [
                        'used' => max(0, $searchUsed),
                        'limit' => (int) ($limits['searchLimit'] ?? 0),
                    ],
                    'viral_video_bookmarks' => [
                        'used' => max(0, $videoBookmarksUsed),
                        'limit' => (int) ($limits['videoBookmarkLimit'] ?? 0),
                    ],
                    'search_bookmarks' => [
                        'used' => max(0, $searchBookmarksUsed),
                        'limit' => (int) ($limits['searchBookmarkLimit'] ?? 0),
                    ],
                    'video_analysis' => [
                        'used' => max(0, $videoAnalysisUsed),
                        'limit' => (int) ($limits['videoAnalysisLimit'] ?? 0),
                    ],
                ],
            ],
        ])->save();

        if ($status === 'active' && $periodEnd !== null) {
            $user->forceFill([
                'current_plan_slug' => $plan->slug,
                'monthly_credits_remaining' => $renewed
                    ? $this->billing->searchCreditsRemaining($user) + ((int) ($limits['searchLimit'] ?? 0))
                    : $user->monthly_credits_remaining,
                'plan_renews_at' => $periodEnd,
            ])->save();

            if ($renewed) {
                $user->forceFill([
                    'monthly_credits_remaining' => max(0, (int) ($limits['searchLimit'] ?? 0)),
                ])->save();
            }

            $this->billing->syncSubscriptionUsage($user, $plan);
        }

        if (in_array($status, ['canceled', 'unpaid', 'incomplete_expired'], true)) {
            $user->forceFill([
                'current_plan_slug' => 'free',
                'monthly_credits_remaining' => 1,
                'plan_renews_at' => CarbonImmutable::now()->addMonth(),
            ])->save();
        }
    }

    private function timestampToCarbon(mixed $timestamp): ?CarbonImmutable
    {
        if (! is_numeric($timestamp)) {
            return null;
        }

        return CarbonImmutable::createFromTimestampUTC((int) $timestamp);
    }
}
