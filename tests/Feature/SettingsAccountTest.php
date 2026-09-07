<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SettingsAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_account_page_includes_normalized_notification_preferences(): void
    {
        $user = User::factory()->create([
            'preferences' => [
                'notifications' => [
                    'weekly_viral_digest' => true,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->get('/settings/account')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Account')
                ->where('preferences.notifications.search_finished', true)
                ->where('preferences.notifications.virality_alerts', true)
                ->where('preferences.notifications.weekly_viral_digest', true)
                ->where('preferences.appearance.disable_animations', false)
                ->where('preferences.appearance.compact_rows', false)
                ->where('preferences.appearance.autoplay_previews', true));
    }

    public function test_updating_account_can_persist_notification_preferences(): void
    {
        $user = User::factory()->create([
            'name' => 'Before',
            'preferences' => [
                'theme' => ['mode' => 'light'],
            ],
        ]);

        $this->actingAs($user)
            ->patch('/settings/account', [
                'name' => 'After',
                'preferences' => [
                    'notifications' => [
                        'search_finished' => false,
                        'virality_alerts' => true,
                        'weekly_viral_digest' => true,
                    ],
                ],
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertSame('After', $user->name);
        $this->assertSame([
            'theme' => ['mode' => 'light'],
            'notifications' => [
                'search_finished' => false,
                'virality_alerts' => true,
                'weekly_viral_digest' => true,
            ],
            'appearance' => [
                'disable_animations' => false,
                'compact_rows' => false,
                'autoplay_previews' => true,
            ],
        ], $user->preferences);
    }

    public function test_google_connected_user_can_add_a_password_for_manual_login(): void
    {
        $user = User::factory()->create([
            'preferences' => ['authentication' => ['google_connected' => true]],
        ]);

        $this->actingAs($user)
            ->post('/settings/account/password', [
                'password' => 'New-password-123',
                'password_confirmation' => 'New-password-123',
            ])
            ->assertRedirect();

        $user->refresh();
        $this->assertTrue(Hash::check('New-password-123', $user->password));
        $this->assertNotNull(data_get($user->preferences, 'authentication.password_added_at'));

        auth()->logout();
        $this->post('/login', ['email' => $user->email, 'password' => 'New-password-123'])
            ->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    public function test_non_google_user_cannot_use_add_password_endpoint(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/settings/account/password', [
                'password' => 'New-password-123',
                'password_confirmation' => 'New-password-123',
            ])
            ->assertForbidden();
    }
}
