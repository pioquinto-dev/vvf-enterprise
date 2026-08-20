<?php

namespace App\Services\ViralVideoAnalysis;

use App\Jobs\RunVideoAnalysis;
use App\Models\VideoAnalysis;
use App\Models\VideoPreparation;
use App\Models\ViralVideo;
use App\Services\Apify\ApifyConnectionException;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class VideoPreparationProcessor
{
    private const APIFY_CONNECTION_FAILURE = 'Something went wrong. Try again or contact support.';

    public function __construct(
        private readonly SharedTranscriptStore $sharedTranscripts,
        private readonly VideoSourceRefresher $refresher,
        private readonly TranscriptFetcher $transcriptFetcher,
        private readonly TranscriptPayloadNormalizer $transcripts,
        private readonly SharedDiagnosticAnalyzer $diagnostics,
    ) {}

    public function process(VideoPreparation $preparation): void
    {
        $video = ViralVideo::query()->find($preparation->viral_video_id);

        if ($video === null) {
            $this->failPreparation($preparation, 'This video is no longer available.');

            return;
        }

        try {
            $this->prepare($preparation, $video);
        } catch (ApifyConnectionException $e) {
            Log::warning('Video preparation could not reach Apify.', [
                'viral_video_id' => $video->id,
                'video_id' => $video->video_id,
                'error' => $e->getMessage(),
            ]);

            $this->failPreparation($preparation, self::APIFY_CONNECTION_FAILURE);
        } catch (RuntimeException $e) {
            Log::warning('Video preparation failed.', [
                'viral_video_id' => $video->id,
                'video_id' => $video->video_id,
                'error' => $e->getMessage(),
            ]);

            $this->failPreparation($preparation, 'We could not prepare this video yet. Please try again later.');
        }
    }

    private function prepare(VideoPreparation $preparation, ViralVideo $video): void
    {
        $sharedTranscript = $this->sharedTranscripts->find($video->video_id, $video->post_url);
        $payload = is_array($video->raw_payload) ? $video->raw_payload : [];

        if ($sharedTranscript === null || blank($sharedTranscript->transcript)) {
            // Refresh stats/metadata from the scrape, then fetch the transcript
            // from the dedicated transcript actor. Fall back to whatever
            // subtitles the scrape carried if the transcript actor comes back
            // empty.
            $payload = $this->refresher->refresh($video);

            $transcriptPayload = $this->transcriptFetcher->fetch($video);
            $normalized = $transcriptPayload !== null
                ? $this->transcripts->extract($transcriptPayload)
                : ['transcript' => null, 'transcript_segments' => null];

            if (blank($normalized['transcript'])) {
                $normalized = $this->transcripts->extract($payload);
            }

            if (blank($normalized['transcript'])) {
                throw new RuntimeException('No transcript was available from the source payload.');
            }

            $sharedTranscript = $this->sharedTranscripts->upsertTranscript(
                videoId: $video->video_id,
                postUrl: $video->post_url,
                transcript: (string) $normalized['transcript'],
                transcriptSegments: $normalized['transcript_segments'],
                fetchedAt: now(),
            );
        }

        if (blank($sharedTranscript->analysis_result) || $this->diagnostics->needsRefresh((array) $sharedTranscript->analysis_result)) {
            $analysis = $this->diagnostics->analyze(
                transcript: $sharedTranscript->transcript,
                transcriptSegments: $sharedTranscript->transcript_segments,
                videoContext: $this->videoContext($video, $payload),
            );

            if ($analysis === null) {
                throw new RuntimeException('Shared diagnostic analysis was unavailable.');
            }

            $sharedTranscript = $this->sharedTranscripts->storeAnalysisResult($sharedTranscript, $analysis);
        }

        $preparation->forceFill([
            'status' => VideoPreparation::STATUS_COMPLETE,
            'shared_artifacts' => [
                'shared_transcript_id' => $sharedTranscript->id,
                'has_analysis_result' => filled($sharedTranscript->analysis_result),
                'normalized_post_url' => $sharedTranscript->normalized_post_url,
            ],
            'prepared_at' => now(),
            'error_message' => null,
        ])->save();

        VideoAnalysis::query()
            ->where('video_id', $preparation->video_id)
            ->where('status', VideoAnalysis::STATUS_PROCESSING)
            ->pluck('id')
            ->each(fn (string $analysisId) => RunVideoAnalysis::dispatch($analysisId)
                ->onQueue((string) config('viral_video_analysis.queue', 'video-analysis')));
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function videoContext(ViralVideo $video, array $payload): array
    {
        return [
            'video_id' => $video->video_id,
            'title' => $video->title,
            'handle' => $video->username,
            'creator_name' => $video->name,
            'followers' => $video->followers,
            'views' => $video->views,
            'likes' => $video->likes,
            'comments' => $video->comments,
            'shares' => $video->shares,
            'bookmarks' => $video->bookmarks,
            'duration' => $video->duration,
            'engagement_rate' => $video->engagementRate(),
            'hashtags' => $video->hashtags,
            'sound_label' => $video->soundLabel(),
            'song' => $video->song,
            'artist' => $video->artist,
            'content_format' => $video->content_format,
            'content_hook' => $video->content_hook,
            'content_angle' => $video->content_angle,
            'virality_score' => $video->virality_score,
            'uploaded_at' => $video->uploaded_at?->toIso8601String(),
            'post_url' => $video->post_url,
            'raw_payload' => $payload,
        ];
    }

    private function failPreparation(VideoPreparation $preparation, string $message): void
    {
        $preparation->forceFill([
            'status' => VideoPreparation::STATUS_FAILED,
            'error_message' => $message,
        ])->save();

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
