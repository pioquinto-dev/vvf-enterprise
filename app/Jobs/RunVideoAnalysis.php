<?php

namespace App\Jobs;

use App\Models\VideoAnalysis;
use App\Services\ViralVideoAnalysis\UserVideoAnalysisProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Throwable;

class RunVideoAnalysis implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 900;

    public function __construct(public readonly string $analysisId) {}

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping('video-analysis:'.$this->analysisId)];
    }

    public function handle(UserVideoAnalysisProcessor $processor): void
    {
        $analysis = VideoAnalysis::query()->find($this->analysisId);

        if ($analysis === null || $analysis->isComplete()) {
            return;
        }

        $processor->process($analysis);
    }

    public function failed(Throwable $e): void
    {
        VideoAnalysis::query()
            ->whereKey($this->analysisId)
            ->where('status', VideoAnalysis::STATUS_PROCESSING)
            ->update([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => 'We could not finish this analysis right now. Please try again later.',
                'updated_at' => now(),
            ]);
    }
}
