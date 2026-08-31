<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SettingsAppearanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_appearance_page_includes_normalized_appearance_preferences(): void
    {
        $user = User::factory()->create([
            'preferences' => [
                'appearance' => [
                    'compact_rows' => true,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->get('/settings/appearance')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Appearance')
                ->where('preferences.appearance.disable_animations', false)
                ->where('preferences.appearance.compact_rows', true)
                ->where('preferences.appearance.autoplay_previews', true)
                ->where('preferences.notifications.search_finished', true));
    }

    public function test_updating_appearance_can_persist_preferences_without_overwriting_other_groups(): void
    {
        $user = User::factory()->create([
            'preferences' => [
                'notifications' => [
                    'search_finished' => false,
                    'virality_alerts' => true,
                    'weekly_viral_digest' => false,
                ],
            ],
        ]);

        $this->actingAs($user)
            ->patch('/settings/appearance', [
                'preferences' => [
                    'appearance' => [
                        'disable_animations' => true,
                        'compact_rows' => true,
                        'autoplay_previews' => false,
                    ],
                ],
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertSame([
            'notifications' => [
                'search_finished' => false,
                'virality_alerts' => true,
                'weekly_viral_digest' => false,
            ],
            'appearance' => [
                'disable_animations' => true,
                'compact_rows' => true,
                'autoplay_previews' => false,
            ],
        ], $user->preferences);
    }
}
