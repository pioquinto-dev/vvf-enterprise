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

    /**
     * One attempt only. The processor already polls Apify to completion, and a
     * blind retry would start a second paid scrape for the same run.
     */
    public int $tries = 1;

    public int $timeout = 1800;

    public function __construct(public readonly int $runId) {}

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

        $processor->process($run);
    }

    public function failed(\Throwable $e): void
    {
        CustomKeywordSearchRun::where('id', $this->runId)
            ->whereIn('status', [CustomKeywordSearchRun::STATUS_QUEUED, CustomKeywordSearchRun::STATUS_RUNNING])
            ->update([
                'status' => CustomKeywordSearchRun::STATUS_FAILED,
                'error_message' => mb_substr($e->getMessage(), 0, 2000),
                'completed_at' => now(),
                'updated_at' => now(),
            ]);
    }
}
