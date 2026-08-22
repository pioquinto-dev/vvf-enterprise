<?php

namespace App\Services\ViralVideoAnalysis;

use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\VideoPreparation;
use App\Services\Billing\BillingService;
use App\Support\AppEventLogger;
use Illuminate\Support\Facades\Log;

class UserVideoAnalysisProcessor
{
    public function __construct(
        private readonly CreativeStrategistGenerator $strategist,
        private readonly BillingService $billing,
    ) {}

    public function process(VideoAnalysis $analysis): void
    {
        AppEventLogger::result('video_analysis.processing_started', [
            'analysis_id' => $analysis->id,
            'user_id' => $analysis->user_id,
            'video_id' => $analysis->video_id,
            'viral_video_id' => $analysis->viral_video_id,
        ]);

        $preparation = VideoPreparation::query()
            ->where('video_id', $analysis->video_id)
            ->first();

        if ($preparation === null || ! $preparation->isComplete()) {
            $analysis->forceFill([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => 'This analysis is not ready yet. Please try again later.',
            ])->save();

            AppEventLogger::error('video_analysis.preparation_missing', 'Preparation incomplete or missing.', [
                'analysis_id' => $analysis->id,
                'user_id' => $analysis->user_id,
                'video_id' => $analysis->video_id,
            ]);

            return;
        }

        $result = $this->strategist->generate($analysis->video_id);

        if ($result === null) {
            $analysis->forceFill([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => 'We could not finish this analysis right now. Please try again later.',
            ])->save();

            AppEventLogger::error('video_analysis.generation_failed', 'Strategist returned no result.', [
                'analysis_id' => $analysis->id,
                'user_id' => $analysis->user_id,
                'video_id' => $analysis->video_id,
            ]);

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

        Log::info('Video analysis completed successfully.', [
            'analysis_id' => $analysis->id,
            'user_id' => $analysis->user_id,
            'video_id' => $analysis->video_id,
            'viral_video_id' => $analysis->viral_video_id,
        ]);

        AppEventLogger::result('video_analysis.completed', [
            'analysis_id' => $analysis->id,
            'user_id' => $analysis->user_id,
            'video_id' => $analysis->video_id,
            'viral_video_id' => $analysis->viral_video_id,
            'transcript_present' => filled($result['transcript'] ?? null),
            'segment_count' => count($result['transcript_segments'] ?? []),
        ]);

        if ($analysis->counts_toward_quota && $analysis->user_id !== null) {
            $user = User::query()->find($analysis->user_id);

            if ($user === null) {
                Log::warning('Video analysis completed but no user record was found for billing.', [
                    'analysis_id' => $analysis->id,
                    'user_id' => $analysis->user_id,
                    'video_id' => $analysis->video_id,
                ]);

                AppEventLogger::error('video_analysis.billing_user_missing', 'Completed analysis has no billable user record.', [
                    'analysis_id' => $analysis->id,
                    'user_id' => $analysis->user_id,
                    'video_id' => $analysis->video_id,
                ]);

                return;
            }

            $this->billing->consumeVideoAnalysis($user);

            Log::info('Video analysis usage synced on successful completion.', [
                'analysis_id' => $analysis->id,
                'user_id' => $analysis->user_id,
                'video_id' => $analysis->video_id,
            ]);

            AppEventLogger::result('video_analysis.billing_consumed', [
                'analysis_id' => $analysis->id,
                'user_id' => $analysis->user_id,
                'video_id' => $analysis->video_id,
            ]);
        }
    }
}
