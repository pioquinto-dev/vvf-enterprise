<?php

namespace App\Services\CustomKeywordSearch;

use App\Services\IndexedKeywordService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Turns one phrase into a short set of search-like keywords. AI first, cached,
 * with a template fallback so the create flow never blocks on OpenAI.
 */
class KeywordExpansionService
{
    public function __construct(
        private readonly KeywordNormalizer $normalizer,
        private readonly IndexedKeywordService $indexedKeywords,
    ) {}

    /**
     * @return array{phrase: string, keywords: array<int, string>, source: string}
     */
    public function expand(string $phrase, bool $fresh = false, bool $allowAi = true, string $type = 'brand'): array
    {
        $phrase = $this->normalizer->keyword($phrase);

        if ($phrase === '') {
            return ['phrase' => '', 'keywords' => [], 'source' => 'empty'];
        }

        $cacheKey = 'cks:expand:'.sha1(mb_strtolower($type.'|'.$phrase));
        $ttl = (int) config('custom_keyword_search.expansion.cache_seconds', 86400);
        $cached = Cache::get($cacheKey);

        if (! $fresh && is_array($cached)) {
            return $cached;
        }

        if (! $allowAi || ! $this->canUseAi()) {
            return $this->templatePayload($phrase, $cacheKey, $ttl, $cached, $type);
        }

        $resolver = function () use ($phrase, $type): array {
            $suggestions = $this->fromOpenAi($phrase);
            $source = 'ai';

            if ($suggestions === []) {
                $suggestions = $this->fromTemplates($phrase);
                $source = 'fallback';
            }

            return [
                'phrase' => $phrase,
                'keywords' => $this->mergeWithIndexedSuggestions($phrase, $type, $suggestions),
                'source' => $source,
            ];
        };

        $lockKey = $cacheKey.':lock';
        $lockSeconds = max(1, (int) config('custom_keyword_search.expansion.lock_seconds', 12));
        $hasLock = Cache::add($lockKey, true, $lockSeconds);

        if (! $hasLock) {
            return $this->templatePayload($phrase, $cacheKey, $ttl, $cached, $type);
        }

        try {
            $payload = $resolver();
            Cache::put($cacheKey, $payload, $ttl);

            return $payload;
        } finally {
            Cache::forget($lockKey);
        }
    }

    private function canUseAi(): bool
    {
        return ! blank(config('services.openai.api_key'));
    }

    /**
     * @param  array{phrase: string, keywords: array<int, string>, source: string}|mixed  $cached
     * @return array{phrase: string, keywords: array<int, string>, source: string}
     */
    private function templatePayload(string $phrase, string $cacheKey, int $ttl, mixed $cached = null, string $type = 'brand'): array
    {
        if (is_array($cached)) {
            return $cached;
        }

        $payload = [
            'phrase' => $phrase,
            'keywords' => $this->mergeWithIndexedSuggestions($phrase, $type, $this->fromTemplates($phrase)),
            'source' => 'fallback',
        ];

        Cache::put($cacheKey, $payload, $ttl);

        return $payload;
    }

