<?php

namespace Tests\Feature;

use App\Jobs\SendRegistrationEmails;
use App\Models\User;
use App\Models\UtmAttribution;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AuthRegistrationBrevoTest extends TestCase
{
    use RefreshDatabase;

    public function test_manual_registration_queues_registration_and_verification_emails(): void
    {
        Queue::fake();

        $this->post('/register', [
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect('/dashboard');

        $user = User::query()->where('email', 'jane@example.com')->firstOrFail();

        Queue::assertPushed(
            SendRegistrationEmails::class,
            fn (SendRegistrationEmails $job): bool => $job->userId === $user->id && $job->sendVerificationEmail,
        );
    }

    public function test_manual_registration_persists_signup_utm_attribution_from_session(): void
    {
        Queue::fake();

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
