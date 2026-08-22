<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\CustomKeywordSearch;
use App\Models\ViralVideo;
use App\Support\AppEventLogger;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Single-call OpenAI enrichment for a completed search run.
 *
 * Replaces the two-call pattern of SearchSummaryWriter + VideoContentAnalyzer
 * with one prompt that returns the whole page's analytical payload:
 *
 *   - insights[]                       — 3 bullet strings (**bold** allowed)
 *   - videos[{id, format, hook, angle, why_broke_out, replicate_with}]
 *   - best_post_time{day, hour_local, sentence}
 *
 * The page is information-rich by design (see brandbeaconanalyticsredesign.html
 * mockup) — pulling every piece of analytical text in one round-trip keeps that
 * data density from turning into an OpenAI bill that scales with the UI.
 *
 * The model is fed pre-computed figures (median views, outlier counts, best
 * hour) and never asked to do arithmetic. Anything the model can't tell from
 * the text stays null and the page renders without it.
 */
class SearchEnrichmentService
{
    private const VIDEO_BUDGET = 8;

    /**
     * Run the batched call and persist every field it returns.
     *
     * @param  array<string, mixed>  $facts
     *   Pre-computed figures from SearchInsights (baseline, tile values,
     *   top hashtags, top sounds, posting-heatmap best cell). Everything the
     *   model may quote as a number must appear here.
     * @return array<string, mixed>|null  the raw enrichment payload written,
     *   or null on any failure (best-effort — the page renders without it).
     */
    public function enrich(CustomKeywordSearch $search, array $facts, Collection $topVideos): ?array
    {
        if (! $this->enabled()) {
            AppEventLogger::result('search_enrichment.skipped', [
                'search_id' => $search->id,
                'reason' => 'disabled',
            ]);

            return null;
        }

        $videos = $topVideos->take(self::VIDEO_BUDGET)->values();

        if ($videos->isEmpty()) {
            AppEventLogger::result('search_enrichment.skipped', [
                'search_id' => $search->id,
                'reason' => 'no_videos',
            ]);

            return null;
        }

        $payload = $this->request($search, $facts, $videos);

        if ($payload === null) {
            return null;
        }

        $this->persist($search, $videos, $payload);

        AppEventLogger::result('search_enrichment.persisted', [
            'search_id' => $search->id,
            'insights_count' => count($payload['insights'] ?? []),
            'videos_written' => count($payload['videos'] ?? []),
            'best_post_time' => (bool) ($payload['best_post_time'] ?? null),
        ]);

        return $payload;
    }

    public function enabled(): bool
    {
        return filter_var(config('custom_keyword_search.analysis.enabled', true), FILTER_VALIDATE_BOOL)
            && ! blank(config('services.openai.api_key'));
    }

