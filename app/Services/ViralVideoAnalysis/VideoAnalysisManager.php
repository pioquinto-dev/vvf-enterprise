<?php

namespace App\Services\ViralVideoAnalysis;

use App\Jobs\PrepareVideoAnalysis;
use App\Jobs\RunVideoAnalysis;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\VideoPreparation;
use App\Models\ViralVideo;
use App\Services\Admin\UserActivityService;
use App\Services\Billing\BillingService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VideoAnalysisManager
{
    private const STALE_ERROR = 'This analysis took longer than expected and got stuck. Please try again.';

    public function __construct(
        private readonly BillingService $billing,
        private readonly CreativeStrategistGenerator $strategist,
        private readonly UserActivityService $activity,
    ) {}

    public function request(User $user, ViralVideo $video, bool $forceRefresh = false): VideoAnalysis
    {
        return $this->queue($user, $video, $forceRefresh, true);
    }

    /**
     * Queues the current saved-search winner without consuming a user credit.
     * A completed analysis is reused; this is a search-run benefit, not a
     * request to regenerate the same video's strategy on every refresh.
     */
    public function requestAutomaticWinner(User $user, ViralVideo $video): VideoAnalysis
    {
        return $this->queue($user, $video, false, false);
    }

    /**
     * Completes the automatic winner analysis before a search run is marked
     * ready. The regular queued jobs remain the single implementation of
     * preparation and generation; dispatching them synchronously simply makes
     * their terminal state part of the search-run contract.
     */
    public function requestAutomaticWinnerAndWait(User $user, ViralVideo $video): VideoAnalysis
    {
        $analysis = $this->requestAutomaticWinner($user, $video)->refresh();

        if (! $analysis->isProcessing()) {
            return $analysis;
        }

        $preparation = VideoPreparation::query()
            ->where('video_id', $analysis->video_id)
            ->first();

        if ($preparation !== null && ! $preparation->isComplete()) {
            PrepareVideoAnalysis::dispatchSync($preparation->id);
        }

        $analysis = $analysis->fresh();

        if ($analysis->isProcessing()) {
            RunVideoAnalysis::dispatchSync($analysis->id);
        }

        $analysis = $analysis->fresh();

        if ($analysis->isProcessing()) {
            // A search must not advertise a ready winner while its automatic
            // analysis is left in limbo. Preserve the search result, but make
            // the analysis outcome explicit and terminal.
            $analysis->forceFill([
                'status' => VideoAnalysis::STATUS_FAILED,
                'error_message' => 'Automatic winner analysis did not finish before the search completed.',
            ])->save();
        }

        return $analysis->refresh();
    }

    private function queue(User $user, ViralVideo $video, bool $forceRefresh, bool $countsTowardQuota): VideoAnalysis
    {
        return DB::transaction(function () use ($user, $video, $forceRefresh, $countsTowardQuota): VideoAnalysis {
            $analysis = VideoAnalysis::query()
                ->where('user_id', $user->id)
                ->where('video_id', $video->video_id)
                ->lockForUpdate()
                ->first();

            if ($analysis !== null && $analysis->isProcessing() && ! $forceRefresh && ! $this->isStale($analysis)) {
                return $analysis;
            }

            if ($analysis !== null && $analysis->isComplete() && ! $forceRefresh) {
                if (! $countsTowardQuota || ! $this->strategist->needsRefresh((array) $analysis->result)) {
                    return $analysis->counts_toward_quota
                        ? $this->ensureCompletedAnalysisUsageSynced($analysis)
                        : $analysis;
                }
            }

            // Automatic runs never replace or retry an existing manual
            // analysis. That keeps the search benefit free and preserves the
            // user's original billing record.
            if (! $countsTowardQuota && $analysis !== null) {
                return $analysis;
            }

            if ($countsTowardQuota) {
                $this->billing->ensureCanAnalyzeVideo($user);
            }

            $preparation = VideoPreparation::query()
                ->where('video_id', $video->video_id)
                ->lockForUpdate()
                ->first();

            $analysis ??= new VideoAnalysis([
                'user_id' => $user->id,
                'viral_video_id' => $video->id,
                'video_id' => $video->video_id,
                'counts_toward_quota' => $countsTowardQuota,
            ]);

            $analysis->fill([
                'viral_video_id' => $video->id,
                'status' => VideoAnalysis::STATUS_PROCESSING,
                'error_message' => null,
            ])->save();
            $this->activity->record($user, 'engagement', 'video_analysis_triggered', 'Triggered video analysis.', ['video_id' => $video->id]);

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

        if ($analysis !== null && ! $analysis->counts_toward_quota && $analysis->isComplete()) {
            return $analysis;
        }

        if ($analysis === null || ! $analysis->isComplete() || ! $this->strategist->needsRefresh((array) $analysis->result)) {
            return $analysis?->isComplete() ? $this->ensureCompletedAnalysisUsageSynced($analysis) : $analysis;
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

    private function staleCutoff(): Carbon
    {
        return now()->subMinutes((int) config('viral_video_analysis.processing.stale_after_minutes', 20));
    }

    private function ensureCompletedAnalysisUsageSynced(VideoAnalysis $analysis): VideoAnalysis
    {
        if (! $analysis->isComplete() || ! $analysis->counts_toward_quota) {
            return $analysis;
        }

        return DB::transaction(function () use ($analysis): VideoAnalysis {
            $locked = VideoAnalysis::query()
                ->whereKey($analysis->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $locked->isComplete() || ! $locked->counts_toward_quota) {
                return $locked;
            }

            $user = $locked->user()->first();

            Log::info('Syncing video analysis usage for completed analysis.', [
                'analysis_id' => $locked->id,
                'user_id' => $locked->user_id,
                'video_id' => $locked->video_id,
            ]);

            if ($user !== null) {
                $this->billing->consumeVideoAnalysis($user);
            }

            return $locked->refresh();
        });
    }
}
