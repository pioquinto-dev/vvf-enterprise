<?php

namespace Tests\Unit;

use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Billing\BillingEntitlementService;
use App\Services\Billing\BillingService;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Stripe\StripeClient;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class BillingServiceBrevoTest extends TestCase
{
    use RefreshDatabase;

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
            );

        $service = new BillingService($stripe, $entitlements, $emails);
        $service->finalizeCheckout($user, 'cs_test_123');
    }
}
