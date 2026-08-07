<?php

namespace App\Services\CustomKeywordSearch;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * A saved search is a phrase, not an account - nothing in the schema says
 * which TikTok account a brand tracker is actually about. Ask OpenAI for the
 * official handle directly from the brand phrase, and hide the account UI when
 * that lookup is unavailable or uncertain.
 */
class BrandAccountResolver
{
    private const AI_CONFIDENCE_THRESHOLD = 0.6;

    /**
     * @param  array<int, array<string, mixed>>  $results  presented card rows
     * @return array<string, mixed>|null
     */
    public function resolve(array $results, ?string $phrase = null): ?array
    {
        if (blank($phrase)) {
            return null;
        }

        return $this->chooseWithOpenAi((string) $phrase, $results);
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
     * Asks OpenAI for the handle from the brand phrase, then re-hydrates from
     * the current result rows when that handle already appears in the search.
     * The cache holds only the handle + confidence decision, never the account
     * stats, so a cached choice cannot serve stale avatar or follower values.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, mixed>|null
     */
    private function chooseWithOpenAi(string $phrase, array $results): ?array
    {
        if (blank(config('services.openai.api_key'))) {
            return null;
        }

        $decision = $this->cachedDecision($phrase);

        if ($decision === null || blank($decision['handle'] ?? null)) {
            return null;
        }

        if ((float) ($decision['confidence'] ?? 0) < self::AI_CONFIDENCE_THRESHOLD) {
            return null;
        }

        $accounts = $this->aggregateAccounts($results);
        $selected = $accounts[mb_strtolower((string) $decision['handle'])] ?? null;

        return [
            'handle' => $selected['handle'] ?? (string) $decision['handle'],
            'name' => $selected['name'] ?? null,
            'avatar' => $selected['avatar'] ?? null,
            'followers' => isset($selected['followers']) && $selected['followers'] > 0 ? $selected['followers'] : null,
            'posts_in_search' => $selected['posts'] ?? 0,
            'confidence' => round((float) $decision['confidence'], 4),
            'is_confident' => true,
            'distinct_accounts' => count($accounts),
            'source' => 'ai',
        ];
    }

    /**
     * The detail page resolves the account on every render and on every poll of
     * the results endpoint. Without this cache that is a paid OpenAI call per
     * page view, so the decision is memoised against the brand phrase alone.
     *
     * A model reply is cached even when it declines to pick ("handle": null),
     * because a decline is a real answer. A transport failure is not cached, so
     * one network blip cannot suppress account detection for a week.
     *
     * @return array{handle: string|null, confidence: float}|null
     */
    private function cachedDecision(string $phrase): ?array
    {
        $key = 'cks:brand-account:'.sha1(mb_strtolower(trim($phrase)));
        $cached = Cache::get($key);

        if (is_array($cached)) {
            return $cached;
        }

        $decision = $this->requestDecision($phrase);

        if ($decision === null) {
            return null;
        }

        Cache::put($key, $decision, (int) config('custom_keyword_search.analysis.account_cache_seconds', 604800));

        return $decision;
    }

    /**
     * @return array{handle: string|null, confidence: float}|null  null when the
     *                                                             call itself failed
     */
    private function requestDecision(string $phrase): ?array
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
                                'You identify the official TikTok handle for a brand.',
                                '',
                                'You will receive only the brand name or search phrase.',
                                'Return the official TikTok handle if you know it with high confidence.',
                                '',
                                'Return one raw JSON object with exactly these keys:',
                                '- handle: string or null',
                                '- confidence: number from 0 to 1',
                                '',
                                'Rules:',
                                '- Return the official brand account, not a creator, affiliate, reseller, or fan account',
                                '- If you are not confident, return handle as null',
                                '- Include the leading @ when returning a handle',
                                '- No prose, no markdown, no code fences',
                            ]),
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'brand' => $phrase,
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
     * The account's own median views across the videos we have for it. This is
     * a partial baseline: it only sees posts that matched the search phrase,
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
