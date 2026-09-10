<?php

namespace Tests\Unit;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\ViralVideo;
use App\Services\Billing\BillingEntitlementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class VideoAnalysisEntitlementTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_users_cannot_analyze_videos(): void
    {
        $user = User::factory()->create();

        $this->expectException(ValidationException::class);

        app(BillingEntitlementService::class)->ensureCanAnalyzeVideo($user);
    }

    public function test_paid_users_with_remaining_limit_can_analyze_videos(): void
    {
        $user = $this->paidUserWithVideoAnalysisLimit(limit: 2, used: 1);

        app(BillingEntitlementService::class)->ensureCanAnalyzeVideo($user);

        $this->assertTrue(true);
    }

    public function test_paid_users_at_limit_cannot_analyze_more_videos(): void
    {
        $user = $this->paidUserWithVideoAnalysisLimit(limit: 2, used: 2);

        $this->expectException(ValidationException::class);

        app(BillingEntitlementService::class)->ensureCanAnalyzeVideo($user);
    }

    public function test_consuming_and_refunding_video_analysis_updates_subscription_usage(): void
    {
        $user = $this->paidUserWithVideoAnalysisLimit(limit: 5, used: 1);
        $service = app(BillingEntitlementService::class);

        // consumeVideoAnalysis() syncs the metadata counter up to the derived
        // (real row) count rather than blindly incrementing it, so a second
        // analysis has to actually exist for the count to move to 2.
        $this->analysisFor($user);

        $service->consumeVideoAnalysis($user);
        $this->assertSame(2, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));

        $service->refundVideoAnalysis($user);
        $this->assertSame(1, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
    }

    private function paidUserWithVideoAnalysisLimit(int $limit, int $used): User
    {
        $plan = PricingPlan::query()->create([
            'id' => (string) \Illuminate\Support\Str::ulid(),
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
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => 0, 'limit' => $limit],
                ],
            ],
        ]);

        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) \Illuminate\Support\Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'current_period_starts_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'metadata' => [
                'subscription' => [
                    'trialEnabled' => false,
                    'search_limits' => ['used' => 0, 'limit' => 10],
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => $used, 'limit' => $limit],
                ],
            ],
        ]);

        // Usage is derived from actual VideoAnalysis rows within the current
        // billing window, not the metadata counter above (which is only a
        // synced high-water mark) — so the limit gate needs real rows too.
        for ($i = 0; $i < $used; $i++) {
            $this->analysisFor($user);
        }

        return $user;
    }

    private function analysisFor(User $user): VideoAnalysis
    {
        $video = ViralVideo::query()->create([
            'id' => (string) Str::ulid(),
            'video_id' => (string) Str::ulid(),
        ]);

        return VideoAnalysis::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'viral_video_id' => $video->id,
            'video_id' => $video->video_id,
            'status' => VideoAnalysis::STATUS_PROCESSING,
            'counts_toward_quota' => true,
        ]);
    }
}
