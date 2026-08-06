<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\ApifyTrigger;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\CustomKeywordSearchVideo;
use App\Models\ViralVideo;
use App\Services\Apify\ApifyClient;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

/**
 * Executes one scrape attempt end to end: start the Apify run, wait, import
 * what survives prescreen, attach the ranked top slice to the saved search.
 */
class SearchRunProcessor
{
    public function __construct(
        private readonly ApifyClient $apify,
        private readonly TikTokItemMapper $mapper,
        private readonly KeywordMatcher $matcher,
    ) {}

    public function process(CustomKeywordSearchRun $run): void
    {
        $search = $run->search;

        if ($search === null || $search->trashed()) {
            $this->failRun($run, 'Saved search no longer exists.');

            return;
        }

        if ($search->status === CustomKeywordSearch::STATUS_PAUSED) {
            $this->failRun($run, 'Saved search is paused.');

            return;
        }

        try {
            $this->run($search, $run);
        } catch (Throwable $e) {
            Log::error('Custom keyword search run failed.', [
                'search_id' => $search->id,
                'run_id' => $run->id,
                'error' => $e->getMessage(),
            ]);

            $this->failRun($run, $e->getMessage());
            $this->settleSearchAfterFailure($search);
        }
    }

    private function run(CustomKeywordSearch $search, CustomKeywordSearchRun $run): void
    {
        $taskId = (string) config('custom_keyword_search.scrape.task_id');

        if ($taskId === '' || ! $this->apify->isConfigured()) {
            throw new RuntimeException('Apify is not configured. Set APIFY_TOKEN and CUSTOM_KEYWORD_SEARCH_APIFY_TASK_ID.');
        }

        // Only the primary phrase goes to the scraper. Sending every keyword as
        // a remote filter is what starves these searches of results — the full
        // set is applied locally instead.
        $input = [
            'location' => config('custom_keyword_search.scrape.location', 'US'),
            'dateRange' => config('custom_keyword_search.scrape.date_range', 'ALL_TIME'),
            'sortType' => config('custom_keyword_search.scrape.sort_type', 'MOST_LIKED'),
            'maxItems' => (int) config('custom_keyword_search.scrape.max_items', 100),
            'keywords' => [$search->phrase],
        ];

        $trigger = ApifyTrigger::create([
            'source_type' => 'custom_keyword_search',
            'source_id' => (string) $search->id,
            'actor_id' => $taskId,
            'status' => 'queued',
            'request_source' => 'custom_keyword_search',
            'input' => $input,
            'search_keywords' => $search->keywords,
            'requested_by_user_id' => $search->user_id,
        ]);

        $started = $this->apify->startTaskRun($taskId, $input);
        $apifyRunId = (string) ($started['id'] ?? '');

        if ($apifyRunId === '') {
            throw new RuntimeException('Apify did not return a run id.');
        }

        $trigger->update([
            'apify_run_id' => $apifyRunId,
            'dataset_id' => $started['defaultDatasetId'] ?? null,
            'status' => (string) ($started['status'] ?? 'RUNNING'),
            'started_at' => now(),
        ]);

        $run->update([
            'status' => CustomKeywordSearchRun::STATUS_RUNNING,
            'apify_trigger_id' => $trigger->id,
            'apify_run_id' => $apifyRunId,
            'started_at' => now(),
        ]);

        $search->update([
            'status' => CustomKeywordSearch::STATUS_SCRAPING,
            'last_run_at' => now(),
        ]);

        $finished = $this->apify->waitForRun($apifyRunId);
        $finalStatus = (string) ($finished['status'] ?? 'FAILED');

        $trigger->update([
            'status' => $finalStatus,
            'dataset_id' => $finished['defaultDatasetId'] ?? $trigger->dataset_id,
            'finished_at' => now(),
            'compute_units' => $finished['stats']['computeUnits'] ?? null,
            'usage_total_usd' => $finished['usageTotalUsd'] ?? null,
        ]);

        if ($finalStatus !== 'SUCCEEDED') {
            throw new RuntimeException("Apify run finished with status {$finalStatus}.");
        }

        $datasetId = (string) ($finished['defaultDatasetId'] ?? $trigger->dataset_id ?? '');

        if ($datasetId === '') {
            throw new RuntimeException('Apify run succeeded but returned no dataset.');
        }

        $rawItems = $this->apify->getDatasetItems($datasetId);

        $mapped = [];
        $invalidItems = 0;
        foreach ($rawItems as $rawItem) {
            if (! is_array($rawItem)) {
                $invalidItems++;
                continue;
            }

            $item = $this->mapper->map($rawItem);

            if ($item !== null) {
                $mapped[$item['video_id']] = $item;
            }
        }

        ['kept' => $kept, 'summary' => $summary] = $this->matcher->prescreen(
            array_values($mapped),
            $search->phrase,
            $search->keywords ?? []
        );

        $summary['received'] += $invalidItems;
        $summary['invalid_item'] += $invalidItems;

        $ranked = $this->matcher->rank($kept);
        $top = array_slice($ranked, 0, (int) config('custom_keyword_search.limits.max_results', 100));

        $attached = $this->persist($search, $run, $trigger, $top);

        $trigger->update([
            'item_count' => count($rawItems),
            'result_count' => count($kept),
            'imported_count' => $attached,
            'filter_summary' => $summary,
        ]);

        $run->update([
            'status' => CustomKeywordSearchRun::STATUS_DONE,
            'completed_at' => now(),
            'raw_summary' => $summary + [
                'apify_run_id' => $apifyRunId,
                'dataset_id' => $datasetId,
                'attached' => $attached,
            ],
        ]);

        $search->update([
            'status' => CustomKeywordSearch::STATUS_DONE,
            'last_run_at' => now(),
            'next_run_at' => $this->nextRunAt($search->frequency),
        ]);
    }

