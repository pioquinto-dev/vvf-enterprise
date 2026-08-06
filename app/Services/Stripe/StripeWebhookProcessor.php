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
        $periodStart = $this->timestampToCarbon(data_get($payload, 'current_period_start'));
        $periodEnd = $this->timestampToCarbon(data_get($payload, 'current_period_end'));

        $subscription->forceFill([
            'stripe_customer_id' => $customerId,
            'stripe_subscription_id' => $subscriptionId,
            'status' => $status,
            'current_period_starts_at' => $periodStart,
            'current_period_ends_at' => $periodEnd,
            'canceled_at' => $status === 'canceled' ? now() : null,
            'metadata' => [
                'plan_slug' => $plan->slug,
                'searchCreditsLimit' => (int) data_get($subscription->metadata, 'searchCreditsLimit', data_get($plan->metadata, 'searchCreditsLimit', 0)),
                'searchCreditsUsed' => (int) data_get($subscription->metadata, 'searchCreditsUsed', 0),
                'bookmarkLimit' => (int) data_get($subscription->metadata, 'bookmarkLimit', data_get($plan->metadata, 'bookmarkLimit', 0)),
                'bookmarksUsed' => (int) data_get($subscription->metadata, 'bookmarksUsed', 0),
            ],
        ])->save();

        if ($status === 'active' && $periodEnd !== null) {
            $user->forceFill([
                'current_plan_slug' => $plan->slug,
                'plan_renews_at' => $periodEnd,
            ])->save();

            $this->billing->syncSubscriptionUsage($user, $plan);
        }

        if (in_array($status, ['canceled', 'unpaid', 'incomplete_expired'], true)) {
            $user->forceFill([
                'current_plan_slug' => 'free',
                'monthly_credits_remaining' => max(0, $user->monthly_credits_remaining),
                'plan_renews_at' => null,
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
