<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Support\PricingPlanTable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutIntentLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_paid_growth_user_is_redirected_to_plans_when_trial_scale_checkout_is_gated(): void
    {
        PricingPlanTable::seedDefaults();

        $growth = PricingPlan::query()->where('slug', 'growth')->firstOrFail();
        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $growth->id,
            'status' => 'active',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => ['plan_slug' => 'growth'],
        ]);

        $this->get('/login?redirect=trial_checkout&plan=scale&trial=1')
            ->assertOk();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('plans'))
            ->assertSessionHas('status', 'This plan is not available for self-serve checkout yet. Contact us to upgrade.');
    }
}