    private function persist(CustomKeywordSearch $search, Collection $videos, array $payload): void
    {
        // 1. Search-level: bullets + best time + a plain-text fallback summary
        //    that we still write into ai_summary so older code that reads it
        //    stays useful.
        $bullets = $this->normalizeBullets($payload['insights'] ?? []);
        $best = $this->normalizeBestTime($payload['best_post_time'] ?? null);

        $search->forceFill([
            'insights_bullets' => $bullets,
            'best_post_time' => $best,
            'ai_summary' => $this->flattenBullets($bullets),
            'ai_summary_generated_at' => now(),
        ])->save();

        // 2. Per-video enrichment: format/hook/angle plus the two new one-liners.
        $labels = collect($payload['videos'] ?? [])
            ->filter(fn ($entry): bool => is_array($entry) && ! blank($entry['id'] ?? null))
            ->keyBy(fn (array $entry): string => (string) $entry['id']);

        foreach ($videos as $video) {
            $label = $labels->get((string) $video->video_id, []);

            $video->forceFill([
                'content_format' => $this->clean($label['format'] ?? null, 80),
                'content_hook' => $this->clean($label['hook'] ?? null, 120),
                'content_angle' => $this->clean($label['angle'] ?? null, 120),
                'content_why_broke_out' => $this->clean($label['why_broke_out'] ?? null, 320, lowercase: false),
                'content_replicate_with' => $this->clean($label['replicate_with'] ?? null, 320, lowercase: false),
                'analyzed_at' => now(),
            ])->save();
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    private function request(CustomKeywordSearch $search, array $facts, Collection $videos): ?array
    {
        $videoInputs = $videos->map(fn (ViralVideo $video): array => [
            'id' => (string) $video->video_id,
            'caption' => mb_substr((string) $video->title, 0, 300),
            'hashtags' => array_slice((array) $video->hashtags, 0, 8),
            'sound' => $video->soundLabel(),
            'views' => $video->views,
            'seconds' => (int) round($video->duration),
            'handle' => $video->username,
        ])->all();

        try {
            AppEventLogger::result('search_enrichment.request_started', [
                'search_id' => $search->id,
                'video_count' => count($videoInputs),
            ]);

            $response = Http::withToken((string) config('services.openai.api_key'))
                ->timeout((int) config('custom_keyword_search.analysis.timeout', 60))
                ->acceptJson()
                ->post(rtrim((string) config('services.openai.base_url'), '/').'/chat/completions', [
                    'model' => config('custom_keyword_search.analysis.model', 'gpt-4.1-mini'),
                    'temperature' => 0.3,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $this->systemPrompt(),
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'tracker' => [
                                    'name' => $search->name,
                                    'phrase' => $search->phrase,
                                    'type' => $search->search_type,
                                    'handle' => $search->source_tiktok_handle,
                                ],
                                'figures' => $facts,
                                'videos' => $videoInputs,
                            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                AppEventLogger::error('search_enrichment.request_failed', 'Search enrichment request failed.', [
                    'search_id' => $search->id,
                    'status' => $response->status(),
                ]);
                Log::warning('Search enrichment request failed.', [
                    'search_id' => $search->id,
                    'status' => $response->status(),
                ]);

                return null;
            }

            $decoded = json_decode(
                (string) data_get($response->json(), 'choices.0.message.content'),
                true,
            );

            if (! is_array($decoded)) {
                AppEventLogger::error('search_enrichment.invalid_payload', 'Search enrichment returned a non-object payload.', [
                    'search_id' => $search->id,
                ]);

                return null;
            }

            AppEventLogger::result('search_enrichment.response_received', [
                'search_id' => $search->id,
            ]);

            return $decoded;
        } catch (Throwable $e) {
            AppEventLogger::error('search_enrichment.exception', $e, [
                'search_id' => $search->id,
            ]);
            Log::warning('Search enrichment threw.', [
                'search_id' => $search->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function systemPrompt(): string
    {
        return implode("\n", [
            'You are the analytical engine behind a TikTok viral-video research tool.',
            '',
            'For one completed search run you produce every piece of qualitative text the tracker page needs, in one JSON object.',
            'You are handed pre-computed figures. Use them verbatim. Never calculate, never round differently, never introduce a number that was not handed to you.',
            'Prefer null over a guess. The page renders around missing fields cleanly.',
            '',
            'Return a raw JSON object with EXACTLY these keys:',
            '',
            '{',
            '  "insights": [                          // 3 items, in priority order',
            '    "..." ,                              // one short bullet, plain sentence',
            '    "..." ,',
            '    "..."                                // wrap important nouns/numbers in **double asterisks**',
            '  ],',
            '  "videos": [                            // one per input id, same order',
            '    {',
            '      "id": "<echo of input id>",',
            '      "format": "...",                   // 2-4 words, lowercase',
            '      "hook": "...",                     // 3-6 words, lowercase',
            '      "angle": "...",                    // 3-6 words, lowercase',
            '      "why_broke_out": "...",            // ONE sentence, up to 30 words, factual',
            '      "replicate_with": "..."            // ONE sentence, imperative voice ("Skip polished ...")',
            '    }',
            '  ],',
            '  "best_post_time": {                    // derived from figures.posting_heatmap.best',
            '    "day": "Wednesday",',
            '    "hour_local": "6 PM PST",',
            '    "sentence": "Best time to post: **Wednesday around 6 PM PST**. Their highest ..."',
            '  }',
            '}',
            '',
            'Rules for `insights` bullets:',
            '- Lead the first bullet with the most useful, action-oriented signal in the run.',
            '- Bold at most two fragments per bullet with **double asterisks** (a hashtag, a handle, a number, or a format).',
            '- Never exceed 30 words per bullet.',
            '- No hype ("insane", "explosive", "game-changing"). No advice to the reader.',
            '',
            'Rules for `videos`:',
            '- Every input id must appear in the output. If the caption is uninformative, set format/hook/angle to null; still fill why_broke_out with something the numbers alone support ("Highest view count in the batch at 3.6M.").',
            '- `why_broke_out` cites what made THIS video win — a claim, a format, a hook style — not generic advice.',
            '- `replicate_with` is one imperative sentence starting with a verb ("Skip", "Lead", "Pair"), aimed at the tracker owner.',
            '',
            'Rules for `best_post_time`:',
            '- Use exactly the day/hour handed in figures.posting_heatmap.best.',
            '- `sentence` is one line: "Best time to post: **<Day> around <hour> <tz>**. <short reason from the data>."',
            '- If figures.posting_heatmap.best is missing or null, set best_post_time to null.',
        ]);
    }

    /**
     * @param  mixed  $bullets
     * @return array<int, string>
     */
    private function normalizeBullets(mixed $bullets): array
    {
        if (! is_array($bullets)) return [];

        return collect($bullets)
            ->filter(fn ($item): bool => is_string($item) && trim($item) !== '')
            ->map(fn (string $item): string => mb_substr(trim($item), 0, 400))
            ->take(4)
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function normalizeBestTime(mixed $best): ?array
    {
        if (! is_array($best)) return null;

        $day = $this->clean($best['day'] ?? null, 20, lowercase: false);
        $hour = $this->clean($best['hour_local'] ?? null, 30, lowercase: false);
        $sentence = $this->clean($best['sentence'] ?? null, 240, lowercase: false);

        if (! $sentence) return null;

        return array_filter([
            'day' => $day,
            'hour_local' => $hour,
            'sentence' => $sentence,
        ]);
    }

    private function flattenBullets(array $bullets): ?string
    {
        if ($bullets === []) return null;

        $stripped = array_map(
            fn (string $bullet): string => trim(preg_replace('/\*\*/', '', $bullet)),
            $bullets,
        );

        return mb_substr(implode(' ', $stripped), 0, 400);
    }

    private function clean(mixed $value, int $max, bool $lowercase = true): ?string
    {
        if (! is_string($value)) return null;

        $value = trim($value);
        if ($lowercase) {
            $value = mb_strtolower($value);
        }

        if ($value === '' || in_array(mb_strtolower($value), ['null', 'none', 'unknown', 'n/a'], true)) {
            return null;
        }

        return mb_substr($value, 0, $max);
    }
}
