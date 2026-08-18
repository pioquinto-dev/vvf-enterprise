<?php

namespace Tests\Unit;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\VideoBookmark;
use App\Models\ViralVideo;
use App\Services\Billing\BillingEntitlementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class VideoBookmarkEntitlementTest extends TestCase
{
    use RefreshDatabase;

    public function test_paid_users_at_limit_cannot_bookmark_more_videos_even_after_removing_one(): void
    {
        $user = $this->paidUserWithVideoBookmarkLimit(limit: 2, used: 2);
        $videos = [$this->video('7300000000000000001'), $this->video('7300000000000000002')];

        foreach ($videos as $video) {
            VideoBookmark::query()->create([
                'user_id' => $user->id,
                'viral_video_id' => $video->id,
            ]);
        }

        VideoBookmark::query()->where('viral_video_id', $videos[0]->id)->delete();

        $this->expectException(ValidationException::class);

        app(BillingEntitlementService::class)->ensureCanBookmark($user);
    }

    public function test_consuming_video_bookmark_increments_usage_without_being_refunded_by_removal(): void
    {
        $user = $this->paidUserWithVideoBookmarkLimit(limit: 5, used: 1);
        $service = app(BillingEntitlementService::class);
        $video = $this->video('7300000000000000003');

        VideoBookmark::query()->create([
            'user_id' => $user->id,
            'viral_video_id' => $video->id,
        ]);

        $service->consumeVideoBookmark($user);
        $this->assertSame(2, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.viral_video_bookmarks.used'));

        VideoBookmark::query()
            ->where('user_id', $user->id)
            ->where('viral_video_id', $video->id)
            ->delete();

        $this->assertSame(2, $service->videoBookmarkCount($user));
    }

    private function paidUserWithVideoBookmarkLimit(int $limit, int $used): User
    {
        $plan = PricingPlan::query()->create([
            'id' => (string) Str::ulid(),
            'name' => 'Growth',
            'slug' => 'basic',
            'interval' => 'month',
            'interval_count' => 1,
            'price_cents' => 1000,
            'currency' => 'usd',
            'is_active' => true,
            'metadata' => [
                'subscription' => [
                    'trialEnabled' => false,
                    'search_limits' => ['used' => 0, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => $limit],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => 0, 'limit' => 10],
                ],
            ],
        ]);

        $user = User::factory()->create([
            'current_plan_slug' => 'basic',
            'plan_renews_at' => now()->addMonth(),
        ]);

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => [
                'subscription' => [
                    'trialEnabled' => false,
                    'search_limits' => ['used' => 0, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => $used, 'limit' => $limit],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => 0, 'limit' => 10],
                ],
            ],
        ]);

        return $user;
    }

    private function video(string $videoId): ViralVideo
    {
        return ViralVideo::query()->create([
            'id' => (string) Str::ulid(),
            'video_id' => $videoId,
            'title' => 'Test video',
            'username' => 'tester',
            'name' => 'Tester',
            'post_url' => "https://www.tiktok.com/@tester/video/{$videoId}",
            'views' => 1000,
            'likes' => 100,
            'comments' => 10,
            'shares' => 5,
            'bookmarks' => 2,
            'followers' => 10000,
            'duration' => 14,
            'virality_score' => 2.5,
        ]);
    }
}
