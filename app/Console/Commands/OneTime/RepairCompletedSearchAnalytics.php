<?php

namespace App\Console\Commands\OneTime;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Services\CustomKeywordSearch\SnapshotRecorder;
use Illuminate\Console\Command;

class RepairCompletedSearchAnalytics extends Command
{
    protected $signature = 'custom-keyword-search:repair-completed-analytics
        {--search_id= : Limit the repair to one custom_keyword_searches.id}
        {--limit=0 : Maximum number of searches to repair}';

    protected $description = 'Rebuild analytics snapshots for completed searches without running a fresh scrape.';

    public function handle(SnapshotRecorder $snapshots): int
    {
        $searchId = $this->option('search_id');
        $limit = max(0, (int) $this->option('limit'));

        $query = CustomKeywordSearch::query()
            ->where('status', CustomKeywordSearch::STATUS_DONE)
            ->whereHas('videos')
            ->with(['latestRun', 'runs' => fn ($runs) => $runs
                ->where('status', CustomKeywordSearchRun::STATUS_DONE)
                ->latest('completed_at')
                ->limit(1),
            ]);

        if ($searchId !== null && $searchId !== '') {
            $query->whereKey((int) $searchId);
        }

        if ($limit > 0) {
            $query->limit($limit);
        }

        $processed = 0;
        $skipped = 0;

        $query->orderBy('id')->chunkById(100, function ($searches) use ($snapshots, &$processed, &$skipped): void {
            foreach ($searches as $search) {
                $run = $search->runs->first() ?? $search->latestRun;

                if (! $run || $run->status !== CustomKeywordSearchRun::STATUS_DONE) {
                    $skipped++;
                    $this->warn("Skipped search {$search->id}: no completed run found.");
                    continue;
                }

                $snapshot = $snapshots->record($search, $run);

                if ($snapshot === null) {
                    $skipped++;
                    $this->warn("Skipped search {$search->id}: no visible results to snapshot.");
                    continue;
                }

                $processed++;
                $this->info("Repaired search {$search->id} using run {$run->id}.");
            }
        });

        $this->newLine();
        $this->info("Analytics repair complete. Processed {$processed} searches, skipped {$skipped}.");

        return self::SUCCESS;
    }
}
