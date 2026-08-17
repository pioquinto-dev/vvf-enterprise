<?php

namespace App\Services\ViralVideoAnalysis;

use App\Jobs\PrepareVideoAnalysis;
use App\Jobs\RunVideoAnalysis;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\VideoPreparation;
use App\Models\ViralVideo;
use Illuminate\Support\Facades\DB;

class VideoAnalysisManager
{
    private const STALE_ERROR = 'This analysis took longer than expected and got stuck. Please try again.';

    public function __construct(
        private readonly \App\Services\Billing\BillingService $billing,
        private readonly CreativeStrategistGenerator $strategist,
    ) {}

    public function request(User $user, ViralVideo $video, bool $forceRefresh = false): VideoAnalysis
    {
        $this->billing->ensureCanAnalyzeVideo($user);

        return DB::transaction(function () use ($user, $video, $forceRefresh): VideoAnalysis {
            $analysis = VideoAnalysis::query()
                ->where('user_id', $user->id)
                ->where('video_id', $video->video_id)
                ->lockForUpdate()
                ->first();

            if ($analysis !== null && $analysis->isProcessing() && ! $forceRefresh && ! $this->isStale($analysis)) {
                return $analysis;
            }

            if ($analysis !== null && $analysis->isComplete() && ! $forceRefresh && ! $this->strategist->needsRefresh((array) $analysis->result)) {
                return $this->ensureCompletedAnalysisCharged($analysis);
            }

            $preparation = VideoPreparation::query()
                ->where('video_id', $video->video_id)
                ->lockForUpdate()
                ->first();

            $analysis ??= new VideoAnalysis([
                'user_id' => $user->id,
                'viral_video_id' => $video->id,
                'video_id' => $video->video_id,
            ]);

            $analysis->fill([
                'viral_video_id' => $video->id,
                'status' => VideoAnalysis::STATUS_PROCESSING,
                'error_message' => null,
            ])->save();

            // A forced refresh must rebuild the shared diagnostic too (hook
            // reasons, drivers), so it routes back through preparation rather
            // than reusing the cached diagnostic via a direct run.
            if (! $forceRefresh && $preparation !== null && $preparation->isComplete()) {
                RunVideoAnalysis::dispatch($analysis->id)
                    ->onQueue((string) config('viral_video_analysis.queue', 'video-analysis'));

                return $analysis->refresh();
            }

            $preparation ??= new VideoPreparation([
                'viral_video_id' => $video->id,
                'video_id' => $video->video_id,
            ]);

            $preparation->fill([
                'viral_video_id' => $video->id,
                'status' => VideoPreparation::STATUS_PROCESSING,
                'error_message' => null,
            ])->save();

            PrepareVideoAnalysis::dispatch($preparation->id)
                ->onQueue((string) config('viral_video_analysis.queue', 'video-analysis'));

            return $analysis->refresh();
        });
    }

    public function statusFor(User $user, ViralVideo $video): ?VideoAnalysis
    {
        $analysis = VideoAnalysis::query()
            ->where('user_id', $user->id)
            ->where('video_id', $video->video_id)
            ->first();

        if ($analysis !== null && $analysis->isProcessing() && $this->isStale($analysis)) {
            return $this->failStaleAnalysis($analysis, $video);
        }

        if ($analysis === null || ! $analysis->isComplete() || ! $this->strategist->needsRefresh((array) $analysis->result)) {
            return $analysis?->isComplete() ? $this->ensureCompletedAnalysisCharged($analysis) : $analysis;
        }

        return DB::transaction(function () use ($analysis, $video): ?VideoAnalysis {
            $locked = VideoAnalysis::query()
                ->whereKey($analysis->id)
                ->lockForUpdate()
                ->first();

            if ($locked === null || ! $locked->isComplete() || ! $this->strategist->needsRefresh((array) $locked->result)) {
                return $locked;
            }

            $preparation = VideoPreparation::query()
                ->where('video_id', $video->video_id)
                ->lockForUpdate()
                ->first();

            $locked->forceFill([
                'status' => VideoAnalysis::STATUS_PROCESSING,
                'error_message' => null,
            ])->save();

            if ($preparation !== null && $preparation->isComplete()) {
                RunVideoAnalysis::dispatch($locked->id)
                    ->onQueue((string) config('viral_video_analysis.queue', 'video-analysis'));

                return $locked->refresh();
            }

            $preparation ??= new VideoPreparation([
                'viral_video_id' => $video->id,
                'video_id' => $video->video_id,
            ]);

            $preparation->fill([
                'viral_video_id' => $video->id,
                'status' => VideoPreparation::STATUS_PROCESSING,
                'error_message' => null,
            ])->save();

            PrepareVideoAnalysis::dispatch($preparation->id)
                ->onQueue((string) config('viral_video_analysis.queue', 'video-analysis'));

            return $locked->refresh();
        });
    }

    private function failStaleAnalysis(VideoAnalysis $analysis, ViralVideo $video): VideoAnalysis
    {
        return DB::transaction(function () use ($analysis, $video): VideoAnalysis {
            $locked = VideoAnalysis::query()
                ->whereKey($analysis->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $locked->isProcessing() || ! $this->isStale($locked)) {
                return $locked;
            }

            $locked->forceFill([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => self::STALE_ERROR,
            ])->save();

            VideoPreparation::query()
                ->where('video_id', $video->video_id)
                ->where('status', VideoPreparation::STATUS_PROCESSING)
                ->where('updated_at', '<=', $this->staleCutoff())
                ->update([
                    'status' => VideoPreparation::STATUS_FAILED,
                    'error_message' => self::STALE_ERROR,
                    'updated_at' => now(),
                ]);

            return $locked->refresh();
        });
    }

    private function isStale(VideoAnalysis $analysis): bool
    {
        return $analysis->updated_at !== null && $analysis->updated_at->lte($this->staleCutoff());
    }

    private function staleCutoff(): \Illuminate\Support\Carbon
    {
        return now()->subMinutes((int) config('viral_video_analysis.processing.stale_after_minutes', 20));
    }

    private function ensureCompletedAnalysisCharged(VideoAnalysis $analysis): VideoAnalysis
    {
        if (! $analysis->isComplete() || filled(data_get($analysis->result, '_billing.charged_at'))) {
            return $analysis;
        }

        return DB::transaction(function () use ($analysis): VideoAnalysis {
            $locked = VideoAnalysis::query()
                ->whereKey($analysis->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $locked->isComplete() || filled(data_get($locked->result, '_billing.charged_at'))) {
                return $locked;
            }

            $user = $locked->user()->first();

            if ($user !== null) {
                $this->billing->consumeVideoAnalysis($user);
            }

            $locked->forceFill([
                'result' => data_set((array) $locked->result, '_billing.charged_at', now()->toIso8601String()),
            ])->save();

            return $locked->refresh();
        });
    }
}
