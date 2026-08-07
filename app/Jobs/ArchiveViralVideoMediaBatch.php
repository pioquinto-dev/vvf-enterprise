<?php

namespace App\Jobs;

use App\Models\ViralVideo;
use App\Services\Media\MediaArchiver;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

/**
 * Archives media for many videos in one pass.
 *
 * The lenient counterpart to the single-item job: it never fails on a bad row.
 * Catch-up and repair work runs over rows whose sources may be long dead, and
 * one dead link must not roll back the fifty assets that archived cleanly
 * alongside it. Failures are logged with their IDs so they can be chased later.
 */
class ArchiveViralVideoMediaBatch implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 1800;

    /**
     * @param  array<int, string>  $viralVideoIds
     */
    public function __construct(public readonly array $viralVideoIds) {}

    public function handle(MediaArchiver $archiver): void
    {
        if (! $archiver->enabled() || $this->viralVideoIds === []) {
            return;
        }

        $failedIds = [];
        $archived = 0;

        foreach (ViralVideo::whereIn('id', $this->viralVideoIds)->cursor() as $video) {
            try {
                $report = $archiver->archiveWithReport([
                    'video_id' => $video->video_id,
                    'created_at' => $video->created_at,
                    'apify_trigger_id' => $video->apify_trigger_id,
                    'cover' => $video->cover,
                    'thumbnail_url' => $video->thumbnail_url,
                    'avatar' => $video->avatar,
                ]);

                $video->forceFill([
                    'cover' => $report['attributes']['cover'],
                    'thumbnail_url' => $report['attributes']['thumbnail_url'],
                    'avatar' => $report['attributes']['avatar'],
                ])->save();

                if ($report['failures'] === []) {
                    $archived++;

                    continue;
                }

                $failedIds[] = $video->id;

                Log::info('Media archive partially failed in batch.', [
                    'viral_video_id' => $video->id,
                    'failures' => $report['failures'],
                ]);
            } catch (\Throwable $e) {
                // Keep going. The whole point of the batch job is that it does
                // not abandon the remaining rows.
                $failedIds[] = $video->id;

                Log::warning('Media archive threw inside a batch.', [
                    'viral_video_id' => $video->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('Media archive batch finished.', [
            'requested' => count($this->viralVideoIds),
            'archived_cleanly' => $archived,
            'failed_ids' => $failedIds,
        ]);
    }
}
