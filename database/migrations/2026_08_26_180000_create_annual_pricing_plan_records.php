<?php

use App\Models\PricingPlan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $this->updateMonthlyPlan(
            'basic',
            amount: 99,
            features: [
                '100 searches',
                '100 viral breakout video analysis',
                'Weekly + monthly scheduling',
                'Virality alerts',
                'Unlimited bookmarks',
            ],
            searchLimit: 100,
            bookmarkLimit: -1,
            videoAnalysisLimit: 100,
            annualSavingsPercent: 40,
        );

        $this->updateMonthlyPlan(
            'premium',
            amount: 199,
            features: [
                'Unlimited searches',
                'Unlimited viral breakout video analysis',
                'Weekly + monthly scheduling',
                'Virality alerts',
                'Unlimited bookmarks',
            ],
            searchLimit: -1,
            bookmarkLimit: -1,
            videoAnalysisLimit: -1,
            annualSavingsPercent: 45,
        );

        $this->upsertAnnualPlan(
            slug: 'basic-annual',
            name: 'Growth',
            planType: 'growth',
            amount: 699,
            unitAmount: 69900,
            savedAmount: 489,
            annualSavingsPercent: 40,
            popular: true,
            features: [
                '100 searches',
                '100 viral breakout video analysis',
                'Weekly + monthly scheduling',
                'Virality alerts',
                'Unlimited bookmarks',
            ],
            searchLimit: 100,
            bookmarkLimit: -1,
            videoAnalysisLimit: 100,
        );

        $this->upsertAnnualPlan(
            slug: 'premium-annual',
            name: 'Scale',
            planType: 'scale',
            amount: 1299,
            unitAmount: 129900,
            savedAmount: 1089,
            annualSavingsPercent: 45,
            popular: false,
            features: [
                'Unlimited searches',
                'Unlimited viral breakout video analysis',
                'Weekly + monthly scheduling',
                'Virality alerts',
                'Unlimited bookmarks',
            ],
            searchLimit: -1,
            bookmarkLimit: -1,
            videoAnalysisLimit: -1,
        );
    }

    public function down(): void
    {
        PricingPlan::query()->whereIn('slug', ['basic-annual', 'premium-annual'])->delete();
    }

    private function updateMonthlyPlan(
        string $slug,
        float $amount,
        array $features,
        int $searchLimit,
        int $bookmarkLimit,
        int $videoAnalysisLimit,
        int $annualSavingsPercent,
    ): void {
        $plan = PricingPlan::query()->where('slug', $slug)->first();

        if (! $plan) {
            return;
        }

        $metadata = (array) ($plan->metadata ?? []);
        data_set($metadata, 'settings.annualSavingsPercent', $annualSavingsPercent);
        data_set($metadata, 'subscription.search_limits.limit', $searchLimit);
        data_set($metadata, 'subscription.viral_video_bookmarks.limit', $bookmarkLimit);
        data_set($metadata, 'subscription.search_bookmarks.limit', $bookmarkLimit);
        data_set($metadata, 'subscription.video_analysis.limit', $videoAnalysisLimit);

        $plan->update([
            'features' => $features,
            'amount' => $amount,
            'annual_amount' => 0,
            'saved_amount' => 0,
            'metadata' => $metadata,
        ]);
    }

    private function upsertAnnualPlan(
        string $slug,
        string $name,
        string $planType,
        float $amount,
        int $unitAmount,
        float $savedAmount,
        int $annualSavingsPercent,
        bool $popular,
        array $features,
        int $searchLimit,
        int $bookmarkLimit,
        int $videoAnalysisLimit,
    ): void {
        $existing = PricingPlan::query()->where('slug', $slug)->first();
        $metadata = (array) ($existing?->metadata ?? []);
        $stripePriceId = $existing?->stripe_price_id;

        data_set($metadata, 'settings.cta', $name === 'Growth' ? 'Choose Growth Annual' : 'Choose Scale Annual');
        data_set($metadata, 'settings.popular', $popular);
        data_set($metadata, 'settings.annualSavingsPercent', $annualSavingsPercent);
        data_set($metadata, 'subscription.trialEnabled', true);
        data_set($metadata, 'subscription.search_limits', ['used' => 0, 'limit' => $searchLimit]);
        data_set($metadata, 'subscription.viral_video_bookmarks', ['used' => 0, 'limit' => $bookmarkLimit]);
        data_set($metadata, 'subscription.search_bookmarks', ['used' => 0, 'limit' => $bookmarkLimit]);
        data_set($metadata, 'subscription.video_analysis', ['used' => 0, 'limit' => $videoAnalysisLimit]);

        PricingPlan::query()->updateOrCreate(
            ['slug' => $slug],
            [
                'id' => $existing?->id ?? (string) Str::ulid(),
                'name' => $name,
                'stripe_product_id' => $existing?->stripe_product_id,
                'stripe_price_id' => $stripePriceId,
                'price_cents' => $unitAmount,
                'currency' => 'usd',
                'interval' => 'year',
                'interval_count' => 12,
                'is_active' => true,
                'features' => $features,
                'metadata' => $metadata,
                'plan_type' => $planType,
                'description' => $name === 'Growth' ? 'For a single brand.' : 'For brand and agency teams.',
                'amount' => $amount,
                'annual_amount' => $amount,
                'saved_amount' => $savedAmount,
                'unit_amount' => $unitAmount,
                'duration' => 'annual',
                'plan_environment' => 'production',
                'archived_at' => null,
            ]
        );
    }
};
