<?php

namespace App\Repositories\CustomKeywordSearch;

use App\Models\CustomKeywordSearchVideo;
use App\Models\VideoAnalysis;
use Illuminate\Support\Collection;

/**
 * Query surface for the Library hub's analysis-history tab.
 */
class LibraryRepository
{
    /**
     * @return Collection<int, VideoAnalysis>
     */
    public function analysesForUser(int $userId): Collection
    {
        return VideoAnalysis::query()
            ->where('user_id', $userId)
            ->whereNotNull('viral_video_id')
            ->with(['viralVideo' => fn ($query) => $query->visible()])
            ->latest('updated_at')
            ->get();
    }

    public function analysisCountForUser(int $userId): int
    {
        return VideoAnalysis::query()
            ->where('user_id', $userId)
            ->whereNotNull('viral_video_id')
            ->count();
    }

    /**
     * The saved-search rows that surfaced each of the given videos, newest
     * link first, grouped by video id.
     *
     * @param  Collection<int, mixed>  $videoIds
     * @return Collection<int, Collection<int, CustomKeywordSearchVideo>>
     */
    public function searchLinksForVideos(Collection $videoIds): Collection
    {
        return CustomKeywordSearchVideo::query()
            ->with('search')
            ->whereIn('viral_video_id', $videoIds)
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy('viral_video_id');
    }
}
