<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingEntitlementService;
use App\Services\Billing\BillingService;
use App\Services\Stripe\StripeClient;
use App\Support\PricingPlanTable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

/**
 * Scale is gated behind "Contact Us" only for an active paid Growth
 * subscriber. Hiding the button is not enough — the checkout service itself
 * must refuse a non-self-serve plan in that one mid-cycle upgrade case.
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

    public function test_checkout_refuses_a_non_self_serve_plan_for_an_active_paid_growth_subscriber(): void
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
        $this->expectExceptionMessage('in-app Scale upgrade');

        app(BillingService::class)->checkout($user, $scale);
    }

    public function test_checkout_refuses_a_lower_tier_for_an_active_paid_scale_subscriber(): void
    {
        PricingPlanTable::seedDefaults();

        $growth = PricingPlan::query()->where('slug', 'growth')->firstOrFail();
        $scale = $this->makeScalePlan();
        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $scale->id,
            'status' => 'active',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => ['plan_slug' => 'scale'],
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('already has a higher plan');

        app(BillingService::class)->checkout($user, $growth);
    }

    public function test_free_user_can_start_a_scale_trial_checkout(): void
    {
        $scale = $this->makeScalePlan();
        $user = User::factory()->create();

        $stripe = Mockery::mock(StripeClient::class);
        $stripe->shouldReceive('createCustomer')->andReturn((object) ['id' => 'cus_free']);
        $stripe->shouldReceive('createCheckoutSession')->once()->withArgs(function (array $payload): bool {
            return data_get($payload, 'metadata.trial_days') === '8'
                && data_get($payload, 'subscription_data.trial_period_days') === 8;
        })->andReturn((object) [
            'id' => 'cs_scale_free',
            'url' => 'https://checkout.stripe.test/scale',
        ]);
        $this->app->instance(StripeClient::class, $stripe);

        $url = app(BillingService::class)->checkout($user, $scale, withTrial: true);

        $this->assertSame('https://checkout.stripe.test/scale', $url);
    }

    public function test_trialing_user_can_start_a_paid_scale_checkout(): void
    {
        PricingPlanTable::seedDefaults();

        $growth = PricingPlan::query()->where('slug', 'growth')->firstOrFail();
        $scale = PricingPlan::query()->where('slug', 'scale')->firstOrFail();
        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $growth->id,
            'status' => 'trialing',
            'trial_started_at' => now(),
            'trial_ends_at' => now()->addDays(8),
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addDays(8),
            'metadata' => ['plan_slug' => 'growth'],
        ]);

        $stripe = Mockery::mock(StripeClient::class);
        $stripe->shouldReceive('createCheckoutSession')->once()->withArgs(function (array $payload): bool {
            return data_get($payload, 'metadata.trial_days') === '0'
                && data_get($payload, 'subscription_data.trial_period_days') === null;
        })->andReturn((object) [
            'id' => 'cs_scale_trialing',
            'url' => 'https://checkout.stripe.test/scale-trialing',
        ]);
        $this->app->instance(StripeClient::class, $stripe);

        $url = app(BillingService::class)->checkout($user, $scale);

        $this->assertSame('https://checkout.stripe.test/scale-trialing', $url);
    }

    public function test_checkout_allows_a_non_self_serve_plan_for_an_active_paid_scale_subscriber(): void
    {
        $scale = $this->makeScalePlan();
        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $scale->id,
            'status' => 'active',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => ['plan_slug' => 'scale'],
        ]);

        $stripe = Mockery::mock(StripeClient::class);
        $stripe->shouldReceive('createCheckoutSession')->once()->andReturn((object) [
            'id' => 'cs_scale_existing',
            'url' => 'https://checkout.stripe.test/scale-existing',
        ]);
        $this->app->instance(StripeClient::class, $stripe);

        $url = app(BillingService::class)->checkout($user, $scale);

        $this->assertSame('https://checkout.stripe.test/scale-existing', $url);
    }

    public function test_reverted_trial_user_must_use_paid_scale_checkout(): void
    {
        PricingPlanTable::seedDefaults();

        $growth = PricingPlan::query()->where('slug', 'growth')->firstOrFail();
        $scale = PricingPlan::query()->where('slug', 'scale')->firstOrFail();
        $free = PricingPlan::query()->where('slug', 'free')->firstOrFail();
        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $growth->id,
            'status' => 'canceled',
            'trial_started_at' => now()->subDays(8),
            'trial_ends_at' => now(),
            'trial_completed_at' => now(),
            'current_period_starts_at' => now()->subDays(8),
            'current_period_ends_at' => now(),
            'metadata' => ['plan_slug' => 'growth'],
        ]);
        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $free->id,
            'status' => 'free',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => ['plan_slug' => 'free'],
        ]);

        $this->assertTrue(app(BillingEntitlementService::class)->hasUsedTrial($user));

        try {
            app(BillingService::class)->checkout($user, $scale, withTrial: true);
            $this->fail('A reverted trial user must not start another trial.');
        } catch (ValidationException $exception) {
            $this->assertArrayHasKey('trial', $exception->errors());
        }

        $stripe = Mockery::mock(StripeClient::class);
        $stripe->shouldReceive('createCustomer')->andReturn((object) ['id' => 'cus_reverted_trial']);
        $stripe->shouldReceive('createCheckoutSession')->once()->andReturn((object) [
            'id' => 'cs_scale_paid',
            'url' => 'https://checkout.stripe.test/scale-paid',
        ]);
        $this->app->instance(StripeClient::class, $stripe);

        $url = app(BillingService::class)->checkout($user, $scale);

        $this->assertSame('https://checkout.stripe.test/scale-paid', $url);
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
