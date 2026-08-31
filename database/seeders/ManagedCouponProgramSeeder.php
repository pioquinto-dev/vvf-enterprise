<?php

namespace Database\Seeders;

use App\Models\ManagedCouponProgram;
use Illuminate\Database\Seeder;

class ManagedCouponProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            [
                'code' => 'IGNITEBB',
                'name' => 'Ignite Team',
                'link_path' => '/internal-subscription',
                'plan_slug' => 'basic',
                'billing_cycle' => 'monthly',
                'max_redemptions' => 10,
                'allowed_domain' => 'igniteamz.com',
                'whitelist_only' => false,
                'trial_only' => true,
                'collect_payment_method' => false,
                'block_trial_used' => false,
                'block_reverted_free' => false,
            ],
            [
                'code' => 'IVANVIP',
                'name' => 'Ivan VIP',
                'link_path' => '/vip-subscription',
                'plan_slug' => 'basic',
                'billing_cycle' => 'monthly',
                'max_redemptions' => 30,
                'allowed_domain' => null,
                'whitelist_only' => true,
                'trial_only' => false,
                'collect_payment_method' => false,
                'block_trial_used' => true,
                'block_reverted_free' => true,
            ],
        ];

        foreach ($programs as $program) {
            // Keep operational fields (redemption cap toggles, Stripe ids, active
            // flag) editable in admin without a seeder re-run clobbering them.
            ManagedCouponProgram::query()->updateOrCreate(
                ['code' => $program['code']],
                array_merge($program, ['is_active' => true]),
            );
        }
    }
}
