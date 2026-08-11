<?php

namespace Tests\Feature;

use App\Models\ComingSoonInterest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ComingSoonPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_root_shows_landing_page_when_coming_soon_flag_is_disabled(): void
    {
        config()->set('features.show_coming_soon', false);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('Landing'));
    }

    public function test_root_shows_coming_soon_page_when_flag_is_enabled(): void
    {
        config()->set('features.show_coming_soon', true);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->component('ComingSoon'));
    }

    public function test_waitlist_email_is_saved_when_flag_is_enabled(): void
    {
        config()->set('features.show_coming_soon', true);

        $response = $this->post('/coming-soon-interest', [
            'email' => 'Launch@Example.com',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('status');

        $this->assertDatabaseHas('coming_soon_interests', [
            'email' => 'launch@example.com',
        ]);
    }

    public function test_waitlist_endpoint_is_not_available_when_flag_is_disabled(): void
    {
        config()->set('features.show_coming_soon', false);

        $response = $this->post('/coming-soon-interest', [
            'email' => 'launch@example.com',
        ]);

        $response->assertNotFound();
    }
}
