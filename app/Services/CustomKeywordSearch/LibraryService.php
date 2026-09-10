<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Repositories\CustomKeywordSearch\FeedRepository;
use App\Repositories\CustomKeywordSearch\LibraryRepository;

/**
 * Data for the Library hub's "Saved videos" and analysis-history tabs.
 */
class LibraryService
{
    public function __construct(
        private readonly LibraryRepository $repository,
        private readonly FeedRepository $feedRepository,
    ) {}

    /**
     * Analysis history belongs to the Library hub and is intentionally a flat
     * log so users can quickly jump back into finished or in-flight analyses.
     *
     * @return array<int, array<string, mixed>>
     */
    public function analysisHistory(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        $analyses = $this->repository->analysesForUser($user->id);

        if ($analyses->isEmpty()) {
            return [];
        }

        $videoIds = $analyses
            ->pluck('viral_video_id')
            ->filter()
            ->unique()
            ->values();

        $searchLinks = $this->repository->searchLinksForVideos($videoIds);

        return $analyses
            ->map(function (VideoAnalysis $analysis) use ($searchLinks): ?array {
                $video = $analysis->viralVideo;

                if ($video === null) {
                    return null;
                }

                $links = $searchLinks->get($analysis->viral_video_id, collect());
                $searches = $links
                    ->map(fn (CustomKeywordSearchVideo $row) => $row->search)
                    ->filter()
                    ->unique('id')
                    ->values();
                $primarySearch = $searches->first();

                return [
                    'id' => $analysis->id,
                    'status' => $analysis->status,
                    'analyzed_at' => $analysis->analyzed_at?->toIso8601String(),
                    'updated_at' => $analysis->updated_at?->toIso8601String(),
                    'counts_toward_quota' => (bool) $analysis->counts_toward_quota,
                    'error_message' => $analysis->error_message,
                    'video' => $video->toCardArray(),
                    'analysis_url' => '/videos/'.$video->id.'/analysis',
                    'searches' => $searches
                        ->map(fn (CustomKeywordSearch $search): array => [
                            'id' => $search->id,
                            'name' => $search->name,
                            'url' => $search->url(),
                        ])
                        ->all(),
                    'search_name' => $primarySearch?->name,
                    'search_url' => $primarySearch?->url(),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    public function analysisHistoryCount(?User $user): int
    {
        return $user === null ? 0 : $this->repository->analysisCountForUser($user->id);
    }

    /**
     * @param  array<int, mixed>  $videoIds
     * @return array<int, array<string, mixed>>
     */
    public function bookmarkedVideos(array $videoIds): array
    {
        if ($videoIds === []) {
            return [];
        }

        return $this->feedRepository->visibleVideosByIds($videoIds)
            ->map(fn ($video): array => $video->toCardArray())
            ->all();
    }
}
