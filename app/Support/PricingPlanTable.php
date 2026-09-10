<?php

namespace App\Support;

use App\Models\PricingPlan;
use Illuminate\Support\Str;

class PricingPlanTable
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public static function defaultRows(): array
    {
        return [
            [
                'id' => (string) Str::ulid(),
                'slug' => 'free',
                'name' => 'Free',
                'stripe_product_id' => null,
                'stripe_price_id' => null,
                'price_cents' => 0,
                'currency' => 'usd',
                'interval' => 'month',
                'interval_count' => 1,
                'is_active' => true,
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
                'plan_type' => 'free',
                'description' => 'One search, no card.',
                'amount' => 0,
                'annual_amount' => 0,
                'saved_amount' => 0,
                'unit_amount' => 0,
                'duration' => 'monthly',
                'plan_environment' => 'production',
            ],
            [
                'id' => (string) Str::ulid(),
                'slug' => 'growth',
                'name' => 'Growth',
                'stripe_product_id' => null,
                'stripe_price_id' => null,
                'price_cents' => 9900,
                'currency' => 'usd',
                'interval' => 'month',
                'interval_count' => 1,
                'is_active' => true,
                'features' => [
                    '100 searches',
                    '100 viral breakout video analysis',
                    'Weekly Refresh Scheduling',
                    'Virality alerts',
                    'Unlimited bookmarks',
                ],
                'metadata' => [
                    'settings' => [
                        'cta' => 'Choose Growth',
                        'popular' => true,
                        'annualSavingsPercent' => 17,
                    ],
                    'subscription' => [
                        'trialEnabled' => true,
                        'search_limits' => ['used' => 0, 'limit' => 100],
                        'viral_video_bookmarks' => ['used' => 0, 'limit' => -1],
                        'search_bookmarks' => ['used' => 0, 'limit' => -1],
                        'video_analysis' => ['used' => 0, 'limit' => 100],
                    ],
                ],
                'plan_type' => 'growth',
                'description' => 'For a single brand.',
                'amount' => 99,
                'annual_amount' => 0,
                'saved_amount' => 0,
                'unit_amount' => 9900,
                'duration' => 'monthly',
                'plan_environment' => 'production',
            ],
            [
                'id' => (string) Str::ulid(),
                'slug' => 'growth-annual',
                'name' => 'Growth',
                'stripe_product_id' => null,
                'stripe_price_id' => null,
                'price_cents' => 99000,
                'currency' => 'usd',
                'interval' => 'year',
                'interval_count' => 12,
                'is_active' => true,
                'features' => [
                    '100 searches',
                    '100 viral breakout video analysis',
                    'Weekly Refresh Scheduling',
                    'Virality alerts',
                    'Unlimited bookmarks',
                ],
                'metadata' => [
                    'settings' => [
                        'cta' => 'Choose Growth Annual',
                        'popular' => true,
                        'annualSavingsPercent' => 17,
                    ],
                    'subscription' => [
                        'trialEnabled' => true,
                        'search_limits' => ['used' => 0, 'limit' => 100],
                        'viral_video_bookmarks' => ['used' => 0, 'limit' => -1],
                        'search_bookmarks' => ['used' => 0, 'limit' => -1],
                        'video_analysis' => ['used' => 0, 'limit' => 100],
                    ],
                ],
                'plan_type' => 'growth',
                'description' => 'For a single brand.',
                'amount' => 990,
                'annual_amount' => 990,
                'saved_amount' => 198,
                'unit_amount' => 99000,
                'duration' => 'annual',
                'plan_environment' => 'production',
            ],
            [
                'id' => (string) Str::ulid(),
                'slug' => 'scale',
                'name' => 'Scale',
                'stripe_product_id' => null,
                'stripe_price_id' => null,
                'price_cents' => 19900,
                'currency' => 'usd',
                'interval' => 'month',
                'interval_count' => 1,
                'is_active' => true,
                'features' => [
                    'Unlimited searches',
                    'Unlimited viral breakout video analysis',
                    'Weekly Refresh Scheduling',
                    'Virality alerts',
                    'Unlimited bookmarks',
                ],
                'metadata' => [
                    'settings' => [
                        'cta' => 'Contact Us',
                        'popular' => false,
                        'annualSavingsPercent' => 20,
                        // Scale is gated behind a Contact Us flow — not self-serve.
                        'self_serve' => false,
                    ],
                    'subscription' => [
                        'trialEnabled' => true,
                        'search_limits' => ['used' => 0, 'limit' => -1],
                        'viral_video_bookmarks' => ['used' => 0, 'limit' => -1],
                        'search_bookmarks' => ['used' => 0, 'limit' => -1],
                        'video_analysis' => ['used' => 0, 'limit' => -1],
                    ],
                ],
                'plan_type' => 'scale',
                'description' => 'For brand and agency teams.',
                'amount' => 199,
                'annual_amount' => 0,
                'saved_amount' => 0,
                'unit_amount' => 19900,
                'duration' => 'monthly',
                'plan_environment' => 'production',
            ],
            [
                'id' => (string) Str::ulid(),
                'slug' => 'scale-annual',
                'name' => 'Scale',
                'stripe_product_id' => null,
                'stripe_price_id' => null,
                'price_cents' => 189900,
                'currency' => 'usd',
                'interval' => 'year',
                'interval_count' => 12,
                'is_active' => true,
                'features' => [
                    'Unlimited searches',
                    'Unlimited viral breakout video analysis',
                    'Weekly Refresh Scheduling',
                    'Virality alerts',
                    'Unlimited bookmarks',
                ],
                'metadata' => [
                    'settings' => [
                        'cta' => 'Contact Us',
                        'popular' => false,
                        'annualSavingsPercent' => 20,
                        // Scale is gated behind a Contact Us flow — not self-serve.
                        'self_serve' => false,
                    ],
                    'subscription' => [
                        'trialEnabled' => true,
                        'search_limits' => ['used' => 0, 'limit' => -1],
                        'viral_video_bookmarks' => ['used' => 0, 'limit' => -1],
                        'search_bookmarks' => ['used' => 0, 'limit' => -1],
                        'video_analysis' => ['used' => 0, 'limit' => -1],
                    ],
                ],
                'plan_type' => 'scale',
                'description' => 'For brand and agency teams.',
                'amount' => 1899,
                'annual_amount' => 1899,
                'saved_amount' => 489,
                'unit_amount' => 189900,
                'duration' => 'annual',
                'plan_environment' => 'production',
            ],
        ];
    }

    public static function seedDefaults(): void
    {
        foreach (self::defaultRows() as $row) {
            PricingPlan::query()->updateOrCreate(
                ['slug' => $row['slug']],
                $row
            );
        }
    }
}
