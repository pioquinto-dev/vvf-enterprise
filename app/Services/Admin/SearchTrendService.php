<?php

namespace App\Services\Admin;

use App\Models\CustomKeywordSearch;
use Illuminate\Support\Collection;

/**
 * "Search Trend" — which subjects people actually run searches for, ranked by
 * how often they are searched.
 *
 * The hard part is that one brand is rarely typed one way. "rhode", "rhode
 * skin" and "rhode beauty" are the same company, and counting them as three
 * entries buries the signal. So phrases are clustered before they are counted.
 *
 * The clustering is deliberately conservative — a false merge invents a trend
 * that is not there, which is worse than an under-merge an admin can see and
 * reason about:
 *
 *  - Only BRAND searches cluster. Product phrases ("led face mask", "led
 *    lamp") share leading words without being the same thing, so they are
 *    counted by their exact normalized phrase.
 *  - A lead word only anchors a cluster when it is corroborated: at least two
 *    distinct phrases start with it. A lone "drunk elephant" is never
 *    shortened to "drunk".
 *  - The label is the longest token prefix every member shares, not the lead
 *    word alone, so {"jones road", "jones road beauty"} reports as "jones
 *    road" rather than "jones".
 *  - Generic openers can never anchor a cluster.
 *
 * Every row carries the variants it absorbed so an admin can audit a merge
 * instead of trusting it.
 */
class SearchTrendService
{
    /** Rows returned to the dashboard card. */
    private const LIMIT = 8;

    /** Variant chips shown per row. */
    private const VARIANT_LIMIT = 4;

    /**
     * Words too generic to identify a brand. A phrase starting with one of
     * these is counted on its own rather than anchoring a cluster.
     */
    private const GENERIC_LEADS = [
        'a', 'an', 'the', 'and', 'for', 'with', 'best', 'top', 'new', 'my',
        'buy', 'cheap', 'official', 'shop', 'store', 'brand', 'product',
        'products', 'viral', 'tiktok', 'trending',
    ];

