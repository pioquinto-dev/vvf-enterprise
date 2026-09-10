<?php

use App\Models\PricingPlan;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const ANNUAL_PLANS = [
        'growth-annual' => ['amount' => 990, 'unit_amount' => 99000, 'saved_amount' => 198, 'savings_percent' => 17],
        'scale-annual' => ['amount' => 1899, 'unit_amount' => 189900, 'saved_amount' => 489, 'savings_percent' => 20],
    ];

    public function up(): void
    {
        $this->updateSavingsPercentages(['growth' => 17, 'scale' => 20]);
        $this->applyPricing(self::ANNUAL_PLANS);
    }

    public function down(): void
    {
        $this->updateSavingsPercentages(['growth' => 40, 'scale' => 45]);
        $this->applyPricing([
            'growth-annual' => ['amount' => 699, 'unit_amount' => 69900, 'saved_amount' => 489, 'savings_percent' => 40],
            'scale-annual' => ['amount' => 1299, 'unit_amount' => 129900, 'saved_amount' => 1089, 'savings_percent' => 45],
        ]);
    }

    /**
     * @param array<string, array{amount: int, unit_amount: int, saved_amount: int, savings_percent: int}> $plans
     */
    private function applyPricing(array $plans): void
    {
        foreach ($plans as $slug => $pricing) {
            $plan = PricingPlan::query()->where('slug', $slug)->first();

            if ($plan === null) {
                continue;
            }

            $metadata = (array) $plan->metadata;
            data_set($metadata, 'settings.annualSavingsPercent', $pricing['savings_percent']);

            $plan->update([
                'price_cents' => $pricing['unit_amount'],
                'amount' => $pricing['amount'],
                'annual_amount' => $pricing['amount'],
                'saved_amount' => $pricing['saved_amount'],
                'unit_amount' => $pricing['unit_amount'],
                'metadata' => $metadata,
            ]);
        }
    }

    /**
     * @param array<string, int> $percentages
     */
    private function updateSavingsPercentages(array $percentages): void
    {
        foreach ($percentages as $planType => $percentage) {
            PricingPlan::query()
                ->where('plan_type', $planType)
                ->each(function (PricingPlan $plan) use ($percentage): void {
                    $metadata = (array) $plan->metadata;
                    data_set($metadata, 'settings.annualSavingsPercent', $percentage);
                    $plan->update(['metadata' => $metadata]);
                });
        }
    }
};
