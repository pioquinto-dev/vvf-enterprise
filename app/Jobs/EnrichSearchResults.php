<?php

namespace App\Jobs;

use App\Http\Resources\SavedSearchPresenter;
use App\Models\CustomKeywordSearch;
use App\Models\ViralVideo;
use App\Support\AppEventLogger;
use App\Services\CustomKeywordSearch\SearchInsights;
use App\Services\CustomKeywordSearch\SearchSummaryWriter;
use App\Services\CustomKeywordSearch\VideoContentAnalyzer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;

/**
 * The AI pass, run after a scrape lands.
 *
 * Kept off the scrape job on purpose: a failure here must never mark a run as
 * failed. The scrape is the product; classification and the summary line are
 * decoration, and the page renders perfectly well without either.
 */
class EnrichSearchResults implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 300;

    public function __construct(public readonly int $searchId) {}

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping('cks-enrich:'.$this->searchId)];
    }

    public function handle(
        VideoContentAnalyzer $analyzer,
        SearchSummaryWriter $summaries,
        SearchInsights $insights,
    ): void {
        $search = CustomKeywordSearch::find($this->searchId);

        if ($search === null) {
            AppEventLogger::error('search_enrichment.search_missing', 'Search enrichment could not find the target search.', [
                'search_id' => $this->searchId,
            ]);

            return;
        }

        $results = SavedSearchPresenter::resultRows($search);

        if ($results === []) {
            AppEventLogger::result('search_enrichment.skipped', [
                'search_id' => $search->id,
                'reason' => 'no_results',
            ]);

            return;
        }

        AppEventLogger::result('search_enrichment.started', [
            'search_id' => $search->id,
            'result_count' => count($results),
        ]);

        try {
            $classified = $this->classifyTopVideos($search, $analyzer);

            AppEventLogger::result('search_enrichment.classification_completed', [
                'search_id' => $search->id,
                'classified_count' => $classified,
            ]);
        } catch (\Throwable $e) {
            AppEventLogger::error('search_enrichment.classification_failed', $e, [
                'search_id' => $search->id,
            ]);

            Log::warning('Content classification failed.', ['search_id' => $search->id, 'error' => $e->getMessage()]);
        }

        try {
            // Re-read so the summary can cite labels the pass just wrote.
            $summary = $summaries->generate($search, $this->facts($search, $insights));

            AppEventLogger::result('search_enrichment.summary_completed', [
                'search_id' => $search->id,
                'summary_generated' => filled($summary),
            ]);
        } catch (\Throwable $e) {
            AppEventLogger::error('search_enrichment.summary_failed', $e, [
                'search_id' => $search->id,
            ]);

            Log::warning('Summary generation failed.', ['search_id' => $search->id, 'error' => $e->getMessage()]);
        }

        AppEventLogger::result('search_enrichment.completed', [
            'search_id' => $search->id,
        ]);
    }

    /**
     * Only the top slice is classified. The page shows format, hook and angle
     * on the winner and nowhere else, so paying to label result 80 buys
     * nothing a user will ever see.
     */
    private function classifyTopVideos(CustomKeywordSearch $search, VideoContentAnalyzer $analyzer): int
    {
        $limit = (int) config('custom_keyword_search.analysis.top_videos', 10);

        $videoIds = $search->videos()
            ->orderBy('rank')
            ->limit($limit)
            ->pluck('viral_video_id');

        if ($videoIds->isEmpty()) {
            return 0;
        }

        return $analyzer->analyze(ViralVideo::whereIn('id', $videoIds)->get());
    }

    /**
     * Pre-computed figures for the summary writer. Everything the model is
     * allowed to say a number about appears in here first.
     *
     * @return array<string, mixed>
     */
    private function facts(CustomKeywordSearch $search, SearchInsights $insights): array
    {
        $results = SavedSearchPresenter::resultRows($search);

        // Built without the phrase on purpose: the summary never cites the
        // brand account, and passing it would spend a second OpenAI call
        // re-deciding something the detail page has already cached.
        $payload = $insights->build($insights->withMultiples($results));
        $top = $results[0] ?? [];

        return [
            'phrase' => $search->phrase,
            'videos_matched' => count($results),
            'median_views' => $payload['baseline']['median_views'],
            'outlier_count' => collect($payload['tiles'])->firstWhere('key', 'outliers')['value'] ?? null,
            'top_multiple' => collect($payload['tiles'])->firstWhere('key', 'top_multiple')['value'] ?? null,
            'avg_engagement_rate' => collect($payload['tiles'])->firstWhere('key', 'avg_engagement')['value'] ?? null,
            'top_video' => [
                'caption' => mb_substr((string) ($top['title'] ?? ''), 0, 160),
                'views' => $top['views'] ?? null,
                'handle' => $top['handle'] ?? null,
                'format' => $top['content_format'] ?? null,
                'angle' => $top['content_angle'] ?? null,
                'sound' => $top['sound_label'] ?? null,
            ],
            'top_hashtags' => collect($payload['hashtags'] ?? [])->take(3)->pluck('tag')->all(),
            'top_sounds' => collect($payload['sounds'] ?? [])->take(2)->pluck('label')->all(),
        ];
    }
}
