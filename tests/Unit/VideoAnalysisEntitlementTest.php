<?php

namespace Tests\Unit;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingEntitlementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class VideoAnalysisEntitlementTest extends TestCase
{
    use RefreshDatabase;

    public function test_free_users_cannot_analyze_videos(): void
    {
        $user = User::factory()->create([
            'current_plan_slug' => 'free',
            'plan_renews_at' => now()->addDay(),
        ]);

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

        $service->consumeVideoAnalysis($user);
        $this->assertSame(2, (int) data_get($user->subscriptions()->first()->metadata, 'subscription.video_analysis.used'));

        $service->refundVideoAnalysis($user);
        $this->assertSame(1, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
    }

    private function paidUserWithVideoAnalysisLimit(int $limit, int $used): User
    {
        $plan = PricingPlan::query()->create([
            'id' => (string) \Illuminate\Support\Str::ulid(),
            'name' => 'Basic',
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

        $user = User::factory()->create([
            'current_plan_slug' => 'basic',
            'plan_renews_at' => now()->addMonth(),
        ]);

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

        return $user;
    }
}
