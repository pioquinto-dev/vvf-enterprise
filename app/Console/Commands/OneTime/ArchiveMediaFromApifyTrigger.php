<?php

namespace App\Console\Commands\OneTime;

use App\Jobs\ArchiveViralVideoMedia;
use App\Models\ApifyTrigger;
use App\Models\ViralVideo;
use Illuminate\Console\Command;

/**
 * Re-dispatches media archiving for every video imported by one Apify trigger.
 *
 * This is intentionally a queue handoff rather than an inline repair: the
 * archiver already knows how to retry transient failures, and reusing that job
 * keeps the repair path identical to the fresh-import path.
 */
class ArchiveMediaFromApifyTrigger extends Command
{
    protected $signature = 'viral-videos:archive-media-from-trigger
        {apify_trigger_id : The apify_triggers.id whose viral_videos rows should be archived}
        {--queue= : Override the media archive queue for this run}';

    protected $description = 'Queue media archiving for every viral video imported by a specific Apify trigger.';

    public function handle(): int
    {
        $triggerId = (int) $this->argument('apify_trigger_id');

        if ($triggerId <= 0) {
            $this->error('The apify_trigger_id must be a positive integer.');

            return self::FAILURE;
        }

        $trigger = ApifyTrigger::find($triggerId);

        if ($trigger === null) {
            $this->error("Apify trigger {$triggerId} was not found.");

            return self::FAILURE;
        }

        if (! config('viral_videos.media.enabled', false)) {
            $this->warn('Media archiving is currently disabled (VIRAL_VIDEOS_MEDIA_ARCHIVE_ENABLED=false). Jobs would no-op.');

            return self::FAILURE;
        }

        $queue = trim((string) ($this->option('queue') ?: config('viral_videos.media.queue', 'default')));
        $count = ViralVideo::where('apify_trigger_id', $triggerId)->count();

        if ($count === 0) {
            $this->warn("No viral_videos rows were found for apify_trigger_id={$triggerId}.");

            return self::SUCCESS;
        }

        $this->info("Queueing media archive jobs for apify_trigger_id={$triggerId}");
        $this->line("Trigger status: {$trigger->status}");
        $this->line("Rows found: {$count}");
        $this->line("Queue: {$queue}");
        $this->newLine();

        $dispatched = 0;

        ViralVideo::where('apify_trigger_id', $triggerId)
            ->orderBy('id')
            ->select(['id', 'video_id'])
            ->chunkById(100, function ($videos) use ($queue, &$dispatched): void {
                foreach ($videos as $video) {
                    ArchiveViralVideoMedia::dispatch($video->id)->onQueue($queue);
                    $dispatched++;
                }
            }, 'id');

        $this->info("Dispatched {$dispatched} media archive job(s).");
        $this->line('Run a queue worker on the same queue to process them.');

        return self::SUCCESS;
    }
}
