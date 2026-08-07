<?php

namespace Database\Seeders;

use App\Models\PricingPlan;
use App\Models\User;
use App\Support\PricingPlanTable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

        User::query()->updateOrCreate(['email' => 'test@example.com'], [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'current_plan_slug' => 'free',
            'monthly_credits_remaining' => 1,
            'free_search_used_at' => null,
        ]);

        collect([
            ['name' => 'Test User 01', 'email' => 'free1@example.com'],
            ['name' => 'Test User 02', 'email' => 'free2@example.com'],
            ['name' => 'Test User 03', 'email' => 'free3@example.com'],
            ['name' => 'Test User 04', 'email' => 'free4@example.com'],
            ['name' => 'Test User 05', 'email' => 'free5@example.com'],
        ])->each(function (array $user): void {
            User::query()->updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'),
                    'remember_token' => Str::random(10),
                    'current_plan_slug' => 'free',
                    'monthly_credits_remaining' => 1,
                    'free_search_used_at' => null,
                ]
            );
        });
    }
}
