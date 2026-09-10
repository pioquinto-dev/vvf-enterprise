<?php

namespace App\Repositories\CustomKeywordSearch;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\VideoAnalysis;
use App\Models\ViralVideo;
use Illuminate\Support\Collection;

/**
 * Query surface for My Feed and the brand/product hubs. Presentation and
 * caching live in the services that consume this; every method here returns
 * plain Eloquent collections/models.
 */
class FeedRepository
{
    public function ownedSearchIds(?int $userId, ?string $guestToken): Collection
    {
        return CustomKeywordSearch::query()->ownedBy($userId, $guestToken)->pluck('id');
    }

    /**
     * @param  Collection<int, int>  $ids
     * @return Collection<int, CustomKeywordSearch>
     */
    public function searchesByIds(Collection $ids): Collection
    {
        return CustomKeywordSearch::query()->whereIn('id', $ids)->get();
    }

    /**
     * The strongest breakouts across a set of searches, one row per
     * underlying video, best score first.
     *
     * @param  Collection<int, int>  $searchIds
     * @return Collection<int, CustomKeywordSearchVideo>
     */
    public function topBreakoutRows(Collection $searchIds, int $limit): Collection
    {
        return CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->whereHas('video', fn ($query) => $query->visible())
            ->with('video')
            ->orderByDesc('viral_score')
            ->limit($limit)
            ->get();
    }

    /**
     * Breakout count and top score per search, for the "Your searches" rail.
     *
     * @param  Collection<int, int>  $searchIds
     * @return Collection<int, object{custom_keyword_search_id: int, breakouts: int, top_score: float}>
     */
    public function breakoutStatsBySearch(Collection $searchIds): Collection
    {
        return CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->selectRaw('custom_keyword_search_id, COUNT(*) as breakouts, MAX(viral_score) as top_score')
            ->where('is_new_breakout', true)
            ->groupBy('custom_keyword_search_id')
            ->get()
            ->keyBy('custom_keyword_search_id');
    }

    /**
     * A user's existing analyses for a set of videos, keyed by video id.
     *
     * @param  array<int, mixed>  $videoIds
     * @return Collection<int, VideoAnalysis>
     */
    public function analysesForUser(int $userId, array $videoIds): Collection
    {
        if ($videoIds === []) {
            return collect();
        }

        return VideoAnalysis::query()
            ->where('user_id', $userId)
            ->whereIn('viral_video_id', $videoIds)
            ->get()
            ->keyBy('viral_video_id');
    }

    /**
     * @param  array<int, mixed>  $ids
     * @return Collection<int, ViralVideo>
     */
    public function visibleVideosByIds(array $ids): Collection
    {
        if ($ids === []) {
            return collect();
        }

        return ViralVideo::query()->visible()->whereIn('id', $ids)->get();
    }

    /**
     * @return Collection<int, ViralVideo>
     */
    public function showcaseVideos(int $limit): Collection
    {
        return ViralVideo::query()
            ->visible()
            ->whereNotNull('content_hook')
            ->where('virality_score', '>', 3)
            ->orderByDesc('virality_score')
            ->limit($limit)
            ->get();
    }

    /**
     * Average views per search, for the brand/product hub cards. Only counts
     * videos with a still-live source asset.
     *
     * @param  Collection<int, int>  $searchIds
     * @return array<int, float>
     */
    public function averageViewsBySearchId(Collection $searchIds): array
    {
        return CustomKeywordSearchVideo::query()
            ->join('viral_videos', 'viral_videos.id', '=', 'custom_keyword_search_videos.viral_video_id')
            ->whereIn('custom_keyword_search_videos.custom_keyword_search_id', $searchIds)
            ->whereNull('viral_videos.archived_at')
            ->groupBy('custom_keyword_search_videos.custom_keyword_search_id')
            ->selectRaw('custom_keyword_search_videos.custom_keyword_search_id, AVG(viral_videos.views) as average_video_views')
            ->pluck('average_video_views', 'custom_keyword_search_videos.custom_keyword_search_id')
            ->all();
    }

    /**
     * Top breakout videos across a set of searches, for the hub's "Moving
     * this week" panel.
     *
     * @param  Collection<int, int>  $searchIds
     * @return Collection<int, CustomKeywordSearchVideo>
     */
    public function movingThisWeekRows(Collection $searchIds, int $limit): Collection
    {
        return CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->whereHas('video', fn ($query) => $query->visible())
            ->with('video')
            ->orderByDesc('viral_score')
            ->limit($limit)
            ->get();
    }
}
