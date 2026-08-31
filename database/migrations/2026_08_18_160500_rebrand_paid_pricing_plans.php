<?php

use App\Models\PricingPlan;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PricingPlan::query()->where('slug', 'basic')->update([
            'name' => 'Growth',
            'metadata' => [
                'settings' => [
                    'cta' => 'Choose Growth',
                    'popular' => true,
                ],
                'subscription' => [
                    'trialEnabled' => true,
                    'search_limits' => ['used' => 0, 'limit' => 150],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 50],
                    'search_bookmarks' => ['used' => 0, 'limit' => 50],
                    'video_analysis' => ['used' => 0, 'limit' => 50],
                ],
            ],
        ]);

        PricingPlan::query()->where('slug', 'premium')->update([
            'name' => 'Scale',
            'metadata' => [
                'settings' => [
                    'cta' => 'Choose Scale',
                    'popular' => false,
                ],
                'subscription' => [
                    'trialEnabled' => true,
                    'search_limits' => ['used' => 0, 'limit' => 400],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => -1],
                    'search_bookmarks' => ['used' => 0, 'limit' => -1],
                    'video_analysis' => ['used' => 0, 'limit' => -1],
                ],
            ],
        ]);
    }

    public function down(): void
    {
        PricingPlan::query()->where('slug', 'basic')->update([
            'name' => 'Basic',
            'metadata' => [
                'settings' => [
                    'cta' => 'Choose Basic',
                    'popular' => true,
                ],
                'subscription' => [
                    'trialEnabled' => true,
                    'search_limits' => ['used' => 0, 'limit' => 150],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 50],
                    'search_bookmarks' => ['used' => 0, 'limit' => 50],
                    'video_analysis' => ['used' => 0, 'limit' => 50],
                ],
            ],
        ]);

        PricingPlan::query()->where('slug', 'premium')->update([
            'name' => 'Premium',
            'metadata' => [
                'settings' => [
                    'cta' => 'Choose Premium',
                    'popular' => false,
                ],
                'subscription' => [
                    'trialEnabled' => true,
                    'search_limits' => ['used' => 0, 'limit' => 400],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => -1],
                    'search_bookmarks' => ['used' => 0, 'limit' => -1],
                    'video_analysis' => ['used' => 0, 'limit' => -1],
                ],
            ],
        ]);
    }
};
