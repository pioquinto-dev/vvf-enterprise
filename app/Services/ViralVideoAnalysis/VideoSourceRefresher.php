<?php

namespace App\Services\ViralVideoAnalysis;

use App\Models\ApifyTrigger;
use App\Models\ViralVideo;
use App\Services\Apify\ApifyClient;
use App\Services\CustomKeywordSearch\TikTokItemMapper;
use RuntimeException;

class VideoSourceRefresher
{
    public function __construct(
        private readonly ApifyClient $apify,
        private readonly TikTokItemMapper $mapper,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function refresh(ViralVideo $video): array
    {
        $postUrl = trim((string) $video->post_url);

        if ($postUrl === '') {
            throw new RuntimeException('Video is missing a post URL for preparation.');
        }

        $input = array_merge(
            (array) config('viral_video_analysis.apify.input', []),
            ['startUrls' => [$postUrl]]
        );

        $shouldRefreshStats = $video->updated_at === null
            || $video->updated_at->lte(now()->subHours((int) config('viral_video_analysis.apify.refresh_after_hours', 24)));

        $trigger = ApifyTrigger::query()->create([
            'source_type' => 'viral_video_analysis',
            'source_id' => (string) $video->id,
            'actor_id' => $shouldRefreshStats
                ? (string) config('viral_video_analysis.apify.task_id')
                : (string) config('viral_video_analysis.apify.actor_id', ''),
            'status' => 'queued',
            'request_source' => 'viral_video_analysis',
            'input' => $input,
        ]);

        $started = $shouldRefreshStats
            ? $this->apify->startTaskRun((string) config('viral_video_analysis.apify.task_id'), $input)
            : $this->startActorRun($input);

        $trigger->update([
            'apify_run_id' => $started['id'] ?? null,
            'dataset_id' => $started['defaultDatasetId'] ?? null,
            'status' => (string) ($started['status'] ?? 'RUNNING'),
            'started_at' => now(),
        ]);

        $finished = $this->apify->waitForRun((string) ($started['id'] ?? ''));
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

        $items = $this->apify->getDatasetItems($datasetId, 1);
        $first = $items[0] ?? null;

        if (! is_array($first)) {
            throw new RuntimeException('Apify returned no usable video payload.');
        }

        $mapped = $this->mapper->map($first);

        if ($mapped !== null) {
            $video->forceFill([
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
                'video_url' => $mapped['video_url'] ?: $video->video_url,
                'post_url' => $mapped['post_url'] ?: $video->post_url,
                'embed_url' => $mapped['embed_url'] ?: $video->embed_url,
                'song_id' => $mapped['song_id'] ?: $video->song_id,
                'song' => $mapped['song'] ?: $video->song,
                'artist' => $mapped['artist'] ?: $video->artist,
                'song_cover_url' => $mapped['song_cover_url'] ?: $video->song_cover_url,
                'uploaded_at' => $mapped['uploaded_at'] ?: $video->uploaded_at,
                'raw_payload' => $first,
                'apify_trigger_id' => $trigger->id,
            ])->save();
        } else {
            $video->forceFill([
                'raw_payload' => $first,
                'apify_trigger_id' => $trigger->id,
            ])->save();
        }

        return $first;
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    private function startActorRun(array $input): array
    {
        $actorId = trim((string) config('viral_video_analysis.apify.actor_id', ''));

        if ($actorId === '') {
            return $this->apify->startTaskRun((string) config('viral_video_analysis.apify.task_id'), $input);
        }

        return $this->apify->startActorRun($actorId, $input);
    }
}
