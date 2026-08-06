<?php

namespace App\Services\CustomKeywordSearch;

use Carbon\CarbonImmutable;

/**
 * Derived analytics for a saved search's detail page.
 *
 * Everything here is computed from the current result set — there is no
 * snapshot history in the schema, so nothing in this class compares against a
 * previous run. That is deliberate: a delta chip we cannot source honestly is
 * worse than no delta chip. When a snapshot table lands, growth rates belong
 * here alongside the values they qualify.
 *
 * The outlier multiple is views over the *median views of this search*, not the
 * median of the creator's own account. We do not scrape account timelines, so
 * an account baseline does not exist. Label it as "vs. search median" wherever
 * it surfaces.
 */
class SearchInsights
{
    /** A video at or above this multiple counts as an outlier. */
    public const OUTLIER_THRESHOLD = 3.0;

    /** The panels show a top-5, like the mockup. Snapshots still tally the
     *  full list (see SearchMetrics::tallies), so growth for a tag that drops
     *  out of the top 5 and returns is not lost. */
    private const TOP_HASHTAGS = 5;

    private const TOP_SOUNDS = 5;

    private const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /**
     * Buckets for the score distribution panel, matching the mockup: the panel
     * describes the outliers only, so the bottom bucket starts at the outlier
     * threshold and everything under 3x falls outside the chart on purpose.
     * Upper bound is exclusive; null means open-ended.
     *
     * @var array<int, array{label: string, min: float, max: float|null}>
     */
    private const BUCKETS = [
        ['label' => '3 - 5x', 'min' => 3.0, 'max' => 5.0],
        ['label' => '5 - 8x', 'min' => 5.0, 'max' => 8.0],
        ['label' => '8 - 12x', 'min' => 8.0, 'max' => 12.0],
        ['label' => '12x+', 'min' => 12.0, 'max' => null],
    ];

    public function __construct(
        private readonly BrandAccountResolver $accounts,
        private readonly PlaceholderProfileData $placeholders,
    ) {}

    /**
     * @param  array<int, array<string, mixed>>  $results  presented card rows
     * @return array<string, mixed>
     */
    public function build(array $results, ?string $phrase = null): array
    {
        $medianViews = $this->medianViews($results);
        $results = $this->withMultiples($results, $medianViews);
        $account = $this->account($results, $phrase);

        return [
            'baseline' => [
                'median_views' => $medianViews,
                'sample_size' => count($results),
                'outlier_threshold' => self::OUTLIER_THRESHOLD,
            ],
            'account' => $account,
            'tiles' => $this->tiles($results, $medianViews),
            'hashtags' => $this->hashtags($results),
            'sounds' => $this->sounds($results),
            'heatmap' => $this->heatmap($results),
            'distribution' => $this->distribution($results),
            // Which sections on screen are not real. Empty this list by
            // deleting PlaceholderProfileData once the profile actor exists.
            'placeholders' => $account === null ? [] : PlaceholderProfileData::SECTIONS,
        ];
    }

    /**
     * Brand identity: the detected parts are real, the profile parts are not.
     * They are merged into one object but the fake keys stay under `profile`
     * with their own flag, so nothing can render an invented number without
     * having reached past a boolean called `is_placeholder`.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, mixed>|null
     */
    private function account(array $results, ?string $phrase = null): ?array
    {
        $detected = $this->accounts->resolve($results, $phrase);

        if ($detected === null) {
            return null;
        }

        return $detected + [
            'own_median_views' => $this->accounts->medianViewsForHandle($results, $detected['handle']),
            'profile' => $this->placeholders->forHandle($detected['handle'], (int) ($detected['followers'] ?? 0)),
        ];
    }