    /**
     * @return array<int, string>
     */
    private function fromOpenAi(string $phrase): array
    {
        if (! $this->canUseAi()) {
            return [];
        }

        $apiKey = (string) config('services.openai.api_key');

        $wanted = (int) config('custom_keyword_search.expansion.suggestions', 6);
        $candidatePool = max($wanted, (int) config('custom_keyword_search.expansion.candidate_pool', 12));

        try {
            $response = Http::withToken($apiKey)
                ->timeout((int) config('custom_keyword_search.expansion.timeout', 20))
                ->acceptJson()
                ->post(rtrim((string) config('services.openai.base_url'), '/').'/chat/completions', [
                    'model' => config('custom_keyword_search.expansion.model', 'gpt-4.1-mini'),
                    'temperature' => 0.35,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => implode("\n", [
                                'You generate related TikTok search keywords for a saved search builder.',
                                '',
                                'Your job is to extend one niche phrase into close, tightly anchored TikTok search queries users actually type.',
                                '',
                                'Output rules:',
                                '- Return only a raw JSON array of strings',
                                '- No prose, no markdown, no code fences',
                                '- Each keyword must be 1 to 4 words',
                                '- Use lowercase only',
                                '- Keep every keyword tightly specific to the phrase',
                                '- Prefer close variants such as subtypes, product forms, review queries, unboxing queries, buyer-intent searches, audience refinements, and branded variations',
                                '- Stay very near the original phrase and avoid category drift',
                                '- Avoid near-duplicates',
                                '- Avoid hashtag formatting',
                                '- Do not include "#", emojis, numbering, or commentary',
                                '- Do not include the words "json" or "keywords"',
                                '- Exclude broad adjacent topics, generic aesthetics, and loose trend terms',
                                '- Do not repeat the original phrase exactly',
                                '',
                                'Prioritize suggestions like "brand rings", "brand bracelet", "brand review", or "brand unboxing" over broad discovery phrases.',
                            ]),
                        ],
                        [
                            'role' => 'user',
                            'content' => implode("\n", [
                                "Niche phrase: {$phrase}",
                                '',
                                "Generate {$candidatePool} related TikTok search keywords for this niche.",
                                '',
                                'Keep the list tightly anchored to the phrase.',
                                'Good outputs are close variants, product types, review queries, unboxing queries, buyer-intent searches, and audience refinements.',
                                'Bad outputs are broad category terms, generic trends, aesthetics, or neighboring topics.',
                            ]),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Keyword expansion request failed.', [
                    'phrase' => $phrase,
                    'status' => $response->status(),
                ]);

                return [];
            }

            $content = data_get($response->json(), 'choices.0.message.content');
            $decoded = json_decode((string) $content, true);
            $keywords = $this->extractCandidates($decoded);

            if (! is_array($keywords)) {
                return [];
            }

            return $this->rankAndFilterSuggestions($phrase, $keywords, $wanted);
        } catch (Throwable $e) {
            Log::warning('Keyword expansion threw.', ['phrase' => $phrase, 'error' => $e->getMessage()]);

            return [];
        }
    }

    /**
     * No-AI backup. Deliberately boring — it exists so the UI always has
     * something to show, not to compete with the model.
     *
     * @return array<int, string>
     */
    private function fromTemplates(string $phrase): array
    {
        $topic = $this->primaryTopic($phrase);
        $prefix = $this->leadingTokens($phrase);

        return [
            "{$phrase} review",
            "{$phrase} unboxing",
            "{$phrase} for men",
            "{$phrase} {$topic}",
            $prefix !== '' ? "{$prefix} {$topic}s" : "{$phrase} {$topic}",
            $prefix !== '' ? "{$prefix} chain" : "{$phrase} chain",
            $prefix !== '' ? "{$prefix} bracelet" : "{$phrase} bracelet",
        ];
    }

    /**
     * @param  array<int, mixed>  $keywords
     * @return array<int, string>
     */
    private function rankAndFilterSuggestions(string $phrase, array $keywords, int $wanted): array
    {
        $normalizedPhrase = $this->normalizer->keyword($phrase);
        $phraseComparable = $this->normalizer->comparable($phrase);
        $topic = $this->primaryTopic($phrase);
        $anchor = $this->anchorPhrase($phrase);
        $phraseTokens = $this->tokens($phraseComparable);
        $anchorComparable = $this->normalizer->comparable($anchor);
        $anchorTokens = $this->tokens($anchorComparable);
        $topicComparable = $this->normalizer->comparable($topic);
        $minRelevance = (float) config('custom_keyword_search.expansion.min_relevance', 0.55);

        $ranked = [];

        foreach ($keywords as $candidate) {
            $term = is_array($candidate)
                ? $this->normalizer->keyword((string) data_get($candidate, 'term'))
                : $this->normalizer->keyword(is_string($candidate) ? $candidate : '');

            if ($term === '' || mb_strtolower($term) === mb_strtolower($normalizedPhrase)) {
                continue;
            }

            $modelRelevance = is_array($candidate) ? (float) data_get($candidate, 'relevance', 0) : 0.5;
            $comparable = $this->normalizer->comparable($term);
            $tokens = $this->tokens($comparable);

            if ($tokens === []) {
                continue;
            }

            $containsAnchor = $anchorComparable !== '' && str_contains($comparable, $anchorComparable);
            $anchorOverlap = $anchorTokens !== [] ? $this->overlapRatio($tokens, $anchorTokens) : 0.0;
            $tokenOverlap = $this->overlapRatio($tokens, $phraseTokens);
            $containsTopic = $topicComparable !== '' && str_contains($comparable, $topicComparable);
            $topicOverlap = $topicComparable !== '' ? $this->overlapRatio($tokens, $this->tokens($topicComparable)) : 0.0;

            if ($anchorTokens !== [] && ! $containsAnchor && $anchorOverlap === 0.0) {
                continue;
            }

            $score = ($modelRelevance * 0.55) + ($anchorOverlap * 0.3) + ($tokenOverlap * 0.1) + ($topicOverlap * 0.05);

            if ($containsAnchor) {
                $score += 0.25;
            }

            if ($containsTopic) {
                $score += 0.05;
            }

            if ($score < $minRelevance) {
                continue;
            }

            $ranked[] = [
                'term' => $term,
                'score' => $score,
            ];
        }

        usort($ranked, fn (array $a, array $b): int => $b['score'] <=> $a['score']);

        return array_values(array_slice(array_map(
            fn (array $item): string => $item['term'],
            $ranked
        ), 0, $wanted));
    }

    /**
     * Supports the current raw-string-array contract and the older wrapped
     * object shape so prompt changes do not break cached or in-flight calls.
     *
     * @return array<int, mixed>|null
     */
    private function extractCandidates(mixed $decoded): ?array
    {
        if (is_array($decoded) && array_is_list($decoded)) {
            return $decoded;
        }

        $keywords = data_get($decoded, 'keywords');

        return is_array($keywords) ? $keywords : null;
    }

    private function primaryTopic(string $phrase): string
    {
        $tokens = $this->tokens($this->normalizer->comparable($phrase));

        return $tokens === [] ? '' : end($tokens);
    }

    private function leadingTokens(string $phrase): string
    {
        $tokens = $this->tokens($this->normalizer->comparable($phrase));

        if (count($tokens) <= 1) {
            return $tokens[0] ?? '';
        }

        array_pop($tokens);

        return implode(' ', $tokens);
    }

    private function anchorPhrase(string $phrase): string
    {
        $prefix = $this->leadingTokens($phrase);

        return $prefix !== '' ? $prefix : $phrase;
    }

    /**
     * @return array<int, string>
     */
    private function tokens(string $value): array
    {
        return array_values(array_filter(explode(' ', $value), fn (string $token): bool => $token !== ''));
    }

    /**
     * @param  array<int, string>  $a
     * @param  array<int, string>  $b
     */
    private function overlapRatio(array $a, array $b): float
    {
        if ($a === [] || $b === []) {
            return 0.0;
        }

        $matches = array_intersect($a, $b);

        return count($matches) / max(1, min(count($a), count($b)));
    }

    /**
     * @param  array<int, string>  $suggestions
     * @return array<int, string>
     */
    private function mergeWithIndexedSuggestions(string $phrase, string $type, array $suggestions): array
    {
        $indexed = $this->indexedKeywords->relatedTerms($type, $phrase, 6);

        return $this->normalizer->keywordSet($phrase, array_merge($indexed, $suggestions));
    }
}
