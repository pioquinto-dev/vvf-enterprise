<?php

namespace App\Services\CustomKeywordSearch;

use App\Jobs\ArchiveViralVideoMedia;
use App\Jobs\EnrichSearchResults;
use App\Models\ApifyTrigger;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\CustomKeywordSearchVideo;
use App\Models\ViralVideo;
use App\Services\Apify\ApifyClient;
use App\Services\Billing\BillingService;
use App\Support\AppEventLogger;
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
        private readonly SnapshotRecorder $snapshots,
        private readonly LocalCorpusRecall $localCorpus,
        private readonly BillingService $billing,
    ) {}

    public function process(CustomKeywordSearchRun $run, bool $throwOnFailure = false): void
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
            AppEventLogger::error('search.run.failed', $e, [
                'search_id' => $search->id,
                'run_id' => $run->id,
                'search_type' => $search->search_type,
                'phrase' => $search->phrase,
            ]);

            Log::error('Custom keyword search run failed.', [
                'search_id' => $search->id,
                'run_id' => $run->id,
                'error' => $e->getMessage(),
            ]);

            if ($throwOnFailure) {
                throw $e;
            }

            $this->markFailed($run, $e->getMessage());
        }
    }

    public function markFailed(CustomKeywordSearchRun $run, string $message): void
    {
        $this->failRun($run, $message);

        if ($run->search !== null) {
            $this->settleSearchAfterFailure($run->search);
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

        AppEventLogger::result('search.run.started', [
            'search_id' => $search->id,
            'run_id' => $run->id,
            'search_type' => $search->search_type,
            'phrase' => $search->phrase,
            'keyword_count' => count($search->keywords ?? []),
            'apify_trigger_id' => $trigger->id,
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

        // Step 1: take the full Apify dataset and drop anything that fails the
        // normal matching gates.
        ['kept' => $apifyMatches, 'summary' => $summary] = $this->matcher->prescreen(
            array_values($mapped),
            $search->phrase,
            $search->keywords ?? []
        );

        // Step 2: pool in what the database already holds for this phrase. The
        // corpus has been paid for by earlier runs and sibling searches — a
        // video we already imported should not need Apify to resurface it.
        $localCandidates = $this->localCorpus->candidates($search);
        ['kept' => $localMatches, 'summary' => $localSummary] = $this->matcher->prescreen(
            array_values($localCandidates),
            $search->phrase,
            $search->keywords ?? []
        );

        // Step 3: combine both match sets. On a collision the Apify match wins:
        // its stats are minutes old, the stored row's are from whenever it was
        // last seen.
        $combined = [];

        foreach ($apifyMatches as $item) {
            $combined[$item['video_id']] = $item;
        }

        foreach ($localMatches as $item) {
            if (! isset($combined[$item['video_id']])) {
                $combined[$item['video_id']] = $item;
            }
        }

        $kept = array_values($combined);

        $summary['received'] += $invalidItems;
        $summary['invalid_item'] += $invalidItems;
        $summary['local_pool'] = count($localCandidates);
        $summary['kept_local'] = count($localMatches);
        $summary['kept'] = count($kept);
        $summary['kept_phrase'] += (int) ($localSummary['kept_phrase'] ?? 0);
        $summary['rescued_by_handle'] += (int) ($localSummary['rescued_by_handle'] ?? 0);
        $summary['rescued_by_supporting'] += (int) ($localSummary['rescued_by_supporting'] ?? 0);

        // Step 4: sort by the strongest winners first.
        $ranked = $this->matcher->rank($kept);
        $top = array_slice($ranked, 0, (int) config('custom_keyword_search.limits.max_results', 100));

        $summary['kept_apify'] = count($apifyMatches);

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
            'raw_summary' => ($run->raw_summary ?? []) + $summary + [
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

        AppEventLogger::result('search.run.completed', [
            'search_id' => $search->id,
            'run_id' => $run->id,
            'search_type' => $search->search_type,
            'phrase' => $search->phrase,
            'apify_trigger_id' => $trigger->id,
            'apify_run_id' => $apifyRunId,
            'dataset_id' => $datasetId,
            'received' => $summary['received'] ?? count($rawItems),
            'kept' => count($kept),
            'attached' => $attached,
            'local_pool' => $summary['local_pool'] ?? 0,
            'compute_units' => $finished['stats']['computeUnits'] ?? null,
            'usage_total_usd' => $finished['usageTotalUsd'] ?? null,
        ]);

        if ($this->reservedCredit($run) && $search->user !== null) {
            $this->billing->syncSubscriptionUsage($search->user);
        }

        // Everything past this point is enrichment. The scrape has already
        // succeeded and the user's results are live — a failure here must not
        // reopen a finished run.
        try {
            $this->snapshots->record($search->refresh(), $run);
        } catch (Throwable $e) {
            Log::warning('Snapshot recording failed.', ['search_id' => $search->id, 'error' => $e->getMessage()]);
        }

        try {
            EnrichSearchResults::dispatch($search->id)
                ->onQueue((string) config('custom_keyword_search.queue', 'default'));
        } catch (Throwable $e) {
            Log::warning('Enrichment dispatch failed.', ['search_id' => $search->id, 'error' => $e->getMessage()]);
        }
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

        $freshlyScraped = [];

        $attached = DB::transaction(function () use ($search, $run, $trigger, $items, &$freshlyScraped): int {
            $existingIds = $search->videos()->pluck('viral_video_id')->all();
            $existing = array_flip($existingIds);
            $rank = 0;
            $attached = 0;

            foreach ($items as $item) {
                if ((int) ($item['followers'] ?? 0) < (int) config('custom_keyword_search.matching.min_followers', 500)) {
                    continue;
                }

                $rank++;

                $isLocal = ($item['origin'] ?? null) === 'local';

                // A local candidate *is* the canonical row — rewriting it with
                // itself would only repoint apify_trigger_id at a run that
                // never scraped it. Only freshly scraped data updates canon.
                $video = $isLocal
                    ? ViralVideo::where('video_id', $item['video_id'])->first()
                    : ViralVideo::updateOrCreate(
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
                            'song_id' => $item['song_id'],
                            'song' => $item['song'],
                            'artist' => $item['artist'],
                            'song_cover_url' => $item['song_cover_url'],
                            'uploaded_at' => $item['uploaded_at'],
                            'virality_score' => $item['virality_score'],
                            'scrape_source' => 'apify',
                            'raw_payload' => $item['raw_payload'],
                            'apify_trigger_id' => $trigger->id,
                        ]
                    );

                if ($video === null) {
                    // The canonical row vanished between recall and persist.
                    $rank--;

                    continue;
                }

                if (! $isLocal) {
                    // Only freshly scraped rows carry new CDN URLs. A local
                    // match was archived when it was first imported.
                    $freshlyScraped[] = $video->id;
                }

                CustomKeywordSearchVideo::updateOrCreate(
                    [
                        'custom_keyword_search_id' => $search->id,
                        'viral_video_id' => $video->id,
                    ],
                    [
                        'custom_keyword_search_run_id' => $run->id,
                        'source' => $isLocal
                            ? CustomKeywordSearchVideo::SOURCE_LOCAL_MATCH
                            : CustomKeywordSearchVideo::SOURCE_EXTERNAL_SCRAPE,
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

        $this->queueMediaArchive($freshlyScraped);

        return $attached;
    }

    /**
     * Hands the freshly scraped rows to the archiver.
     *
     * Queued, never inline: the source URLs are already saved, so a slow or
     * broken bucket costs the run nothing. It is dispatched after the
     * transaction commits so the worker cannot race ahead of the rows it is
     * meant to read.
     *
     * Fresh imports use the strict single-row job so archiving starts
     * immediately after the Apify results land in `viral_videos`.
     *
     * @param  array<int, string>  $viralVideoIds
     */
    private function queueMediaArchive(array $viralVideoIds): void
    {
        if ($viralVideoIds === [] || ! config('viral_videos.media.enabled', false)) {
            return;
        }

        if (config('custom_keyword_search.skip_media_archive', true)) {
            return;
        }

        $queue = (string) config('viral_videos.media.queue', 'default');

        foreach (array_unique($viralVideoIds) as $viralVideoId) {
            ArchiveViralVideoMedia::dispatch($viralVideoId)->onQueue($queue);
        }
    }

    private function failRun(CustomKeywordSearchRun $run, string $message): void
    {
        AppEventLogger::error('search.run.marked_failed', $message, [
            'run_id' => $run->id,
            'search_id' => $run->search?->id,
        ]);

        $run->update([
            'status' => CustomKeywordSearchRun::STATUS_FAILED,
            'completed_at' => now(),
            'error_message' => mb_substr($message, 0, 2000),
        ]);

        $search = $run->search;

        if ($this->reservedCredit($run) && $search?->user !== null) {
            $this->billing->refundSearchCredit($search->user);
        }
    }

    private function reservedCredit(CustomKeywordSearchRun $run): bool
    {
        return (bool) data_get($run->raw_summary, 'credit_reserved', false);
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
