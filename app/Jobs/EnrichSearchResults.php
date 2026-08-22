<?php

namespace App\Jobs;

use App\Http\Resources\SavedSearchPresenter;
use App\Models\CustomKeywordSearch;
use App\Models\ViralVideo;
use App\Services\CustomKeywordSearch\SearchEnrichmentService;
use App\Services\CustomKeywordSearch\SearchInsights;
use App\Support\AppEventLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;

/**
 * The AI pass, run after a scrape lands.
 *
 * Kept off the scrape job on purpose: a failure here must never mark a run as
 * failed. The scrape is the product; analytical text is decoration, and the
 * page renders perfectly well without it.
 *
 * A single OpenAI call now covers what used to be two — bullet insights, the
 * per-video format/hook/angle + why-it-broke-out + replicate-with lines, and
 * the best-time-to-post sentence — via SearchEnrichmentService.
 */
class EnrichSearchResults implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 300;

    private const VIDEO_BUDGET = 8;

    public function __construct(public readonly int $searchId) {}

    /**
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new WithoutOverlapping('cks-enrich:'.$this->searchId)];
    }

    public function handle(
        SearchEnrichmentService $enrichment,
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
            // Pull the top-N ViralVideos (models) that the service will label.
            $topVideoIds = $search->videos()
                ->orderBy('rank')
                ->limit(self::VIDEO_BUDGET)
                ->pluck('viral_video_id');

            $topVideos = ViralVideo::whereIn('id', $topVideoIds)->get();

            $enrichment->enrich($search, $this->facts($search, $insights, $results), $topVideos);

            AppEventLogger::result('search_enrichment.completed', [
                'search_id' => $search->id,
            ]);
        } catch (\Throwable $e) {
            AppEventLogger::error('search_enrichment.exception', $e, [
                'search_id' => $search->id,
            ]);
            Log::warning('Search enrichment failed.', ['search_id' => $search->id, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Pre-computed figures + top hashtags/sounds + a posting heatmap best cell.
     * Everything the enrichment model is allowed to quote as a number must be
     * present in this payload.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, mixed>
     */
    private function facts(CustomKeywordSearch $search, SearchInsights $insights, array $results): array
    {
        $payload = $insights->build($insights->withMultiples($results), $search->phrase);
        $top = $results[0] ?? [];

        return [
            'phrase' => $search->phrase,
            'videos_matched' => count($results),
            'median_views' => data_get($payload, 'baseline.median_views'),
            'outlier_count' => collect($payload['tiles'] ?? [])->firstWhere('key', 'outliers')['value'] ?? null,
            'top_multiple' => collect($payload['tiles'] ?? [])->firstWhere('key', 'top_multiple')['value'] ?? null,
            'avg_engagement_rate' => collect($payload['tiles'] ?? [])->firstWhere('key', 'avg_engagement')['value'] ?? null,
            'top_video' => [
                'caption' => mb_substr((string) ($top['title'] ?? ''), 0, 160),
                'views' => $top['views'] ?? null,
                'handle' => $top['handle'] ?? null,
                'multiple' => $top['multiple'] ?? null,
                'sound' => $top['sound_label'] ?? null,
            ],
            'top_hashtags' => collect($payload['hashtags'] ?? [])->take(5)->pluck('tag')->all(),
            'top_sounds' => collect($payload['sounds'] ?? [])->take(3)->pluck('label')->all(),
            'posting_heatmap' => [
                'best' => $this->bestPostingCell($results),
            ],
        ];
    }

    /**
     * Given the outlier rows, return the day+hour cell with the most posts.
     * Deterministic, no OpenAI — the service is only asked to phrase the
     * finding, not compute it.
     *
     * @param  array<int, array<string, mixed>>  $results
     * @return array<string, mixed>|null
     */
    private function bestPostingCell(array $results): ?array
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $counts = [];

        foreach ($results as $row) {
            // Card rows consistently expose the canonical upload timestamp as
            // `uploaded_at`; the older aliases only exist on a few importers.
            $iso = $row['uploaded_at'] ?? $row['posted_at'] ?? $row['createdAt'] ?? $row['published_at'] ?? null;
            if (! $iso) continue;
            try {
                $d = new \DateTimeImmutable((string) $iso, new \DateTimeZone('UTC'));
            } catch (\Throwable) {
                continue;
            }

            $key = ((int) $d->format('w')).'|'.((int) $d->format('G'));
            $counts[$key] = ($counts[$key] ?? 0) + 1;
        }

        if ($counts === []) return null;

        arsort($counts);
        [$dayIdx, $hour] = array_map('intval', explode('|', (string) array_key_first($counts)));

        return [
            'day' => $days[$dayIdx] ?? null,
            'hour_24' => $hour,
            'hour_label' => $this->humanHour($hour).' UTC',
            'post_count' => reset($counts),
        ];
    }

    private function humanHour(int $h): string
    {
        if ($h === 0)  return '12 AM';
        if ($h === 12) return '12 PM';

        return $h < 12 ? "{$h} AM" : ($h - 12).' PM';
    }
}
