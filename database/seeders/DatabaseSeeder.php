<?php

namespace Database\Seeders;

use App\Models\PricingPlan;
use App\Models\User;
use App\Support\PricingPlanTable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (PricingPlan::query()->count() === 0) {
            PricingPlanTable::seedDefaults();
        }

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
