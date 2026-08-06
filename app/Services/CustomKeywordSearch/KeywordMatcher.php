<?php

namespace App\Services\CustomKeywordSearch;

use Carbon\CarbonImmutable;

/**
 * The precision half of the pipeline. The scrape is deliberately broad — this
 * is what decides which of those items actually belong to the saved search,
 * and in what order.
 */
class KeywordMatcher
{
    private const GENERIC_SECONDARY_TOKENS = [
        'and', 'beauty', 'brand', 'care', 'clothing', 'co', 'company', 'cosmetics',
        'fashion', 'for', 'hair', 'jewelry', 'life', 'makeup', 'official', 'shop',
        'skincare', 'store', 'style', 'the', 'wear', 'with',
    ];

    private const LANGUAGE_PATHS = [
        'raw_payload.language',
        'raw_payload.lang',
        'raw_payload.locale',
        'language',
        'lang',
        'locale',
    ];

    private const US_REGION_PATHS = [
        'raw_payload.region',
        'raw_payload.country',
        'raw_payload.countryCode',
        'raw_payload.createRegion',
        'raw_payload.market',
        'raw_payload.author.region',
        'raw_payload.authorMeta.region',
        'raw_payload.channel.region',
        'region',
        'country',
        'countryCode',
        'createRegion',
        'market',
    ];

    private const TIKTOK_JARGON_WHITELIST = [
        'asmr', 'capcut', 'duet', 'foryou', 'foryoupage', 'fyp', 'fy',
        'getreadywithme', 'grwm', 'mukbang', 'pov', 'stitch', 'storytime', 'tiktok', 'tt', 'viral',
    ];

    private const AMBIGUOUS_SINGLE_WORD_SIGNALS = [
        'to', 'we', 'no', 'on', 'mi', 'si', 'la', 'de', 'na', 'ya', 'ja', 'da',
    ];

    private const NON_ENGLISH_WORD_SIGNALS = [
        'ademas', 'agar', 'ahora', 'alors', 'ama', 'anak', 'aqui', 'avec', 'avoir', 'bagi',
        'bagus', 'banyak', 'baru', 'basta', 'bien', 'bonjour', 'bueno', 'casa', 'cepat', 'como',
        'con', 'cosa', 'dalam', 'dari', 'das', 'dengan', 'desa', 'despues', 'donde', 'ekstra',
        'eller', 'este', 'esto', 'etait', 'ganda', 'gratis', 'gusto', 'haba', 'hallo', 'harga',
        'hasta', 'hindi', 'hola', 'ini', 'itu', 'jadi', 'je', 'kamu', 'kami', 'karena',
        'kasi', 'kaya', 'kerana', 'lagi', 'lebih', 'mais', 'makan', 'mana', 'merci', 'muito',
        'nama', 'ngayon', 'nous', 'ola', 'para', 'pero', 'por', 'porque', 'pues', 'saja',
        'sangat', 'saya', 'selamat', 'semua', 'sudah', 'tak', 'tambien', 'terima', 'tout', 'uma',
        'untuk', 'vous', 'yang',
    ];

    public function __construct(private readonly KeywordNormalizer $normalizer) {}

    /**
     * Drops items that are unusable or off-topic.
     *
     * @param  array<int, array<string, mixed>>  $items  mapped items
     * @param  array<int, string>  $keywords
     * @return array{kept: array<int, array<string, mixed>>, summary: array<string, int>}
     */
    public function prescreen(array $items, string $phrase, array $keywords): array
    {
        $minFollowers = (int) config('custom_keyword_search.matching.min_followers', 500);

        $kept = [];
        $summary = [
            'received' => count($items),
            'invalid_item' => 0,
            'broken_media' => 0,
            'below_min_followers' => 0,
            'non_english_title_confidence' => 0,
            'main_keyword_mismatch' => 0,
            'kept' => 0,
        ];

        foreach ($items as $item) {
            if (! is_array($item)) {
                $summary['invalid_item']++;

                continue;
            }

            if (! $this->hasUsableMedia($item)) {
                $summary['broken_media']++;

                continue;
            }

            if ((int) ($item['followers'] ?? 0) < $minFollowers) {
                $summary['below_min_followers']++;

                continue;
            }

            if (! $this->passesEnglishTitleConfidence($item)) {
                $summary['non_english_title_confidence']++;

                continue;
            }

            if (! $this->matchesPhrase($item, $phrase)) {
                $summary['main_keyword_mismatch']++;

                continue;
            }

            $item['matched_keywords'] = $this->matchedSupporting($item, $phrase, $keywords);
            $item['virality_score'] = $this->score($item, count($item['matched_keywords']));

            $kept[] = $item;
            $summary['kept']++;
        }

        return ['kept' => $kept, 'summary' => $summary];
    }

