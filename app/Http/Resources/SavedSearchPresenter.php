<?php

namespace App\Http\Resources;

use App\Models\CustomKeywordSearch;
use App\Services\CustomKeywordSearch\SearchInsights;
use App\Services\CustomKeywordSearch\TrendBuilder;

/**
 * One place that decides what a saved search looks like over the wire, so the
 * list, detail page and polling endpoint cannot drift apart.
 */
class SavedSearchPresenter
{
    /**
     * @return array<string, mixed>
     */
    public static function summary(CustomKeywordSearch $search): array
    {
        $latestRun = $search->relationLoaded('latestRun') ? $search->latestRun : $search->latestRun()->first();

        return [
            'id' => $search->id,
            'name' => $search->name,
            'phrase' => $search->phrase,
            'search_type' => $search->search_type,
            'is_watchlisted' => (bool) $search->is_watchlisted,
            'keywords' => $search->keywords ?? [],
            'frequency' => $search->frequency,
            'status' => $search->status,
            'url' => $search->url(),
            'result_count' => $search->videos_count ?? $search->videos()->count(),
            'last_run_at' => $search->last_run_at?->toIso8601String(),
            'next_run_at' => $search->next_run_at?->toIso8601String(),
            'created_at' => $search->created_at?->toIso8601String(),
            'latest_run_status' => $latestRun?->status,
            'latest_run_completed_at' => $latestRun?->completed_at?->toIso8601String(),
            'latest_run_error' => $latestRun?->error_message,
        ];
    }

    /**
     * The ranked card rows for a search. Public because the snapshot recorder
     * and the AI enrichment job must measure exactly what the page renders —
     * a second definition of "the results" is how a chart ends up disagreeing
     * with the grid beneath it.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function resultRows(CustomKeywordSearch $search, array $bookmarkedVideoIds = []): array
    {
        return $search->videos()
            ->with('video')
            ->orderBy('rank')
            ->get()
            ->map(fn ($row): array => array_merge(
                $row->video?->toCardArray() ?? [],
                [
                    'rank' => $row->rank,
                    'score' => (float) $row->viral_score,
                    'bookmarked' => in_array($row->viral_video_id, $bookmarkedVideoIds, true),
                    'is_new_breakout' => (bool) $row->is_new_breakout,
                    'source' => $row->source,
                ]
            ))
            ->filter(fn (array $row): bool => isset($row['id']))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function detail(CustomKeywordSearch $search, array $bookmarkedVideoIds = []): array
    {
        $results = self::resultRows($search, $bookmarkedVideoIds);

        // Insights are derived from the same rows the cards render, so the
        // median a card is measured against is always the median of what the
        // user is actually looking at.
        $insights = app(SearchInsights::class);
        $results = $insights->withMultiples($results);
        $payload = $insights->build($results, $search->phrase);

        $trends = app(TrendBuilder::class);
        $snapshots = $search->snapshots()->orderBy('captured_at')->get();
        $trend = $trends->build($results, $snapshots);

        $payload['trend'] = $trend;
        $payload['tile_deltas'] = $trends->tileDeltas($trend);
        $payload['hashtags'] = self::withGrowth(
            $payload['hashtags'],
            $trends->tagGrowth($snapshots, 'hashtag_counts'),
            'tag',
        );
        $payload['sounds'] = self::withGrowth(
            $payload['sounds'],
            $trends->tagGrowth($snapshots, 'sound_counts'),
            'label',
        );

        return self::summary($search) + [
            'results' => $results,
            'scanned_count' => (int) data_get($search->latestRun?->raw_summary, 'received', 0),
            'ai_summary' => $search->ai_summary,
            'ai_summary_generated_at' => $search->ai_summary_generated_at?->toIso8601String(),
            'insights' => $payload,
        ];
    }

    /**
     * Attaches run-over-run growth to hashtag or sound rows. Rows keep a null
     * `growth` until two recorded snapshots exist — an unknown trend renders as
     * nothing, never as flat.
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<string, array<string, mixed>>  $growth
     * @return array<int, array<string, mixed>>
     */
    private static function withGrowth(array $rows, array $growth, string $key): array
    {
        return array_map(function (array $row) use ($growth, $key): array {
            $row['growth'] = $growth[mb_strtolower((string) $row[$key])] ?? null;

            return $row;
        }, $rows);
    }
}
