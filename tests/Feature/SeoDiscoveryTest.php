<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_robots_points_crawlers_to_the_canonical_sitemap(): void
    {
        config()->set('app.url', 'https://www.brandbeacon.example');

        $this->get('/robots.txt')
            ->assertOk()
            ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
            ->assertSeeText('Allow: /')
            ->assertSeeText('Sitemap: https://www.brandbeacon.example/sitemap.xml');
    }

    public function test_sitemap_contains_only_stable_public_pages(): void
    {
        config()->set('app.url', 'https://www.brandbeacon.example');

        $response = $this->get('/sitemap.xml');

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('https://www.brandbeacon.example/contact', false)
            ->assertSee('https://www.brandbeacon.example/security', false)
            ->assertSee('https://www.brandbeacon.example/tiktok-brand-tracking', false)
            ->assertSee('https://www.brandbeacon.example/ugc-trend-discovery', false)
            ->assertDontSee('/search', false)
            ->assertDontSee('/dashboard', false);
    }

    public function test_landing_shares_the_canonical_application_url(): void
    {
        config()->set('features.show_coming_soon', false);
        config()->set('app.url', 'https://www.brandbeacon.example');

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Landing')
                ->where('app.url', 'https://www.brandbeacon.example'));
    }

    public function test_solution_landing_pages_render_their_expected_topic(): void
    {
        $pages = [
            '/tiktok-brand-tracking' => 'brand-tracking',
            '/tiktok-product-research' => 'product-research',
            '/viral-video-monitoring' => 'viral-video-monitoring',
            '/ugc-trend-discovery' => 'ugc-trend-discovery',
        ];

        foreach ($pages as $path => $topic) {
            $this->get($path)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('LandingSolution')
                    ->where('topic', $topic));
        }
    }

    public function test_retired_competitor_tracking_url_redirects_to_brand_tracking(): void
    {
        $this->get('/competitor-tracking')
            ->assertRedirect('/tiktok-brand-tracking')
            ->assertStatus(301);
    }
}
