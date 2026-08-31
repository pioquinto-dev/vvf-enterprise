<?php

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingEntitlementService;
use Carbon\CarbonImmutable;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $billing = app(BillingEntitlementService::class);

        User::query()
            ->whereDoesntHave('subscriptions')
            ->each(function (User $user) use ($billing): void {
                $plan = PricingPlan::query()->where('slug', $user->current_plan_slug)->first();
                $limits = $billing->limitsForUser($user);

                Subscription::query()->create([
                    'id' => (string) Str::ulid(),
                    'user_id' => $user->id,
                    'plan_id' => $plan?->id,
                    'status' => $user->current_plan_slug === 'free' ? 'free' : 'pending',
                    'current_period_starts_at' => CarbonImmutable::now(),
                    'current_period_ends_at' => $user->plan_renews_at,
                    'metadata' => $plan === null ? null : [
                        'plan_slug' => $plan->slug,
                        'settings' => [
                            'cta' => (string) data_get($plan->metadata, 'settings.cta', 'Choose plan'),
                            'popular' => (bool) data_get($plan->metadata, 'settings.popular', false),
                        ],
                        'subscription' => [
                            'trialEnabled' => (bool) ($limits['trialEnabled'] ?? false),
                            'search_limits' => [
                                'used' => max(0, (int) ($limits['searchCreditsUsed'] ?? 1)),
                                'limit' => (int) ($limits['searchCreditsLimit'] ?? 1),
                            ],
                            'viral_video_bookmarks' => [
                                'used' => max(0, (int) ($limits['videoBookmarkUsed'] ?? 0)),
                                'limit' => (int) ($limits['videoBookmarkLimit'] ?? -1),
                            ],
                            'search_bookmarks' => [
                                'used' => max(0, (int) ($limits['searchBookmarkUsed'] ?? 0)),
                                'limit' => (int) ($limits['searchBookmarkLimit'] ?? 0),
                            ],
                            'video_analysis' => [
                                'used' => max(0, (int) ($limits['videoAnalysisUsed'] ?? 0)),
                                'limit' => (int) ($limits['videoAnalysisLimit'] ?? 0),
                            ],
                        ],
                    ],
                ]);
            });
    }

    public function down(): void
    {
        Subscription::query()
            ->whereIn('status', ['free', 'pending'])
            ->whereNull('stripe_subscription_id')
            ->whereNull('stripe_customer_id')
            ->delete();
    }
};
