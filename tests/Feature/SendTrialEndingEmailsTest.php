<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
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

    public function test_trial_ending_command_sends_three_day_reminder_once(): void
    {
        CarbonImmutable::setTestNow('2026-08-17 09:00:00');

        $user = User::factory()->create();

        $plan = PricingPlan::query()->create([
            'id' => (string) str()->ulid(),
            'slug' => 'basic',
            'name' => 'Growth',
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
}
