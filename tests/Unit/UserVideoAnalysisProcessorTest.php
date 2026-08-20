<?php

namespace Tests\Unit;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\VideoPreparation;
use App\Models\ViralVideo;
use App\Services\Apify\ApifyConnectionException;
use App\Services\ViralVideoAnalysis\CreativeStrategistGenerator;
use App\Services\ViralVideoAnalysis\SharedDiagnosticAnalyzer;
use App\Services\ViralVideoAnalysis\SharedTranscriptStore;
use App\Services\ViralVideoAnalysis\TranscriptFetcher;
use App\Services\ViralVideoAnalysis\TranscriptPayloadNormalizer;
use App\Services\ViralVideoAnalysis\UserVideoAnalysisProcessor;
use App\Services\ViralVideoAnalysis\VideoPreparationProcessor;
use App\Services\ViralVideoAnalysis\VideoSourceRefresher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Mockery;
use Tests\TestCase;

class UserVideoAnalysisProcessorTest extends TestCase
{
    use RefreshDatabase;

    public function test_successful_analysis_consumes_one_credit(): void
    {
        $user = $this->paidUserWithVideoAnalysisLimit(limit: 50, used: 0);
        $analysis = $this->analysisFor($user);
        $this->preparationFor($analysis);

        $mock = Mockery::mock(CreativeStrategistGenerator::class);
        $mock->shouldReceive('generate')
            ->once()
            ->with($analysis->video_id)
            ->andReturn([
                'transcript' => 'hello world',
                'transcript_segments' => [],
                'result' => ['creative_strategy' => ['summary' => 'Keep it punchy.']],
            ]);
        app()->instance(CreativeStrategistGenerator::class, $mock);

        app(UserVideoAnalysisProcessor::class)->process($analysis->fresh());

        $this->assertSame('complete', $analysis->fresh()->status);
        $this->assertSame(1, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
    }

    public function test_failed_analysis_does_not_consume_a_credit(): void
    {
        $user = $this->paidUserWithVideoAnalysisLimit(limit: 50, used: 0);
        $analysis = $this->analysisFor($user);
        $this->preparationFor($analysis);

        $mock = Mockery::mock(CreativeStrategistGenerator::class);
        $mock->shouldReceive('generate')
            ->once()
            ->with($analysis->video_id)
            ->andReturn(null);
        app()->instance(CreativeStrategistGenerator::class, $mock);

        app(UserVideoAnalysisProcessor::class)->process($analysis->fresh());

        $this->assertSame('failed', $analysis->fresh()->status);
        $this->assertSame(0, (int) data_get($user->subscriptions()->first()->fresh()->metadata, 'subscription.video_analysis.used'));
    }

    public function test_apify_connection_failure_marks_the_analysis_failed_without_consuming_a_credit(): void
    {
        $user = $this->paidUserWithVideoAnalysisLimit(limit: 50, used: 0);
        $video = ViralVideo::query()->create([
            'id' => (string) Str::ulid(),
            'video_id' => '7300000000000000002',
            'post_url' => 'https://www.tiktok.com/@tester/video/7300000000000000002',
        ]);
        $analysis = VideoAnalysis::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'viral_video_id' => $video->id,
            'video_id' => $video->video_id,
            'status' => VideoAnalysis::STATUS_PROCESSING,
        ]);
        $preparation = VideoPreparation::query()->create([
            'id' => (string) Str::ulid(),
            'viral_video_id' => $video->id,
            'video_id' => $video->video_id,
            'status' => VideoPreparation::STATUS_PROCESSING,
        ]);

        $refresher = Mockery::mock(VideoSourceRefresher::class);
        $refresher->shouldReceive('refresh')
            ->once()
            ->with(Mockery::on(fn (ViralVideo $candidate): bool => $candidate->is($video)))
            ->andThrow(new ApifyConnectionException('Could not resolve host: api.apify.com'));

        $processor = new VideoPreparationProcessor(
            Mockery::mock(SharedTranscriptStore::class),
            $refresher,
            Mockery::mock(TranscriptFetcher::class),
            Mockery::mock(TranscriptPayloadNormalizer::class),
            Mockery::mock(SharedDiagnosticAnalyzer::class),
        );

        $processor->process($preparation);

        $this->assertSame(VideoPreparation::STATUS_FAILED, $preparation->fresh()->status);
        $this->assertSame('Something went wrong. Try again or contact support.', $preparation->fresh()->error_message);
        $this->assertSame(VideoAnalysis::STATUS_FAILED, $analysis->fresh()->status);
        $this->assertSame('Something went wrong. Try again or contact support.', $analysis->fresh()->error_message);
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

    private function analysisFor(User $user): VideoAnalysis
    {
        return VideoAnalysis::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'viral_video_id' => (string) Str::ulid(),
            'video_id' => '7300000000000000001',
            'status' => VideoAnalysis::STATUS_PROCESSING,
        ]);
    }

    private function preparationFor(VideoAnalysis $analysis): void
    {
        VideoPreparation::query()->create([
            'id' => (string) Str::ulid(),
            'viral_video_id' => $analysis->viral_video_id,
            'video_id' => $analysis->video_id,
            'status' => VideoPreparation::STATUS_COMPLETE,
            'prepared_at' => now(),
        ]);
    }
}
