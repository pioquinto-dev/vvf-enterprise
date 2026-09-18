<?php

namespace App\Services\Lifecycle\Flows;

use App\Models\ManagedCouponRedemption;
use App\Models\Subscription;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Lifecycle\LifecycleCandidate;
use App\Services\Lifecycle\LifecycleFlow;
use Carbon\CarbonImmutable;

/**
 * Trial-ending reminders, ported off the standalone cron onto the shared
 * dispatcher. The behaviour is unchanged — the same reminder days, the same
 * coupon no-card branch — but dedupe now lives in email_sends rather than in
 * subscriptions.metadata, so it works the same way as every later flow.
 */
class TrialEndingFlow implements LifecycleFlow
{
    /** Days before trial end that earn a reminder. */
    private const REMINDER_DAYS = [3, 1];

    public function __construct(private readonly BrevoLifecycleEmailService $emails) {}

    public function name(): string
    {
        return 'trial_ending';
    }

    /**
     * @return iterable<LifecycleCandidate>
     */
    public function due(): iterable
    {
        [$noCardSubscriptionIds, $noCardUserIds] = $this->noCardTrialKeys();

        $subscriptions = Subscription::query()
            ->with(['user', 'plan'])
            ->whereIn('status', ['trialing', 'trial'])
            ->whereNotNull('trial_ends_at')
            ->get();

        foreach ($subscriptions as $subscription) {
            $user = $subscription->user;

            if ($user === null) {
                continue;
            }

            $daysRemaining = (int) CarbonImmutable::now()->startOfDay()->diffInDays(
                CarbonImmutable::instance($subscription->trial_ends_at)->startOfDay(),
                false,
            );

            if (! in_array($daysRemaining, self::REMINDER_DAYS, true)) {
                continue;
            }

            $noCard = $this->isNoCardTrial($subscription, $noCardSubscriptionIds, $noCardUserIds);

            yield new LifecycleCandidate(
                // The slot is claimed under the flow, not the variant it picks.
                // The no-card branch depends on coupon state that can change
                // between runs, so claiming per template would let the same
                // reminder go out twice — once under each key.
                flowKey: 'trial_ending',
                dedupeKey: "subscription:{$subscription->id}:d{$daysRemaining}",
                user: $user,
                send: fn (): bool => $noCard
                    ? $this->emails->sendNoCardTrialEnding($user, $subscription, $daysRemaining)
                    : $this->emails->sendTrialEnding($user, $subscription, $daysRemaining),
                templateKey: $noCard ? 'trial_ending_no_cc' : 'trial_ending_cc',
                context: [
                    'subscription_id' => $subscription->id,
                    'plan_id' => $subscription->plan_id,
                    'days_remaining' => $daysRemaining,
                    'no_card' => $noCard,
                ],
            );
        }
    }

    /**
     * @return array{0: array<int, string>, 1: array<int, int>}
     */
    private function noCardTrialKeys(): array
    {
        $redemptions = ManagedCouponRedemption::query()
            ->whereNotNull('redeemed_at')
            ->whereHas('program', fn ($query) => $query->where('collect_payment_method', false))
            ->get(['user_id', 'stripe_subscription_id']);

        return [
            $redemptions->pluck('stripe_subscription_id')->filter()->unique()->values()->all(),
            $redemptions->pluck('user_id')->filter()->map(fn ($id): int => (int) $id)->unique()->values()->all(),
        ];
    }

    /**
     * Coupon-originated no-card trials are identified by the Stripe
     * subscription id recorded on redemption finalization, or the redeemed
     * user id as a fallback.
     *
     * @param  array<int, string>  $subscriptionIds
     * @param  array<int, int>  $userIds
     */
    private function isNoCardTrial(Subscription $subscription, array $subscriptionIds, array $userIds): bool
    {
        return ($subscription->stripe_subscription_id !== null && in_array($subscription->stripe_subscription_id, $subscriptionIds, true))
            || in_array((int) $subscription->user_id, $userIds, true);
    }
}
