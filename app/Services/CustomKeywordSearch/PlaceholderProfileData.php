<?php

namespace App\Services\CustomKeywordSearch;

/**
 * ============================ FAKE DATA — DELETE ME ==========================
 *
 * Every invented number on the brand and competitor detail pages comes from
 * this class and nowhere else. Grep for `PlaceholderProfileData` to find every
 * screen currently showing something that is not real.
 *
 * These fields all need a TikTok profile/timeline Apify actor, which is not
 * configured yet — the app only has the keyword-search task. Once that actor
 * exists:
 *
 *   1. Write a real resolver that scrapes the handle's profile and timeline.
 *   2. Delete this class.
 *   3. The `placeholders` manifest in SearchInsights empties itself, and the
 *      badges disappear from the UI automatically.
 *
 * Values are seeded from the handle so they stay identical across reloads. A
 * placeholder that changes every refresh reads as a bug rather than as a stub.
 *
 * =============================================================================
 */
class PlaceholderProfileData
{
    /**
     * Section keys fed by this class. SearchInsights publishes this list to the
     * frontend, which badges the matching sections.
     */
    public const SECTIONS = [
        'account_profile',
        'account_baseline',
        'follower_trend',
    ];

    private const CATEGORIES = [
        'clean skincare',
        'beauty and personal care',
        'home and lifestyle',
        'health and wellness',
        'fashion and apparel',
        'food and beverage',
    ];

    /**
     * @return array<string, mixed>
     */
    public function forHandle(?string $handle, int $knownFollowers = 0): array
    {
        $seed = crc32(mb_strtolower(trim((string) $handle)));

        // Anchor the fake account baseline to something the real data implies,
        // so the number at least sits in a believable range for this account.
        $followers = $knownFollowers > 0 ? $knownFollowers : 12_000 + $this->pick($seed, 1, 0, 480_000);

        return [
            'is_placeholder' => true,
            'category' => self::CATEGORIES[$seed % count(self::CATEGORIES)],
            'verified' => $this->pick($seed, 2, 0, 100) > 55,
            'follower_growth_pct' => round($this->pick($seed, 3, -30, 90) / 10, 1),
            'account_posts_30d' => $this->pick($seed, 4, 8, 46),
            // A full-timeline median sits well below a keyword-matched median,
            // since most of an account's posts never break out.
            'account_median_views' => max(1_000, (int) round($followers * ($this->pick($seed, 5, 4, 22) / 100))),
        ];
    }

    /**
     * Deterministic value in [$min, $max] for a given seed and field index.
     */
    private function pick(int $seed, int $field, int $min, int $max): int
    {
        $span = $max - $min + 1;

        if ($span <= 0) {
            return $min;
        }

        return $min + (int) (abs(crc32($seed.':'.$field)) % $span);
    }
}
