<?php

namespace App\Jobs;

use App\Models\VideoPreparation;
use App\Models\VideoAnalysis;
use App\Services\ViralVideoAnalysis\VideoPreparationProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Throwable;

class PrepareVideoAnalysis implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 900;

    public function __construct(public readonly string $preparationId) {}

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping('video-preparation:'.$this->preparationId)];
    }

    public function handle(VideoPreparationProcessor $processor): void
    {
        $preparation = VideoPreparation::query()->find($this->preparationId);

        if ($preparation === null || $preparation->isComplete()) {
            return;
        }

        $processor->process($preparation);
    }

    public function failed(Throwable $e): void
    {
        $preparation = VideoPreparation::query()->find($this->preparationId);

        if ($preparation === null) {
            return;
        }

        $message = 'We could not prepare this video yet. Please try again later.';

        if ($preparation->status === VideoPreparation::STATUS_PROCESSING) {
            $preparation->forceFill([
                'status' => VideoPreparation::STATUS_FAILED,
                'error_message' => $message,
            ])->save();
        }

        VideoAnalysis::query()
            ->where('video_id', $preparation->video_id)
            ->where('status', VideoAnalysis::STATUS_PROCESSING)
            ->update([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => $message,
                'updated_at' => now(),
            ]);
    }
}
