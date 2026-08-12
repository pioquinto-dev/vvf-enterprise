<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminListingsTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('admin.root_name', 'Root Admin');
        config()->set('admin.root_email', 'admin@example.com');
        config()->set('admin.root_password', 'super-secret');
        config()->set('admin.session_key', 'admin.authenticated');
    }

    public function test_admin_listing_pages_render_the_shared_listing_screen(): void
    {
        $pages = [
            '/x/admin/viral-videos' => 'Viral Videos',
            '/x/admin/searches' => 'Searches',
            '/x/admin/plans' => 'Plans',
            '/x/admin/subscription' => 'Subscription',
            '/x/admin/users' => 'Users',
            '/x/admin/users/admin-users' => 'Admin Users',
        ];

        foreach ($pages as $uri => $title) {
            $this->withSession(['admin.authenticated' => true, 'admin.user' => ['email' => 'admin@example.com']])
                ->get($uri)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Admin/Listing')
                    ->where('title', $title)
                    ->where('pagination.perPage', 25));
        }
    }

    public function test_admin_listings_apply_search_and_filter_query_state(): void
    {
        $this->withSession(['admin.authenticated' => true, 'admin.user' => ['email' => 'admin@example.com']])
            ->get('/x/admin/users?search=Jules&status=active')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Listing')
                ->where('title', 'Users')
                ->where('search', 'Jules')
                ->where('query.status', 'active')
                ->where('pagination.total', 1));
    }
}
