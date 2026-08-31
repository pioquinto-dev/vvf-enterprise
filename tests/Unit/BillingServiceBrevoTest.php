<?php

namespace Tests\Unit;

use App\Models\ManagedCouponProgram;
use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Billing\BillingEntitlementService;
use App\Services\Billing\BillingService;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Stripe\StripeClient;
use App\Services\Utm\UtmAttributionService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class BillingServiceBrevoTest extends TestCase
{
    use RefreshDatabase;

    public function test_coupon_checkout_without_payment_method_uses_if_required_collection(): void
    {
        $user = User::factory()->create([
            'email' => 'vip@igniteamz.com',
            'name' => 'VIP User',
            'stripe_customer_id' => 'cus_existing',
        ]);

        $plan = PricingPlan::query()->create([
            'id' => (string) str()->ulid(),
            'slug' => 'basic',
            'name' => 'Growth',
            'stripe_price_id' => 'price_basic',
            'price_cents' => 9900,
            'interval_count' => 1,
            'is_active' => true,
            'amount' => 99,
            'annual_amount' => 0,
            'saved_amount' => 0,
            'unit_amount' => 9900,
        ]);

        $program = ManagedCouponProgram::query()->create([
            'code' => 'IVANVIP',
            'name' => 'Ivan VIP',
            'link_path' => '/vip-subscription',
            'plan_slug' => 'basic',
            'billing_cycle' => 'monthly',
            'max_redemptions' => 30,
            'whitelist_only' => true,
            'trial_only' => false,
            'collect_payment_method' => false,
            'block_trial_used' => true,
            'block_reverted_free' => true,
            'is_active' => true,
            'stripe_coupon_id' => 'coupon_ivanvip',
        ]);

        $stripe = Mockery::mock(StripeClient::class);
        $entitlements = Mockery::mock(BillingEntitlementService::class);
        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $utm = Mockery::mock(UtmAttributionService::class);

        $stripe->shouldReceive('createCheckoutSession')
            ->once()
            ->with(Mockery::on(function (array $payload) use ($user, $plan, $program): bool {
                return ($payload['mode'] ?? null) === 'subscription'
                    && ($payload['customer'] ?? null) === 'cus_existing'
                    && ($payload['payment_method_collection'] ?? null) === 'if_required'
                    && (($payload['discounts'][0]['coupon'] ?? null) === 'coupon_ivanvip')
                    && (($payload['metadata']['coupon_program_code'] ?? null) === $program->code)
                    && (($payload['metadata']['user_id'] ?? null) === (string) $user->id)
                    && (($payload['line_items'][0]['price'] ?? null) === $plan->stripe_price_id);
            }))
            ->andReturn((object) [
                'id' => 'cs_coupon_test',
                'url' => 'https://checkout.stripe.test/session',
            ]);

        $service = new BillingService($stripe, $entitlements, $emails, $utm);

        $url = $service->checkout($user, $plan, false, 'monthly', $program);

        $this->assertSame('https://checkout.stripe.test/session', $url);
    }

    public function test_finalize_checkout_sends_subscription_started_for_a_new_subscription(): void
    {
        CarbonImmutable::setTestNow('2026-08-17 09:00:00');

        $user = User::factory()->create([
            'stripe_customer_id' => 'cus_existing',
        ]);

        $plan = PricingPlan::query()->create([
            'id' => (string) str()->ulid(),
            'slug' => 'basic',
            'name' => 'Growth',
            'stripe_price_id' => 'price_basic',
            'price_cents' => 9900,
            'interval_count' => 1,
            'is_active' => true,
            'amount' => 99,
            'annual_amount' => 0,
            'saved_amount' => 0,
            'unit_amount' => 9900,
        ]);

        $stripe = Mockery::mock(StripeClient::class);
        $entitlements = Mockery::mock(BillingEntitlementService::class);
        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $utm = Mockery::mock(UtmAttributionService::class);

        $stripe->shouldReceive('retrieveCheckoutSession')
            ->once()
            ->with('cs_test_123')
            ->andReturn((object) [
                'payment_status' => 'paid',
                'status' => 'complete',
                'metadata' => (object) ['plan_slug' => 'basic'],
                'subscription' => 'sub_test_123',
                'customer' => 'cus_test_123',
            ]);

        $entitlements->shouldReceive('limitsFor')
            ->once()
            ->with(Mockery::type(PricingPlan::class))
            ->andReturn([
                'searchLimit' => 10,
                'videoBookmarkLimit' => 5,
                'searchBookmarkLimit' => 3,
                'videoAnalysisLimit' => 2,
                'trialEnabled' => false,
            ]);

        $entitlements->shouldReceive('videoBookmarkCount')->once()->andReturn(0);
        $entitlements->shouldReceive('searchBookmarkCount')->once()->andReturn(0);
        $entitlements->shouldReceive('remainingSearchCreditsFrom')->once()->andReturn(10);

        $emails->shouldReceive('sendSubscriptionStarted')
            ->once()
            ->with(
                Mockery::on(fn (User $candidate): bool => $candidate->is($user)),
                Mockery::on(fn ($subscription): bool => $subscription->user_id === $user->id && $subscription->plan_id === $plan->id)
            )
            ->andReturn(true);

        $utm->shouldReceive('createSubscriptionAttribution')
            ->once()
            ->with($user, 'sub_test_123');

        $service = new BillingService($stripe, $entitlements, $emails, $utm);
        $service->finalizeCheckout($user, 'cs_test_123');
    }
}
