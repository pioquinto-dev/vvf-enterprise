<?php

namespace App\Jobs;

use App\Models\ViralVideo;
use App\Services\Media\MediaArchiver;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;

/**
 * Archives one video's media, straight after its import.
 *
 * This one is strict: any unresolved failure fails the job so the queue retries
 * it with backoff. That is the right trade for a fresh row, where the source
 * URLs are still alive and a transient CDN hiccup is the likely cause.
 *
 * The batch job is the lenient counterpart, for catch-up over rows whose links
 * may legitimately be dead.
 */
class ArchiveViralVideoMedia implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 300;

    /** @var array<int, int> */
    public array $backoff = [30, 120];

    public function __construct(public readonly string $viralVideoId) {}

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping('media-archive:'.$this->viralVideoId)];
    }

    public function handle(MediaArchiver $archiver): void
    {
        if (! $archiver->enabled()) {
            return;
        }

        $video = ViralVideo::find($this->viralVideoId);

        if ($video === null) {
            return;
        }

        $report = $archiver->archiveWithReport([
            'video_id' => $video->video_id,
            'created_at' => $video->created_at,
            'apify_trigger_id' => $video->apify_trigger_id,
            'cover' => $video->cover,
            'thumbnail_url' => $video->thumbnail_url,
            'avatar' => $video->avatar,
        ]);

        $attributes = $report['attributes'];

        // Written whatever happened: successes become durable URLs, dead links
        // become empty, and soft failures write back the value they already had.
        $video->forceFill([
            'cover' => $attributes['cover'],
            'thumbnail_url' => $attributes['thumbnail_url'],
            'avatar' => $attributes['avatar'],
        ])->save();

        if ($report['failures'] === []) {
            return;
        }

        Log::warning('Media archive finished with failures.', [
            'viral_video_id' => $video->id,
            'video_id' => $video->video_id,
            'failures' => $report['failures'],
        ]);

        /*
         * Expired signatures are not a transient fault — the bytes are gone and
         * no number of retries brings them back. Recording it and moving on is
         * the honest outcome; failing the job would just burn the queue.
         */
        if ($this->allExpired($report['failures'])) {
            return;
        }

        throw new \RuntimeException(
            'Could not archive media for video '.$video->video_id.': '.$report['failures'][0]['message']
        );
    }

    /**
     * @param  array<int, array<string, mixed>>  $failures
     */
    private function allExpired(array $failures): bool
    {
        foreach ($failures as $failure) {
            if (! str_contains((string) $failure['message'], 'already expired')) {
                return false;
            }
        }

        return true;
    }
}
