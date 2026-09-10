<?php

namespace App\Console\Commands\Scheduled;

use App\Models\ManagedCouponRedemption;
use App\Models\Subscription;
use App\Services\Brevo\BrevoLifecycleEmailService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class SendTrialEndingEmails extends Command
{
    private const REMINDER_DAYS = [3, 1];

    protected $signature = 'brevo:send-trial-ending-emails';

    protected $description = 'Send trial ending reminder emails for subscriptions nearing the end of their trial.';

    public function __construct(private readonly BrevoLifecycleEmailService $emails)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $sent = 0;
        [$noCardSubscriptionIds, $noCardUserIds] = $this->noCardTrialKeys();

        Subscription::query()
            ->with(['user', 'plan'])
            ->whereIn('status', ['trialing', 'trial'])
            ->whereNotNull('trial_ends_at')
            ->get()
            ->each(function (Subscription $subscription) use (&$sent, $noCardSubscriptionIds, $noCardUserIds): void {
                $user = $subscription->user;

                if ($user === null) {
                    return;
                }

                $daysRemaining = CarbonImmutable::now()->startOfDay()->diffInDays(
                    CarbonImmutable::instance($subscription->trial_ends_at)->startOfDay(),
                    false,
                );

                if (! in_array($daysRemaining, self::REMINDER_DAYS, true) || $this->alreadySentForDaysRemaining($subscription, $daysRemaining)) {
                    return;
                }

                if ($this->isNoCardTrial($subscription, $noCardSubscriptionIds, $noCardUserIds)) {
                    if ($this->emails->sendNoCardTrialEnding($user, $subscription, $daysRemaining)) {
                        $this->markSent($subscription, $daysRemaining, 'no_cc_trial_ending_sent');
                        $sent++;
                    }
                } else {
                    if ($this->emails->sendTrialEnding($user, $subscription, $daysRemaining)) {
                        $this->markSent($subscription, $daysRemaining);
                        $sent++;
                    }
                }
            });

        $this->info(sprintf('Sent %d trial ending reminder(s).', $sent));

        return self::SUCCESS;
    }

    private function alreadySentForDaysRemaining(Subscription $subscription, int $daysRemaining): bool
    {
        return filled(data_get($subscription->metadata, "brevo.trial_ending_sent.{$daysRemaining}"))
            || filled(data_get($subscription->metadata, "brevo.no_cc_trial_ending_sent.{$daysRemaining}"));
    }

    private function markSent(Subscription $subscription, int $daysRemaining, string $key = 'trial_ending_sent'): void
    {
        $metadata = $subscription->metadata ?? [];
        data_set($metadata, "brevo.{$key}.{$daysRemaining}", now()->toIso8601String());

        $subscription->forceFill([
            'metadata' => $metadata,
        ])->save();
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
     * Coupon-originated no-card trials can be identified either by the Stripe
     * subscription id recorded on redemption finalization or, as a fallback,
     * the redeemed user id.
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
