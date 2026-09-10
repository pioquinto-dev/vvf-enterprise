<?php

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'monthly_credits_remaining')) {
            return;
        }

        User::query()->each(function (User $user): void {
            $statuses = $user->current_plan_slug === 'free'
                ? ['free']
                : ['active', 'trialing', 'pending', 'paid'];
            $subscription = Subscription::query()
                ->where('user_id', $user->id)
                ->whereIn('status', $statuses)
                ->orderByDesc('current_period_ends_at')
                ->first();

            if ($subscription === null) {
                $plan = PricingPlan::query()->where('slug', $user->current_plan_slug)->first();

                if ($plan === null) {
                    return;
                }

                $subscription = Subscription::query()->create([
                    'id' => (string) Str::ulid(),
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'status' => $user->current_plan_slug === 'free' ? 'free' : 'pending',
                    'current_period_starts_at' => now(),
                    'current_period_ends_at' => $user->plan_renews_at,
                    'metadata' => [
                        'plan_slug' => $plan->slug,
                        'subscription' => [
                            'search_limits' => [
                                'limit' => (int) data_get($plan->metadata, 'subscription.search_limits.limit', 0),
                                'used' => 0,
                            ],
                        ],
                    ],
                ]);
            }

            $metadata = (array) $subscription->metadata;
            $limit = (int) data_get($metadata, 'subscription.search_limits.limit', 0);
            $remaining = max(0, (int) $user->getAttribute('monthly_credits_remaining'));

            data_set($metadata, 'subscription.search_limits.used', $limit === -1 ? 0 : max(0, min($limit, $limit - $remaining)));

            $subscription->forceFill(['metadata' => $metadata])->save();
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('monthly_credits_remaining');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->unsignedInteger('monthly_credits_remaining')->default(0)->after('current_plan_slug');
        });
    }
};