    /**
     * @return array<string, mixed>
     */
    public function payload(): array
    {
        $searches = CustomKeywordSearch::query()
            ->select(['id', 'user_id', 'name', 'phrase', 'search_type', 'created_at'])
            ->get();

        if ($searches->isEmpty()) {
            return [
                'rows' => [],
                'totalSearches' => 0,
                'entityCount' => 0,
                'topShare' => 0,
            ];
        }

        $entries = $searches
            ->map(function (CustomKeywordSearch $search): ?array {
                $normalized = $this->normalize($search->phrase ?: $search->name);

                if ($normalized === '') {
                    return null;
                }

                return [
                    'normalized' => $normalized,
                    'tokens' => explode(' ', $normalized),
                    'type' => $search->search_type === CustomKeywordSearch::TYPE_PRODUCT ? 'product' : 'brand',
                    'user_id' => $search->user_id,
                    'created_at' => $search->created_at,
                ];
            })
            ->filter()
            ->values();

        if ($entries->isEmpty()) {
            return [
                'rows' => [],
                'totalSearches' => 0,
                'entityCount' => 0,
                'topShare' => 0,
            ];
        }

        $anchors = $this->corroboratedLeads($entries);

        /** @var array<string, array<string, mixed>> $clusters */
        $clusters = [];

        foreach ($entries as $entry) {
            $lead = $entry['tokens'][0];
            $anchored = $entry['type'] === 'brand' && isset($anchors[$lead]);
            $key = $entry['type'].':'.($anchored ? $lead : $entry['normalized']);

            if (! isset($clusters[$key])) {
                $clusters[$key] = [
                    'type' => $entry['type'],
                    'prefix' => $entry['tokens'],
                    'count' => 0,
                    'variants' => [],
                    'userIds' => [],
                    'guests' => 0,
                    'lastSearchedAt' => null,
                ];
            }

            $cluster = &$clusters[$key];
            $cluster['count']++;
            $cluster['prefix'] = $this->commonPrefix($cluster['prefix'], $entry['tokens']);
            $cluster['variants'][$entry['normalized']] = ($cluster['variants'][$entry['normalized']] ?? 0) + 1;

            if ($entry['user_id'] === null) {
                $cluster['guests']++;
            } else {
                $cluster['userIds'][$entry['user_id']] = true;
            }

            if ($entry['created_at'] !== null
                && ($cluster['lastSearchedAt'] === null || $entry['created_at']->greaterThan($cluster['lastSearchedAt']))) {
                $cluster['lastSearchedAt'] = $entry['created_at'];
            }

            unset($cluster);
        }

        $total = $entries->count();

        $rows = collect($clusters)
            ->map(function (array $cluster): array {
                arsort($cluster['variants']);
                $variants = array_keys($cluster['variants']);
                // An empty prefix cannot happen for an anchored cluster (the
                // lead word is shared by definition), but fall back to the most
                // common spelling rather than rendering a blank label.
                $label = implode(' ', $cluster['prefix']) ?: ($variants[0] ?? '');

                return [
                    'label' => $label,
                    'type' => $cluster['type'],
                    'count' => $cluster['count'],
                    'searchers' => count($cluster['userIds']) + $cluster['guests'],
                    'variantCount' => count($variants),
                    // Only the spellings that differ from the label are worth
                    // showing — a chip repeating the label teaches nothing.
                    'variants' => array_slice(
                        array_values(array_filter($variants, fn (string $variant): bool => $variant !== $label)),
                        0,
                        self::VARIANT_LIMIT,
                    ),
                    'lastSearchedAt' => $cluster['lastSearchedAt']?->toIso8601String(),
                ];
            })
            ->sortBy([['count', 'desc'], ['label', 'asc']])
            ->values();

        $top = $rows->take(self::LIMIT)->values();
        $topCount = (int) ($top->first()['count'] ?? 0);

        return [
            'rows' => $top->map(fn (array $row): array => $row + [
                // Bars are scaled against the leader, not the total, so the
                // shape stays readable when the long tail is flat.
                'share' => $topCount > 0 ? (int) round($row['count'] / $topCount * 100) : 0,
                'percent' => (int) round($row['count'] / max(1, $total) * 100),
            ])->all(),
            'totalSearches' => $total,
            'entityCount' => $rows->count(),
            'topShare' => $topCount > 0 ? (int) round($topCount / max(1, $total) * 100) : 0,
        ];
    }

    /**
     * Lead words that start at least two distinct phrases among brand
     * searches. Only these are allowed to collapse a group.
     *
     * @param  Collection<int, array<string, mixed>>  $entries
     * @return array<string, true>
     */
    private function corroboratedLeads(Collection $entries): array
    {
        /** @var array<string, array<string, true>> $seen */
        $seen = [];

        foreach ($entries as $entry) {
            if ($entry['type'] !== 'brand') {
                continue;
            }

            $lead = $entry['tokens'][0];

            if (mb_strlen($lead) < 2 || in_array($lead, self::GENERIC_LEADS, true)) {
                continue;
            }

            $seen[$lead][$entry['normalized']] = true;
        }

        $corroborated = array_filter($seen, fn (array $phrases): bool => count($phrases) >= 2);

        return array_fill_keys(array_keys($corroborated), true);
    }

    /**
     * The tokens two phrases share from the start.
     *
     * @param  array<int, string>  $left
     * @param  array<int, string>  $right
     * @return array<int, string>
     */
    private function commonPrefix(array $left, array $right): array
    {
        $shared = [];

        foreach ($left as $index => $token) {
            if (($right[$index] ?? null) !== $token) {
                break;
            }

            $shared[] = $token;
        }

        return $shared;
    }

    /**
     * Lowercase, strip punctuation (so "rhode-skin" and "rhode skin" match),
     * and collapse whitespace.
     */
    private function normalize(?string $value): string
    {
        $clean = preg_replace('/[^\p{L}\p{N}]+/u', ' ', mb_strtolower(trim((string) $value)));

        return trim(preg_replace('/\s+/', ' ', (string) $clean));
    }
}
