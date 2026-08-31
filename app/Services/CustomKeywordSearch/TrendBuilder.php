<?php

namespace App\Services\CustomKeywordSearch;

use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Turns visible search results into the uploaded-at weekly chart, the
 * outliers-per-week bars, and the delta chips on the signal tiles.
 *
 * The chart on the results page is intentionally based on when the matched
 * videos were uploaded, not when the search happened to refresh. That makes
 * the graph useful on day one and keeps it stable for older completed searches
 * without forcing another scrape.
 */
class TrendBuilder
{
    private const LOOKBACK_DAYS = 90;

    public function __construct(private readonly SearchMetrics $metrics) {}

    /**
     * @param  array<int, array<string, mixed>>  $results  presented card rows
     * @param  Collection<int, \App\Models\CustomKeywordSearchSnapshot>  $snapshots
     * @return array<string, mixed>
     */
    public function build(array $results, Collection $snapshots): array
    {
        // Score every bucket against the whole search's median, not its own, so
        // a quiet week does not manufacture outliers out of its three posts.
        $baseline = app(SearchInsights::class)->medianViews($results);
        $cohorts = $this->cohortsByWeek($results);
        $weeks = $this->lookbackWeeks();

        $points = array_map(
            fn (string $weekKey): array => $this->pointFromCohort($cohorts[$weekKey] ?? [], $weekKey, $baseline),
            $weeks,
        );

        return [
            'weeks' => count($points),
            'points' => $points,
            'has_reconstructed' => false,
            'fully_reconstructed' => false,
            'recorded_count' => 0,
            'x_axis_label' => 'Upload week',
            'y_axis_labels' => [
                'views' => 'Views',
                'posts' => 'Posts',
                'engagement' => 'Engagement',
                'rate' => 'Engagement rate',
            ],
            'metrics' => $this->metricSeries($points),
            'outliers_per_week' => array_map(
                fn (array $p): array => [
                    'label' => $p['label'],
                    'value' => $p['outliers'],
                    'reconstructed' => false,
                ],
                array_slice($points, -6),
            ),
        ];
    }

    /**
     * Delta chips for the signal tiles: the newest point against the one
     * before it. Null when there is nothing to compare against — a tile with no
     * chip is correct, a tile with a zero chip is a lie.
     *
     * @param  array<string, mixed>  $trend
     * @return array<string, array<string, mixed>|null>
     */
    public function tileDeltas(array $trend): array
    {
        $points = array_values(array_filter(
            $trend['points'] ?? [],
            fn (array $p): bool => $p['posts'] > 0,
        ));

        if (count($points) < 2) {
            return ['outliers' => null, 'top_multiple' => null, 'avg_engagement' => null, 'median_views' => null];
        }

        $latest = $points[count($points) - 1];
        $previous = $points[count($points) - 2];
        $reconstructed = $latest['reconstructed'] || $previous['reconstructed'];

        return [
            'outliers' => $this->delta($latest['outliers'], $previous['outliers'], 'absolute', $reconstructed),
            'top_multiple' => $this->delta($latest['top_multiple'], $previous['top_multiple'], 'multiple', $reconstructed),
            'avg_engagement' => $this->delta($latest['engagement_rate'], $previous['engagement_rate'], 'points', $reconstructed),
            'median_views' => $this->delta($latest['median_views'], $previous['median_views'], 'percent', $reconstructed),
        ];
    }

    /**
     * Post-count growth for a hashtag or sound, newest recorded snapshot against
     * the one before it. Reconstruction cannot help here: `uploaded_at` says
     * when a post went up, not when we first saw the tag on it.
     *
     * @param  Collection<int, \App\Models\CustomKeywordSearchSnapshot>  $snapshots
     * @return array<string, array<string, mixed>>
     */
    public function tagGrowth(Collection $snapshots, string $field): array
    {
        $recorded = $snapshots
            ->where('is_reconstructed', false)
            ->sortBy('captured_at')
            ->values();

        if ($recorded->count() < 2) {
            return [];
        }

        $latest = (array) ($recorded->last()->{$field} ?? []);
        $previous = (array) ($recorded[$recorded->count() - 2]->{$field} ?? []);

        $growth = [];

        foreach ($latest as $key => $count) {
            $before = (int) ($previous[$key] ?? 0);

            $growth[$key] = [
                'now' => (int) $count,
                'before' => $before,
                'is_new' => $before === 0,
                'change_pct' => $before > 0 ? round((($count - $before) / $before) * 100, 1) : null,
            ];
        }

        return $growth;
    }

