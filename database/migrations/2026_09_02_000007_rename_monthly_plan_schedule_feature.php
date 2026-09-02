<?php

use App\Models\PricingPlan;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const PLAN_SLUGS = ['growth', 'growth-annual', 'scale', 'scale-annual'];
    private const OLD_LABEL = 'Weekly + monthly scheduling';
    private const NEW_LABEL = 'Weekly Refresh Scheduling';

    public function up(): void
    {
        $this->replaceFeature(self::OLD_LABEL, self::NEW_LABEL);
    }

    public function down(): void
    {
        $this->replaceFeature(self::NEW_LABEL, self::OLD_LABEL);
    }

    private function replaceFeature(string $from, string $to): void
    {
        PricingPlan::query()
            ->whereIn('slug', self::PLAN_SLUGS)
            ->each(function (PricingPlan $plan) use ($from, $to): void {
                $plan->update([
                    'features' => array_map(
                        fn (mixed $feature): string => (string) $feature === $from ? $to : (string) $feature,
                        (array) $plan->features,
                    ),
                ]);
            });
    }
};
