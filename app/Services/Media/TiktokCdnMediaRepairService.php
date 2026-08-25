<?php

namespace App\Services\Media;

use App\Models\ApifyTrigger;
use App\Models\ViralVideo;
use App\Services\Apify\ApifyClient;
use App\Services\Apify\ApifyConnectionException;
use App\Services\CustomKeywordSearch\KeywordMatcher;
use App\Services\CustomKeywordSearch\TikTokItemMapper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use RuntimeException;

class TiktokCdnMediaRepairService
{
    public function __construct(
        private readonly ApifyClient $apify,
        private readonly TikTokItemMapper $mapper,
        private readonly MediaArchiver $archiver,
        private readonly KeywordMatcher $matcher,
    ) {}

    public function affectedQuery(): Builder
    {
        return ViralVideo::query()->where(function (Builder $query): void {
            foreach ($this->mediaFields() as $field) {
                $query->orWhere($field, 'like', '%tiktokcdn%');
            }
        });
    }

    /**
     * @return array{affected_records: int, per_field: array<string, int>}
     */
    public function summarizeAffected(): array
    {
        $query = $this->affectedQuery();

        $perField = [];

        foreach ($this->mediaFields() as $field) {
            $perField[$field] = (clone $query)
                ->where($field, 'like', '%tiktokcdn%')
                ->count();
        }

        return [
            'affected_records' => (clone $query)->count(),
            'per_field' => $perField,
        ];
    }

    /**
     * @return list<string>
     */
    public function selectAffectedVideoIds(
        int $limit = 100,
        int $chunkBy = 25,
        ?int $batchCount = null,
    ): array {
        $summary = $this->summarizeAffected();
        $limit = max(1, $limit);
        $chunkBy = max(1, $chunkBy);
        $maxChunks = $batchCount === null ? null : max(1, $batchCount);
        $selectedRecords = min(
            $summary['affected_records'],
            $limit,
            $maxChunks === null ? $limit : $chunkBy * $maxChunks,
        );

        if ($selectedRecords <= 0) {
            return [];
        }

        return $this->affectedQuery()
            ->orderBy('id')
            ->limit($selectedRecords)
            ->pluck('id')
            ->map(static fn ($id): string => (string) $id)
            ->all();
    }

    /**
     * @return array{
     *   affected_records: int,
     *   selected_records: int,
     *   processed: int,
     *   updated_records: int,
     *   skipped: int,
     *   failed: int,
     *   chunks_processed: int,
     *   field_updates: array<string, int>,
     *   failures: array<int, array<string, mixed>>
     * }
     */
    public function repair(
        bool $dryRun = false,
        int $limit = 100,
        int $chunkBy = 25,
        ?int $batchCount = null,
        ?callable $progress = null,
    ): array
    {
        $summary = $this->summarizeAffected();
        $limit = max(1, $limit);
        $chunkBy = max(1, $chunkBy);
        $maxChunks = $batchCount === null ? null : max(1, $batchCount);
        $selectedRecords = min(
            $summary['affected_records'],
            $limit,
            $maxChunks === null ? $limit : $chunkBy * $maxChunks,
        );

        $result = [
            'affected_records' => $summary['affected_records'],
            'selected_records' => $selectedRecords,
            'processed' => 0,
            'updated_records' => 0,
            'skipped' => 0,
            'failed' => 0,
            'chunks_processed' => 0,
            'field_updates' => [
                'avatar' => 0,
                'cover' => 0,
                'thumbnail_url' => 0,
                'followers' => 0,
                'views' => 0,
                'likes' => 0,
                'bookmarks' => 0,
                'comments' => 0,
                'shares' => 0,
                'virality_score' => 0,
            ],
            'failures' => [],
        ];

        if ($selectedRecords === 0) {
            return $result;
        }

        $remaining = $selectedRecords;
        $lastId = null;

        while ($remaining > 0 && ($maxChunks === null || $result['chunks_processed'] < $maxChunks)) {
            $fetch = min($chunkBy, $remaining);

            $query = $this->affectedQuery()
                ->orderBy('id')
                ->limit($fetch);

            if ($lastId !== null) {
                $query->where('id', '>', $lastId);
            }

            /** @var Collection<int, ViralVideo> $videos */
            $videos = $query->get();

            if ($videos->isEmpty()) {
                break;
            }

            $result['chunks_processed']++;

            foreach ($videos as $video) {
                $result['processed']++;

                try {
                    $outcome = $this->repairVideo($video, $dryRun);
                } catch (\Throwable $e) {
                    $result['failed']++;
                    $result['failures'][] = [
                        'viral_video_id' => $video->id,
                        'video_id' => $video->video_id,
                        'message' => $e->getMessage(),
                    ];

                    $progress && $progress($video, 'failed', ['message' => $e->getMessage()]);

                    continue;
                }

                foreach ($outcome['field_updates'] as $field => $count) {
                    $result['field_updates'][$field] += $count;
                }

                if ($outcome['status'] === 'updated') {
                    $result['updated_records']++;
                } elseif ($outcome['status'] === 'skipped') {
                    $result['skipped']++;
                }

                $progress && $progress($video, $outcome['status'], $outcome);
            }

            $lastId = $videos->last()?->id;
            $remaining -= $videos->count();
        }

        return $result;
    }

