<?php

namespace Tests\Feature;

use App\Services\Media\MediaArchiver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The archiver's contract is mostly about what it does when things go wrong,
 * because that is what decides whether a card shows an image next month.
 */
class MediaArchiverTest extends TestCase
{
    use RefreshDatabase;

    private const SOURCE = 'https://p16.tiktokcdn.com/obj/cover.jpeg';

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');

        config()->set('viral_videos.media.enabled', true);
        config()->set('viral_videos.media.disk', 's3');
        config()->set('viral_videos.media.prefix', 'viral_videos');
        config()->set('viral_videos.media.download.attempts', 2);
        config()->set('viral_videos.media.download.retry_delay_ms', 0);
    }

    private function attributes(array $overrides = []): array
    {
        return array_merge([
            'video_id' => '7412345678901234567',
            'created_at' => '2026-08-01T00:00:00Z',
            'apify_trigger_id' => 42,
            'cover' => self::SOURCE,
            'thumbnail_url' => null,
            'avatar' => null,
        ], $overrides);
    }

    public function test_it_does_nothing_when_archiving_is_disabled(): void
    {
        config()->set('viral_videos.media.enabled', false);
        Http::preventStrayRequests();

        $result = app(MediaArchiver::class)->archiveWithReport($this->attributes());

        $this->assertSame(self::SOURCE, $result['attributes']['cover']);
        $this->assertSame([], $result['failures']);
    }

    public function test_it_skips_rows_without_a_usable_identity(): void
    {
        Http::preventStrayRequests();

        $archiver = app(MediaArchiver::class);

        $this->assertFalse($archiver->shouldArchive($this->attributes(['video_id' => ''])));
        $this->assertFalse($archiver->shouldArchive($this->attributes(['created_at' => null])));
        $this->assertTrue($archiver->shouldArchive($this->attributes()));
    }

    public function test_a_successful_archive_stores_the_object_and_rewrites_the_url(): void
    {
        Http::fake([
            '*' => Http::response('binary-image-bytes', 200, ['Content-Type' => 'image/jpeg']),
        ]);

        $result = app(MediaArchiver::class)->archiveWithReport($this->attributes());

        $folder = '42_7412345678901234567_'.strtotime('2026-08-01T00:00:00Z');
        $expected = "viral_videos/tiktok/{$folder}/{$folder}_video_cover.jpg";

        Storage::disk('s3')->assertExists($expected);
        $this->assertSame(Storage::disk('s3')->url($expected), $result['attributes']['cover']);
        $this->assertSame([], $result['failures']);
    }

    public function test_each_field_is_archived_independently(): void
    {
        Http::fake([
            '*avatar*' => Http::response('', 404),
            '*' => Http::response('bytes', 200, ['Content-Type' => 'image/png']),
        ]);

        $result = app(MediaArchiver::class)->archiveWithReport($this->attributes([
            'thumbnail_url' => 'https://p16.tiktokcdn.com/obj/thumb.png',
            'avatar' => 'https://p16.tiktokcdn.com/obj/avatar.png',
        ]));

        // The dead avatar must not take the cover down with it.
        $this->assertStringContainsString('video_cover.png', $result['attributes']['cover']);
        $this->assertStringContainsString('thumbnail.png', $result['attributes']['thumbnail_url']);
        $this->assertSame('', $result['attributes']['avatar']);
        $this->assertCount(1, $result['failures']);
        $this->assertSame('avatar', $result['failures'][0]['kind']);
    }

    public function test_an_expired_signed_url_is_cleared_without_a_request(): void
    {
        Http::preventStrayRequests();

        $expired = 'https://p16.tiktokcdn.com/obj/cover.jpeg?x-expires='.(now()->getTimestamp() - 60);

        $result = app(MediaArchiver::class)->archiveWithReport($this->attributes(['cover' => $expired]));

        $this->assertSame('', $result['attributes']['cover']);
        $this->assertStringContainsString('already expired', $result['failures'][0]['message']);
    }

    public function test_a_live_signature_is_still_downloaded(): void
    {
        Http::fake(['*' => Http::response('bytes', 200, ['Content-Type' => 'image/jpeg'])]);

        $live = 'https://p16.tiktokcdn.com/obj/cover.jpeg?x-expires='.(now()->getTimestamp() + 3600);

        $result = app(MediaArchiver::class)->archiveWithReport($this->attributes(['cover' => $live]));

        $this->assertStringContainsString('video_cover.jpg', $result['attributes']['cover']);
    }

    /**
     * A dead link is worse than no link: it guarantees a broken image and it
     * never recovers, so the field is emptied.
     */
    public function test_a_dead_source_clears_the_field(): void
    {
        foreach ([403, 404, 410] as $status) {
            Http::fake(['*' => Http::response('', $status)]);

            $result = app(MediaArchiver::class)->archiveWithReport($this->attributes());

            $this->assertSame('', $result['attributes']['cover'], "status {$status} should clear the field");
            $this->assertCount(1, $result['failures']);
        }
    }

    /**
     * A server error might be a bad minute rather than a dead asset, so the
     * source is preserved for a later pass.
     */
    public function test_a_server_error_keeps_the_source_url(): void
    {
        Http::fake(['*' => Http::response('', 503)]);

        $result = app(MediaArchiver::class)->archiveWithReport($this->attributes());

        $this->assertSame(self::SOURCE, $result['attributes']['cover']);
        $this->assertCount(1, $result['failures']);
        $this->assertStringContainsString('503', $result['failures'][0]['message']);
    }

    public function test_hard_failures_are_not_retried(): void
    {
        config()->set('viral_videos.media.download.attempts', 3);

        Http::fake(['*' => Http::response('', 404)]);

        app(MediaArchiver::class)->archiveWithReport($this->attributes());

        Http::assertSentCount(1);
    }

    public function test_server_errors_are_retried(): void
    {
        config()->set('viral_videos.media.download.attempts', 3);

        Http::fake(['*' => Http::response('', 500)]);

        app(MediaArchiver::class)->archiveWithReport($this->attributes());

        Http::assertSentCount(3);
    }

    public function test_an_already_archived_url_is_left_alone(): void
    {
        Http::preventStrayRequests();

        $archiver = app(MediaArchiver::class);
        $stored = $archiver->storageBaseUrl().'/viral_videos/tiktok/42_abc_1/42_abc_1_video_cover.jpg';

        $result = $archiver->archiveWithReport($this->attributes(['cover' => $stored]));

        $this->assertSame($stored, $result['attributes']['cover']);
        $this->assertSame([], $result['failures']);
    }

    /**
     * The one exception to the skip rule — a stored HEIC is what a conversion
     * repair pass exists to find.
     */
    public function test_a_stored_heic_is_reprocessed(): void
    {
        Http::fake(['*' => Http::response('bytes', 200, ['Content-Type' => 'image/jpeg'])]);

        $archiver = app(MediaArchiver::class);
        $stored = $archiver->storageBaseUrl().'/viral_videos/tiktok/42_abc_1/42_abc_1_video_cover.heic';

        $this->assertFalse($archiver->isAlreadyStored($stored));

        $result = $archiver->archiveWithReport($this->attributes(['cover' => $stored]));

        $this->assertStringContainsString('video_cover.jpg', $result['attributes']['cover']);
    }

    public function test_the_extension_comes_from_content_type_then_url_then_fallback(): void
    {
        $archiver = app(MediaArchiver::class);

        $this->assertSame(['png', 'image/png'], $archiver->resolveExtension('image/png; charset=binary', 'https://x/y.jpg', 'jpg'));
        $this->assertSame(['webp', 'image/webp'], $archiver->resolveExtension(null, 'https://x/y.webp?a=1', 'jpg'));
        $this->assertSame(['jpg', 'image/jpeg'], $archiver->resolveExtension('application/octet-stream', 'https://x/y', 'jpg'));
    }

    public function test_heic_uploads_are_converted_to_jpeg_before_storage(): void
    {
        Http::fake([
            '*' => Http::response('heic-bytes', 200, ['Content-Type' => 'image/heic']),
        ]);

        $archiver = new class extends MediaArchiver
        {
            protected function convertToJpeg(string $source, string $target): bool
            {
                file_put_contents($target, 'jpeg-bytes');

                return true;
            }
        };

        $result = $archiver->archiveWithReport($this->attributes());

        $this->assertStringContainsString('video_cover.jpg', $result['attributes']['cover']);
        $this->assertSame([], $result['failures']);

        $folder = '42_7412345678901234567_'.strtotime('2026-08-01T00:00:00Z');
        Storage::disk('s3')->assertExists("viral_videos/tiktok/{$folder}/{$folder}_video_cover.jpg");
        Storage::disk('s3')->assertMissing("viral_videos/tiktok/{$folder}/{$folder}_video_cover.heic");
    }

    public function test_heic_uploads_fall_back_to_original_when_conversion_is_unavailable(): void
    {
        Http::fake([
            '*' => Http::response('heic-bytes', 200, ['Content-Type' => 'image/heic']),
        ]);

        $archiver = new class extends MediaArchiver
        {
            protected function convertToJpeg(string $source, string $target): bool
            {
                return false;
            }
        };

        $result = $archiver->archiveWithReport($this->attributes());

        $this->assertStringContainsString('video_cover.heic', $result['attributes']['cover']);
        $this->assertSame([], $result['failures']);

        $folder = '42_7412345678901234567_'.strtotime('2026-08-01T00:00:00Z');
        Storage::disk('s3')->assertExists("viral_videos/tiktok/{$folder}/{$folder}_video_cover.heic");
    }

    public function test_object_keys_are_deterministic_and_sanitised(): void
    {
        $archiver = app(MediaArchiver::class);

        $path = $archiver->pathPrefix($this->attributes(['video_id' => 'a b/c#d']));

        $folder = '42_a_b_c_d_'.strtotime('2026-08-01T00:00:00Z');
        $this->assertSame("viral_videos/tiktok/{$folder}/{$folder}", $path);

        // Same input, same key — that is what makes a repair overwrite rather
        // than accumulate duplicates.
        $this->assertSame($path, $archiver->pathPrefix($this->attributes(['video_id' => 'a b/c#d'])));
    }

    public function test_a_missing_trigger_still_produces_a_valid_key(): void
    {
        $path = app(MediaArchiver::class)->pathPrefix($this->attributes(['apify_trigger_id' => null]));

        $this->assertStringStartsWith('viral_videos/tiktok/na_', $path);
    }
}
