<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserActivity;
use App\Services\Admin\UserActivityService;
use App\Services\Billing\BillingService;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Stripe\StripeClient;
use App\Services\Stripe\StripeWebhookProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Stripe\Checkout\Session;
use Stripe\Event;
use Tests\TestCase;

class SubscriptionActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_container_resolved_billing_records_checkout_and_cancellation_history(): void
    {
        $user = User::factory()->create();
        $plan = PricingPlan::query()->create([
            'id' => (string) str()->ulid(), 'slug' => 'growth', 'name' => 'Growth',
            'price_cents' => 9900, 'amount' => 99, 'annual_amount' => 0,
            'saved_amount' => 0, 'unit_amount' => 9900, 'interval_count' => 1, 'is_active' => true,
        ]);
        $stripe = Mockery::mock(StripeClient::class);
        $stripe->shouldReceive('retrieveCheckoutSession')->twice()->with('cs_activity')->andReturn(Session::constructFrom([
            'id' => 'cs_activity', 'status' => 'complete', 'payment_status' => 'paid',
            'metadata' => ['plan_slug' => $plan->slug],
            'subscription' => 'sub_activity', 'customer' => 'cus_activity',
        ]));
        $this->app->instance(StripeClient::class, $stripe);
        $emails = Mockery::mock(BrevoLifecycleEmailService::class)->shouldIgnoreMissing();
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $billing = app(BillingService::class);
        $billing->finalizeCheckout($user, 'cs_activity');
        $billing->finalizeCheckout($user, 'cs_activity');
        $this->assertSame(1, UserActivity::query()->where('event', 'subscription_paid')->count());

        $subscription = Subscription::query()->where('stripe_subscription_id', 'sub_activity')->firstOrFail();
        foreach ([true, true, false] as $index => $scheduled) {
            app(StripeWebhookProcessor::class)->handle(Event::constructFrom([
                'id' => 'evt_activity_'.$index,
                'type' => 'customer.subscription.updated',
                'data' => ['object' => [
                    'id' => 'sub_activity', 'customer' => 'cus_activity', 'status' => 'active',
                    'cancel_at_period_end' => $scheduled,
                    'current_period_start' => $subscription->current_period_starts_at->timestamp,
                    'current_period_end' => $subscription->current_period_ends_at->timestamp,
                ]],
            ]));
            $this->assertSame($scheduled, data_get($subscription->fresh()->metadata, 'subscription.cancel_at_period_end'));
        }

        $this->assertSame(1, UserActivity::query()->where('event', 'subscription_cancellation_scheduled')->count());
        $this->assertSame(1, UserActivity::query()->where('event', 'subscription_cancellation_reverted')->count());
        $rows = app(UserActivityService::class)->recentPayload()['byCategory']['subscription'];
        $this->assertCount(3, $rows);
        $this->assertEqualsCanonicalizing([
            'subscription_paid', 'subscription_cancellation_scheduled', 'subscription_cancellation_reverted',
        ], array_column($rows, 'event'));
    }
}