    /**
     * Attaches `outlier_multiple` to each row. Public so the presenter can
     * decorate the same rows it ships to the cards without recomputing the
     * median.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array<int, array<string, mixed>>
     */
    public function withMultiples(array $results, ?int $medianViews = null): array
    {
        $medianViews ??= $this->medianViews($results);

        return array_map(function (array $row) use ($medianViews): array {
            $row['outlier_multiple'] = $this->multipleFor((int) ($row['views'] ?? 0), $medianViews);

            return $row;
        }, $results);
    }

    /**
     * @param  array<int, array<string, mixed>>  $results
     */
    public function medianViews(array $results): int
    {
        $views = array_values(array_filter(
            array_map(fn (array $row): int => (int) ($row['views'] ?? 0), $results),
            fn (int $value): bool => $value > 0,
        ));

        if ($views === []) {
            return 0;
        }

        sort($views);
        $count = count($views);
        $middle = intdiv($count, 2);

        // Even counts average the two centre values so a two-video search does
        // not report one of its own videos as the baseline.
        return $count % 2 === 1
            ? $views[$middle]
            : (int) round(($views[$middle - 1] + $views[$middle]) / 2);
    }

    private function multipleFor(int $views, int $medianViews): ?float
    {
        if ($medianViews <= 0 || $views <= 0) {
            return null;
        }

        return round($views / $medianViews, 2);
    }

