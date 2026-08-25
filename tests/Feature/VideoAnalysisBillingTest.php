<?php

namespace Tests\Feature;

use App\Jobs\PrepareVideoAnalysis;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\VideoPreparation;
use App\Models\ViralVideo;
use App\Services\ViralVideoAnalysis\UserVideoAnalysisProcessor;
use App\Services\ViralVideoAnalysis\VideoAnalysisManager;
use App\Services\ViralVideoAnalysis\VideoPreparationProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Mockery;
use Tests\TestCase;

class VideoAnalysisBillingTest extends TestCase
{
    use RefreshDatabase;

    public function test_starting_video_analysis_does_not_consume_a_credit_before_success(): void
    {
        Queue::fake();

        $user = $this->paidUserWithVideoAnalysisLimit(limit: 50, used: 0);
        $video = $this->video();

        $this->actingAs($user)
            ->postJson("/api/v1/videos/{$video->id}/analysis")
            ->assertAccepted();

        $this->assertSame(0, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
        Queue::assertPushed(PrepareVideoAnalysis::class);
    }

    public function test_retriggering_while_analysis_is_processing_does_not_queue_duplicate_work(): void
    {
        Queue::fake();

        $user = $this->paidUserWithVideoAnalysisLimit(limit: 50, used: 0);
        $video = $this->video();

        $this->actingAs($user)
            ->postJson("/api/v1/videos/{$video->id}/analysis")
            ->assertAccepted();

        $this->actingAs($user)
            ->postJson("/api/v1/videos/{$video->id}/analysis")
            ->assertAccepted();

        $this->assertSame(0, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
        Queue::assertPushed(PrepareVideoAnalysis::class, 1);
    }

    public function test_automatic_winner_analysis_completes_without_consuming_credit(): void
    {
        Queue::fake();

        $user = $this->paidUserWithVideoAnalysisLimit(limit: 50, used: 0);
        $video = $this->video();

        $this->mockPreparationAndAnalysisProcessors();

        $analysis = app(VideoAnalysisManager::class)->requestAutomaticWinnerAndWait($user, $video);

        $this->assertSame(VideoAnalysis::STATUS_COMPLETE, $analysis->status);
        $this->assertFalse((bool) $analysis->counts_toward_quota);
        $this->assertSame(0, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
    }

    public function test_retrying_a_failed_free_winner_analysis_stays_free(): void
    {
        Queue::fake();

        $user = $this->paidUserWithVideoAnalysisLimit(limit: 50, used: 0);
        $video = $this->video();

        VideoAnalysis::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'viral_video_id' => $video->id,
            'video_id' => $video->video_id,
            'counts_toward_quota' => false,
            'status' => VideoAnalysis::STATUS_FAILED,
            'error_message' => 'We could not prepare this video yet. Please try again later.',
        ]);

        $this->mockPreparationAndAnalysisProcessors();

        $analysis = app(VideoAnalysisManager::class)->requestAutomaticWinnerAndWait($user, $video);

        $this->assertSame(VideoAnalysis::STATUS_COMPLETE, $analysis->status);
        $this->assertFalse((bool) $analysis->counts_toward_quota);
        $this->assertSame(0, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
    }

    private function paidUserWithVideoAnalysisLimit(int $limit, int $used): User
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
                    'viral_video_bookmarks' => ['used' => 0, 'limit' => 10],
                    'search_bookmarks' => ['used' => 0, 'limit' => 10],
                    'video_analysis' => ['used' => $used, 'limit' => $limit],
                ],
            ],
        ]);

        return $user;
    }

    private function video(): ViralVideo
    {
        return ViralVideo::query()->create([
            'id' => (string) Str::ulid(),
            'video_id' => '7300000000000000001',
            'title' => 'Test video',
            'username' => 'tester',
            'name' => 'Tester',
            'post_url' => 'https://www.tiktok.com/@tester/video/7300000000000000001',
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

    private function mockPreparationAndAnalysisProcessors(): void
    {
        $this->mock(VideoPreparationProcessor::class, function (Mockery\MockInterface $mock): void {
            $mock->shouldReceive('process')
                ->once()
                ->with(Mockery::type(VideoPreparation::class))
                ->andReturnUsing(function (VideoPreparation $preparation): void {
                    $preparation->forceFill([
                        'status' => VideoPreparation::STATUS_COMPLETE,
                        'prepared_at' => now(),
                        'error_message' => null,
                    ])->save();
                });
        });

        $this->mock(UserVideoAnalysisProcessor::class, function (Mockery\MockInterface $mock): void {
            $mock->shouldReceive('process')
                ->once()
                ->with(Mockery::type(VideoAnalysis::class))
                ->andReturnUsing(function (VideoAnalysis $analysis): void {
                    $analysis->forceFill([
                        'status' => VideoAnalysis::STATUS_COMPLETE,
                        'transcript' => 'Transcript',
                        'transcript_segments' => [],
                        'result' => ['why_it_went_viral' => 'Test'],
                        'error_message' => null,
                        'analyzed_at' => now(),
                    ])->save();
                });
        });
    }
}
