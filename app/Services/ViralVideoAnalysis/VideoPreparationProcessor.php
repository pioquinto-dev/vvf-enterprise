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
            // A search winner was just scraped, so use its dedicated transcript
            // actor first. Re-scraping the same post before this step adds a
            // second provider dependency and can fail even when a transcript
            // is available.
            $transcriptPayload = $this->transcriptFetcher->fetch($video);
            $normalized = $transcriptPayload !== null
                ? $this->transcripts->extract($transcriptPayload)
                : ['transcript' => null, 'transcript_segments' => null];

            if (blank($normalized['transcript'])) {
                $normalized = $this->transcripts->extract($payload);
            }

            if (blank($normalized['transcript'])) {
                // Older/manual videos may not retain usable source data. Only
                // then refresh the post and use its payload as a final fallback.
                $payload = $this->refresher->refresh($video);
                $normalized = $this->transcripts->extract($payload);
            }

            if (blank($normalized['transcript'])) {
                $fallbackTranscript = $this->fallbackTranscript($video, $payload);

                if (blank($fallbackTranscript)) {
                    throw new RuntimeException('No transcript was available from the source payload.');
                }

                Log::info('Video preparation fell back to saved caption context.', [
                    'viral_video_id' => $video->id,
                    'video_id' => $video->video_id,
                ]);

                $normalized = [
                    'transcript' => $fallbackTranscript,
                    'transcript_segments' => null,
                ];
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

    /**
     * When the transcript actor and payload both come up empty, keep automatic
     * winner analysis alive with the best text context we already have locally.
     *
     * @param  array<string, mixed>  $payload
     */
    private function fallbackTranscript(ViralVideo $video, array $payload): ?string
    {
        $hashtags = array_values(array_filter(
            array_map(
                fn (mixed $tag): string => trim((string) $tag),
                is_array($video->hashtags) ? $video->hashtags : []
            ),
            fn (string $value): bool => $value !== ''
        ));

        $parts = array_values(array_filter([
            trim((string) $video->title),
            trim((string) ($payload['desc'] ?? '')),
            trim((string) ($payload['description'] ?? '')),
            trim((string) ($payload['text'] ?? '')),
            trim((string) ($payload['title'] ?? '')),
            $hashtags !== [] ? 'Hashtags: '.implode(' ', array_map(
                fn (string $tag): string => str_starts_with($tag, '#') ? $tag : '#'.$tag,
                array_slice($hashtags, 0, 12)
            )) : '',
            filled($video->soundLabel()) ? 'Sound: '.$video->soundLabel() : '',
            filled($video->username) ? 'Creator: @'.$video->username : '',
        ], fn (string $value): bool => $value !== ''));

        if ($parts === []) {
            return null;
        }

        return implode("\n", array_values(array_unique($parts)));
    }
}
