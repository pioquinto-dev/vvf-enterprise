<?php

use App\Models\Subscription;
use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Subscription::query()
            ->whereIn('status', ['trialing', 'trial'])
            ->whereNotNull('trial_started_at')
            ->each(function (Subscription $subscription): void {
                $trialStartedAt = $subscription->trial_started_at;

                if ($trialStartedAt === null) {
                    return;
                }

                $subscription->forceFill([
                    'trial_ends_at' => CarbonImmutable::instance($trialStartedAt)->addDays(8),
                    'current_period_ends_at' => $subscription->status === 'trialing'
                        ? CarbonImmutable::instance($trialStartedAt)->addDays(8)
                        : $subscription->current_period_ends_at,
                ])->save();
            });
    }

    public function down(): void
    {
        Subscription::query()
            ->whereIn('status', ['trialing', 'trial'])
            ->whereNotNull('trial_started_at')
            ->each(function (Subscription $subscription): void {
                $trialStartedAt = $subscription->trial_started_at;

                if ($trialStartedAt === null) {
                    return;
                }

                $subscription->forceFill([
                    'trial_ends_at' => CarbonImmutable::instance($trialStartedAt)->addDays(7),
                    'current_period_ends_at' => $subscription->status === 'trialing'
                        ? CarbonImmutable::instance($trialStartedAt)->addDays(7)
                        : $subscription->current_period_ends_at,
                ])->save();
            });
    }
};
