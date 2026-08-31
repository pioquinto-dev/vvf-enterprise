<?php

namespace App\Services\ViralVideoAnalysis;

use App\Models\ApifyTrigger;
use App\Models\ViralVideo;
use App\Services\Apify\ApifyClient;
use App\Services\Apify\ApifyConnectionException;
use App\Support\AppEventLogger;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Fetches the spoken-word transcript for a single post from a dedicated Apify
 * transcript actor. Kept separate from {@see VideoSourceRefresher} (which
 * refreshes stats) so the transcript no longer rides on whatever subtitles the
 * stats scraper happens to return.
 */
class TranscriptFetcher
{
    public function __construct(
        private readonly ApifyClient $apify,
    ) {}

    /**
     * Runs the transcript actor for the video's post URL and returns the first
     * dataset item, or null when the actor is unconfigured or yields nothing.
     * Failures are logged and swallowed so the caller can fall back to the
     * scrape payload rather than failing the whole preparation.
     *
     * @return array<string, mixed>|null
     */
    public function fetch(ViralVideo $video): ?array
    {
        $actorId = trim((string) config('viral_video_analysis.transcript.actor_id', ''));
        $postUrl = trim((string) $video->post_url);

        if ($actorId === '' || $postUrl === '' || ! $this->apify->isConfigured()) {
            AppEventLogger::result('video_transcript.skipped', [
                'viral_video_id' => $video->id,
                'actor_configured' => $actorId !== '',
                'has_post_url' => $postUrl !== '',
                'apify_configured' => $this->apify->isConfigured(),
            ]);

            return null;
        }

        $input = [
            'postUrls' => [$postUrl],
            'useWhisperFallback' => (bool) config('viral_video_analysis.transcript.use_whisper_fallback', false),
        ];

        $trigger = ApifyTrigger::query()->create([
            'source_type' => 'viral_video_analysis_transcript',
            'source_id' => (string) $video->id,
            'actor_id' => $actorId,
            'status' => 'queued',
            'request_source' => 'viral_video_analysis',
            'input' => $input,
        ]);

        AppEventLogger::result('video_transcript.fetch_started', [
            'viral_video_id' => $video->id,
            'apify_trigger_id' => $trigger->id,
            'actor_id' => $actorId,
        ]);

        try {
            $started = $this->apify->startActorRun($actorId, $input);

            $trigger->update([
                'apify_run_id' => $started['id'] ?? null,
                'dataset_id' => $started['defaultDatasetId'] ?? null,
                'status' => (string) ($started['status'] ?? 'RUNNING'),
                'started_at' => now(),
            ]);

            $finished = $this->apify->waitForRun((string) ($started['id'] ?? ''));
            $finalStatus = (string) ($finished['status'] ?? 'FAILED');

            $trigger->update([
                'status' => $finalStatus,
                'dataset_id' => $finished['defaultDatasetId'] ?? $trigger->dataset_id,
                'finished_at' => now(),
                'compute_units' => $finished['stats']['computeUnits'] ?? null,
                'usage_total_usd' => $finished['usageTotalUsd'] ?? null,
            ]);

            if ($finalStatus !== 'SUCCEEDED') {
                AppEventLogger::error('video_transcript.fetch_failed', 'Transcript actor run did not succeed.', [
                    'viral_video_id' => $video->id,
                    'apify_trigger_id' => $trigger->id,
                    'apify_run_id' => $trigger->apify_run_id,
                    'status' => $finalStatus,
                ]);

                Log::warning('Transcript actor run did not succeed.', [
                    'viral_video_id' => $video->id,
                    'status' => $finalStatus,
                ]);

                return null;
            }

            $datasetId = (string) ($finished['defaultDatasetId'] ?? $trigger->dataset_id ?? '');

            if ($datasetId === '') {
                AppEventLogger::error('video_transcript.dataset_missing', 'Transcript actor finished without a dataset id.', [
                    'viral_video_id' => $video->id,
                    'apify_trigger_id' => $trigger->id,
                    'apify_run_id' => $trigger->apify_run_id,
                ]);

                return null;
            }

            $items = $this->apify->getDatasetItems($datasetId, 1);
            $first = $items[0] ?? null;

            if (! is_array($first)) {
                AppEventLogger::error('video_transcript.payload_missing', 'Transcript actor returned no usable transcript payload.', [
                    'viral_video_id' => $video->id,
                    'apify_trigger_id' => $trigger->id,
                    'dataset_id' => $datasetId,
                ]);

                return null;
            }

            AppEventLogger::result('video_transcript.fetched', [
                'viral_video_id' => $video->id,
                'apify_trigger_id' => $trigger->id,
                'dataset_id' => $datasetId,
                'apify_run_id' => $trigger->apify_run_id,
            ]);

            return $first;
        } catch (ApifyConnectionException $e) {
            $trigger->update([
                'status' => 'FAILED',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);

            throw $e;
        } catch (RuntimeException $e) {
            $trigger->update(['status' => 'FAILED', 'finished_at' => now()]);

            AppEventLogger::error('video_transcript.exception', $e, [
                'viral_video_id' => $video->id,
                'apify_trigger_id' => $trigger->id,
            ]);

            Log::warning('Transcript actor fetch threw.', [
                'viral_video_id' => $video->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
