<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\UserActivity;
use App\Services\Admin\UserActivityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class UserActivityServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_limits_the_dashboard_preview_to_the_most_recent_activity(): void
    {
        $user = User::factory()->create();
        $activity = app(UserActivityService::class);

        $activity->record($user, 'engagement', 'logged_in', 'Logged in.');
        $activity->record($user, 'engagement', 'search_triggered', 'Triggered a brand search with keyword sunscreen.');
        UserActivity::query()->where('event', 'logged_in')->update(['created_at' => now()->subMinute()]);

        $payload = $activity->recentPayload(1);

        $this->assertCount(1, $payload['rows']);
        $this->assertSame('search_triggered', $payload['rows'][0]['event']);
    }

    public function test_it_filters_the_full_activity_log_by_category_and_event(): void
    {
        $user = User::factory()->create();
        $activity = app(UserActivityService::class);

        $activity->record($user, 'engagement', 'logged_in', 'Logged in.');
        $activity->record($user, 'engagement', 'search_triggered', 'Triggered a product search with keyword serum.');
        $activity->record($user, 'analysis', 'video_analysis_triggered', 'Triggered video analysis.');
        $activity->record($user, 'subscription', 'subscription_paid', 'Subscription is active.');

        $payload = $activity->activityLogPayload(Request::create('/x/admin/activity', 'GET', [
            'range' => '30D',
            'category' => 'engagement',
            'event' => 'search_triggered',
        ]));

        $this->assertSame('engagement', $payload['filters']['category']);
        $this->assertSame('search_triggered', $payload['filters']['event']);
        $this->assertCount(1, $payload['rows']);
        $this->assertSame('search_triggered', $payload['rows'][0]['event']);
        $this->assertContains('subscription_paid', $payload['events']);
        $this->assertContains('video_analysis_triggered', $payload['events']);

        $analysisPayload = $activity->activityLogPayload(Request::create('/x/admin/activity', 'GET', [
            'range' => '30D',
            'category' => 'analysis',
            'event' => 'video_analysis_triggered',
        ]));

        $this->assertSame('analysis', $analysisPayload['filters']['category']);
        $this->assertCount(1, $analysisPayload['rows']);
        $this->assertSame('video_analysis_triggered', $analysisPayload['rows'][0]['event']);
    }
}
