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
                    '150 searches',
                    '50 search bookmarks',
                    '50 viral video bookmarks',
                    '50 video analysis',
                    'Weekly + monthly scheduling',
                    'Virality alerts',
                ],
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
                'plan_type' => 'growth',
                'description' => 'For a single brand.',
                'amount' => 99,
                'annual_amount' => 950.40,
                'saved_amount' => 237.60,
                'unit_amount' => 9900,
                'duration' => 'monthly',
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
                    '400 searches',
                    'Unlimited search bookmarks',
                    'Unlimited viral video bookmarks',
                    'Unlimited video analysis',
                    'Weekly + monthly scheduling',
                    'Virality alerts',
                ],
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
                'plan_type' => 'scale',
                'description' => 'For brand and agency teams.',
                'amount' => 199,
                'annual_amount' => 1910.40,
                'saved_amount' => 477.60,
                'unit_amount' => 19900,
                'duration' => 'monthly',
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
