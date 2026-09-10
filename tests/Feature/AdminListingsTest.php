<?php

namespace Tests\Feature;

use App\Models\IndexedKeyword;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminListingsTest extends TestCase
{
    use RefreshDatabase;

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
            '/x/admin/inquiries' => 'Inquiries',
            '/x/admin/plans' => 'Plans',
            '/x/admin/subscription' => 'Subscription',
            '/x/admin/users' => 'Users',
            '/x/admin/users/admin-users' => 'Admin Users',
            '/x/admin/keyword-index' => 'Keyword Index',
        ];

        foreach ($pages as $uri => $title) {
            $this->withAdminSession()
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
        $plan = PricingPlan::query()->create($this->planAttributes([
            'id' => (string) Str::ulid(),
            'name' => 'Growth',
            'slug' => 'growth',
        ]));

        $user = User::factory()->create([
            'name' => 'Jules',
            'email' => 'jules@example.com',
        ]);

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'metadata' => [
                'subscription' => [
                    'search_limits' => ['used' => 3, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => 4, 'limit' => 12],
                    'search_bookmarks' => ['used' => 1, 'limit' => 5],
                    'video_analysis' => ['used' => 2, 'limit' => 8],
                ],
            ],
        ]);

        $this->withAdminSession()
            ->get('/x/admin/users?search=Jules&status=active')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Listing')
                ->where('title', 'Users')
                ->where('search', 'Jules')
                ->where('query.status', 'active')
                ->where('pagination.total', 1)
                ->where('rows.0.credits', '7 left / 3 used')
                ->where('rows.0.preview.sections.1.fields.0.value', '3 used / 10 limit / 7 left'));
    }

    public function test_admin_can_create_a_plan(): void
    {
        $response = $this->withAdminSession()->post('/x/admin/records/plans', [
            'name' => 'Scale',
            'slug' => 'scale',
            'description' => 'For scaling teams',
            'plan_type' => 'paid',
            'cta' => 'Choose Scale',
            'popular' => true,
            'trial_enabled' => true,
            'amount' => 149,
            'annual_amount' => 129,
            'saved_amount' => 20,
            'price_cents' => 14900,
            'unit_amount' => 14900,
            'currency' => 'usd',
            'interval' => 'month',
            'interval_count' => 1,
            'duration' => 'monthly',
            'search_credits_limit' => -1,
            'video_bookmark_limit' => -1,
            'search_bookmark_limit' => -1,
            'video_analysis_limit' => 100,
            'plan_environment' => 'production',
            'is_active' => true,
        ]);

        $response->assertRedirect();

        $plan = PricingPlan::query()->where('slug', 'scale')->firstOrFail();

        $this->assertSame('Scale', $plan->name);
        $this->assertSame(-1, (int) data_get($plan->metadata, 'subscription.search_limits.limit'));
        $this->assertTrue((bool) data_get($plan->metadata, 'settings.popular'));
    }

    public function test_admin_can_update_subscription_and_related_usage_controls(): void
    {
        $plan = PricingPlan::query()->create($this->planAttributes([
            'id' => (string) Str::ulid(),
            'name' => 'Starter',
            'slug' => 'starter',
        ]));
        $user = User::factory()->create();
        $subscription = Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'trialing',
            'metadata' => [
                'subscription' => [
                    'search_limits' => ['used' => 2, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => 1, 'limit' => 5],
                    'search_bookmarks' => ['used' => 0, 'limit' => 5],
                    'video_analysis' => ['used' => 0, 'limit' => 2],
                ],
            ],
        ]);

        $this->withAdminSession()->patch("/x/admin/records/subscription/{$subscription->id}", [
            'status' => 'past_due',
            'credits' => 11,
            'search_credits_limit' => 25,
            'video_analysis_limit' => 9,
        ])->assertRedirect();

        $this->assertSame('past_due', $subscription->fresh()->status);
        $this->assertSame(11, (int) data_get($subscription->fresh()->metadata, 'subscription.search_limits.limit') - (int) data_get($subscription->fresh()->metadata, 'subscription.search_limits.used'));
        $this->assertSame(25, (int) data_get($plan->fresh()->metadata, 'subscription.search_limits.limit'));
        $this->assertSame(9, (int) data_get($plan->fresh()->metadata, 'subscription.video_analysis.limit'));
    }

    public function test_admin_can_archive_delete_and_restore_supported_records(): void
    {
        $video = ViralVideo::query()->create([
            'id' => (string) Str::ulid(),
            'video_id' => 'vid-123',
            'platform' => 'tiktok',
            'title' => 'Summer launch',
            'video_status' => 'visible',
        ]);

        $keyword = IndexedKeyword::query()->create([
            'label' => 'Summer Serum',
            'normalized_label' => 'summer serum',
            'keyword_type' => 'product',
            'source' => 'manual',
            'usage_count' => 3,
            'last_seen_at' => now(),
        ]);

        $this->withAdminSession()
            ->patch("/x/admin/records/viral-videos/{$video->id}/archive", ['archived' => true])
            ->assertRedirect();
        $this->assertNotNull($video->fresh()->archived_at);

        $this->withAdminSession()
            ->delete("/x/admin/records/keyword-index/{$keyword->id}")
            ->assertRedirect();
        $this->assertSoftDeleted('indexed_keywords', ['id' => $keyword->id]);

        $this->withAdminSession()
            ->patch("/x/admin/records/keyword-index/{$keyword->id}/restore")
            ->assertRedirect();
        $this->assertNull($keyword->fresh()->deleted_at);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function planAttributes(array $overrides = []): array
    {
        return array_merge([
            'id' => (string) Str::ulid(),
            'slug' => 'plan-'.Str::lower(Str::random(6)),
            'name' => 'Plan '.Str::upper(Str::random(3)),
            'description' => 'Admin test plan',
            'plan_type' => 'paid',
            'stripe_product_id' => null,
            'stripe_price_id' => null,
            'price_cents' => 9900,
            'currency' => 'usd',
            'interval' => 'month',
            'interval_count' => 1,
            'is_active' => true,
            'amount' => 99,
            'annual_amount' => 79,
            'saved_amount' => 20,
            'unit_amount' => 9900,
            'duration' => 'monthly',
            'plan_environment' => 'production',
            'metadata' => [
                'settings' => ['cta' => 'Choose plan', 'popular' => false],
                'subscription' => [
                    'trialEnabled' => true,
                    'search_limits' => ['used' => 0, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => 0, 'limit' => 10],
                ],
            ],
        ], $overrides);
    }

    private function withAdminSession(): self
    {
        return $this->withSession([
            'admin.authenticated' => true,
            'admin.user' => ['email' => 'admin@example.com'],
        ]);
    }
}
