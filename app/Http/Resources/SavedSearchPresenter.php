<?php

namespace App\Http\Resources;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\CustomKeywordSearchVideo;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\ViralVideo;
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
        $resultCount = $search->videos_count ?? $search->videos()->count();

        return [
            'id' => $search->id,
            'name' => $search->name,
            'phrase' => $search->phrase,
            'search_type' => $search->search_type,
            'source_tiktok_handle' => $search->source_tiktok_handle,
            'source_website' => $search->source_website,
            'is_watchlisted' => (bool) $search->is_watchlisted,
            'keywords' => $search->keywords ?? [],
            'frequency' => $search->frequency,
            'status' => $search->status,
            'url' => $search->url(),
            'result_count' => $resultCount,
            'last_run_at' => $search->last_run_at?->toIso8601String(),
            'next_run_at' => $search->next_run_at?->toIso8601String(),
            'created_at' => $search->created_at?->toIso8601String(),
            'latest_run_status' => $latestRun?->status,
            'latest_run_completed_at' => $latestRun?->completed_at?->toIso8601String(),
            'latest_run_error' => $latestRun?->error_message,
            'can_retry_initial' => $search->status === CustomKeywordSearch::STATUS_FAILED
                && $latestRun?->status === CustomKeywordSearchRun::STATUS_FAILED
                && $resultCount === 0,
        ];
    }

    /**
     * Summary plus the headline stats the Brand/Product list cards show.
     * `top_score` and `outlier_count` come from aggregates loaded on the
     * collection (loadMax/loadCount), so this stays query-free per row.
     *
     * @return array<string, mixed>
     */
    public static function card(CustomKeywordSearch $search): array
    {
        $latestRun = $search->relationLoaded('latestRun') ? $search->latestRun : $search->latestRun()->first();
        $resultCount = $search->videos_count ?? $search->videos()->count();

        return self::summary($search) + [
            'videos_scanned' => (int) data_get($latestRun?->raw_summary, 'received', $resultCount),
            'latest_outlier_count' => self::latestOutlierCount($search, $latestRun),
            'top_score' => $search->videos_max_viral_score !== null ? (float) $search->videos_max_viral_score : null,
            'average_video_views' => self::averageVideoViews($search),
            'outlier_count' => (int) ($search->outlier_count ?? 0),
        ];
    }

    private static function latestOutlierCount(CustomKeywordSearch $search, ?CustomKeywordSearchRun $latestRun): int
    {
        if ($latestRun === null) {
            return 0;
        }

        return CustomKeywordSearchVideo::query()
            ->where('custom_keyword_search_id', $search->id)
            ->where('custom_keyword_search_run_id', $latestRun->id)
            ->where('is_new_breakout', true)
            ->count();
    }

    private static function averageVideoViews(CustomKeywordSearch $search): int
    {
        return (int) round(
            ViralVideo::query()
                ->visible()
                ->join('custom_keyword_search_videos', 'custom_keyword_search_videos.viral_video_id', '=', 'viral_videos.id')
                ->where('custom_keyword_search_videos.custom_keyword_search_id', $search->id)
                ->avg('viral_videos.views') ?? 0
        );
    }

    /**
     * The ranked card rows for a search. Public because the snapshot recorder
     * and the AI enrichment job must measure exactly what the page renders —
     * a second definition of "the results" is how a chart ends up disagreeing
     * with the grid beneath it.
     *
     * @return array<int, array<string, mixed>>
     */
    public static function resultRows(CustomKeywordSearch $search, array $bookmarkedVideoIds = [], ?User $user = null): array
    {
        $analysisByVideoId = self::analysisMapForSearch($search, $user);

        return $search->videos()
            // Archived videos stay attached to the search but must not render;
            // the `isset($row['id'])` guard below drops the empty rows.
            ->with(['video' => fn ($query) => $query->visible()])
            ->orderBy('rank')
            ->get()
            ->map(function ($row) use ($analysisByVideoId, $bookmarkedVideoIds): array {
                $video = $row->video;

                return array_merge(
                    $video?->toCardArray() ?? [],
                    [
                        'rank' => $row->rank,
                        'score' => (float) $row->viral_score,
                        'bookmarked' => in_array($row->viral_video_id, $bookmarkedVideoIds, true),
                        'is_new_breakout' => (bool) $row->is_new_breakout,
                        'source' => $row->source,
                        // The run that last surfaced this video. The pivot
                        // row is upserted in place on every re-run, so this
                        // points at the newest run the video was included
                        // in — the detail page uses it to bucket cards as
                        // "new this run" vs "previous run" vs "older".
                        'search_run_id' => $row->custom_keyword_search_run_id,
                        'analysis' => $analysisByVideoId[$row->viral_video_id] ?? null,
                        // enrichment fields — nullable, populated by SearchEnrichmentService
                        'content_format' => $video?->content_format,
                        'content_hook' => $video?->content_hook,
                        'content_angle' => $video?->content_angle,
                        'why_broke_out' => $video?->content_why_broke_out,
                        'replicate_with' => $video?->content_replicate_with,
                    ]
                );
            })
            ->filter(fn (array $row): bool => isset($row['id']))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function detail(CustomKeywordSearch $search, array $bookmarkedVideoIds = [], ?User $user = null): array
    {
        $results = self::resultRows($search, $bookmarkedVideoIds, $user);

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
            'runs' => self::runHistory($search),
            'ai_summary' => $search->ai_summary,
            'ai_summary_generated_at' => $search->ai_summary_generated_at?->toIso8601String(),
            'insights_bullets' => is_array($search->insights_bullets) ? $search->insights_bullets : [],
            'best_post_time' => is_array($search->best_post_time) ? $search->best_post_time : null,
            'insights' => $payload,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function runHistory(CustomKeywordSearch $search): array
    {
        return $search->runs()
            ->where('status', CustomKeywordSearchRun::STATUS_DONE)
            ->orderBy('completed_at')
            ->with(['search', 'apifyTrigger'])
            ->get()
            ->map(function (CustomKeywordSearchRun $run) use ($search): array {
                $snapshot = $search->snapshots()
                    ->where('custom_keyword_search_run_id', $run->id)
                    ->where('is_reconstructed', false)
                    ->latest('captured_at')
                    ->first();

                return [
                    'id' => $run->id,
                    'status' => $run->status,
                    'started_at' => $run->started_at?->toIso8601String(),
                    'completed_at' => $run->completed_at?->toIso8601String(),
                    'error_message' => $run->error_message,
                    'summary' => $run->raw_summary ?? [],
                    'snapshot' => $snapshot ? [
                        'captured_at' => $snapshot->captured_at?->toIso8601String(),
                        'posts' => (int) $snapshot->video_count,
                        'views' => (int) $snapshot->total_views,
                        'engagement' => (int) $snapshot->total_engagement,
                        'engagement_rate' => round((float) $snapshot->avg_engagement_rate, 2),
                        'median_views' => (int) $snapshot->median_views,
                        'outliers' => (int) $snapshot->outlier_count,
                        'top_multiple' => round((float) $snapshot->top_multiple, 2),
                    ] : null,
                ];
            })
            ->values()
            ->all();
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

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function analysisMapForSearch(CustomKeywordSearch $search, ?User $user): array
    {
        if ($user === null) {
            return [];
        }

        $videoIds = $search->videos()->pluck('viral_video_id')->all();

        if ($videoIds === []) {
            return [];
        }

        return VideoAnalysis::query()
            ->where('user_id', $user->id)
            ->whereIn('viral_video_id', $videoIds)
            ->get()
            ->keyBy('viral_video_id')
            ->map(fn (VideoAnalysis $analysis): array => self::analysisPayload($analysis))
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function analysisPayload(VideoAnalysis $analysis): array
    {
        return [
            'id' => $analysis->id,
            'video_id' => $analysis->video_id,
            'status' => $analysis->status,
            'result' => $analysis->result,
            'transcript' => $analysis->transcript,
            'transcript_segments' => $analysis->transcript_segments,
            'error_message' => $analysis->error_message,
            'analyzed_at' => $analysis->analyzed_at?->toIso8601String(),
            'updated_at' => $analysis->updated_at?->toIso8601String(),
        ];
    }
}