    /**
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function cohortsByWeek(array $results): array
    {
        $cohorts = [];
        $windowStart = CarbonImmutable::now('UTC')
            ->subDays(self::LOOKBACK_DAYS - 1)
            ->startOfDay();

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

            if ($moment->lt($windowStart)) {
                continue;
            }

            $cohorts[$moment->startOfWeek()->toDateString()][] = $row;
        }

        return $cohorts;
    }

    /**
     * @param  array<int, array<string, mixed>>  $cohort
     * @return array<string, mixed>
     */
    private function pointFromCohort(array $cohort, string $weekKey, int $baseline): array
    {
        $metrics = $this->metrics->for($cohort, $baseline > 0 ? $baseline : null);
        $weekStart = CarbonImmutable::parse($weekKey, 'UTC')->startOfWeek();

        return [
            'label' => $weekStart->format('M j'),
            'week_start' => $weekStart->toIso8601String(),
            'reconstructed' => false,
            'posts' => $metrics['video_count'],
            'views' => $metrics['total_views'],
            'engagement' => $metrics['total_engagement'],
            'engagement_rate' => round($metrics['avg_engagement_rate'], 2),
            'median_views' => $metrics['median_views'],
            'outliers' => $metrics['outlier_count'],
            'top_multiple' => $metrics['top_multiple'],
        ];
    }

    /**
     * The four series the chart tabs switch between.
     *
     * @param  array<int, array<string, mixed>>  $points
     * @return array<string, mixed>
     */
    private function metricSeries(array $points): array
    {
        $definitions = [
            'views' => ['label' => 'views', 'key' => 'views', 'format' => 'compact', 'delta' => 'percent'],
            'posts' => ['label' => 'posts', 'key' => 'posts', 'format' => 'count', 'delta' => 'percent'],
            'engagement' => ['label' => 'engagement', 'key' => 'engagement', 'format' => 'compact', 'delta' => 'percent'],
            'rate' => ['label' => 'eng rate', 'key' => 'engagement_rate', 'format' => 'percent', 'delta' => 'points'],
        ];

        $series = [];

        foreach ($definitions as $name => $definition) {
            $values = array_map(fn (array $p) => $p[$definition['key']], $points);
            $nonEmpty = array_values(array_filter($values, fn ($v): bool => $v > 0));

            $series[$name] = [
                'label' => $definition['label'],
                'format' => $definition['format'],
                'values' => $values,
                'current' => $values[count($values) - 1] ?? 0,
                'delta' => count($nonEmpty) >= 2
                    ? $this->delta(end($nonEmpty), $nonEmpty[0], $definition['delta'], false)
                    : null,
            ];
        }

        return $series;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function delta(float|int|null $latest, float|int|null $previous, string $unit, bool $reconstructed): ?array
    {
        if ($latest === null || $previous === null) {
            return null;
        }

        $value = match ($unit) {
            'percent' => $previous == 0 ? null : round((($latest - $previous) / $previous) * 100, 1),
            'points', 'absolute' => round($latest - $previous, 2),
            'multiple' => round($latest - $previous, 2),
            default => null,
        };

        if ($value === null) {
            return null;
        }

        return [
            'value' => $value,
            'unit' => $unit,
            'direction' => $value > 0 ? 'up' : ($value < 0 ? 'down' : 'flat'),
            'reconstructed' => $reconstructed,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function lookbackWeeks(): array
    {
        $start = CarbonImmutable::now('UTC')
            ->subDays(self::LOOKBACK_DAYS - 1)
            ->startOfWeek();
        $end = CarbonImmutable::now('UTC')->startOfWeek();
        $weeks = [];

        for ($cursor = $start; $cursor->lte($end); $cursor = $cursor->addWeek()) {
            $weeks[] = $cursor->toDateString();
        }

        return $weeks;
    }
}