    /**
     * The primary phrase is required. It may appear in the caption or in a
     * hashtag, and multi-word phrases also match their compacted form so
     * "korean skincare" catches #koreanskincare.
     *
     * @param  array<string, mixed>  $item
     */
    public function matchesPhrase(array $item, string $phrase): bool
    {
        $needle = $this->normalizer->comparable($phrase);

        if ($needle === '') {
            return true;
        }

        $haystack = $this->normalizer->comparable($item['title'] ?? '');
        $compactNeedle = str_replace(' ', '', $needle);

        if ($this->containsWholePhrase($haystack, $needle)) {
            return true;
        }

        foreach ((array) ($item['hashtags'] ?? []) as $tag) {
            $tagComparable = $this->normalizer->comparable($tag);
            $tagCompact = $this->normalizer->compact($tag);

            if ($this->containsWholePhrase($tagComparable, $needle)) {
                return true;
            }

            if ($this->isCompactPhraseMatchAllowed($needle)
                && $tagCompact !== ''
                && str_contains($tagCompact, $compactNeedle)) {
                return true;
            }
        }

        $primaryToken = $this->primaryPhraseToken($phrase);

        if ($primaryToken === null) {
            return false;
        }

        if ($this->containsWholeWord($haystack, $primaryToken)) {
            return true;
        }

        foreach ((array) ($item['hashtags'] ?? []) as $tag) {
            if ($this->containsWholeWord($this->normalizer->comparable($tag), $primaryToken)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Supporting keywords never gate an item — they only add score, which is
     * what keeps result counts healthy on narrow niches.
     *
     * @param  array<string, mixed>  $item
     * @param  array<int, string>  $keywords
     * @return array<int, string>
     */
    public function matchedSupporting(array $item, string $phrase, array $keywords): array
    {
        $haystack = $this->normalizer->comparable($item['title'] ?? '');
        $compact = $this->normalizer->compact($item['title'] ?? '');

        foreach ((array) ($item['hashtags'] ?? []) as $tag) {
            $compact .= ' '.$this->normalizer->compact($tag);
        }

        $phraseKey = mb_strtolower($this->normalizer->keyword($phrase));
        $matched = [];

        foreach ($keywords as $keyword) {
            if (mb_strtolower($this->normalizer->keyword($keyword)) === $phraseKey) {
                continue;
            }

            $needle = $this->normalizer->comparable($keyword);

            if ($needle === '') {
                continue;
            }

            $compactNeedle = str_replace(' ', '', $needle);

            if (str_contains($haystack, $needle) || ($compactNeedle !== '' && str_contains($compact, $compactNeedle))) {
                $matched[] = $keyword;
            }
        }

        return $matched;
    }

    /**
     * Engagement per follower, so a 12k-follower account with a 3M-view video
     * outranks a 500k-follower account posting to its own audience. Recency and
     * keyword overlap are small nudges on top.
     *
     * @param  array<string, mixed>  $item
     */
    public function score(array $item, int $matchedKeywordCount = 0): float
    {
        $weights = (array) config('custom_keyword_search.matching.weights', []);
        $floor = max(1, (int) config('custom_keyword_search.matching.virality_follower_floor', 1000));

        $followers = max((int) ($item['followers'] ?? 0), $floor);

        $engagement =
            ((float) ($weights['views'] ?? 1.0)) * (int) ($item['views'] ?? 0)
            + ((float) ($weights['likes'] ?? 3.0)) * (int) ($item['likes'] ?? 0)
            + ((float) ($weights['comments'] ?? 8.0)) * (int) ($item['comments'] ?? 0);

        $score = $engagement / $followers;

        $score += $matchedKeywordCount * (float) config('custom_keyword_search.matching.supporting_keyword_bonus', 0.05);
        $score += $this->recencyBonus($item['uploaded_at'] ?? null);

        return round($score, 6);
    }

    private function recencyBonus(mixed $uploadedAt): float
    {
        if (! $uploadedAt instanceof CarbonImmutable) {
            return 0.0;
        }

        $window = max(1, (int) config('custom_keyword_search.matching.recency_window_days', 90));
        $bonus = (float) config('custom_keyword_search.matching.recency_bonus', 0.25);

        $ageDays = $uploadedAt->diffInDays(CarbonImmutable::now());

        if ($ageDays >= $window) {
            return 0.0;
        }

        return $bonus * (1 - ($ageDays / $window));
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function hasUsableMedia(array $item): bool
    {
        $hasPreview = ! blank($item['thumbnail_url'] ?? null) || ! blank($item['cover'] ?? null);

        if (! $hasPreview) {
            return false;
        }

        $platform = mb_strtolower((string) ($item['platform'] ?? ''));

        return match ($platform) {
            'instagram' => ! blank($item['video_url'] ?? null),
            'youtube' => ! blank($item['embed_url'] ?? null) || ! blank($item['post_url'] ?? null),
            'tiktok' => ! blank($item['embed_url'] ?? null) || ! blank($item['video_id'] ?? null) || ! blank($item['post_url'] ?? null),
            default => ! blank($item['embed_url'] ?? null) || ! blank($item['video_url'] ?? null) || ! blank($item['post_url'] ?? null),
        };
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function passesEnglishTitleConfidence(array $item): bool
    {
        return $this->titleEnglishConfidenceRejectReason($item) === null;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function titleEnglishConfidenceRejectReason(array $item): ?string
    {
        $languageSignal = $this->stringAtPaths($item, self::LANGUAGE_PATHS);

        if ($languageSignal !== null && ! str_contains(mb_strtolower($languageSignal), 'en')) {
            return 'non_english_language';
        }

        $normalized = $this->normalizeTitleForEnglishCheck((string) ($item['title'] ?? ''));

        if ($normalized === '') {
            return $this->hasExplicitUsRegion($item) ? null : 'empty_title_after_cleanup';
        }

        if (preg_match('/^[A-Za-z\s]+$/', $normalized) !== 1) {
            return 'non_english_title';
        }

        if ($this->containsCommonNonEnglishWords($normalized, 1)) {
            return 'non_english_words';
        }

        $wordCount = count($this->tokens(mb_strtolower($normalized)));
        $hashtagCount = count((array) ($item['hashtags'] ?? []));

        if ($wordCount >= 2 || $hashtagCount >= 2) {
            return null;
        }

        return 'insufficient_title_content';
    }

    private function containsWholePhrase(string $haystack, string $needle): bool
    {
        if ($haystack === '' || $needle === '') {
            return false;
        }

        return preg_match('/(?:^|\s)'.preg_quote($needle, '/').'(?:$|\s)/u', $haystack) === 1;
    }

    private function containsWholeWord(string $haystack, string $needle): bool
    {
        if ($haystack === '' || $needle === '') {
            return false;
        }

        return preg_match('/(?:^|\s)'.preg_quote($needle, '/').'(?:$|\s)/u', $haystack) === 1;
    }

    private function isCompactPhraseMatchAllowed(string $needle): bool
    {
        return count($this->tokens($needle)) > 1;
    }

    private function primaryPhraseToken(string $phrase): ?string
    {
        foreach ($this->tokens($this->normalizer->comparable($phrase)) as $token) {
            if (! in_array($token, self::GENERIC_SECONDARY_TOKENS, true) && mb_strlen($token) >= 3) {
                return $token;
            }
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function tokens(string $value): array
    {
        return array_values(array_filter(explode(' ', $value), fn (string $token): bool => $token !== ''));
    }

    private function normalizeTitleForEnglishCheck(string $title): string
    {
        $title = preg_replace('#https?://\S+#iu', ' ', $title) ?? $title;
        $title = preg_replace('/#([\p{L}\p{N}_]+)/u', ' ', $title) ?? $title;
        $title = preg_replace('/\d+/u', ' ', $title) ?? $title;
        $title = preg_replace('/[^\p{L}\s]+/u', ' ', $title) ?? $title;
        $title = preg_replace('/\s+/u', ' ', $title) ?? $title;

        return trim($title);
    }

    private function containsCommonNonEnglishWords(string $normalizedTitle, int $threshold): bool
    {
        $tokens = $this->tokens(mb_strtolower($normalizedTitle));
        $signals = 0;

        foreach ($tokens as $token) {
            if (in_array($token, self::TIKTOK_JARGON_WHITELIST, true)) {
                continue;
            }

            if (in_array($token, self::NON_ENGLISH_WORD_SIGNALS, true)) {
                $signals++;
            }
        }

        if ($threshold === 1 && $signals === 1) {
            $matched = array_values(array_intersect($tokens, self::NON_ENGLISH_WORD_SIGNALS));

            if (count($matched) === 1 && in_array($matched[0], self::AMBIGUOUS_SINGLE_WORD_SIGNALS, true)) {
                return false;
            }
        }

        return $signals >= $threshold;
    }

    /**
     * @param  array<string, mixed>  $item
     * @param  array<int, string>  $paths
     */
    private function stringAtPaths(array $item, array $paths): ?string
    {
        foreach ($paths as $path) {
            $value = data_get($item, $path);

            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function hasExplicitUsRegion(array $item): bool
    {
        foreach (self::US_REGION_PATHS as $path) {
            $value = data_get($item, $path);

            if (! is_string($value) || trim($value) === '') {
                continue;
            }

            $normalized = mb_strtolower(trim($value));

            if (in_array($normalized, ['us', 'usa', 'united states', 'united states of america'], true)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Deterministic ordering: score, then views, then recency, then id as a
     * stable tiebreaker so repeat runs do not shuffle equal rows.
     *
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, array<string, mixed>>
     */
    public function rank(array $items): array
    {
        usort($items, function (array $a, array $b): int {
            return [
                $b['virality_score'] ?? 0,
                $b['views'] ?? 0,
                ($b['uploaded_at'] ?? null)?->getTimestamp() ?? 0,
                (string) ($a['video_id'] ?? ''),
            ] <=> [
                $a['virality_score'] ?? 0,
                $a['views'] ?? 0,
                ($a['uploaded_at'] ?? null)?->getTimestamp() ?? 0,
                (string) ($b['video_id'] ?? ''),
            ];
        });

        return $items;
    }
}
