<?php

namespace App\Console\Commands\OneTime;

use App\Services\Media\TiktokCdnMediaRepairService;
use Illuminate\Console\Command;

class RepairTiktokCdnMedia extends Command
{
    protected $signature = 'viral-videos:repair-tiktok-cdn-media
        {--dry-run : Preview affected rows and planned updates without saving changes}
        {--limit=100 : Maximum number of records to process in this run}
        {--chunk_by=25 : Number of records to load and process per chunk}
        {--batch_count= : Maximum number of chunks to process in this run}';

    protected $description = 'Re-scrape viral_videos rows still using TikTok CDN media URLs, archive image fields to object storage, convert HEIC images before storage via Imagick when available, and refresh stats.';

    public function handle(TiktokCdnMediaRepairService $service): int
    {
        if (! config('viral_videos.media.enabled', false)) {
            $this->error('Media archiving is currently disabled (VIRAL_VIDEOS_MEDIA_ARCHIVE_ENABLED=false).');

            return self::FAILURE;
        }

        $summary = $service->summarizeAffected();
        $limit = max(1, (int) $this->option('limit'));
        $chunkBy = max(1, (int) $this->option('chunk_by'));
        $batchCountOption = $this->option('batch_count');
        $batchCount = $batchCountOption === null || $batchCountOption === ''
            ? null
            : max(1, (int) $batchCountOption);
        $selectedRecords = min(
            $summary['affected_records'],
            $limit,
            $batchCount === null ? $limit : $chunkBy * $batchCount,
        );

        $this->info($this->option('dry-run') ? 'Dry run: TikTok CDN media repair' : 'TikTok CDN media repair');
        $this->line('Affected records: '.$summary['affected_records']);
        $this->line('Records with avatar to update: '.$summary['per_field']['avatar']);
        $this->line('Records with cover to update: '.$summary['per_field']['cover']);
        $this->line('Records with thumbnail_url to update: '.$summary['per_field']['thumbnail_url']);
        $this->line('Limit this run: '.$limit);
        $this->line('Chunk size: '.$chunkBy);
        $this->line('Batch count: '.($batchCount === null ? 'all needed within limit' : $batchCount));
        $this->line('Selected records this run: '.$selectedRecords);

        if ($summary['affected_records'] === 0) {
            $this->info('No affected records found.');

            return self::SUCCESS;
        }

        if ((bool) $this->option('dry-run')) {
            $this->newLine();
            $this->info('Dry-run summary');
            $this->line('No Apify runs were started and no records were changed.');
            $this->line('HEIC/HEIF files will be converted before storage on non-dry runs via the shared media archiver.');

            return self::SUCCESS;
        }

        $this->newLine();

        $result = $service->repair(
            dryRun: false,
            limit: $limit,
            chunkBy: $chunkBy,
            batchCount: $batchCount,
            progress: function ($video, string $status, array $outcome): void {
                $videoId = (string) $video->video_id;

                if ($status === 'failed') {
                    $this->warn("[failed] {$videoId} - {$outcome['message']}");

                    return;
                }

                if ($status === 'skipped') {
                    $this->line("[skipped] {$videoId}");

                    return;
                }

                $this->line("[updated] {$videoId} - ".implode(', ', $outcome['changed_fields']));
            }
        );

        $this->newLine();
        $this->info('Repair summary');
        $this->line('Selected records: '.$result['selected_records']);
        $this->line('Processed: '.$result['processed']);
        $this->line('Chunks processed: '.$result['chunks_processed']);
        $this->line('Updated records: '.$result['updated_records']);
        $this->line('Skipped: '.$result['skipped']);
        $this->line('Failed: '.$result['failed']);
        $this->line('Field updates:');
        $this->line('  avatar: '.$result['field_updates']['avatar']);
        $this->line('  cover: '.$result['field_updates']['cover']);
        $this->line('  thumbnail_url: '.$result['field_updates']['thumbnail_url']);
        $this->line('  followers: '.$result['field_updates']['followers']);
        $this->line('  views: '.$result['field_updates']['views']);
        $this->line('  likes: '.$result['field_updates']['likes']);
        $this->line('  bookmarks: '.$result['field_updates']['bookmarks']);
        $this->line('  comments: '.$result['field_updates']['comments']);
        $this->line('  shares: '.$result['field_updates']['shares']);
        $this->line('  virality_score: '.$result['field_updates']['virality_score']);

        return $result['failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }
}
