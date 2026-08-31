<?php

use App\Models\PricingPlan;
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
    }

    public function down(): void
    {
        PricingPlan::query()->where('slug', 'free')->update([
            'features' => [
                '1 free search',
                '0 watchlist slots',
                'Last 90 days',
                'Top 100 viral videos',
            ],
        ]);

        PricingPlan::query()->where('slug', 'basic')->update([
            'features' => [
                '150 searches',
                '50 watchlist slots',
                'Weekly + monthly scheduling',
                'CSV export for reports',
                'Virality alerts',
                '2 user seats',
            ],
        ]);

        PricingPlan::query()->where('slug', 'premium')->update([
            'features' => [
                '400 searches',
                'Unlimited watchlist',
                'Weekly + monthly scheduling',
                'Virality alerts',
                'CSV export for reports',
                '10 user seats',
            ],
        ]);
    }
};
