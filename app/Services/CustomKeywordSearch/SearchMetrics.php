<?php

namespace App\Services\CustomKeywordSearch;

/**
 * The one definition of "what a set of videos measures". Snapshots, trend
 * buckets and the signal tiles all read from here, so a metric cannot mean one
 * thing on the chart and another on the tile above it.
 */
class SearchMetrics
{
    public function __construct(private readonly SearchInsights $insights) {}

    /**
     * @param  array<int, array<string, mixed>>  $results  presented card rows
     * @param  int|null  $medianViews  baseline to score against; defaults to the
     *                                 median of `$results` itself. Trend buckets
     *                                 pass the whole-search median so a quiet
     *                                 week is not graded on its own curve.
     * @return array<string, mixed>
     */
    public function for(array $results, ?int $medianViews = null): array
    {
        $medianViews ??= $this->insights->medianViews($results);
        $ownMedian = $this->insights->medianViews($results);

        $views = 0;
        $engagement = 0;
        $rates = [];
        $multiples = [];

        foreach ($results as $row) {
            $rowViews = (int) ($row['views'] ?? 0);
            $views += $rowViews;

            $engagement += (int) ($row['likes'] ?? 0)
                + (int) ($row['comments'] ?? 0)
                + (int) ($row['shares'] ?? 0)
                + (int) ($row['saves'] ?? 0);

            if (($row['engagement_rate'] ?? null) !== null) {
                $rates[] = (float) $row['engagement_rate'];
            }

            if ($medianViews > 0 && $rowViews > 0) {
                $multiples[] = round($rowViews / $medianViews, 2);
            }
        }

        return [
            'video_count' => count($results),
            'total_views' => $views,
            'total_engagement' => $engagement,
            'avg_engagement_rate' => $rates === [] ? 0.0 : round(array_sum($rates) / count($rates), 4),
            'median_views' => $ownMedian,
            'outlier_count' => count(array_filter(
                $multiples,
                fn (float $m): bool => $m >= SearchInsights::OUTLIER_THRESHOLD,
            )),
            'top_multiple' => $multiples === [] ? 0.0 : max($multiples),
        ];
    }

    /**
     * Post counts per hashtag and per sound, stored on a snapshot so growth can
     * be read against the previous one without re-walking every video.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array{hashtags: array<string, int>, sounds: array<string, int>}
     */
    public function tallies(array $results): array
    {
        $hashtags = [];
        $sounds = [];

        foreach ($results as $row) {
            $seen = [];

            foreach ((array) ($row['hashtags'] ?? []) as $tag) {
                $tag = mb_strtolower(ltrim(trim((string) $tag), '#'));

                if ($tag === '' || isset($seen[$tag])) {
                    continue;
                }

                $seen[$tag] = true;
                $hashtags[$tag] = ($hashtags[$tag] ?? 0) + 1;
            }

            $sound = mb_strtolower(trim((string) ($row['sound_label'] ?? '')));

            if ($sound !== '') {
                $sounds[$sound] = ($sounds[$sound] ?? 0) + 1;
            }
        }

        arsort($hashtags);
        arsort($sounds);

        return [
            'hashtags' => array_slice($hashtags, 0, 40, true),
            'sounds' => array_slice($sounds, 0, 40, true),
        ];
    }
}
