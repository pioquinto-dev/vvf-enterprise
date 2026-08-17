<?php

namespace App\Services\ViralVideoAnalysis;

use App\Models\ViralVideoSharedTranscript;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class CreativeStrategistGenerator
{
    public function needsRefresh(?array $payload): bool
    {
        if (! is_array($payload)) {
            return true;
        }

        $strategy = is_array($payload['creative_strategy'] ?? null) ? $payload['creative_strategy'] : [];
        $recommendations = $strategy['recommendations'] ?? null;
        $blueprint = $strategy['blueprint'] ?? null;

        return blank($strategy['summary'] ?? null)
            || ! is_array($recommendations)
            || count($recommendations) < 3
            || ! is_array($blueprint)
            || blank($blueprint['hook'] ?? null)
            || blank($blueprint['proof'] ?? null)
            || blank($blueprint['payoff'] ?? null)
            || blank($blueprint['caption_cta'] ?? null);
    }

    /**
     * @return array{transcript:string, transcript_segments:?array, result:array<string, mixed>}|null
     */
    public function generate(string $videoId): ?array
    {
        $shared = ViralVideoSharedTranscript::query()
            ->where('video_id', $videoId)
            ->first();

        if ($shared === null || blank($shared->analysis_result)) {
            return null;
        }

        $creatorLayer = $this->creatorFacingLayer($shared->transcript, $shared->transcript_segments, (array) $shared->analysis_result);

        if ($creatorLayer === null) {
            return null;
        }

        $result = array_merge([
            'why_it_went_viral' => data_get($shared->analysis_result, 'why_it_went_viral'),
            'evidence_summary' => data_get($shared->analysis_result, 'evidence_summary'),
            'hook_analysis' => data_get($shared->analysis_result, 'hook_analysis'),
            'hook_reasons' => data_get($shared->analysis_result, 'hook_reasons'),
            'content_breakdown' => data_get($shared->analysis_result, 'content_breakdown'),
            'hooks' => data_get($shared->analysis_result, 'hooks'),
        ], $creatorLayer);

        return [
            'transcript' => $shared->transcript,
            'transcript_segments' => $shared->transcript_segments,
            'result' => $result,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>|null  $transcriptSegments
     * @param  array<string, mixed>  $diagnostic
     * @return array<string, mixed>|null
     */
    private function creatorFacingLayer(string $transcript, ?array $transcriptSegments, array $diagnostic): ?array
    {
        if (blank(config('services.openai.api_key'))) {
            return null;
        }

        try {
            $response = Http::withToken((string) config('services.openai.api_key'))
                ->timeout((int) config('viral_video_analysis.analysis.timeout', 60))
                ->acceptJson()
                ->post(rtrim((string) config('services.openai.base_url'), '/').'/chat/completions', [
                    'model' => config('viral_video_analysis.analysis.model', 'gpt-4.1-mini'),
                    'temperature' => 0.4,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => implode("\n", [
                                'You create creator-facing adaptation guidance from a viral short-form video analysis.',
                                'Return only valid JSON with exactly these top-level keys: creative_strategy, ctas, delivery_instructions.',
                                'creative_strategy must be an object with keys: summary, recommendations, blueprint.',
                                'summary must explain the repeatable mechanism in 1-2 sentences.',
                                'recommendations must be an array of 3-4 objects with keys: title, text.',
                                'Each recommendation should tell a brand how to adapt the mechanism, not copy the source literally.',
                                'blueprint must be an object with keys: hook, proof, payoff, caption_cta.',
                                'ctas must be 2-4 concise CTA ideas.',
                                'delivery_instructions must be 2-4 concise filming or pacing instructions.',
                                'It is okay to provide a reusable script structure, but do not quote the source video line-for-line unless necessary.',
                            ]),
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'transcript' => $transcript,
                                'transcript_segments' => $transcriptSegments,
                                'diagnostic' => $diagnostic,
                            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Creative strategist request failed.', [
                    'status' => $response->status(),
                ]);

                return null;
            }

            $decoded = json_decode((string) data_get($response->json(), 'choices.0.message.content'), true);

            return $this->normalize($decoded);
        } catch (Throwable $e) {
            Log::warning('Creative strategist generation threw.', ['error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * @param  mixed  $payload
     * @return array<string, mixed>|null
     */
    private function normalize(mixed $payload): ?array
    {
        if (! is_array($payload)) {
            return null;
        }

        $strategy = is_array($payload['creative_strategy'] ?? null) ? $payload['creative_strategy'] : [];
        $summary = $this->stringValue($strategy['summary'] ?? $payload['summary'] ?? $payload['creative_summary'] ?? null);
        $recommendations = $this->normalizeRecommendations(
            $strategy['recommendations'] ?? $payload['recommendations'] ?? $payload['recommendation_list'] ?? null
        );
        $blueprint = $this->normalizeBlueprint(
            $strategy['blueprint'] ?? $payload['blueprint'] ?? $payload['script_to_replicate'] ?? null,
            $payload['ctas'] ?? null,
            $payload['delivery_instructions'] ?? null,
        );
        $ctas = $this->normalizeStringList($payload['ctas'] ?? $strategy['ctas'] ?? null);
        $delivery = $this->normalizeStringList($payload['delivery_instructions'] ?? $strategy['delivery_instructions'] ?? null);

        if ($summary === null && $recommendations !== []) {
            $summary = $recommendations[0]['title'];
        }

        return [
            'creative_strategy' => [
                'summary' => $summary ?? 'Adapt the mechanism, compress the payoff, and keep the promise immediately clear.',
                'recommendations' => $recommendations,
                'blueprint' => $blueprint,
            ],
            'ctas' => $ctas,
            'delivery_instructions' => $delivery,
        ];
    }

    /**
     * @param  mixed  $value
     * @return array<int, array<string, ?string>>
     */
    private function normalizeRecommendations(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $items = [];

        foreach ($value as $entry) {
            if (is_string($entry)) {
                $text = $this->cleanString($entry);

                if ($text === null) {
                    continue;
                }

                $items[] = [
                    'title' => Str::limit($text, 50, ''),
                    'text' => null,
                ];

                continue;
            }

            if (! is_array($entry)) {
                continue;
            }

            $title = $this->stringValue($entry['title'] ?? $entry['headline'] ?? $entry['label'] ?? null);
            $text = $this->stringValue($entry['text'] ?? $entry['body'] ?? $entry['reason'] ?? $entry['description'] ?? null);

            if ($title === null && $text === null) {
                continue;
            }

            $items[] = [
                'title' => $title ?? Str::limit((string) $text, 50, ''),
                'text' => $text,
            ];
        }

        return array_slice($items, 0, 4);
    }

    /**
     * @param  mixed  $value
     * @param  mixed  $ctas
     * @param  mixed  $delivery
     * @return array<string, string>
     */
    private function normalizeBlueprint(mixed $value, mixed $ctas, mixed $delivery): array
    {
        $normalized = [];

        if (is_string($value)) {
            $normalized['script'] = $value;
        }

        if (is_array($value)) {
            $normalized = array_filter([
                'hook' => $this->stringValue($value['hook'] ?? $value['HOOK'] ?? $value['opening'] ?? null),
                'proof' => $this->stringValue($value['proof'] ?? $value['PROOF'] ?? $value['middle'] ?? null),
                'payoff' => $this->stringValue($value['payoff'] ?? $value['PAYOFF'] ?? $value['close'] ?? null),
                'caption_cta' => $this->stringValue($value['caption_cta'] ?? $value['caption CTA'] ?? $value['cta'] ?? null),
            ]);
        }

        $deliveryList = $this->normalizeStringList($delivery);
        $ctaList = $this->normalizeStringList($ctas);

        if (! array_key_exists('hook', $normalized) && isset($deliveryList[0])) {
            $normalized['hook'] = $deliveryList[0];
        }

        if (! array_key_exists('proof', $normalized) && isset($deliveryList[1])) {
            $normalized['proof'] = $deliveryList[1];
        }

        if (! array_key_exists('payoff', $normalized) && isset($deliveryList[2])) {
            $normalized['payoff'] = $deliveryList[2];
        }

        if (! array_key_exists('caption_cta', $normalized) && isset($ctaList[0])) {
            $normalized['caption_cta'] = $ctaList[0];
        }

        return $normalized;
    }

    /**
     * @param  mixed  $value
     * @return array<int, string>
     */
    private function normalizeStringList(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $items = [];

        foreach ($value as $entry) {
            if (is_string($entry)) {
                $text = $this->cleanString($entry);
                if ($text !== null) {
                    $items[] = $text;
                }

                continue;
            }

            if (! is_array($entry)) {
                continue;
            }

            $text = $this->stringValue($entry['text'] ?? $entry['body'] ?? $entry['label'] ?? null);

            if ($text !== null) {
                $items[] = $text;
            }
        }

        return array_slice(array_values(array_unique($items)), 0, 4);
    }

    private function stringValue(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        return $this->cleanString($value);
    }

    private function cleanString(?string $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        return Arr::get(['value' => preg_replace("/\s+/", ' ', $value)], 'value') ?? $value;
    }
}
