<?php

namespace Tests\Unit;

use App\Models\ViralVideoSharedTranscript;
use App\Services\ViralVideoAnalysis\SharedTranscriptStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SharedTranscriptStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_resolves_records_by_video_id_first(): void
    {
        $older = ViralVideoSharedTranscript::query()->create([
            'video_id' => '123',
            'post_url' => 'https://www.tiktok.com/@creator/video/123',
            'normalized_post_url' => 'https://tiktok.com/@creator/video/123',
            'transcript' => 'Older transcript',
        ]);

        ViralVideoSharedTranscript::query()->create([
            'video_id' => null,
            'post_url' => 'https://www.tiktok.com/@creator/video/123',
            'normalized_post_url' => 'https://tiktok.com/@creator/video/123',
            'transcript' => 'Fallback transcript',
        ]);

        $resolved = app(SharedTranscriptStore::class)->find('123', 'https://www.tiktok.com/@creator/video/123');

        $this->assertSame($older->id, $resolved?->id);
    }

    public function test_it_falls_back_to_latest_exact_post_url_match(): void
    {
        ViralVideoSharedTranscript::query()->create([
            'video_id' => null,
            'post_url' => 'https://www.tiktok.com/@creator/video/456',
            'normalized_post_url' => 'https://tiktok.com/@creator/video/456',
            'transcript' => 'First transcript',
            'updated_at' => now()->subMinute(),
        ]);

        $latest = ViralVideoSharedTranscript::query()->create([
            'video_id' => null,
            'post_url' => 'https://www.tiktok.com/@creator/video/456',
            'normalized_post_url' => 'https://tiktok.com/@creator/video/456',
            'transcript' => 'Latest transcript',
        ]);

        $resolved = app(SharedTranscriptStore::class)->find(null, 'https://www.tiktok.com/@creator/video/456');

        $this->assertSame($latest->id, $resolved?->id);
    }

    public function test_it_falls_back_to_latest_normalized_post_url_match(): void
    {
        ViralVideoSharedTranscript::query()->create([
            'video_id' => null,
            'post_url' => 'https://m.tiktok.com/@creator/video/789?foo=bar',
            'normalized_post_url' => 'https://m.tiktok.com/@creator/video/789',
            'transcript' => 'First transcript',
            'updated_at' => now()->subMinute(),
        ]);

        $latest = ViralVideoSharedTranscript::query()->create([
            'video_id' => null,
            'post_url' => 'https://m.tiktok.com/@creator/video/789?baz=qux',
            'normalized_post_url' => 'https://m.tiktok.com/@creator/video/789',
            'transcript' => 'Latest transcript',
        ]);

        $resolved = app(SharedTranscriptStore::class)->find(null, 'https://m.tiktok.com/@creator/video/789?utm_source=test');

        $this->assertSame($latest->id, $resolved?->id);
    }

    public function test_it_upserts_and_normalizes_transcript_payloads(): void
    {
        $record = app(SharedTranscriptStore::class)->upsertTranscript(
            videoId: '999',
            postUrl: 'https://www.tiktok.com/@creator/video/999?is_copy_url=1',
            transcript: "Line one\r\nLine two\r\n",
            transcriptSegments: [['start_ms' => 0, 'text' => 'Line one']],
            fetchedAt: now(),
        );

        $this->assertSame('999', $record->video_id);
        $this->assertSame('Line one'."\n".'Line two', $record->transcript);
        $this->assertSame('https://tiktok.com/@creator/video/999', $record->normalized_post_url);
        $this->assertSame('Line one', $record->transcript_segments[0]['text']);
    }
}
