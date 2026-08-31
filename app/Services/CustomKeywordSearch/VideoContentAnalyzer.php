<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\ViralVideo;
use App\Support\AppEventLogger;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Classifies a video's creative shape: the format it uses, how it opens, and
 * what argument it makes. One OpenAI call covers a batch of videos.
 *
 * The model only sees captions, hashtags, sound names and engagement — never
 * the footage. That is a real limit: a caption-led guess is often right about
 * angle and wrong about format. Treat these as labels for scanning, not ground
 * truth, and keep them out of anything that computes a number.
 *
 * Analysis is best-effort throughout. A missing key, a timeout, or a malformed
 * response leaves the fields null and the page renders without them.
 */
class VideoContentAnalyzer
{
    /**
     * Analyses the videos in `$videos` that have not been classified before.
     *
     * @param  iterable<ViralVideo>  $videos
     * @return int  how many were written
     */
    public function analyze(iterable $videos): int
    {
        if (! $this->enabled()) {
            AppEventLogger::result('video_content_analysis.skipped', [
                'reason' => 'disabled',
            ]);

            return 0;
        }

        $pending = [];

        foreach ($videos as $video) {
            // analyzed_at is set even on a null result, so a video that the
            // model could not read is not re-sent on every refresh.
            if ($video->analyzed_at === null) {
                $pending[$video->video_id] = $video;
            }
        }

        if ($pending === []) {
            AppEventLogger::result('video_content_analysis.skipped', [
                'reason' => 'no_pending_videos',
            ]);

            return 0;
        }

        AppEventLogger::result('video_content_analysis.started', [
            'video_count' => count($pending),
            'video_ids' => array_keys($pending),
        ]);

        $labels = $this->requestLabels(array_values($pending));

        if ($labels === null) {
            AppEventLogger::error('video_content_analysis.labels_missing', 'Video content analysis returned no usable labels.', [
                'video_count' => count($pending),
                'video_ids' => array_keys($pending),
            ]);

            return 0;
        }

        $written = 0;

        foreach ($pending as $videoId => $video) {
            $label = $labels[$videoId] ?? [];

            $video->forceFill([
                'content_format' => $this->clean($label['format'] ?? null, 80),
                'content_hook' => $this->clean($label['hook'] ?? null, 120),
                'content_angle' => $this->clean($label['angle'] ?? null, 120),
                'analyzed_at' => now(),
            ])->save();

            $written++;
        }

        AppEventLogger::result('video_content_analysis.completed', [
            'video_count' => count($pending),
            'written_count' => $written,
            'video_ids' => array_keys($pending),
        ]);

        return $written;
    }

    public function enabled(): bool
    {
        return filter_var(config('custom_keyword_search.analysis.enabled', true), FILTER_VALIDATE_BOOL)
            && ! blank(config('services.openai.api_key'));
    }

    /**
     * @param  array<int, ViralVideo>  $videos
     * @return array<string, array<string, string|null>>|null  null on failure
     */
    private function requestLabels(array $videos): ?array
    {
        $payload = array_map(fn (ViralVideo $video): array => [
            'id' => $video->video_id,
            'caption' => mb_substr((string) $video->title, 0, 300),
            'hashtags' => array_slice((array) $video->hashtags, 0, 8),
            'sound' => $video->soundLabel(),
            'views' => $video->views,
            'seconds' => (int) round($video->duration),
        ], $videos);

        try {
            AppEventLogger::result('video_content_analysis.request_started', [
                'video_count' => count($videos),
                'video_ids' => array_map(fn (ViralVideo $video): string => (string) $video->video_id, $videos),
            ]);

            $response = Http::withToken((string) config('services.openai.api_key'))
                ->timeout((int) config('custom_keyword_search.analysis.timeout', 45))
                ->acceptJson()
                ->post(rtrim((string) config('services.openai.base_url'), '/').'/chat/completions', [
                    'model' => config('custom_keyword_search.analysis.model', 'gpt-4.1-mini'),
                    'temperature' => 0.2,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => implode("\n", [
                                'You label short-form video creative for a marketing research tool.',
                                '',
                                'For each video you receive an id, caption, hashtags, sound name and stats.',
                                'You never see the footage. Infer only what the text supports, and return null for anything you cannot tell.',
                                '',
                                'Return a raw JSON array. One object per input id, no prose, no markdown, no code fences.',
                                'Each object has exactly these keys: id, format, hook, angle.',
                                '',
                                '- format: the video shape, 2 to 4 words, lowercase.',
                                '  Examples: "before and after demo", "get ready with me", "talking head explainer",',
                                '  "unboxing", "product close up", "street interview", "list rundown".',
                                '- hook: how the opening earns attention, 3 to 6 words, lowercase.',
                                '  Examples: "skeptic to believer open", "bold price claim", "problem stated first".',
                                '- angle: the argument being made, 3 to 6 words, lowercase.',
                                '  Examples: "body care not just face", "cheaper than the salon", "works on sensitive skin".',
                                '',
                                'Never invent specifics the caption does not support. Use null over a guess.',
                            ]),
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                AppEventLogger::error('video_content_analysis.request_failed', 'Video content analysis request failed.', [
                    'status' => $response->status(),
                    'count' => count($videos),
                ]);

                Log::warning('Video content analysis request failed.', [
                    'status' => $response->status(),
                    'count' => count($videos),
                ]);

                return null;
            }

            $decoded = json_decode((string) data_get($response->json(), 'choices.0.message.content'), true);

            if (! is_array($decoded)) {
                AppEventLogger::error('video_content_analysis.invalid_payload', 'Video content analysis returned a non-array payload.', [
                    'count' => count($videos),
                ]);

                return null;
            }

            // Accept both a bare array and one wrapped in a single key.
            if (! array_is_list($decoded)) {
                $decoded = collect($decoded)->first(fn ($value): bool => is_array($value)) ?? [];
            }

            $labels = [];

            foreach ($decoded as $entry) {
                if (is_array($entry) && ! blank($entry['id'] ?? null)) {
                    $labels[(string) $entry['id']] = $entry;
                }
            }

            AppEventLogger::result('video_content_analysis.response_received', [
                'count' => count($videos),
                'label_count' => count($labels),
            ]);

            return $labels;
        } catch (Throwable $e) {
            AppEventLogger::error('video_content_analysis.exception', $e, [
                'count' => count($videos),
            ]);

            Log::warning('Video content analysis threw.', ['error' => $e->getMessage()]);

            return null;
        }
    }

    private function clean(mixed $value, int $max): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim(mb_strtolower($value));

        // The model occasionally answers with a literal "null" or "unknown".
        if ($value === '' || in_array($value, ['null', 'none', 'unknown', 'n/a'], true)) {
            return null;
        }

        return mb_substr($value, 0, $max);
    }
}
