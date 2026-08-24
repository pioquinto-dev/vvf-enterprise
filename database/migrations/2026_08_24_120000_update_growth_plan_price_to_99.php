<?php

use App\Models\PricingPlan;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        PricingPlan::query()->where('slug', 'basic')->update([
            'price_cents' => 9900,
            'amount' => 99,
            'annual_amount' => 950.40,
            'saved_amount' => 237.60,
            'unit_amount' => 9900,
        ]);
    }

    public function down(): void
    {
        PricingPlan::query()->where('slug', 'basic')->update([
            'price_cents' => 7900,
            'amount' => 79,
            'annual_amount' => 756.80,
            'saved_amount' => 191.20,
            'unit_amount' => 7900,
        ]);
    }
};
