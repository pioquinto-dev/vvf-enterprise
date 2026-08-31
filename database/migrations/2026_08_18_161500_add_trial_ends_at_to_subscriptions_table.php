<?php

use App\Models\Subscription;
use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->timestamp('trial_ends_at')->nullable()->after('trial_started_at');
        });

        Subscription::query()
            ->where('status', 'trialing')
            ->whereNotNull('trial_started_at')
            ->whereNull('trial_ends_at')
            ->each(function (Subscription $subscription): void {
                $trialStartedAt = $subscription->trial_started_at;

                if ($trialStartedAt === null) {
                    return;
                }

                $subscription->forceFill([
                    'trial_ends_at' => CarbonImmutable::instance($trialStartedAt)->addDays(7),
                ])->save();
            });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table): void {
            $table->dropColumn('trial_ends_at');
        });
    }
};
