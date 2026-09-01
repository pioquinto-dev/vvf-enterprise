<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingService;
use App\Services\Stripe\StripeClient;
use App\Support\PricingPlanTable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Mockery;
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

    public function test_checkout_refuses_a_non_self_serve_plan_for_an_active_paid_subscriber(): void
    {
        PricingPlanTable::seedDefaults();

        $growth = PricingPlan::query()->where('slug', 'growth')->firstOrFail();
        $scale = $this->makeScalePlan();

        $user = User::factory()->create();

        // An active, paid Growth subscriber: jumping to Scale is a mid-cycle
        // upgrade, which stays gated behind "Contact Us".
        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $growth->id,
            'status' => 'active',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => ['plan_slug' => 'growth'],
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('self-serve');

        app(BillingService::class)->checkout($user, $scale);
    }

    public function test_checkout_allows_a_non_self_serve_plan_for_a_free_user(): void
    {
        $scale = $this->makeScalePlan();
        $user = User::factory()->create();

        // A free account has no active paid subscription, so the "Contact Us"
        // gate does not apply — it self-serves straight into checkout.
        $stripe = Mockery::mock(StripeClient::class);
        $stripe->shouldReceive('createCustomer')->andReturn((object) ['id' => 'cus_free']);
        $stripe->shouldReceive('createCheckoutSession')->once()->andReturn((object) [
            'id' => 'cs_scale_free',
            'url' => 'https://checkout.stripe.test/scale',
        ]);
        $this->app->instance(StripeClient::class, $stripe);

        $url = app(BillingService::class)->checkout($user, $scale);

        $this->assertSame('https://checkout.stripe.test/scale', $url);
    }

    private function makeScalePlan(): PricingPlan
    {
        return PricingPlan::query()->create([
            'id' => (string) Str::ulid(),
            'slug' => 'scale',
            'name' => 'Scale',
            'plan_type' => 'scale',
            'is_active' => true,
            'price_cents' => 19900,
            'currency' => 'usd',
            'interval' => 'month',
            'interval_count' => 1,
            'stripe_price_id' => 'price_scale',
            'metadata' => ['settings' => ['self_serve' => false]],
        ]);
    }
}
