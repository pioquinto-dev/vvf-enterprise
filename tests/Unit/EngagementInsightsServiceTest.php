<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\UserActivity;
use App\Services\Admin\EngagementInsightsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EngagementInsightsServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_summarizes_adoption_usage_and_previous_range_trends(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();

        $this->activity($first, 'logged_in', now()->subDay());
        $this->activity($first, 'video_analysis_triggered', now()->subDay());
        $this->activity($first, 'video_analysis_triggered', now()->subDay());
        $this->activity($first, 'video_bookmarked', now()->subDay());
        $this->activity($second, 'search_triggered', now()->subDay());
        $this->activity($second, 'trial_started', now()->subDay());
        $this->activity($second, 'subscription_paid', now()->subDay());
        $this->activity($first, 'logged_in', now()->subDays(10));

        $payload = app(EngagementInsightsService::class)->payload(7);

        $this->assertSame(2, $payload['activeCreators']);
        $this->assertSame(50, $payload['adoption'][0]['percentage']);
        $this->assertSame('Started a trial', $payload['adoption'][3]['label']);
        $this->assertSame(1, $payload['trends'][2]['current']);
        $this->assertSame(2.0, $payload['frequency'][0]['average']);
        $this->assertSame(1, $payload['trends'][0]['current']);
        $this->assertSame(1, $payload['trends'][0]['previous']);
        $this->assertNotEmpty($payload['suggestions']);
    }

    private function activity(User $user, string $event, $createdAt): void
    {
        UserActivity::query()->create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'category' => 'engagement',
            'event' => $event,
            'summary' => $event,
            'created_at' => $createdAt,
        ]);
    }
}