    /**
     * @return array{
     *   status: 'updated'|'skipped',
     *   field_updates: array<string, int>,
     *   changed_fields: array<int, string>,
     *   source_url: string
     * }
     */
    public function repairVideo(ViralVideo $video, bool $dryRun = false): array
    {
        $sourceUrl = $this->sourceUrlFor($video);

        if ($sourceUrl === null) {
            return [
                'status' => 'skipped',
                'field_updates' => $this->emptyFieldUpdates(),
                'changed_fields' => [],
                'source_url' => '',
            ];
        }

        if (! $this->shouldRefreshFromApify($video)) {
            return [
                'status' => 'skipped',
                'field_updates' => $this->emptyFieldUpdates(),
                'changed_fields' => [],
                'source_url' => $sourceUrl,
            ];
        }

        $trigger = $this->startRefreshTrigger($video, $sourceUrl);

        try {
            $mapped = $this->fetchMappedPayload($trigger, $sourceUrl);
        } catch (ApifyConnectionException $e) {
            $trigger->update([
                'status' => 'FAILED',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);

            throw $e;
        } catch (\Throwable $e) {
            $trigger->update([
                'status' => 'FAILED',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);

            throw $e;
        }

        $candidate = $this->candidateAttributes($video, $mapped, $trigger->id);

        if (! $dryRun) {
            $report = $this->archiver->archiveWithReport([
                'video_id' => $video->video_id,
                'created_at' => $video->created_at,
                'apify_trigger_id' => $trigger->id,
                'cover' => $candidate['cover'],
                'thumbnail_url' => $candidate['thumbnail_url'],
                'avatar' => $candidate['avatar'],
            ]);

            $candidate['cover'] = $report['attributes']['cover'];
            $candidate['thumbnail_url'] = $report['attributes']['thumbnail_url'];
            $candidate['avatar'] = $report['attributes']['avatar'];
        }

        $fieldUpdates = $this->countFieldUpdates($video, $candidate);
        $changedFields = array_keys(array_filter($fieldUpdates));

        if ($changedFields === []) {
            return [
                'status' => 'skipped',
                'field_updates' => $fieldUpdates,
                'changed_fields' => [],
                'source_url' => $sourceUrl,
            ];
        }

        if (! $dryRun) {
            $video->forceFill($candidate)->save();
        }

        return [
            'status' => 'updated',
            'field_updates' => $fieldUpdates,
            'changed_fields' => $changedFields,
            'source_url' => $sourceUrl,
        ];
    }

    /**
     * @return array{
     *   status: 'updated'|'skipped'|'failed',
     *   field_updates: array<string, int>,
     *   changed_fields: array<int, string>,
     *   source_url: string,
     *   video_id: string,
     *   viral_video_id: string,
     *   message?: string
     * }
     */
    public function repairVideoById(string $viralVideoId, bool $dryRun = false): array
    {
        /** @var ViralVideo|null $video */
        $video = ViralVideo::query()->find($viralVideoId);

        if ($video === null) {
            return [
                'status' => 'failed',
                'field_updates' => $this->emptyFieldUpdates(),
                'changed_fields' => [],
                'source_url' => '',
                'video_id' => '',
                'viral_video_id' => $viralVideoId,
                'message' => 'Viral video record could not be found.',
            ];
        }

        try {
            $result = $this->repairVideo($video, $dryRun);

            return array_merge($result, [
                'video_id' => (string) $video->video_id,
                'viral_video_id' => (string) $video->id,
            ]);
        } catch (\Throwable $e) {
            return [
                'status' => 'failed',
                'field_updates' => $this->emptyFieldUpdates(),
                'changed_fields' => [],
                'source_url' => '',
                'video_id' => (string) $video->video_id,
                'viral_video_id' => (string) $video->id,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * @return array<string, int>
     */
    private function emptyFieldUpdates(): array
    {
        return [
            'avatar' => 0,
            'cover' => 0,
            'thumbnail_url' => 0,
            'followers' => 0,
            'views' => 0,
            'likes' => 0,
            'bookmarks' => 0,
            'comments' => 0,
            'shares' => 0,
            'virality_score' => 0,
        ];
    }

    /**
     * @return list<string>
     */
    private function mediaFields(): array
    {
        return ['avatar', 'cover', 'thumbnail_url'];
    }

    private function sourceUrlFor(ViralVideo $video): ?string
    {
        $postUrl = trim((string) $video->post_url);

        if ($postUrl !== '') {
            return $postUrl;
        }

        $username = ltrim(trim((string) $video->username), '@');
        $videoId = trim((string) $video->video_id);

        if ($username === '' || $videoId === '') {
            return null;
        }

        return "https://www.tiktok.com/@{$username}/video/{$videoId}";
    }

    private function startRefreshTrigger(ViralVideo $video, string $sourceUrl): ApifyTrigger
    {
        $input = array_merge(
            (array) config('viral_video_analysis.apify.input', []),
            ['startUrls' => [$sourceUrl]]
        );

        $taskId = trim((string) config('viral_video_analysis.apify.task_id'));

        if ($taskId === '' || ! $this->apify->isConfigured()) {
            throw new RuntimeException('Apify is not configured for viral video refresh.');
        }

        $trigger = ApifyTrigger::query()->create([
            'source_type' => 'media_repair',
            'source_id' => (string) $video->id,
            'actor_id' => $taskId,
            'status' => 'queued',
            'request_source' => 'media_repair',
            'input' => $input,
        ]);

        $started = $this->apify->startTaskRun($taskId, $input);

        $trigger->update([
            'apify_run_id' => $started['id'] ?? null,
            'dataset_id' => $started['defaultDatasetId'] ?? null,
            'status' => (string) ($started['status'] ?? 'RUNNING'),
            'started_at' => now(),
        ]);

        return $trigger;
    }

    /**
     * @return array<string, mixed>
     */
    private function fetchMappedPayload(ApifyTrigger $trigger, string $sourceUrl): array
    {
        $finished = $this->apify->waitForRun((string) $trigger->apify_run_id);
        $finalStatus = (string) ($finished['status'] ?? 'FAILED');

        $trigger->update([
            'status' => $finalStatus,
            'dataset_id' => $finished['defaultDatasetId'] ?? $trigger->dataset_id,
            'finished_at' => now(),
            'compute_units' => $finished['stats']['computeUnits'] ?? null,
            'usage_total_usd' => $finished['usageTotalUsd'] ?? null,
        ]);

        if ($finalStatus !== 'SUCCEEDED') {
            throw new RuntimeException("Apify run finished with status {$finalStatus} for {$sourceUrl}.");
        }

        $datasetId = (string) ($finished['defaultDatasetId'] ?? $trigger->dataset_id ?? '');

        if ($datasetId === '') {
            throw new RuntimeException('Apify run succeeded but returned no dataset.');
        }

        $items = $this->apify->getDatasetItems($datasetId, 20);

        foreach ($items as $item) {
            if (! is_array($item)) {
                continue;
            }

            $mapped = $this->mapper->map($item);

            if ($mapped !== null) {
                $mapped['raw_payload'] = $item;

                return $mapped;
            }
        }

        throw new RuntimeException("Apify returned no usable video payload for {$sourceUrl}.");
    }

    /**
     * @param  array<string, mixed>  $mapped
     * @return array<string, mixed>
     */
    private function candidateAttributes(ViralVideo $video, array $mapped, int $triggerId): array
    {
        return [
            'title' => $mapped['title'] ?: $video->title,
            'hashtags' => $mapped['hashtags'] ?: $video->hashtags,
            'username' => $mapped['username'] ?: $video->username,
            'name' => $mapped['name'] ?: $video->name,
            'avatar' => $mapped['avatar'] ?: $video->avatar,
            'followers' => $mapped['followers'] ?: $video->followers,
            'views' => $mapped['views'] ?: $video->views,
            'likes' => $mapped['likes'] ?: $video->likes,
            'comments' => $mapped['comments'] ?: $video->comments,
            'shares' => $mapped['shares'] ?: $video->shares,
            'bookmarks' => $mapped['bookmarks'] ?: $video->bookmarks,
            'duration' => $mapped['duration'] ?: $video->duration,
            'cover' => $mapped['cover'] ?: $video->cover,
            'thumbnail_url' => $mapped['thumbnail_url'] ?: $video->thumbnail_url,
            // Keep the existing video_url; this command is only for image media.
            'video_url' => $video->video_url,
            'post_url' => $mapped['post_url'] ?: $video->post_url,
            'embed_url' => $mapped['embed_url'] ?: $video->embed_url,
            'song_id' => $mapped['song_id'] ?: $video->song_id,
            'song' => $mapped['song'] ?: $video->song,
            'artist' => $mapped['artist'] ?: $video->artist,
            'song_cover_url' => $mapped['song_cover_url'] ?: $video->song_cover_url,
            'uploaded_at' => $mapped['uploaded_at'] ?: $video->uploaded_at,
            'virality_score' => $this->matcher->score([
                'followers' => $mapped['followers'] ?: $video->followers,
                'views' => $mapped['views'] ?: $video->views,
                'likes' => $mapped['likes'] ?: $video->likes,
                'comments' => $mapped['comments'] ?: $video->comments,
                'uploaded_at' => $mapped['uploaded_at'] ?: $video->uploaded_at,
            ]),
            'raw_payload' => $mapped['raw_payload'],
            'apify_trigger_id' => $triggerId,
        ];
    }

    /**
     * @param  array<string, mixed>  $candidate
     * @return array<string, int>
     */
    private function countFieldUpdates(ViralVideo $video, array $candidate): array
    {
        $fields = $this->emptyFieldUpdates();

        foreach (array_keys($fields) as $field) {
            if ($video->{$field} != $candidate[$field]) {
                $fields[$field] = 1;
            }
        }

        return $fields;
    }

    private function shouldRefreshFromApify(ViralVideo $video): bool
    {
        if ($video->created_at === null) {
            return true;
        }

        return $video->created_at->lte(now()->subHours(23));
    }
}
