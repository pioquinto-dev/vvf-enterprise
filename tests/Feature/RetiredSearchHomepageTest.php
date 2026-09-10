<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * My Feed is the signed-in landing page. The search homepage and the standalone
 * /search wizard are retired; searches now start from the brand/product hubs.
 */
class RetiredSearchHomepageTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_site_root_sends_signed_in_users_to_my_feed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/')->assertRedirect('/home');
        $this->actingAs($user)->get('/home')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Feed'));
    }

    public function test_the_site_root_keeps_the_marketing_page_for_guests(): void
    {
        config(['features.show_coming_soon' => false]);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Landing'));
    }

    public function test_the_retired_search_homepage_sends_signed_in_users_to_my_feed(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/dashboard')->assertRedirect('/home');
        $this->actingAs($user)->get('/search')->assertRedirect('/home');
    }

    public function test_the_brand_and_product_hubs_prefill_the_inline_flow_from_a_query(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/brands?q=rhode%20skin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('prefillQuery', 'rhode skin'));

        $this->actingAs($user)
            ->get('/products?q=lip%20oil')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('prefillQuery', 'lip oil'));
    }

    public function test_the_hubs_carry_no_prefill_without_a_query(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/brands')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('prefillQuery', ''));
    }
}
