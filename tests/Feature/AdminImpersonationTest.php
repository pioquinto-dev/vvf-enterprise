<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminImpersonationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('admin.session_key', 'admin.authenticated');
    }

    public function test_admin_can_impersonate_an_active_user_for_one_hour(): void
    {
        $user = User::factory()->create();

        $this->withSession([
            'admin.authenticated' => true,
            'admin.user' => ['email' => 'admin@example.com'],
        ])->post("/x/admin/users/{$user->id}/impersonate")
            ->assertRedirect(route('dashboard'))
            ->assertAuthenticatedAs($user)
            ->assertSessionHas('admin.authenticated', true)
            ->assertSessionHas('admin.impersonation.user_id', $user->id);
    }

    public function test_customer_sign_out_returns_an_impersonating_admin_to_the_admin_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession([
                'admin.authenticated' => true,
                'admin.user' => ['email' => 'admin@example.com'],
                'admin.impersonation' => [
                    'user_id' => $user->id,
                    'admin_email' => 'admin@example.com',
                    'expires_at' => now()->addHour()->toIso8601String(),
                ],
            ])
            ->post('/logout')
            ->assertRedirect(route('admin.dashboard'))
            ->assertGuest()
            ->assertSessionHas('admin.authenticated', true)
            ->assertSessionMissing('admin.impersonation');
    }

    public function test_expired_impersonation_logs_out_the_customer_but_retains_admin_access(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->withSession([
                'admin.authenticated' => true,
                'admin.user' => ['email' => 'admin@example.com'],
                'admin.impersonation' => [
                    'user_id' => $user->id,
                    'admin_email' => 'admin@example.com',
                    'expires_at' => now()->subMinute()->toIso8601String(),
                ],
            ])
            ->get('/dashboard')
            ->assertRedirect(route('login'))
            ->assertGuest()
            ->assertSessionHas('admin.authenticated', true)
            ->assertSessionMissing('admin.impersonation');
    }
}
