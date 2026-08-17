<?php

namespace App\Services\ViralVideoAnalysis;

use App\Models\VideoAnalysis;
use App\Models\VideoPreparation;
use App\Services\Billing\BillingService;

class UserVideoAnalysisProcessor
{
    public function __construct(
        private readonly CreativeStrategistGenerator $strategist,
        private readonly BillingService $billing,
    ) {}

    public function process(VideoAnalysis $analysis): void
    {
        $preparation = VideoPreparation::query()
            ->where('video_id', $analysis->video_id)
            ->first();

        if ($preparation === null || ! $preparation->isComplete()) {
            $analysis->forceFill([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => 'This analysis is not ready yet. Please try again later.',
            ])->save();

            return;
        }

        $result = $this->strategist->generate($analysis->video_id);

        if ($result === null) {
            $analysis->forceFill([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => 'We could not finish this analysis right now. Please try again later.',
            ])->save();

            return;
        }

        $analysis->forceFill([
            'status' => VideoAnalysis::STATUS_COMPLETE,
            'transcript' => $result['transcript'],
            'transcript_segments' => $result['transcript_segments'],
            'result' => $result['result'],
            'error_message' => null,
            'analyzed_at' => now(),
        ])->save();

        if ($analysis->user !== null) {
            $this->billing->consumeVideoAnalysis($analysis->user);

            $analysis->forceFill([
                'result' => data_set((array) $analysis->result, '_billing.charged_at', now()->toIso8601String()),
            ])->save();
        }
    }
}
