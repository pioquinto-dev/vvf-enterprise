<?php

namespace App\Services\Stripe;

use App\Models\CustomKeywordSearch;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Billing\BillingService;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Support\AppEventLogger;
use Carbon\CarbonImmutable;
use Stripe\Event;

class StripeWebhookProcessor
{
    public function __construct(
        private readonly BillingService $billing,
        private readonly BrevoLifecycleEmailService $emails,
        private readonly ?UserActivityService $activity = null,
    ) {}

    public function handle(Event $event): void
    {
        AppEventLogger::result('billing.webhook.received', [
            'event_id' => (string) ($event->id ?? ''),
            'event_type' => (string) $event->type,
        ]);

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
            AppEventLogger::error('billing.webhook.checkout_completed.invalid_payload', 'Missing checkout session metadata.', [
                'event_id' => (string) ($event->id ?? ''),
                'user_id' => $userId,
                'stripe_checkout_session_id' => $sessionId,
            ]);

            return;
        }

        $user = User::query()->find($userId);

        if ($user === null) {
            AppEventLogger::error('billing.webhook.checkout_completed.user_missing', 'Checkout webhook user was not found.', [
                'event_id' => (string) ($event->id ?? ''),
                'user_id' => $userId,
                'stripe_checkout_session_id' => $sessionId,
            ]);

            return;
        }

        $this->billing->finalizeCheckout($user, $sessionId);

