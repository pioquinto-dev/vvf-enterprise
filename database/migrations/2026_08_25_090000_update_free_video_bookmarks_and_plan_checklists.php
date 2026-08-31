<?php

use App\Models\PricingPlan;
use App\Models\Subscription;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PricingPlan::query()->where('slug', 'free')->update([
            'features' => [
                '1 free search',
                'Unlimited video bookmarks',
                '0 search bookmarks',
                '0 video analysis',
            ],
            'metadata' => [
                'settings' => [
                    'cta' => 'Run a free search',
                    'popular' => false,
                ],
                'subscription' => [
                    'trialEnabled' => true,
                    'search_limits' => ['used' => 0, 'limit' => 1],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => -1],
                    'search_bookmarks' => ['used' => 0, 'limit' => 0],
                    'video_analysis' => ['used' => 0, 'limit' => 0],
                ],
            ],
        ]);

        PricingPlan::query()->where('slug', 'basic')->update([
            'features' => [
                '150 searches',
                '50 search bookmarks',
                '50 viral video bookmarks',
                '50 video analysis',
                'Weekly + monthly scheduling',
                'Virality alerts',
            ],
        ]);

        PricingPlan::query()->where('slug', 'premium')->update([
            'features' => [
                '400 searches',
                'Unlimited search bookmarks',
                'Unlimited viral video bookmarks',
                'Unlimited video analysis',
                'Weekly + monthly scheduling',
                'Virality alerts',
            ],
        ]);

        Subscription::query()
            ->whereHas('plan', fn ($query) => $query->where('slug', 'free'))
            ->get()
            ->each(function (Subscription $subscription): void {
                $metadata = (array) $subscription->metadata;

                data_set($metadata, 'subscription.viral_video_bookmarks.limit', -1);
                data_set($metadata, 'subscription.search_limits.limit', max(0, (int) data_get($metadata, 'subscription.search_limits.limit', 1)));
                data_set($metadata, 'subscription.search_bookmarks.limit', max(0, (int) data_get($metadata, 'subscription.search_bookmarks.limit', 0)));
                data_set($metadata, 'subscription.video_analysis.limit', max(0, (int) data_get($metadata, 'subscription.video_analysis.limit', 0)));

                $subscription->forceFill([
                    'metadata' => $metadata,
                ])->save();
            });
    }

    public function down(): void
    {
        PricingPlan::query()->where('slug', 'free')->update([
            'features' => [
                '1 free search',
                '0 video bookmarks',
                '0 search bookmarks',
                '0 video analysis',
            ],
            'metadata' => [
                'settings' => [
                    'cta' => 'Run a free search',
                    'popular' => false,
                ],
                'subscription' => [
                    'trialEnabled' => true,
                    'search_limits' => ['used' => 0, 'limit' => 1],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 0],
                    'search_bookmarks' => ['used' => 0, 'limit' => 0],
                    'video_analysis' => ['used' => 0, 'limit' => 0],
                ],
            ],
        ]);

        PricingPlan::query()->where('slug', 'basic')->update([
            'features' => [
                '150 searches',
                '50 search bookmarks',
                '50 viral video bookmarks',
                '50 video analysis',
                'Weekly + monthly scheduling',
                'CSV export for reports',
                'Virality alerts',
            ],
        ]);

        PricingPlan::query()->where('slug', 'premium')->update([
            'features' => [
                '400 searches',
                'Unlimited search bookmarks',
                'Unlimited viral video bookmarks',
                'Unlimited video analysis',
                'Weekly + monthly scheduling',
                'Virality alerts',
                'CSV export for reports',
            ],
        ]);

        Subscription::query()
            ->whereHas('plan', fn ($query) => $query->where('slug', 'free'))
            ->get()
            ->each(function (Subscription $subscription): void {
                $metadata = (array) $subscription->metadata;
                data_set($metadata, 'subscription.viral_video_bookmarks.limit', 0);

                $subscription->forceFill([
                    'metadata' => $metadata,
                ])->save();
            });
    }
};
