<?php

namespace Tests\Feature;

use App\Models\User;
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
            ->with(Mockery::on(fn (User $user): bool => $user->email === 'jane@example.com'));

        $emails->shouldReceive('sendVerifyEmail')
            ->once()
            ->with(Mockery::on(fn (User $user): bool => $user->email === 'jane@example.com'));

        $this->post('/register', [
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect('/dashboard');
    }
}
