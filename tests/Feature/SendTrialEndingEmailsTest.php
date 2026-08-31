<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\ManagedCouponProgram;
use App\Models\ManagedCouponRedemption;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Brevo\BrevoLifecycleEmailService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class SendTrialEndingEmailsTest extends TestCase
{
    use RefreshDatabase;

    private function plan(): PricingPlan
    {
        return PricingPlan::query()->create([
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
    }

    public function test_trial_ending_command_sends_three_day_reminder_once(): void
    {
        CarbonImmutable::setTestNow('2026-08-17 09:00:00');

        $user = User::factory()->create();
        $plan = $this->plan();

        $subscription = Subscription::query()->create([
            'id' => (string) str()->ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'trialing',
            'current_period_starts_at' => CarbonImmutable::now()->subDays(4),
            'current_period_ends_at' => CarbonImmutable::now()->addDays(3),
            'trial_started_at' => CarbonImmutable::now()->subDays(4),
            'trial_ends_at' => CarbonImmutable::now()->addDays(3),
            'metadata' => [],
        ]);

        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $emails->shouldReceive('sendTrialEnding')
            ->once()
            ->with(
                Mockery::on(fn (User $candidate): bool => $candidate->is($user)),
                Mockery::on(fn (Subscription $candidate): bool => $candidate->is($subscription)),
                3
            );

        $this->artisan('brevo:send-trial-ending-emails')
            ->expectsOutput('Sent 1 trial ending reminder(s).')
            ->assertSuccessful();

        $this->assertNotNull(data_get($subscription->fresh()->metadata, 'brevo.trial_ending_sent.3'));

        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $emails->shouldNotReceive('sendTrialEnding');
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $this->artisan('brevo:send-trial-ending-emails')
            ->expectsOutput('Sent 0 trial ending reminder(s).')
            ->assertSuccessful();
    }

    public function test_trial_ending_command_sends_one_day_reminder_once(): void
    {
        CarbonImmutable::setTestNow('2026-08-19 09:00:00');

        $user = User::factory()->create();
        $plan = $this->plan();

        $subscription = Subscription::query()->create([
            'id' => (string) str()->ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'trialing',
            'current_period_starts_at' => CarbonImmutable::now()->subDays(6),
            'current_period_ends_at' => CarbonImmutable::now()->addDay(),
            'trial_started_at' => CarbonImmutable::now()->subDays(6),
            'trial_ends_at' => CarbonImmutable::now()->addDay(),
            'metadata' => [],
        ]);

        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $emails->shouldReceive('sendTrialEnding')
            ->once()
            ->with(
                Mockery::on(fn (User $candidate): bool => $candidate->is($user)),
                Mockery::on(fn (Subscription $candidate): bool => $candidate->is($subscription)),
                1
            );

        $this->artisan('brevo:send-trial-ending-emails')
            ->expectsOutput('Sent 1 trial ending reminder(s).')
            ->assertSuccessful();

        $this->assertNotNull(data_get($subscription->fresh()->metadata, 'brevo.trial_ending_sent.1'));

        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $emails->shouldNotReceive('sendTrialEnding');
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $this->artisan('brevo:send-trial-ending-emails')
            ->expectsOutput('Sent 0 trial ending reminder(s).')
            ->assertSuccessful();
    }

    public function test_trial_ending_command_uses_no_card_template_for_managed_coupon_trials(): void
    {
        CarbonImmutable::setTestNow('2026-08-17 09:00:00');

        $user = User::factory()->create();
        $plan = $this->plan();

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
        ]);

        $subscription = Subscription::query()->create([
            'id' => (string) str()->ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'stripe_subscription_id' => 'sub_no_cc_123',
            'status' => 'trialing',
            'current_period_starts_at' => CarbonImmutable::now()->subDays(4),
            'current_period_ends_at' => CarbonImmutable::now()->addDays(3),
            'trial_started_at' => CarbonImmutable::now()->subDays(4),
            'trial_ends_at' => CarbonImmutable::now()->addDays(3),
            'metadata' => [],
        ]);

        ManagedCouponRedemption::query()->create([
            'managed_coupon_program_id' => $program->id,
            'user_id' => $user->id,
            'email' => $user->email,
            'stripe_subscription_id' => 'sub_no_cc_123',
            'redeemed_at' => now(),
        ]);

        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $emails->shouldReceive('sendNoCardTrialEnding')
            ->once()
            ->with(
                Mockery::on(fn (User $candidate): bool => $candidate->is($user)),
                Mockery::on(fn (Subscription $candidate): bool => $candidate->is($subscription)),
                3
            );
        $emails->shouldNotReceive('sendTrialEnding');

        $this->artisan('brevo:send-trial-ending-emails')
            ->expectsOutput('Sent 1 trial ending reminder(s).')
            ->assertSuccessful();

        $this->assertNotNull(data_get($subscription->fresh()->metadata, 'brevo.no_cc_trial_ending_sent.3'));
    }

    public function test_no_card_trial_ending_command_sends_one_day_reminder_once(): void
    {
        CarbonImmutable::setTestNow('2026-08-19 09:00:00');

        $user = User::factory()->create();
        $plan = $this->plan();

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
        ]);

        $subscription = Subscription::query()->create([
            'id' => (string) str()->ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'stripe_subscription_id' => 'sub_no_cc_456',
            'status' => 'trialing',
            'current_period_starts_at' => CarbonImmutable::now()->subDays(6),
            'current_period_ends_at' => CarbonImmutable::now()->addDay(),
            'trial_started_at' => CarbonImmutable::now()->subDays(6),
            'trial_ends_at' => CarbonImmutable::now()->addDay(),
            'metadata' => [],
        ]);

        ManagedCouponRedemption::query()->create([
            'managed_coupon_program_id' => $program->id,
            'user_id' => $user->id,
            'email' => $user->email,
            'stripe_subscription_id' => 'sub_no_cc_456',
            'redeemed_at' => now(),
        ]);

        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $emails->shouldReceive('sendNoCardTrialEnding')
            ->once()
            ->with(
                Mockery::on(fn (User $candidate): bool => $candidate->is($user)),
                Mockery::on(fn (Subscription $candidate): bool => $candidate->is($subscription)),
                1
            );
        $emails->shouldNotReceive('sendTrialEnding');

        $this->artisan('brevo:send-trial-ending-emails')
            ->expectsOutput('Sent 1 trial ending reminder(s).')
            ->assertSuccessful();

        $this->assertNotNull(data_get($subscription->fresh()->metadata, 'brevo.no_cc_trial_ending_sent.1'));
    }
}
