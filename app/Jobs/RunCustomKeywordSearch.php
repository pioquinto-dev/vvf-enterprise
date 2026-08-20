<?php

namespace App\Jobs;

use App\Models\CustomKeywordSearchRun;
use App\Services\CustomKeywordSearch\SearchRunProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;

class RunCustomKeywordSearch implements ShouldQueue
{
    use Queueable;

    /** Established searches get the initial attempt plus three retry attempts. */
    public int $tries = 4;

    /** @var array<int, int> */
    public array $backoff = [60, 180, 600];

    public int $timeout;

    public function __construct(public readonly int $runId)
    {
        $this->timeout = (int) config('custom_keyword_search.scrape.job_timeout_seconds', 1800);
    }

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping('cks-run:'.$this->runId)];
    }

    public function handle(SearchRunProcessor $processor): void
    {
        $run = CustomKeywordSearchRun::with('search')->find($this->runId);

        if ($run === null || $run->isTerminal()) {
            return;
        }

        // The first run is user-retried from the UI, so it never burns through
        // automatic attempts. Later refreshes preserve existing results and
        // retry transient provider failures before becoming terminal.
        $processor->process($run, $run->search?->videos()->exists() ?? false);
    }

    public function failed(\Throwable $e): void
    {
        $run = CustomKeywordSearchRun::with('search')->find($this->runId);

        if ($run === null || $run->isTerminal()) {
            return;
        }

        app(SearchRunProcessor::class)->markFailed($run, $e->getMessage());
    }
}
