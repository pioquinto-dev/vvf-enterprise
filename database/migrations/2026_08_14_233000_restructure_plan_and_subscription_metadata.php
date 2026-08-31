<?php

use App\Models\PricingPlan;
use App\Models\Subscription;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PricingPlan::query()->get()->each(function (PricingPlan $plan): void {
            $metadata = (array) ($plan->metadata ?? []);

            $settings = [
                'cta' => (string) data_get($metadata, 'settings.cta', data_get($metadata, 'cta', 'Choose plan')),
                'popular' => (bool) data_get($metadata, 'settings.popular', data_get($metadata, 'popular', false)),
            ];

            $subscription = [
                'trialEnabled' => (bool) data_get($metadata, 'subscription.trialEnabled', data_get($metadata, 'trialEnabled', false)),
                'search_limits' => [
                    'used' => (int) data_get($metadata, 'subscription.search_limits.used', data_get($metadata, 'searchCreditsUsed', 0)),
                    'limit' => (int) data_get($metadata, 'subscription.search_limits.limit', data_get($metadata, 'searchCreditsLimit', 0)),
                ],
                'viral_video_bookmarks' => [
                    'used' => (int) data_get($metadata, 'subscription.viral_video_bookmarks.used', data_get($metadata, 'bookmarksUsed', 0)),
                    'limit' => (int) data_get($metadata, 'subscription.viral_video_bookmarks.limit', data_get($metadata, 'bookmarkLimit', 0)),
                ],
                'search_bookmarks' => [
                    'used' => (int) data_get($metadata, 'subscription.search_bookmarks.used', data_get($metadata, 'bookmarksUsed', 0)),
                    'limit' => (int) data_get($metadata, 'subscription.search_bookmarks.limit', data_get($metadata, 'bookmarkLimit', 0)),
                ],
                'video_analysis' => [
                    'used' => (int) data_get($metadata, 'subscription.video_analysis.used', 0),
                    'limit' => (int) data_get($metadata, 'subscription.video_analysis.limit', 0),
                ],
            ];

            $plan->forceFill([
                'metadata' => [
                    'settings' => $settings,
                    'subscription' => $subscription,
                ],
            ])->save();
        });

        Subscription::query()->with('plan')->get()->each(function (Subscription $subscription): void {
            $planMetadata = (array) ($subscription->plan?->metadata ?? []);
            $currentMetadata = (array) ($subscription->metadata ?? []);

            $settings = (array) data_get($planMetadata, 'settings', []);
            $planSubscription = (array) data_get($planMetadata, 'subscription', []);

            $subscription->forceFill([
                'metadata' => [
                    'plan_slug' => $subscription->plan?->slug,
                    'settings' => $settings,
                    'subscription' => [
                        'trialEnabled' => (bool) data_get($planSubscription, 'trialEnabled', data_get($currentMetadata, 'trialEnabled', false)),
                        'search_limits' => [
                            'used' => (int) data_get($currentMetadata, 'subscription.search_limits.used', data_get($currentMetadata, 'searchCreditsUsed', 0)),
                            'limit' => (int) data_get($planSubscription, 'search_limits.limit', data_get($currentMetadata, 'searchCreditsLimit', 0)),
                        ],
                        'viral_video_bookmarks' => [
                            'used' => (int) data_get($currentMetadata, 'subscription.viral_video_bookmarks.used', data_get($currentMetadata, 'bookmarksUsed', 0)),
                            'limit' => (int) data_get($planSubscription, 'viral_video_bookmarks.limit', data_get($currentMetadata, 'bookmarkLimit', 0)),
                        ],
                        'search_bookmarks' => [
                            'used' => (int) data_get($currentMetadata, 'subscription.search_bookmarks.used', data_get($currentMetadata, 'bookmarksUsed', 0)),
                            'limit' => (int) data_get($planSubscription, 'search_bookmarks.limit', data_get($currentMetadata, 'bookmarkLimit', 0)),
                        ],
                        'video_analysis' => [
                            'used' => (int) data_get($currentMetadata, 'subscription.video_analysis.used', 0),
                            'limit' => (int) data_get($planSubscription, 'video_analysis.limit', 0),
                        ],
                    ],
                ],
            ])->save();
        });
    }

    public function down(): void
    {
        // One-way data migration.
    }
};
