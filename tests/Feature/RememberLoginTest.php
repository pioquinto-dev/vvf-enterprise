<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RememberLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_opt_in_to_a_thirty_day_remembered_login(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password')]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'remember' => true,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->remember_token);

        $rememberCookie = collect($response->headers->getCookies())
            ->first(fn ($cookie) => str_starts_with($cookie->getName(), 'remember_web_'));

        $this->assertNotNull($rememberCookie);
        $this->assertEqualsWithDelta(now()->addDays(30)->timestamp, $rememberCookie->getExpiresTime(), 5);
    }

    public function test_remembered_login_remains_opt_in(): void
    {
        $user = User::factory()->create(['password' => bcrypt('password')]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'remember' => false,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertNull($user->fresh()->remember_token);
    }
}
