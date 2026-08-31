<?php

namespace App\Jobs;

use App\Services\Media\TiktokCdnMediaRepairService;
use App\Support\AppEventLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class RepairTiktokCdnMediaRecord implements ShouldQueue
{
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly string $viralVideoId,
        public readonly string $batchKey,
    ) {}

    public function middleware(): array
    {
        return [new WithoutOverlapping('repair-tiktok-cdn-media:'.$this->viralVideoId)];
    }

    public function handle(TiktokCdnMediaRepairService $service): void
    {
        $result = $service->repairVideoById($this->viralVideoId);
        $prefix = $this->cachePrefix();

        Cache::increment("{$prefix}:processed");

        if ($result['status'] === 'updated') {
            Cache::increment("{$prefix}:updated");

            AppEventLogger::result('media.repair.tiktok_cdn.record_updated', [
                'batch_key' => $this->batchKey,
                'viral_video_id' => $result['viral_video_id'],
                'video_id' => $result['video_id'],
                'changed_fields' => $result['changed_fields'],
            ]);
        } elseif ($result['status'] === 'skipped') {
            Cache::increment("{$prefix}:skipped");

            AppEventLogger::result('media.repair.tiktok_cdn.record_skipped', [
                'batch_key' => $this->batchKey,
                'viral_video_id' => $result['viral_video_id'],
                'video_id' => $result['video_id'],
                'source_url' => $result['source_url'],
            ]);
        } else {
            Cache::increment("{$prefix}:failed");

            AppEventLogger::error('media.repair.tiktok_cdn.record_failed', (string) ($result['message'] ?? 'Unknown failure.'), [
                'batch_key' => $this->batchKey,
                'viral_video_id' => $result['viral_video_id'],
                'video_id' => $result['video_id'],
            ]);
        }

        $processed = (int) Cache::get("{$prefix}:processed", 0);
        $total = (int) Cache::get("{$prefix}:total", 0);

        if ($total > 0 && $processed >= $total && Cache::add("{$prefix}:final_logged", true, now()->addDay())) {
            AppEventLogger::result('media.repair.tiktok_cdn.batch_completed', [
                'batch_key' => $this->batchKey,
                'total' => $total,
                'processed' => $processed,
                'updated' => (int) Cache::get("{$prefix}:updated", 0),
                'skipped' => (int) Cache::get("{$prefix}:skipped", 0),
                'failed' => (int) Cache::get("{$prefix}:failed", 0),
            ]);
        }
    }

    private function cachePrefix(): string
    {
        return 'repair-tiktok-cdn-media:'.$this->batchKey;
    }
}
