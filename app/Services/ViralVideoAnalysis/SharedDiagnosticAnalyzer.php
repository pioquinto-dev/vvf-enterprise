<?php

namespace App\Services\ViralVideoAnalysis;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class SharedDiagnosticAnalyzer
{
    public function needsRefresh(?array $payload): bool
    {
        if (! is_array($payload)) {
            return true;
        }

        $normalized = $this->normalize($payload);

        if ($normalized === null) {
            return true;
        }

        return blank($normalized['why_it_went_viral'])
            || blank($normalized['evidence_summary'])
            || blank($normalized['hook_analysis'])
            || count($normalized['content_breakdown']) < 3
            || count($normalized['hook_reasons']) < 3
            || count($normalized['hooks']) < 3;
    }

    /**
     * @param  array<int, array<string, mixed>>|null  $transcriptSegments
     * @param  array<string, mixed>  $videoContext
     * @return array<string, mixed>|null
     */
    public function analyze(string $transcript, ?array $transcriptSegments, array $videoContext): ?array
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
                    'temperature' => 0.2,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => implode("\n", [
                                'You are a senior short-form strategist explaining why a video outperformed its baseline.',
                                'Return only valid JSON with exactly these top-level keys:',
                                'why_it_went_viral, evidence_summary, hook_analysis, hook_reasons, content_breakdown, hooks.',
                                'Ground every claim in the transcript, transcript segments, metrics, or provided context.',
                                'Do not invent visuals, timing, or audience reactions that are not supported by the inputs.',
                                'why_it_went_viral must be a dense 2-4 sentence summary that names the specific mechanism (e.g. a countable promise, an open loop, trend-native phrasing) and why people keep watching to the end — not generic praise.',
                                'evidence_summary must be 1-2 sentences that explicitly quote transcript phrases, pacing, or measurable context.',
                                'hook_analysis must be the exact opening line of the video, quoted verbatim from the transcript, with no commentary — this is the hook itself, not a description of it.',
                                'hook_reasons must be an array of exactly 3 objects with keys: title, explanation, that explain WHY the opening line works as a hook. Each title is a 1-3 word named tactic (e.g. "Countable promise", "Exclusivity framing", "Named outcome"). Each explanation is one sentence on the viewer psychology it triggers. These are about the hook only and must be distinct from content_breakdown.',
                                'content_breakdown must be an array of exactly 4 objects with keys: title, explanation, uplift, evidence, covering the whole video (not just the hook).',
                                'Each content_breakdown title is a short named driver; explanation must explain the retention/share mechanism, not restate the line.',
                                'uplift must be a short estimated effect label like "+34%" for every driver — always provide your best-supported estimate, never null.',
                                'hooks must be an array of exactly 3 short alternate opening lines a brand could test that preserve the same mechanism without copying the source verbatim.',
                                'Be specific and concrete; avoid generic best practices that would apply to any video.',
                            ]),
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'video' => $videoContext,
                                'transcript' => $transcript,
                                'transcript_segments' => $transcriptSegments,
                            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Shared diagnostic analysis request failed.', [
                    'status' => $response->status(),
                ]);

                return null;
            }

            $decoded = json_decode((string) data_get($response->json(), 'choices.0.message.content'), true);

            return $this->normalize($decoded);
        } catch (Throwable $e) {
            Log::warning('Shared diagnostic analysis threw.', ['error' => $e->getMessage()]);

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

        $why = $this->stringValue(
            $payload['why_it_went_viral'] ?? $payload['summary'] ?? $payload['viral_summary'] ?? null
        );
        $evidence = $this->stringValue(
            $payload['evidence_summary'] ?? $payload['evidence'] ?? $payload['supporting_evidence'] ?? null
        );
        $hook = $this->normalizeHook(
            $payload['hook_analysis'] ?? $payload['hook'] ?? $payload['opening_hook'] ?? null
        );
        $hookReasons = $this->normalizeHookReasons(
            $payload['hook_reasons'] ?? $payload['hook_breakdown'] ?? $payload['why_the_hook_works'] ?? null
        );
        $contentBreakdown = $this->normalizeBreakdown(
            $payload['content_breakdown'] ?? $payload['drivers'] ?? $payload['why_breakdown'] ?? null
        );
        $hooks = $this->normalizeHooks(
            $payload['hooks'] ?? $payload['hook_variations'] ?? $payload['variations_to_test'] ?? null
        );

        if ($why === null && $evidence !== null) {
            $why = $evidence;
        }

        if ($evidence === null && $why !== null) {
            $evidence = $why;
        }

        if ($contentBreakdown === []) {
            $contentBreakdown = $this->breakdownFromText($evidence ?? $why);
        }

        // If the model gave hook reasons but no standalone drivers, don't let the
        // hook layer double as the whole-video breakdown — they answer different
        // questions on different tabs.
        return [
            'why_it_went_viral' => $why ?? 'This video works because the opening promise, pacing, and payoff align tightly.',
            'evidence_summary' => $evidence ?? 'The transcript and pacing point to a strong open loop and a fast payoff.',
            'hook_analysis' => $hook ?? 'The opening hook is still being assembled from the available transcript.',
            'hook_reasons' => $hookReasons,
            'content_breakdown' => $contentBreakdown,
            'hooks' => $hooks,
        ];
    }

    /**
     * Hook-specific mechanisms — why the opening line lands. Kept separate from
     * the whole-video content_breakdown so the Hook tab does not just repeat the
     * "Why It Went Viral" drivers.
     *
     * @param  mixed  $value
     * @return array<int, array<string, ?string>>
     */
    private function normalizeHookReasons(mixed $value): array
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
                    'title' => Str::limit($text, 32, ''),
                    'explanation' => $text,
                ];

                continue;
            }

            if (! is_array($entry)) {
                continue;
            }

            $title = $this->stringValue($entry['title'] ?? $entry['tactic'] ?? $entry['label'] ?? null);
            $explanation = $this->stringValue(
                $entry['explanation'] ?? $entry['reason'] ?? $entry['body'] ?? $entry['description'] ?? null
            );

            if ($title === null && $explanation === null) {
                continue;
            }

            $items[] = [
                'title' => $title ?? Str::limit((string) $explanation, 32, ''),
                'explanation' => $explanation ?? $title,
            ];
        }

        return array_slice($items, 0, 3);
    }

    private function normalizeHook(mixed $value): ?string
    {
        if (is_string($value)) {
            return $this->cleanString($value);
        }

        if (is_array($value)) {
            return $this->stringValue(
                $value['summary'] ?? $value['text'] ?? $value['line'] ?? $value['hook'] ?? null
            );
        }

        return null;
    }

    /**
     * @param  mixed  $value
     * @return array<int, array<string, mixed>>
     */
    private function normalizeBreakdown(mixed $value): array
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
                    'title' => Str::limit($text, 42, ''),
                    'explanation' => $text,
                    'uplift' => null,
                    'evidence' => null,
                ];

                continue;
            }

            if (! is_array($entry)) {
                continue;
            }

            $title = $this->stringValue($entry['title'] ?? $entry['driver'] ?? $entry['label'] ?? null);
            $explanation = $this->stringValue(
                $entry['explanation'] ?? $entry['reason'] ?? $entry['body'] ?? $entry['description'] ?? null
            );

            if ($title === null && $explanation === null) {
                continue;
            }

            $items[] = [
                'title' => $title ?? Str::limit((string) $explanation, 42, ''),
                'explanation' => $explanation ?? $title,
                'uplift' => $this->stringValue($entry['uplift'] ?? $entry['delta'] ?? $entry['impact'] ?? null),
                'evidence' => $this->stringValue($entry['evidence'] ?? $entry['proof'] ?? $entry['quote'] ?? null),
            ];
        }

        return array_slice($items, 0, 5);
    }

    /**
     * @param  mixed  $value
     * @return array<int, string>
     */
    private function normalizeHooks(mixed $value): array
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

            $text = $this->stringValue(
                $entry['text'] ?? $entry['variation'] ?? $entry['hook'] ?? $entry['line'] ?? null
            );

            if ($text !== null) {
                $items[] = $text;
            }
        }

        return array_slice(array_values(array_unique($items)), 0, 3);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function breakdownFromText(?string $text): array
    {
        if ($text === null) {
            return [];
        }

        return collect(preg_split('/(?<=[.!?])\s+/', $text) ?: [])
            ->map(fn (string $sentence) => $this->cleanString($sentence))
            ->filter()
            ->take(4)
            ->values()
            ->map(fn (string $sentence, int $index): array => [
                'title' => 'Driver '.($index + 1),
                'explanation' => $sentence,
                'uplift' => null,
                'evidence' => null,
            ])
            ->all();
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
