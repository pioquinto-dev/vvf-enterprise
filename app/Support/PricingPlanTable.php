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
                'features' => ['1 free search', '0 bookmark slots', 'Last 90 days', 'Top 100 viral videos'],
                'metadata' => [
                    'cta' => 'Run a free search',
                    'popular' => false,
                    'trialEnabled' => false,
                    'searchCreditsLimit' => 1,
                    'searchCreditsUsed' => 0,
                    'bookmarkLimit' => 0,
                    'bookmarksUsed' => 0,
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
                'slug' => 'basic',
                'name' => 'Basic',
                'stripe_product_id' => null,
                'stripe_price_id' => null,
                'price_cents' => 7900,
                'currency' => 'usd',
                'interval' => 'month',
                'interval_count' => 1,
                'is_active' => true,
                'features' => [
                    '150 searches',
                    '50 bookmark slots',
                    'Weekly + monthly scheduling',
                    'CSV export for reports',
                    'Virality alerts',
                    '2 user seats',
                ],
                'metadata' => [
                    'cta' => 'Choose Basic',
                    'popular' => true,
                    'trialEnabled' => true,
                    'searchCreditsLimit' => 150,
                    'searchCreditsUsed' => 0,
                    'bookmarkLimit' => 50,
                    'bookmarksUsed' => 0,
                ],
                'plan_type' => 'basic',
                'description' => 'For a single brand.',
                'amount' => 79,
                'annual_amount' => 756.80,
                'saved_amount' => 191.20,
                'unit_amount' => 7900,
                'duration' => 'monthly',
                'plan_environment' => 'production',
            ],
            [
                'id' => (string) Str::ulid(),
                'slug' => 'premium',
                'name' => 'Premium',
                'stripe_product_id' => null,
                'stripe_price_id' => null,
                'price_cents' => 19900,
                'currency' => 'usd',
                'interval' => 'month',
                'interval_count' => 1,
                'is_active' => true,
                'features' => [
                    '400 searches',
                    'Unlimited bookmarks',
                    'Weekly + monthly scheduling',
                    'Virality alerts',
                    'CSV export for reports',
                    '10 user seats',
                ],
                'metadata' => [
                    'cta' => 'Choose Premium',
                    'popular' => false,
                    'trialEnabled' => false,
                    'searchCreditsLimit' => 400,
                    'searchCreditsUsed' => 0,
                    'bookmarkLimit' => -1,
                    'bookmarksUsed' => 0,
                ],
                'plan_type' => 'premium',
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
