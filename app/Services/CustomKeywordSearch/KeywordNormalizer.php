<?php

namespace App\Services\CustomKeywordSearch;

/**
 * Normalization is shared by validation, dedupe signatures and the matcher, so
 * everything downstream agrees on what "the same keyword" means.
 */
class KeywordNormalizer
{
    public function keyword(?string $value): string
    {
        $value = (string) $value;
        $value = preg_replace('/\s+/u', ' ', $value) ?? $value;

        return trim($value);
    }

    /**
     * Combines phrase + keywords, trims, dedupes case-insensitively, and caps
     * the list. The phrase always lands first so it stays the primary signal.
     *
     * @param  array<int, string>  $keywords
     * @return array<int, string>
     */
    public function keywordSet(?string $phrase, array $keywords = []): array
    {
        $maxLength = (int) config('custom_keyword_search.limits.max_phrase_length', 120);
        $maxKeywords = (int) config('custom_keyword_search.limits.max_keywords', 12);

        $combined = array_merge([$phrase], $keywords);
        $normalized = [];
        $seen = [];

        foreach ($combined as $candidate) {
            $clean = mb_substr($this->keyword($candidate), 0, $maxLength);

            if ($clean === '') {
                continue;
            }

            $key = mb_strtolower($clean);

            if (isset($seen[$key])) {
                continue;
            }

            $seen[$key] = true;
            $normalized[] = $clean;

            if (count($normalized) >= $maxKeywords) {
                break;
            }
        }

        return $normalized;
    }

    public function name(?string $name, string $fallback): string
    {
        $maxLength = (int) config('custom_keyword_search.limits.max_name_length', 80);
        $clean = $this->keyword($name);

        return mb_substr($clean !== '' ? $clean : $fallback, 0, $maxLength);
    }

    /**
     * Two searches with the same keywords in a different order are the same
     * search, so the signature sorts before joining.
     *
     * @param  array<int, string>  $keywords
     */
    public function signature(array $keywords): string
    {
        $lowered = array_map(fn (string $k): string => mb_strtolower($this->keyword($k)), $keywords);
        $lowered = array_values(array_unique(array_filter($lowered, fn (string $k): bool => $k !== '')));
        sort($lowered, SORT_STRING);

        return mb_substr(implode("\n", $lowered), 0, 191);
    }

    /**
     * Comparison form for matching: lowercase, accents stripped where possible,
     * punctuation flattened to single spaces.
     */
    public function comparable(?string $value): string
    {
        $value = mb_strtolower((string) $value);

        if (function_exists('transliterator_transliterate')) {
            $value = transliterator_transliterate('Any-Latin; Latin-ASCII', $value) ?: $value;
        }

        $value = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $value) ?? $value;

        return trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
    }

    /** Same as comparable() but with spaces removed, for hashtag-style matches. */
    public function compact(?string $value): string
    {
        return str_replace(' ', '', $this->comparable($value));
    }
}