    /**
     * The five signal tiles. Deltas are intentionally absent — see the class
     * docblock.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array<int, array<string, mixed>>
     */
    private function tiles(array $results, int $medianViews): array
    {
        $multiples = array_values(array_filter(
            array_map(fn (array $row): ?float => $row['outlier_multiple'] ?? null, $results),
            fn (?float $value): bool => $value !== null,
        ));

        $rates = array_values(array_filter(
            array_map(fn (array $row): ?float => $row['engagement_rate'] ?? null, $results),
            fn (?float $value): bool => $value !== null,
        ));

        $outliers = count(array_filter($multiples, fn (float $m): bool => $m >= self::OUTLIER_THRESHOLD));

        return [
            [
                'key' => 'videos',
                'label' => 'videos matched',
                'value' => count($results),
                'format' => 'count',
            ],
            [
                'key' => 'outliers',
                'label' => 'outliers',
                'value' => $outliers,
                'format' => 'count',
                'hint' => sprintf('%sx or more vs. the search median', rtrim(rtrim(number_format(self::OUTLIER_THRESHOLD, 1), '0'), '.')),
            ],
            [
                'key' => 'top_multiple',
                'label' => 'top outlier',
                'value' => $multiples === [] ? null : max($multiples),
                'format' => 'multiple',
                'hero' => true,
            ],
            [
                'key' => 'median_views',
                'label' => 'median views',
                'value' => $medianViews > 0 ? $medianViews : null,
                'format' => 'compact',
            ],
            [
                'key' => 'avg_engagement',
                'label' => 'avg eng rate',
                'value' => $rates === [] ? null : round(array_sum($rates) / count($rates), 2),
                'format' => 'percent',
            ],
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $results
     * @return array<int, array<string, mixed>>
     */
    private function hashtags(array $results): array
    {
        $tally = [];

        foreach ($results as $row) {
            // One post can only credit a tag once, even if the caption repeats it.
            $seen = [];

            foreach ((array) ($row['hashtags'] ?? []) as $tag) {
                $tag = ltrim(trim((string) $tag), '#');

                if ($tag === '') {
                    continue;
                }

                $key = mb_strtolower($tag);

                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;

                $tally[$key] ??= ['tag' => $tag, 'posts' => 0, 'views' => 0];
                $tally[$key]['posts']++;
                $tally[$key]['views'] += (int) ($row['views'] ?? 0);
            }
        }

        return $this->topBy($tally, self::TOP_HASHTAGS, count($results));
    }

    /**
     * @param  array<int, array<string, mixed>>  $results
     * @return array<int, array<string, mixed>>
     */
    private function sounds(array $results): array
    {
        $topVideoSound = null;
        $tally = [];

        foreach ($results as $index => $row) {
            $label = trim((string) ($row['sound_label'] ?? ''));

            if ($label === '') {
                continue;
            }

            $key = mb_strtolower($label);

            if ($index === 0) {
                $topVideoSound = $key;
            }

            $tally[$key] ??= [
                'label' => $label,
                'song' => $row['song'] ?? null,
                'artist' => $row['artist'] ?? null,
                'posts' => 0,
                'views' => 0,
            ];
            $tally[$key]['posts']++;
            $tally[$key]['views'] += (int) ($row['views'] ?? 0);
        }

        $sounds = $this->topBy($tally, self::TOP_SOUNDS, count($results));

        return array_map(function (array $sound) use ($topVideoSound): array {
            $sound['on_top_video'] = $topVideoSound !== null
                && mb_strtolower($sound['label']) === $topVideoSound;

            return $sound;
        }, $sounds);
    }

    /**
     * Shared ranking for the hashtag and sound panels: most posts first, then
     * most views, then alphabetical so equal rows do not shuffle between loads.
     *
     * @param  array<string, array<string, mixed>>  $tally
     * @return array<int, array<string, mixed>>
     */
    private function topBy(array $tally, int $limit, int $total): array
    {
        $rows = array_values($tally);

        usort($rows, function (array $a, array $b): int {
            return [$b['posts'], $b['views'], $a['tag'] ?? $a['label']]
                <=> [$a['posts'], $a['views'], $b['tag'] ?? $b['label']];
        });

        return array_map(
            fn (array $row): array => $row + [
                'share' => $total > 0 ? round($row['posts'] / $total, 4) : 0.0,
            ],
            array_slice($rows, 0, $limit),
        );
    }

    /**
     * Posting rhythm as a 7x24 grid. Times are UTC — `uploaded_at` is stored in
     * UTC and no creator timezone is captured, so the UI must not claim these
     * are local hours.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, mixed>
     */
    private function heatmap(array $results): array
    {
        $cells = array_fill(0, 7, array_fill(0, 24, 0));
        $counted = 0;

        foreach ($results as $row) {
            $uploadedAt = $row['uploaded_at'] ?? null;

            if (! is_string($uploadedAt) || $uploadedAt === '') {
                continue;
            }

            try {
                $moment = CarbonImmutable::parse($uploadedAt)->utc();
            } catch (\Throwable) {
                continue;
            }

            // Carbon is Sunday-indexed; the grid reads Monday-first.
            $day = ($moment->dayOfWeek + 6) % 7;
            $cells[$day][$moment->hour]++;
            $counted++;
        }

        $max = 0;
        $peak = null;

        foreach ($cells as $day => $hours) {
            foreach ($hours as $hour => $count) {
                if ($count > $max) {
                    $max = $count;
                    $peak = ['day' => self::DAYS[$day], 'hour' => $hour, 'count' => $count];
                }
            }
        }

        return [
            'days' => self::DAYS,
            'cells' => $cells,
            'max' => $max,
            'peak' => $peak,
            'counted' => $counted,
            'timezone' => 'UTC',
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $results
     * @return array<int, array<string, mixed>>
     */
    private function distribution(array $results): array
    {
        // Only outliers feed the chart — the buckets start at the threshold,
        // so share is a fraction of the outliers, not of every video.
        $multiples = array_values(array_filter(
            array_map(fn (array $row): ?float => $row['outlier_multiple'] ?? null, $results),
            fn (?float $value): bool => $value !== null && $value >= self::OUTLIER_THRESHOLD,
        ));

        return array_map(function (array $bucket) use ($multiples): array {
            $count = count(array_filter(
                $multiples,
                fn (float $m): bool => $m >= $bucket['min'] && ($bucket['max'] === null || $m < $bucket['max']),
            ));

            return $bucket + [
                'count' => $count,
                'share' => $multiples === [] ? 0.0 : round($count / count($multiples), 4),
            ];
        }, self::BUCKETS);
    }
}
