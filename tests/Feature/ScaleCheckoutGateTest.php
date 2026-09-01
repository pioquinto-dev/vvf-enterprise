<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Billing\BillingService;
use App\Support\PricingPlanTable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * Scale is gated behind "Contact Us". Hiding the button is not enough — the
 * checkout service itself must refuse a non-self-serve plan so a direct API
 * call to /billing/checkout/scale cannot start a subscription.
 */
class ScaleCheckoutGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_scale_is_flagged_not_self_serve(): void
    {
        PricingPlanTable::seedDefaults();

        $scale = PricingPlan::query()->where('slug', 'scale')->firstOrFail();
        $growth = PricingPlan::query()->where('slug', 'growth')->firstOrFail();

        $this->assertFalse((bool) data_get($scale->metadata, 'settings.self_serve'));
        $this->assertTrue((bool) data_get($growth->metadata, 'settings.self_serve', true));
    }

    public function test_checkout_refuses_a_non_self_serve_plan(): void
    {
        $user = User::factory()->create();
        $scale = PricingPlan::query()->create([
            'id' => (string) Str::ulid(),
            'slug' => 'scale',
            'name' => 'Scale',
            'is_active' => true,
            'price_cents' => 19900,
            'currency' => 'usd',
            'interval' => 'month',
            'interval_count' => 1,
            'stripe_price_id' => 'price_scale',
            'metadata' => ['settings' => ['self_serve' => false]],
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('self-serve');

        app(BillingService::class)->checkout($user, $scale);
    }
}