    /**
     * Upserts canonical videos, then attaches them to the search. Videos that
     * survive a later run keep their row and get a fresh rank and score.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    private function persist(
        CustomKeywordSearch $search,
        CustomKeywordSearchRun $run,
        ApifyTrigger $trigger,
        array $items,
    ): int {
        if ($items === []) {
            return 0;
        }

        return DB::transaction(function () use ($search, $run, $trigger, $items): int {
            $existingIds = $search->videos()->pluck('viral_video_id')->all();
            $existing = array_flip($existingIds);
            $rank = 0;
            $attached = 0;

            foreach ($items as $item) {
                if ((int) ($item['followers'] ?? 0) < (int) config('custom_keyword_search.matching.min_followers', 500)) {
                    continue;
                }

                $rank++;

                $video = ViralVideo::updateOrCreate(
                    ['video_id' => $item['video_id']],
                    [
                        'platform' => $item['platform'],
                        'title' => $item['title'],
                        'hashtags' => $item['hashtags'],
                        'username' => $item['username'],
                        'name' => $item['name'],
                        'avatar' => $item['avatar'],
                        'followers' => $item['followers'],
                        'views' => $item['views'],
                        'likes' => $item['likes'],
                        'comments' => $item['comments'],
                        'shares' => $item['shares'],
                        'bookmarks' => $item['bookmarks'],
                        'duration' => $item['duration'],
                        'cover' => $item['cover'],
                        'thumbnail_url' => $item['thumbnail_url'],
                        'video_url' => $item['video_url'],
                        'post_url' => $item['post_url'],
                        'embed_url' => $item['embed_url'],
                        'song' => $item['song'],
                        'artist' => $item['artist'],
                        'uploaded_at' => $item['uploaded_at'],
                        'virality_score' => $item['virality_score'],
                        'scrape_source' => 'apify',
                        'raw_payload' => $item['raw_payload'],
                        'apify_trigger_id' => $trigger->id,
                    ]
                );

                CustomKeywordSearchVideo::updateOrCreate(
                    [
                        'custom_keyword_search_id' => $search->id,
                        'viral_video_id' => $video->id,
                    ],
                    [
                        'custom_keyword_search_run_id' => $run->id,
                        'source' => CustomKeywordSearchVideo::SOURCE_EXTERNAL_SCRAPE,
                        'viral_score' => $item['virality_score'],
                        'rank' => $rank,
                        // Only flag a breakout when the search already had
                        // results — everything is "new" on the first run.
                        'is_new_breakout' => $existingIds !== [] && ! isset($existing[$video->id]),
                    ]
                );

                $attached++;
            }

            return $attached;
        });
    }

    private function failRun(CustomKeywordSearchRun $run, string $message): void
    {
        $run->update([
            'status' => CustomKeywordSearchRun::STATUS_FAILED,
            'completed_at' => now(),
            'error_message' => mb_substr($message, 0, 2000),
        ]);
    }

    /**
     * A failed refresh should not blank out a search that already has results —
     * the run is marked failed, but the search stays usable.
     */
    private function settleSearchAfterFailure(CustomKeywordSearch $search): void
    {
        $hasResults = $search->videos()->exists();

        $search->update([
            'status' => $hasResults ? CustomKeywordSearch::STATUS_DONE : CustomKeywordSearch::STATUS_FAILED,
            'next_run_at' => $this->nextRunAt($search->frequency),
        ]);
    }

    public function nextRunAt(string $frequency): Carbon
    {
        $timezone = (string) config('custom_keyword_search.schedule.timezone', 'America/New_York');
        [$hour, $minute] = array_pad(
            explode(':', (string) config('custom_keyword_search.schedule.time', '19:00')),
            2,
            '0'
        );

        $next = now($timezone)->setTime((int) $hour, (int) $minute, 0);

        $next = $frequency === CustomKeywordSearch::FREQUENCY_MONTHLY
            ? $next->addMonthNoOverflow()
            : $next->addWeek();

        return $next->utc();
    }
}