        AppEventLogger::result('billing.webhook.checkout_completed', [
            'event_id' => (string) ($event->id ?? ''),
            'user_id' => $user->id,
            'stripe_checkout_session_id' => $sessionId,
        ]);
    }

    private function handleInvoicePaid(Event $event): void
    {
        $invoice = $event->data->object;
        $subscriptionId = (string) ($invoice->subscription ?? '');

        if ($subscriptionId === '') {
            AppEventLogger::error('billing.webhook.invoice_paid.invalid_payload', 'Invoice webhook is missing a subscription id.', [
                'event_id' => (string) ($event->id ?? ''),
            ]);

            return;
        }

        $subscription = Subscription::query()->where('stripe_subscription_id', $subscriptionId)->first();

        if ($subscription === null) {
            AppEventLogger::error('billing.webhook.invoice_paid.subscription_missing', 'Invoice paid subscription was not found.', [
                'event_id' => (string) ($event->id ?? ''),
                'stripe_subscription_id' => $subscriptionId,
            ]);

            return;
        }

        $subscription->forceFill(['status' => 'active'])->save();

        AppEventLogger::result('billing.webhook.invoice_paid', [
            'event_id' => (string) ($event->id ?? ''),
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'stripe_subscription_id' => $subscriptionId,
        ]);
    }

    private function handleInvoicePaymentFailed(Event $event): void
    {
        $invoice = $event->data->object;
        $subscriptionId = (string) ($invoice->subscription ?? '');

        if ($subscriptionId === '') {
            AppEventLogger::error('billing.webhook.invoice_payment_failed.invalid_payload', 'Invoice payment failed webhook is missing a subscription id.', [
                'event_id' => (string) ($event->id ?? ''),
            ]);

            return;
        }

        $subscription = Subscription::query()->where('stripe_subscription_id', $subscriptionId)->first();

        if ($subscription === null) {
            AppEventLogger::error('billing.webhook.invoice_payment_failed.subscription_missing', 'Invoice payment failed subscription was not found.', [
                'event_id' => (string) ($event->id ?? ''),
                'stripe_subscription_id' => $subscriptionId,
            ]);

            return;
        }

        $subscription->forceFill(['status' => 'past_due'])->save();

        AppEventLogger::result('billing.webhook.invoice_payment_failed', [
            'event_id' => (string) ($event->id ?? ''),
            'subscription_id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'stripe_subscription_id' => $subscriptionId,
        ]);
    }

    private function handleSubscriptionEvent(Event $event): void
    {
        $payload = $event->data->object;
        $subscriptionId = (string) ($payload->id ?? '');
        $customerId = (string) ($payload->customer ?? '');

        if ($subscriptionId === '' || $customerId === '') {
            AppEventLogger::error('billing.webhook.subscription_event.invalid_payload', 'Subscription webhook is missing identifiers.', [
                'event_id' => (string) ($event->id ?? ''),
                'event_type' => (string) $event->type,
                'stripe_subscription_id' => $subscriptionId,
                'stripe_customer_id' => $customerId,
            ]);

            return;
        }

        $subscription = Subscription::query()
            ->where('stripe_subscription_id', $subscriptionId)
            ->orWhere('stripe_customer_id', $customerId)
            ->first();

        if ($subscription === null) {
            AppEventLogger::error('billing.webhook.subscription_event.subscription_missing', 'Subscription webhook could not find a matching subscription.', [
                'event_id' => (string) ($event->id ?? ''),
                'event_type' => (string) $event->type,
                'stripe_subscription_id' => $subscriptionId,
                'stripe_customer_id' => $customerId,
            ]);

            return;
        }

        $user = $subscription->user;
        $plan = $subscription->plan;

        if ($user === null || $plan === null) {
            AppEventLogger::error('billing.webhook.subscription_event.related_records_missing', 'Subscription webhook is missing its related user or plan.', [
                'event_id' => (string) ($event->id ?? ''),
                'event_type' => (string) $event->type,
                'subscription_id' => $subscription->id,
                'user_missing' => $user === null,
                'plan_missing' => $plan === null,
            ]);

            return;
        }

        $status = (string) ($payload->status ?? $subscription->status);
        $previousStatus = (string) ($subscription->status ?? '');
        $previousPeriodEnd = $subscription->current_period_ends_at;
        $periodStart = $this->timestampToCarbon(data_get($payload, 'current_period_start'));
        $periodEnd = $this->timestampToCarbon(data_get($payload, 'current_period_end'));
        $trialEnd = $status === 'trialing'
            ? ($this->timestampToCarbon(data_get($payload, 'trial_end'))
                ?? ($subscription->trial_started_at !== null
                    ? CarbonImmutable::instance($subscription->trial_started_at)->addDays(7)
                    : ($periodStart?->addDays(7))))
            : $subscription->trial_ends_at;
        $limits = $this->billing->limitsFor($plan);
        $renewed = $periodEnd !== null
            && ($previousPeriodEnd === null || $periodEnd->greaterThan(CarbonImmutable::instance($previousPeriodEnd)));

        $searchUsed = $renewed ? 0 : (int) data_get($subscription->metadata, 'subscription.search_limits.used', 0);
        $videoBookmarksUsed = $renewed ? 0 : $this->billing->videoBookmarkCount($user);
        $searchBookmarksUsed = CustomKeywordSearch::query()
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
            'trial_ends_at' => $status === 'trialing' ? $trialEnd : $subscription->trial_ends_at,
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

        if ($status === 'trialing' && $previousStatus !== 'trialing') {
            $this->activity?->record($user, 'regular_trial', 'trial_started', "Started a trial on {$plan->name}.", ['plan' => $plan->slug], 'stripe:'.(string) $event->id.':trial');
        }
        if (in_array($status, ['active', 'paid'], true) && ! in_array($previousStatus, ['active', 'paid'], true)) {
            $this->activity?->record($user, 'paid', 'subscription_paid', "Started a paid subscription on {$plan->name}.", ['plan' => $plan->slug], 'stripe:'.(string) $event->id.':paid');
        }
        if (in_array($status, ['canceled', 'unpaid', 'incomplete_expired'], true) && ! in_array($previousStatus, ['canceled', 'unpaid', 'incomplete_expired'], true)) {
            $this->activity?->record($user, 'cancelled', 'subscription_cancelled', 'Subscription was cancelled.', ['plan' => $plan->slug], 'stripe:'.(string) $event->id.':cancelled');
        }

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

            if (! in_array($previousStatus, ['canceled', 'unpaid', 'incomplete_expired'], true)) {
                $this->emails->sendSubscriptionCanceled($user, $subscription);
            }
        }

        AppEventLogger::result('billing.webhook.subscription_updated', [
            'event_id' => (string) ($event->id ?? ''),
            'event_type' => (string) $event->type,
            'subscription_id' => $subscription->id,
            'user_id' => $user->id,
            'plan_slug' => $plan->slug,
            'status' => $status,
            'renewed' => $renewed,
            'current_period_starts_at' => $periodStart?->toIso8601String(),
            'current_period_ends_at' => $periodEnd?->toIso8601String(),
        ]);
    }

    private function timestampToCarbon(mixed $timestamp): ?CarbonImmutable
    {
        if (! is_numeric($timestamp)) {
            return null;
        }

        return CarbonImmutable::createFromTimestampUTC((int) $timestamp);
    }
}
