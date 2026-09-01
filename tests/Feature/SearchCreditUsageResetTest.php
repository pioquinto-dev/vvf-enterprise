<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\BillingService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SearchCreditUsageResetTest extends TestCase
{
    use RefreshDatabase;

    private function paidUser(int $limit, int $used, ?CarbonImmutable $periodEnd = null): User
    {
        $periodEnd ??= CarbonImmutable::now()->addMonth();
        $plan = PricingPlan::query()->create([
            'id' => (string) Str::ulid(),
            'name' => 'Basic',
            'slug' => 'basic',
            'interval' => 'month',
            'interval_count' => 1,
            'price_cents' => 9900,
            'currency' => 'usd',
            'is_active' => true,
            'metadata' => ['subscription' => [
                'search_limits' => ['used' => 0, 'limit' => $limit],
                'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                'search_bookmarks' => ['used' => 0, 'limit' => 10],
                'video_analysis' => ['used' => 0, 'limit' => 10],
            ]],
        ]);

        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'current_period_starts_at' => CarbonImmutable::now()->subDay(),
            'current_period_ends_at' => $periodEnd,
            'metadata' => ['subscription' => [
                'search_limits' => [
                    'used' => $used,
                    'limit' => $limit,
                    'window_starts_at' => CarbonImmutable::now()->subDay()->toIso8601String(),
                    'window_ends_at' => $periodEnd->toIso8601String(),
                ],
                'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                'search_bookmarks' => ['used' => 0, 'limit' => 10],
                'video_analysis' => ['used' => 0, 'limit' => 10],
            ]],
        ]);

        return $user;
    }

    public function test_consume_then_sync_keeps_the_incremented_used(): void
    {
        $user = $this->paidUser(limit: 100, used: 0);
        $billing = app(BillingService::class);

        $billing->consumeSearchCredit($user);
        $this->assertSame(1, $billing->searchCreditsUsed($user), 'consume should increment used to 1');

        // Completion path.
        $billing->syncSubscriptionUsage($user);
        $this->assertSame(1, $billing->searchCreditsUsed($user), 'sync on completion must not reset used');
    }

    public function test_consume_then_sync_with_expired_window(): void
    {
        // A subscription whose credit window has already lapsed.
        $user = $this->paidUser(limit: 100, used: 5, periodEnd: CarbonImmutable::now()->subDay());
        $billing = app(BillingService::class);

        $billing->consumeSearchCredit($user);
        $usedAfterConsume = $billing->searchCreditsUsed($user);

        $billing->syncSubscriptionUsage($user);
        $this->assertSame($usedAfterConsume, $billing->searchCreditsUsed($user), 'sync must match post-consume used');
    }
}
