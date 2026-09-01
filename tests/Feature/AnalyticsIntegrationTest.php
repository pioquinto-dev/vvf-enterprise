<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\ViralVideo;
use App\Services\Analytics\AnalyticsEvent;
use App\Services\Analytics\AnalyticsEventManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AnalyticsIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_saved_search_creation_returns_analytics_payload(): void
    {
        $this->postJson('/api/v1/saved-searches', [
            'phrase' => 'summer fridays',
            'keywords' => ['summer fridays'],
            'frequency' => 'weekly',
        ])->assertCreated()
            ->assertJsonPath('analytics.0.event', 'search_created')
            ->assertJsonPath('analytics.0.parameters.search_phrase', 'summer fridays');
    }

    public function test_video_bookmark_returns_analytics_payload(): void
    {
        $user = $this->paidUser();
        $video = $this->video();

        $this->actingAs($user)
            ->postJson("/api/v1/videos/{$video->id}/bookmark")
            ->assertOk()
            ->assertJsonPath('analytics.0.event', 'video_bookmarked')
            ->assertJsonPath('analytics.0.parameters.video_id', (string) $video->id);
    }

    public function test_video_analysis_request_returns_analytics_payload(): void
    {
        Queue::fake();

        $user = $this->paidUser();
        $video = $this->video();

        $this->actingAs($user)
            ->postJson("/api/v1/videos/{$video->id}/analysis")
            ->assertAccepted()
            ->assertJsonPath('analytics.0.event', 'video_analysis_requested')
            ->assertJsonPath('analytics.0.parameters.video_id', (string) $video->id);
    }

    public function test_subscription_cancel_request_returns_analytics_payload(): void
    {
        $user = $this->paidUser();

        $this->actingAs($user)
            ->postJson('/settings/subscription/cancel')
            ->assertOk()
            ->assertJsonPath('analytics.0.event', 'subscription_cancellation_requested')
            ->assertJsonPath('analytics.0.parameters.plan_slug', 'basic');
    }

    public function test_queued_user_analytics_events_are_shared_once_through_inertia(): void
    {
        $user = User::factory()->create();

        app(AnalyticsEventManager::class)->queueForUser($user, AnalyticsEvent::make('subscription_started', [
            'plan_slug' => 'basic',
        ]));

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('analytics.enabled', false)
                ->has('analytics.events', 1)
                ->where('analytics.events.0.event', 'subscription_started')
                ->where('analytics.events.0.parameters.plan_slug', 'basic'));

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('analytics.events', 0));
    }

    private function paidUser(): User
    {
        $plan = PricingPlan::query()->create([
            'id' => (string) Str::ulid(),
            'name' => 'Growth',
            'slug' => 'basic',
            'interval' => 'month',
            'interval_count' => 1,
            'price_cents' => 1000,
            'currency' => 'usd',
            'stripe_price_id' => 'price_test_basic',
            'is_active' => true,
            'metadata' => [
                'subscription' => [
                    'trialEnabled' => false,
                    'search_limits' => ['used' => 0, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => 0, 'limit' => 10],
                ],
            ],
        ]);

        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'stripe_subscription_id' => 'sub_test_123',
            'status' => 'active',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => [
                'plan_slug' => 'basic',
                'subscription' => [
                    'trialEnabled' => false,
                    'search_limits' => ['used' => 0, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => 0, 'limit' => 10],
                ],
            ],
        ]);

        return $user;
    }

    private function video(): ViralVideo
    {
        return ViralVideo::query()->create([
            'id' => (string) Str::ulid(),
            'video_id' => '7300000000000000999',
            'title' => 'Analytics test video',
            'username' => 'analytics_tester',
            'name' => 'Analytics Tester',
            'post_url' => 'https://www.tiktok.com/@analytics_tester/video/7300000000000000999',
            'views' => 1500,
            'likes' => 100,
            'comments' => 10,
            'shares' => 5,
            'bookmarks' => 3,
            'followers' => 25000,
            'duration' => 21,
            'virality_score' => 2.8,
        ]);
    }
}
