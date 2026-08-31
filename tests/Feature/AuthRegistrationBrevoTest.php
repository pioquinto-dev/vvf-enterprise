<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UtmAttribution;
use App\Services\Brevo\BrevoLifecycleEmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class AuthRegistrationBrevoTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_registration_sends_registration_and_verification_emails(): void
    {
        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $emails->shouldReceive('sendNewRegistration')
            ->once()
            ->with(Mockery::on(fn (User $user): bool => $user->email === 'jane@example.com'))
            ->andReturn(true);

        $emails->shouldReceive('sendVerifyEmail')
            ->once()
            ->with(Mockery::on(fn (User $user): bool => $user->email === 'jane@example.com'))
            ->andReturn(true);

        $this->post('/register', [
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect('/dashboard');
    }

    public function test_manual_registration_persists_signup_utm_attribution_from_session(): void
    {
        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $emails->shouldReceive('sendNewRegistration')->once()->andReturn(true);
        $emails->shouldReceive('sendVerifyEmail')->once()->andReturn(true);

        $this->withSession([
            'utm_params' => [
                'utm_source' => 'meta',
                'utm_medium' => 'paid-social',
                'utm_campaign' => 'august-launch',
                'utm_content' => 'hero-video',
                'utm_term' => 'creator tools',
            ],
        ])->post('/register', [
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect('/dashboard');

        $user = User::query()->where('email', 'jane@example.com')->firstOrFail();

        $this->assertDatabaseHas('utm_attributions', [
            'user_id' => $user->id,
            'subscription_id' => null,
            'utm_source' => 'meta',
            'utm_medium' => 'paid-social',
            'utm_campaign' => 'august-launch',
            'utm_content' => 'hero-video',
            'utm_term' => 'creator tools',
        ]);
        $this->assertSame(1, UtmAttribution::query()->where('user_id', $user->id)->count());
    }
}
