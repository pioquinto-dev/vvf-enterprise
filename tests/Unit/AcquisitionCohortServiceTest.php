<?php

namespace Tests\Unit;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserActivity;
use App\Models\UtmAttribution;
use App\Services\Admin\AcquisitionCohortService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcquisitionCohortServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_cohort_outcomes_survive_cancellation_and_deletion_without_counting_trial_end_as_payment(): void
    {
        $this->travelTo(CarbonImmutable::parse('2026-09-07 12:00:00', 'UTC'));
        $user = User::factory()->create(['created_at' => now()->subDays(20)]);
        $unpaid = User::factory()->create(['created_at' => now()->subDays(20)]);
        User::factory()->create(['created_at' => now()->subDays(40)]);
        UtmAttribution::create(['user_id' => $user->id, 'utm_source' => 'TikTok', 'utm_medium' => 'paid_social', 'utm_campaign' => 'Launch']);
        UtmAttribution::create(['user_id' => $user->id, 'subscription_id' => 'copy', 'utm_source' => 'ignore']);
        foreach ([$user, $unpaid] as $owner) {
            Subscription::create(['id' => (string) str()->ulid(), 'user_id' => $owner->id,
                'status' => 'canceled', 'trial_started_at' => now()->subDays(10), 'trial_completed_at' => now()->subDays(3)]);
        }
        UserActivity::create(['user_id' => $user->id, 'user_name' => $user->name, 'user_email' => $user->email,
            'category' => 'subscription', 'event' => 'subscription_paid', 'summary' => 'Paid', 'created_at' => now()->subDays(2)]);
        $search = CustomKeywordSearch::create(['user_id' => $user->id, 'name' => 'Brand', 'phrase' => 'brand', 'keywords' => ['brand'], 'keyword_signature' => 'brand']);
        CustomKeywordSearchRun::create(['custom_keyword_search_id' => $search->id, 'status' => 'done', 'completed_at' => now()->subDay()]);
        $search->delete();
        $user->delete();

        // Outcomes after the signup window still belong to this cohort.
        $payload = app(AcquisitionCohortService::class)->payload(CarbonImmutable::now()->subDays(25), CarbonImmutable::now()->subDays(15));
        $this->assertSame(['signups' => 2, 'completed' => 1, 'trials' => 2, 'paid' => 1, 'rate' => 50.0], $payload['totals']);
        $groups = collect($payload['groups'])->keyBy('source');
        $this->assertSame('paid_social', $groups['tiktok']['medium']);
        $this->assertSame('Launch', $groups['tiktok']['campaigns'][0]['campaign']);
        $this->assertSame(1, $groups['tiktok']['paid']);
        $this->assertSame(0, $groups['Source not recorded']['paid']);
        $this->assertCount(2, $payload['rows']);
    }

    public function test_all_users_are_available_for_drilldowns_and_mediums_remain_distinct(): void
    {
        $users = User::factory()->count(56)->create();
        foreach ($users as $index => $user) {
            UtmAttribution::create(['user_id' => $user->id, 'utm_source' => 'google', 'utm_medium' => $index < 28 ? 'cpc' : 'organic']);
        }
        $payload = app(AcquisitionCohortService::class)->payload(CarbonImmutable::now()->startOfDay(), CarbonImmutable::now()->endOfDay());
        $this->assertCount(56, $payload['rows']);
        $this->assertCount(2, $payload['groups']);
        $this->assertSame(28, $payload['groups'][0]['signups']);
        $this->assertSame(28, $payload['groups'][1]['signups']);
    }

    public function test_multiple_subscriptions_count_once_and_earliest_signup_attribution_wins(): void
    {
        $user = User::factory()->create();
        UtmAttribution::create(['user_id' => $user->id, 'utm_source' => ' Referral ', 'utm_campaign' => 'Partner']);
        UtmAttribution::create(['user_id' => $user->id, 'utm_source' => 'later']);
        foreach (['active', 'paid'] as $status) {
            Subscription::create(['id' => (string) str()->ulid(), 'user_id' => $user->id,
                'status' => $status, 'trial_started_at' => now()->subHour()]);
        }
        $payload = app(AcquisitionCohortService::class)->payload(CarbonImmutable::now()->startOfDay(), CarbonImmutable::now()->endOfDay());
        $this->assertSame(1, $payload['totals']['paid']);
        $this->assertSame(1, $payload['totals']['trials']);
        $this->assertSame(100.0, $payload['totals']['rate']);
        $this->assertSame('referral', $payload['groups'][0]['source']);
        $this->assertSame('Medium not recorded', $payload['groups'][0]['medium']);
    }

    public function test_empty_cohort_has_zero_counts(): void
    {
        $payload = app(AcquisitionCohortService::class)->payload(CarbonImmutable::now()->startOfDay(), CarbonImmutable::now()->endOfDay());
        $this->assertSame([], $payload['rows']);
        $this->assertSame([], $payload['groups']);
        $this->assertSame(['signups' => 0, 'completed' => 0, 'trials' => 0, 'paid' => 0, 'rate' => 0], $payload['totals']);
    }
}
