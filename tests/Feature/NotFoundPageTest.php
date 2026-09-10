<?php

namespace Tests\Feature;

use Tests\TestCase;

class NotFoundPageTest extends TestCase
{
    public function test_missing_web_pages_show_the_branded_404(): void
    {
        $this->get('/page-that-does-not-exist')
            ->assertNotFound()
            ->assertInertia(fn ($page) => $page->component('Errors/NotFound'));
    }

    public function test_inertia_navigation_receives_a_404_page_instead_of_an_error_modal(): void
    {
        $this->withHeaders(['X-Inertia' => 'true'])->get('/page-that-does-not-exist')
            ->assertNotFound()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('component', 'Errors/NotFound');
    }

    public function test_missing_api_routes_still_return_json(): void
    {
        $this->getJson('/api/v1/route-that-does-not-exist')
            ->assertNotFound()
            ->assertJsonStructure(['message'])
            ->assertJsonMissingPath('component');
    }
}
