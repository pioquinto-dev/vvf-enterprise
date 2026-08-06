<?php

namespace App\Services\CustomKeywordSearch;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * A saved search is a phrase, not an account - nothing in the schema says
 * which TikTok account a brand tracker is actually about. This infers it from
 * the matched result accounts, using OpenAI first and a deterministic fallback
 * if the model is unavailable or unconvinced.
 */
class BrandAccountResolver
{
    /** Below this share of matched posts, the guess is not worth asserting. */
    private const MIN_CONFIDENCE = 0.15;

    private const AI_CONFIDENCE_THRESHOLD = 0.6;

    /**
     * @param  array<int, array<string, mixed>>  $results  presented card rows
     * @return array<string, mixed>|null
     */
    public function resolve(array $results, ?string $phrase = null): ?array
    {
        $accounts = $this->aggregateAccounts($results);

        if ($accounts === []) {
            return null;
        }

        $ranked = array_values($accounts);

        usort($ranked, fn (array $a, array $b): int => [$b['posts'], $b['views']] <=> [$a['posts'], $a['views']]);

        if (! blank($phrase)) {
            $aiChoice = $this->chooseWithOpenAi((string) $phrase, $ranked);

            if ($aiChoice !== null) {
                return $aiChoice;
            }
        }

        return $this->fallbackChoice($ranked[0], count($results), count($ranked));
    }

    /**
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, array<string, mixed>>
     */
    private function aggregateAccounts(array $results): array
    {
        $accounts = [];

        foreach ($results as $row) {
            $handle = trim((string) ($row['handle'] ?? ''));

            if ($handle === '') {
                continue;
            }

            $key = mb_strtolower($handle);

            $accounts[$key] ??= [
                'handle' => $handle,
                'name' => $row['creator_name'] ?? null,
                'avatar' => $row['avatar'] ?? null,
                'posts' => 0,
                'views' => 0,
                'followers' => 0,
            ];

            $accounts[$key]['posts']++;
            $accounts[$key]['views'] += (int) ($row['views'] ?? 0);
            $accounts[$key]['followers'] = max($accounts[$key]['followers'], (int) ($row['followers'] ?? 0));

            if (($accounts[$key]['avatar'] ?? null) === null && ! blank($row['avatar'] ?? null)) {
                $accounts[$key]['avatar'] = $row['avatar'];
            }
        }

        return $accounts;
    }

    /**
     * Picks a candidate using the cached model decision, then re-hydrates it
     * from the *current* candidate list. The cache holds only the choice — a
     * handle and a confidence — never the account's stats, so a cached decision
     * cannot serve last week's avatar or follower count.
     *
     * @param  array<int, array<string, mixed>>  $ranked
     * @return array<string, mixed>|null
     */
    private function chooseWithOpenAi(string $phrase, array $ranked): ?array
    {
        if (blank(config('services.openai.api_key'))) {
            return null;
        }

        $decision = $this->cachedDecision($phrase, $ranked);

        if ($decision === null || blank($decision['handle'] ?? null)) {
            return null;
        }

        if ((float) ($decision['confidence'] ?? 0) < self::AI_CONFIDENCE_THRESHOLD) {
            return null;
        }

        $selected = collect($ranked)->first(
            fn (array $account): bool => mb_strtolower($account['handle']) === mb_strtolower((string) $decision['handle'])
        );

        if (! is_array($selected)) {
            return null;
        }

        return [
            'handle' => $selected['handle'],
            'name' => $selected['name'],
            'avatar' => $selected['avatar'],
            'followers' => $selected['followers'] > 0 ? $selected['followers'] : null,
            'posts_in_search' => $selected['posts'],
            'confidence' => round((float) $decision['confidence'], 4),
            'is_confident' => true,
            'distinct_accounts' => count($ranked),
            'source' => 'ai',
        ];
    }

    /**
     * The detail page resolves the account on every render and on every poll of
     * the results endpoint. Without this cache that is a paid OpenAI call per
     * page view, so the decision is memoised against the phrase and the exact
     * candidate set — a new run that surfaces different accounts changes the
     * key and re-asks the model.
     *
     * A model reply is cached even when it declines to pick ("handle": null),
     * because a decline is a real answer. A transport failure is not cached, so
     * one network blip cannot suppress account detection for a week.
     *
     * @param  array<int, array<string, mixed>>  $ranked
     * @return array{handle: string|null, confidence: float}|null
     */
    private function cachedDecision(string $phrase, array $ranked): ?array
    {
        // Sorted, so the key describes *which* accounts are in play rather than
        // what order they happened to rank in. Two accounts swapping places on
        // a refresh does not change who the brand is, and should not buy
        // another call.
        $handles = array_map(
            fn (array $account): string => mb_strtolower((string) $account['handle']),
            $ranked,
        );

        sort($handles);

        $key = 'cks:brand-account:'.sha1(mb_strtolower(trim($phrase)).'|'.implode(',', $handles));
        $cached = Cache::get($key);

        if (is_array($cached)) {
            return $cached;
        }

        $decision = $this->requestDecision($phrase, $ranked);

        if ($decision === null) {
            return null;
        }

        Cache::put($key, $decision, (int) config('custom_keyword_search.analysis.account_cache_seconds', 604800));

        return $decision;
    }

