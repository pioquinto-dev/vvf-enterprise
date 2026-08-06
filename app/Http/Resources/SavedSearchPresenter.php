<?php

namespace App\Http\Resources;

use App\Models\CustomKeywordSearch;

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
     * @return array<string, mixed>
     */
    public static function detail(CustomKeywordSearch $search, array $bookmarkedVideoIds = []): array
    {
        $results = $search->videos()
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

        return self::summary($search) + [
            'results' => $results,
            'scanned_count' => (int) data_get($search->latestRun?->raw_summary, 'received', 0),
        ];
    }
}
