<?php

namespace App\Console\Commands\Scheduled;

use App\Models\Subscription;
use App\Services\Brevo\BrevoLifecycleEmailService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class SendTrialEndingEmails extends Command
{
    protected $signature = 'brevo:send-trial-ending-emails';

    protected $description = 'Send trial ending reminder emails for subscriptions nearing the end of their trial.';

    public function __construct(private readonly BrevoLifecycleEmailService $emails)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $sent = 0;

        Subscription::query()
            ->with(['user', 'plan'])
            ->whereIn('status', ['trialing', 'trial'])
            ->whereNotNull('current_period_ends_at')
            ->get()
            ->each(function (Subscription $subscription) use (&$sent): void {
                $user = $subscription->user;

                if ($user === null) {
                    return;
                }

                $daysRemaining = CarbonImmutable::now()->startOfDay()->diffInDays(
                    CarbonImmutable::instance($subscription->current_period_ends_at)->startOfDay(),
                    false,
                );

                if ($daysRemaining !== 3 || $this->alreadySentForDaysRemaining($subscription, $daysRemaining)) {
                    return;
                }

                $this->emails->sendTrialEnding($user, $subscription, $daysRemaining);
                $this->markSent($subscription, $daysRemaining);
                $sent++;
            });

        $this->info(sprintf('Sent %d trial ending reminder(s).', $sent));

        return self::SUCCESS;
    }

    private function alreadySentForDaysRemaining(Subscription $subscription, int $daysRemaining): bool
    {
        return filled(data_get($subscription->metadata, "brevo.trial_ending_sent.{$daysRemaining}"));
    }

    private function markSent(Subscription $subscription, int $daysRemaining): void
    {
        $metadata = $subscription->metadata ?? [];
        data_set($metadata, "brevo.trial_ending_sent.{$daysRemaining}", now()->toIso8601String());

        $subscription->forceFill([
            'metadata' => $metadata,
        ])->save();
    }
}
