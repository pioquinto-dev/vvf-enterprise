<?php

namespace App\Services\CustomKeywordSearch;

use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

/**
 * Turns snapshots into the performance chart, the outliers-per-week bars, and
 * the delta chips on the signal tiles.
 *
 * Two sources feed the same series, and the difference matters:
 *
 *  - Recorded points come from `custom_keyword_search_snapshots`. They are what
 *    the search measured at that moment.
 *  - Reconstructed points are derived here by bucketing videos on `uploaded_at`.
 *    They say "these posts went up that week, and here is what they are worth
 *    *today*" — not what the metric read at the time. A video that went viral
 *    last month lands entirely in the week it was posted.
 *
 * A recorded point always wins its week. Reconstruction only fills the gaps, so
 * the chart converges on real measurement as runs accumulate. Every point
 * carries `reconstructed`, and the UI labels the series whenever any point is.
 */
class TrendBuilder
{
    private const WEEKS = 12;

    public function __construct(private readonly SearchMetrics $metrics) {}

    /**
     * @param  array<int, array<string, mixed>>  $results  presented card rows
     * @param  Collection<int, \App\Models\CustomKeywordSearchSnapshot>  $snapshots
     * @return array<string, mixed>
     */
    public function build(array $results, Collection $snapshots): array
    {
        $now = CarbonImmutable::now()->utc();
        $currentWeek = $now->startOfWeek();

        // Score every bucket against the whole search's median, not its own, so
        // a quiet week does not manufacture outliers out of its three posts.
        $baseline = app(SearchInsights::class)->medianViews($results);

        $recorded = $this->indexRecordedByWeek($snapshots);
        $cohorts = $this->cohortsByWeek($results);

        $points = [];

        for ($offset = self::WEEKS - 1; $offset >= 0; $offset--) {
            $weekStart = $currentWeek->subWeeks($offset);
            $key = $weekStart->format('o-\WW');

            if (isset($recorded[$key])) {
                $points[] = $this->pointFromSnapshot($recorded[$key], $weekStart, $offset);

                continue;
            }

            $points[] = $this->pointFromCohort($cohorts[$key] ?? [], $weekStart, $offset, $baseline);
        }

        $reconstructedCount = count(array_filter($points, fn (array $p): bool => $p['reconstructed']));

        return [
            'weeks' => self::WEEKS,
            'points' => $points,
            'has_reconstructed' => $reconstructedCount > 0,
            'fully_reconstructed' => $reconstructedCount === count($points),
            'recorded_count' => count($points) - $reconstructedCount,
            'metrics' => $this->metricSeries($points),
            'outliers_per_week' => array_map(
                fn (array $p): array => [
                    'label' => $p['label'],
                    'value' => $p['outliers'],
                    'reconstructed' => $p['reconstructed'],
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
     * @param  Collection<int, \App\Models\CustomKeywordSearchSnapshot>  $snapshots
     * @return array<string, \App\Models\CustomKeywordSearchSnapshot>
     */
    private function indexRecordedByWeek(Collection $snapshots): array
    {
        $indexed = [];

        foreach ($snapshots->where('is_reconstructed', false)->sortBy('captured_at') as $snapshot) {
            if ($snapshot->captured_at === null) {
                continue;
            }

            // Last write wins: the most recent run in a week is that week's
            // reading, not the first one.
            $indexed[CarbonImmutable::parse($snapshot->captured_at)->utc()->format('o-\WW')] = $snapshot;
        }

        return $indexed;
    }

    /**
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, array<int, array<string, mixed>>>
     */
    private function cohortsByWeek(array $results): array
    {
        $cohorts = [];

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

            $cohorts[$moment->startOfWeek()->format('o-\WW')][] = $row;
        }

        return $cohorts;
    }

    /**
     * @return array<string, mixed>
     */
    private function pointFromSnapshot($snapshot, CarbonImmutable $weekStart, int $offset): array
    {
        return [
            'label' => $this->label($offset),
            'week_start' => $weekStart->toIso8601String(),
            'reconstructed' => false,
            'posts' => (int) $snapshot->video_count,
            'views' => (int) $snapshot->total_views,
            'engagement' => (int) $snapshot->total_engagement,
            'engagement_rate' => round((float) $snapshot->avg_engagement_rate, 2),
            'median_views' => (int) $snapshot->median_views,
            'outliers' => (int) $snapshot->outlier_count,
            'top_multiple' => round((float) $snapshot->top_multiple, 2),
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $cohort
     * @return array<string, mixed>
     */
    private function pointFromCohort(array $cohort, CarbonImmutable $weekStart, int $offset, int $baseline): array
    {
        $metrics = $this->metrics->for($cohort, $baseline > 0 ? $baseline : null);

        return [
            'label' => $this->label($offset),
            'week_start' => $weekStart->toIso8601String(),
            'reconstructed' => true,
            'posts' => $metrics['video_count'],
            'views' => $metrics['total_views'],
            'engagement' => $metrics['total_engagement'],
            'engagement_rate' => round($metrics['avg_engagement_rate'], 2),
            'median_views' => $metrics['median_views'],
            'outliers' => $metrics['outlier_count'],
            'top_multiple' => $metrics['top_multiple'],
        ];
    }

    private function label(int $offset): string
    {
        return $offset === 0 ? 'now' : "{$offset}w ago";
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
}
