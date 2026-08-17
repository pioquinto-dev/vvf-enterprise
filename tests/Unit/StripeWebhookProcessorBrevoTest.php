<?php

namespace Tests\Unit;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingService;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Stripe\StripeWebhookProcessor;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Stripe\Event;
use Tests\TestCase;

class StripeWebhookProcessorBrevoTest extends TestCase
{
    use RefreshDatabase;

    public function test_canceled_subscription_transition_sends_cancellation_email(): void
    {
        CarbonImmutable::setTestNow('2026-08-17 09:00:00');

        $user = User::factory()->create([
            'current_plan_slug' => 'basic',
            'monthly_credits_remaining' => 8,
            'plan_renews_at' => CarbonImmutable::now()->addMonth(),
        ]);

        $plan = PricingPlan::query()->create([
            'id' => (string) str()->ulid(),
            'slug' => 'basic',
            'name' => 'Basic',
            'stripe_price_id' => 'price_basic',
            'price_cents' => 2900,
            'interval_count' => 1,
            'is_active' => true,
            'amount' => 29,
            'annual_amount' => 0,
            'saved_amount' => 0,
            'unit_amount' => 2900,
        ]);

        $subscription = Subscription::query()->create([
            'id' => (string) str()->ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'stripe_customer_id' => 'cus_test_123',
            'stripe_subscription_id' => 'sub_test_123',
            'status' => 'active',
            'current_period_starts_at' => CarbonImmutable::now()->subDays(10),
            'current_period_ends_at' => CarbonImmutable::now()->addDays(20),
            'metadata' => [],
        ]);

        $billing = Mockery::mock(BillingService::class);
        $emails = Mockery::mock(BrevoLifecycleEmailService::class);

        $billing->shouldReceive('limitsFor')
            ->once()
            ->with(Mockery::type(PricingPlan::class))
            ->andReturn([
                'searchLimit' => 10,
                'videoBookmarkLimit' => 5,
                'searchBookmarkLimit' => 3,
                'videoAnalysisLimit' => 2,
                'trialEnabled' => false,
            ]);
        $billing->shouldReceive('videoBookmarkCount')->once()->with(Mockery::type(User::class))->andReturn(0);
        $billing->shouldReceive('syncSubscriptionUsage')->never();
        $billing->shouldReceive('searchCreditsRemaining')->never();

        $emails->shouldReceive('sendSubscriptionCanceled')
            ->once()
            ->with(
                Mockery::on(fn (User $candidate): bool => $candidate->is($user)),
                Mockery::on(fn (Subscription $candidate): bool => $candidate->is($subscription))
            );

        $processor = new StripeWebhookProcessor($billing, $emails);

        $event = Event::constructFrom([
            'id' => 'evt_test_123',
            'type' => 'customer.subscription.deleted',
            'data' => [
                'object' => [
                    'id' => 'sub_test_123',
                    'customer' => 'cus_test_123',
                    'status' => 'canceled',
                    'current_period_start' => CarbonImmutable::now()->subDays(10)->timestamp,
                    'current_period_end' => CarbonImmutable::now()->addDays(20)->timestamp,
                ],
            ],
        ]);

        $processor->handle($event);

        $this->assertSame('free', $user->fresh()->current_plan_slug);
        $this->assertSame('canceled', $subscription->fresh()->status);
    }
}
