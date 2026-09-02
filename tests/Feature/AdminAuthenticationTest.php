<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminAuthenticationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('admin.root_name', 'Root Admin');
        config()->set('admin.root_email', 'admin@example.com');
        config()->set('admin.root_password', 'super-secret');
        config()->set('admin.session_key', 'admin.authenticated');
    }

    public function test_admin_dashboard_redirects_guests_to_login(): void
    {
        $this->get('/x/admin')
            ->assertRedirect(route('admin.login'));
    }

    public function test_admin_can_log_in_with_env_credentials(): void
    {
        $this->post('/x/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'super-secret',
        ])->assertRedirect(route('admin.dashboard'));

        $this->get('/x/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('screen', 'dashboard')
                ->where('admin.signedIn', true)
                ->where('admin.user.email', 'admin@example.com'));
    }

    public function test_admin_login_rejects_invalid_credentials(): void
    {
        $this->from('/x/admin/login')
            ->post('/x/admin/login', [
                'email' => 'admin@example.com',
                'password' => 'wrong-password',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_authenticated_admin_is_redirected_away_from_login(): void
    {
        $this->withSession(['admin.authenticated' => true])
            ->get('/x/admin/login')
            ->assertRedirect(route('admin.dashboard'));
    }

    public function test_admin_login_page_loads(): void
    {
        $this->get('/x/admin/login')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Login'));
    }

    public function test_admin_can_log_out(): void
    {
        $this->withSession(['admin.authenticated' => true, 'admin.user' => ['email' => 'admin@example.com']])
            ->post('/x/admin/logout')
            ->assertRedirect(route('admin.login'));

        $this->get('/x/admin')->assertRedirect(route('admin.login'));
    }
}
