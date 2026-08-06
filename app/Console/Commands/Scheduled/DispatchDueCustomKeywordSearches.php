<?php

namespace App\Console\Commands\Scheduled;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use Illuminate\Console\Command;

class DispatchDueCustomKeywordSearches extends Command
{
    protected $signature = 'custom-keyword-search:dispatch-due
        {--limit= : Override the configured batch size}';

    protected $description = 'Queue refresh runs for saved searches whose next_run_at has passed.';

    public function handle(SavedSearchManager $manager): int
    {
        $limit = (int) ($this->option('limit') ?: config('custom_keyword_search.schedule.batch_size', 25));

        $due = CustomKeywordSearch::query()
            ->whereIn('status', [CustomKeywordSearch::STATUS_DONE, CustomKeywordSearch::STATUS_FAILED])
            ->whereNotNull('next_run_at')
            ->where('next_run_at', '<=', now())
            // Never stack a refresh on top of a run that is still going.
            ->whereDoesntHave('runs', function ($query): void {
                $query->whereIn('status', [
                    CustomKeywordSearchRun::STATUS_QUEUED,
                    CustomKeywordSearchRun::STATUS_RUNNING,
                ]);
            })
            ->orderBy('next_run_at')
            ->limit($limit)
            ->get();

        foreach ($due as $search) {
            $manager->queueRun($search);
            $this->line("Queued refresh for saved search #{$search->id} ({$search->phrase}).");
        }

        $this->info("Dispatched {$due->count()} saved search refresh run(s).");

        return self::SUCCESS;
    }
}
