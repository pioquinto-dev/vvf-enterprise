<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
