<?php

namespace Tests\Feature;

use App\Models\ViralVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class RepairTiktokCdnMediaCommandTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');

        config()->set('services.apify.token', 'test-token');
        config()->set('services.apify.base_url', 'https://api.apify.com');
        config()->set('viral_video_analysis.apify.task_id', 'video-refresh-task');
        config()->set('viral_video_analysis.apify.input', []);
        config()->set('viral_videos.media.enabled', true);
        config()->set('viral_videos.media.disk', 's3');
        config()->set('viral_videos.media.prefix', 'viral_videos');
        config()->set('viral_videos.media.download.attempts', 1);
        config()->set('viral_videos.media.download.retry_delay_ms', 0);
    }

    private function fakeApifyRefresh(array $items): void
    {
        Http::fake([
            '*/actor-tasks/video-refresh-task/runs' => Http::response([
                'data' => ['id' => 'run-1', 'status' => 'RUNNING', 'defaultDatasetId' => 'dataset-1'],
            ]),
            '*/actor-runs/run-1' => Http::response([
                'data' => ['id' => 'run-1', 'status' => 'SUCCEEDED', 'defaultDatasetId' => 'dataset-1'],
            ]),
            '*/datasets/dataset-1/items*' => Http::response($items),
            'https://fresh.example.test/*' => Http::response('image-bytes', 200, ['Content-Type' => 'image/jpeg']),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function refreshedItem(array $overrides = []): array
    {
        return array_merge([
            'id' => '7300000000000000001',
            'text' => 'freshened payload',
            'webVideoUrl' => 'https://www.tiktok.com/@tester/video/7300000000000000001',
            'playCount' => 1_500_000,
            'diggCount' => 91_000,
            'commentCount' => 1_250,
            'shareCount' => 425,
            'collectCount' => 700,
            'authorMeta' => [
                'name' => 'tester',
                'nickName' => 'Tester',
                'fans' => 22_000,
                'avatar' => 'https://fresh.example.test/avatar.jpg',
            ],
            'videoMeta' => [
                'coverUrl' => 'https://fresh.example.test/cover.jpg',
                'originalCoverUrl' => 'https://fresh.example.test/thumb.jpg',
                'duration' => 21,
            ],
        ], $overrides);
    }

    public function test_dry_run_reports_affected_counts_without_persisting_changes(): void
    {
        $video = ViralVideo::create([
            'video_id' => '7300000000000000001',
            'platform' => 'tiktok',
            'username' => 'tester',
            'avatar' => 'https://p16-common-sign.tiktokcdn-us.com/avatar.jpeg',
            'cover' => 'https://p16-common-sign.tiktokcdn-us.com/cover.jpeg',
            'thumbnail_url' => 'https://p16-common-sign.tiktokcdn-us.com/thumb.jpeg',
            'video_url' => 'https://existing.example.test/video.mp4',
            'post_url' => 'https://www.tiktok.com/@tester/video/7300000000000000001',
            'followers' => 100,
            'views' => 200,
            'likes' => 3,
            'comments' => 4,
            'shares' => 5,
            'bookmarks' => 6,
            'virality_score' => 1.5,
        ]);

        $this->artisan('viral-videos:repair-tiktok-cdn-media', ['--dry-run' => true])
            ->expectsOutput('Dry run: TikTok CDN media repair')
            ->expectsOutput('Affected records: 1')
            ->expectsOutput('Records with avatar to update: 1')
            ->expectsOutput('Records with cover to update: 1')
            ->expectsOutput('Records with thumbnail_url to update: 1')
            ->expectsOutput('Limit this run: 100')
            ->expectsOutput('Chunk size: 25')
            ->expectsOutput('Batch count: all needed within limit')
            ->expectsOutput('Selected records this run: 1')
            ->expectsOutput('Dry-run summary')
            ->expectsOutput('No Apify runs were started and no records were changed.')
            ->expectsOutput('HEIC/HEIF files will be converted before storage on non-dry runs via the shared media archiver.')
            ->assertExitCode(0);

        $video->refresh();

        $this->assertSame('https://p16-common-sign.tiktokcdn-us.com/avatar.jpeg', $video->avatar);
        $this->assertSame('https://existing.example.test/video.mp4', $video->video_url);
        $this->assertSame(200, $video->views);
    }

    public function test_command_repairs_media_refreshes_stats_and_keeps_existing_video_url(): void
    {
        $video = ViralVideo::create([
            'video_id' => '7300000000000000001',
            'platform' => 'tiktok',
            'username' => 'tester',
            'avatar' => 'https://p16-common-sign.tiktokcdn-us.com/avatar.jpeg',
            'cover' => 'https://p16-common-sign.tiktokcdn-us.com/cover.jpeg',
            'thumbnail_url' => 'https://p16-common-sign.tiktokcdn-us.com/thumb.jpeg',
            'video_url' => 'https://existing.example.test/video.mp4',
            'post_url' => 'https://www.tiktok.com/@tester/video/7300000000000000001',
            'followers' => 100,
            'views' => 200,
            'likes' => 3,
            'comments' => 4,
            'shares' => 5,
            'bookmarks' => 6,
            'virality_score' => 1.5,
        ]);

        $this->fakeApifyRefresh([
            $this->refreshedItem([
                'videoUrl' => 'https://fresh.example.test/video.mp4',
            ]),
        ]);

        $this->artisan('viral-videos:repair-tiktok-cdn-media', [
            '--limit' => 100,
            '--chunk_by' => 25,
            '--batch_count' => 1,
        ])
            ->expectsOutput('TikTok CDN media repair')
            ->expectsOutput('Affected records: 1')
            ->expectsOutput('Limit this run: 100')
            ->expectsOutput('Chunk size: 25')
            ->expectsOutput('Batch count: 1')
            ->expectsOutput('Selected records this run: 1')
            ->expectsOutput('Selected records: 1')
            ->expectsOutput('Chunks processed: 1')
            ->expectsOutput('Updated records: 1')
            ->assertExitCode(0);

        $video->refresh();

        $this->assertStringContainsString('/viral_videos/tiktok/', $video->avatar);
        $this->assertStringContainsString('/viral_videos/tiktok/', $video->cover);
        $this->assertStringContainsString('/viral_videos/tiktok/', $video->thumbnail_url);
        $this->assertSame('https://existing.example.test/video.mp4', $video->video_url);
        $this->assertSame(22_000, $video->followers);
        $this->assertSame(1_500_000, $video->views);
        $this->assertSame(91_000, $video->likes);
        $this->assertSame(1_250, $video->comments);
        $this->assertSame(425, $video->shares);
        $this->assertSame(700, $video->bookmarks);
        $this->assertGreaterThan(1.5, $video->virality_score);
    }
}
