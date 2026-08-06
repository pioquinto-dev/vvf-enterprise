<?php

namespace App\Console\Commands\Scheduled;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use Illuminate\Console\Command;

class FailStaleCustomKeywordSearchRuns extends Command
{
    protected $signature = 'custom-keyword-search:fail-stale-runs';

    protected $description = 'Fail saved search runs that have been running longer than the stale threshold.';

    public function handle(): int
    {
        $minutes = (int) config('custom_keyword_search.scrape.stale_after_minutes', 30);
        $cutoff = now()->subMinutes($minutes);

        $stale = CustomKeywordSearchRun::query()
            ->whereIn('status', [CustomKeywordSearchRun::STATUS_QUEUED, CustomKeywordSearchRun::STATUS_RUNNING])
            ->where('created_at', '<=', $cutoff)
            ->with('search')
            ->get();

        foreach ($stale as $run) {
            $run->update([
                'status' => CustomKeywordSearchRun::STATUS_FAILED,
                'completed_at' => now(),
                'error_message' => "Run exceeded the {$minutes} minute stale threshold.",
            ]);

            $search = $run->search;

            if ($search === null || $search->status === CustomKeywordSearch::STATUS_PAUSED) {
                continue;
            }

            // Keep an established search usable — only a search with nothing to
            // show should surface as failed.
            $search->update([
                'status' => $search->videos()->exists()
                    ? CustomKeywordSearch::STATUS_DONE
                    : CustomKeywordSearch::STATUS_FAILED,
            ]);
        }

        $this->info("Failed {$stale->count()} stale run(s).");

        return self::SUCCESS;
    }
}