    /**
     * @param  array<int, array<string, mixed>>  $ranked
     * @return array{handle: string|null, confidence: float}|null  null when the
     *                                                             call itself failed
     */
    private function requestDecision(string $phrase, array $ranked): ?array
    {
        try {
            $response = Http::withToken((string) config('services.openai.api_key'))
                ->timeout((int) config('custom_keyword_search.analysis.timeout', 45))
                ->acceptJson()
                ->post(rtrim((string) config('services.openai.base_url'), '/').'/chat/completions', [
                    'model' => config('custom_keyword_search.analysis.model', 'gpt-4.1-mini'),
                    'temperature' => 0.1,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => implode("\n", [
                                'You identify the most likely official TikTok account for a brand search.',
                                '',
                                'You will receive a brand keyword and a list of candidate TikTok accounts already seen in search results.',
                                'Choose only from the provided candidates.',
                                '',
                                'Return one raw JSON object with exactly these keys:',
                                '- handle: string or null',
                                '- confidence: number from 0 to 1',
                                '',
                                'Rules:',
                                '- Prefer the official brand account over creators, affiliates, resellers, and fan accounts',
                                '- Use brand name similarity in the handle or display name as the strongest signal',
                                '- Follower count and post count are supporting signals, not the main rule',
                                '- If no candidate looks like the official brand account, return handle as null',
                                '- No prose, no markdown, no code fences',
                            ]),
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'keyword' => $phrase,
                                'candidates' => array_map(fn (array $account): array => [
                                    'handle' => $account['handle'],
                                    'name' => $account['name'],
                                    'followers' => $account['followers'],
                                    'posts_in_results' => $account['posts'],
                                    'views_in_results' => $account['views'],
                                ], $ranked),
                            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                Log::warning('Brand account resolver request failed.', [
                    'phrase' => $phrase,
                    'status' => $response->status(),
                ]);

                return null;
            }

            $choice = json_decode((string) data_get($response->json(), 'choices.0.message.content'), true);

            // An unreadable body is still a completed call. Return it as a
            // decline rather than null so it gets cached — a model that
            // reliably answers with garbage must not be re-asked on every
            // render of the page.
            if (! is_array($choice)) {
                return ['handle' => null, 'confidence' => 0.0];
            }

            $handle = trim((string) ($choice['handle'] ?? ''));

            return [
                'handle' => $handle === '' ? null : $handle,
                'confidence' => max(0.0, min(1.0, (float) ($choice['confidence'] ?? 0))),
            ];
        } catch (Throwable $e) {
            Log::warning('Brand account resolver threw.', [
                'phrase' => $phrase,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * @param  array<string, mixed>  $top
     * @return array<string, mixed>
     */
    private function fallbackChoice(array $top, int $resultCount, int $distinctAccounts): array
    {
        $confidence = round($top['posts'] / max(1, $resultCount), 4);

        return [
            'handle' => $top['handle'],
            'name' => $top['name'],
            'avatar' => $top['avatar'],
            'followers' => $top['followers'] > 0 ? $top['followers'] : null,
            'posts_in_search' => $top['posts'],
            'confidence' => $confidence,
            'is_confident' => $confidence >= self::MIN_CONFIDENCE,
            'distinct_accounts' => $distinctAccounts,
            'source' => 'detected',
        ];
    }

    /**
     * The account's own median views across the videos we have for it. This is
     * a *partial* baseline: it only sees posts that matched the search phrase,
     * not the account's full timeline, so it skews high. A true baseline needs
     * the profile actor.
     *
     * @param  array<int, array<string, mixed>>  $results
     */
    public function medianViewsForHandle(array $results, string $handle): int
    {
        $needle = mb_strtolower(trim($handle));

        $views = [];

        foreach ($results as $row) {
            if (mb_strtolower(trim((string) ($row['handle'] ?? ''))) !== $needle) {
                continue;
            }

            $value = (int) ($row['views'] ?? 0);

            if ($value > 0) {
                $views[] = $value;
            }
        }

        if ($views === []) {
            return 0;
        }

        sort($views);
        $middle = intdiv(count($views), 2);

        return count($views) % 2 === 1
            ? $views[$middle]
            : (int) round(($views[$middle - 1] + $views[$middle]) / 2);
    }
}
