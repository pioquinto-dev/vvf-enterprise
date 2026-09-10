<?php

use App\Models\PricingPlan;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
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
            ->whereIn('plan_type', ['growth', 'scale'])
            ->each(function (PricingPlan $plan) use ($from, $to): void {
                $features = array_map(
                    fn (mixed $feature): string => (string) $feature === $from ? $to : (string) $feature,
                    (array) $plan->features,
                );

                $plan->update(['features' => $features]);
            });
    }
};
