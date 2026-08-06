<?php

namespace App\Services\CustomKeywordSearch;

use Carbon\CarbonImmutable;
use Illuminate\Support\Arr;

/**
 * Apify TikTok actors do not agree on field names, and the same task can change
 * shape between actor versions. Rather than bind to one schema, every field is
 * read through a list of candidate paths and the first usable value wins.
 */
class TikTokItemMapper
{
    private const PATHS = [
        'video_id' => ['id', 'videoId', 'video_id', 'awemeId', 'aweme_id', 'itemId'],
        'title' => ['text', 'desc', 'title', 'description', 'caption'],
        'username' => ['channel.username', 'authorMeta.name', 'author.uniqueId', 'authorUniqueId', 'author.nickname', 'username', 'creator.uniqueId'],
        'name' => ['channel.name', 'authorMeta.nickName', 'authorMeta.nickname', 'author.nickname', 'authorName', 'creator.nickname'],
        'avatar' => ['channel.avatar', 'authorMeta.avatar', 'author.avatarThumb', 'authorAvatar', 'creator.avatar'],
        'followers' => ['channel.followers', 'authorMeta.fans', 'authorStats.followerCount', 'author.followerCount', 'authorFollowers', 'creator.followers', 'followers'],
        'views' => ['playCount', 'stats.playCount', 'videoMeta.playCount', 'views', 'play_count', 'viewCount'],
        'likes' => ['diggCount', 'stats.diggCount', 'likes', 'like_count', 'likeCount'],
        'comments' => ['commentCount', 'stats.commentCount', 'comments', 'comment_count'],
        'shares' => ['shareCount', 'stats.shareCount', 'shares', 'share_count'],
        'bookmarks' => ['collectCount', 'stats.collectCount', 'bookmarks', 'saveCount'],
        'duration' => ['videoMeta.duration', 'video.duration', 'duration'],
        'cover' => ['video.cover', 'video.thumbnail', 'videoMeta.coverUrl', 'covers.default', 'cover', 'thumbnail'],
        'thumbnail_url' => ['video.thumbnail', 'video.cover', 'videoMeta.originalCoverUrl', 'videoMeta.coverUrl', 'thumbnailUrl', 'thumbnail', 'covers.origin', 'cover'],
        'video_url' => ['video.url', 'videoUrl', 'mediaUrls.0', 'videoMeta.downloadAddr', 'video.playAddr', 'downloadAddr'],
        'post_url' => ['webVideoUrl', 'postPage', 'shareUrl', 'url', 'postUrl'],
        'song' => ['musicMeta.musicName', 'music.title', 'songTitle'],
        'artist' => ['musicMeta.musicAuthor', 'music.authorName', 'songAuthor'],
        'uploaded_at' => ['createTimeISO', 'createTime', 'create_time', 'uploadedAt', 'createdAt', 'uploaded'],
    ];

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>|null  null when the item is unusable
     */
    public function map(array $item): ?array
    {
        $videoId = $this->firstString($item, self::PATHS['video_id']);
        $postUrl = $this->firstString($item, self::PATHS['post_url']);

        if ($videoId === null && $postUrl !== null) {
            // Fall back to the numeric id embedded in the share URL.
            preg_match('#/video/(\d+)#', $postUrl, $matches);
            $videoId = $matches[1] ?? null;
        }

        if ($videoId === null) {
            return null;
        }

        $username = ltrim((string) ($this->firstString($item, self::PATHS['username']) ?? ''), '@');

        return [
            'video_id' => $videoId,
            'platform' => 'tiktok',
            'title' => $this->firstString($item, self::PATHS['title']) ?? '',
            'hashtags' => $this->hashtags($item),
            'username' => $username !== '' ? $username : null,
            'name' => $this->firstString($item, self::PATHS['name']),
            'avatar' => $this->firstString($item, self::PATHS['avatar']),
            'followers' => $this->firstInt($item, self::PATHS['followers']),
            'views' => $this->firstInt($item, self::PATHS['views']),
            'likes' => $this->firstInt($item, self::PATHS['likes']),
            'comments' => $this->firstInt($item, self::PATHS['comments']),
            'shares' => $this->firstInt($item, self::PATHS['shares']),
            'bookmarks' => $this->firstInt($item, self::PATHS['bookmarks']),
            'duration' => (float) $this->firstInt($item, self::PATHS['duration']),
            'cover' => $this->firstString($item, self::PATHS['cover']),
            'thumbnail_url' => $this->firstString($item, self::PATHS['thumbnail_url']),
            'video_url' => $this->firstString($item, self::PATHS['video_url']),
            'post_url' => $postUrl ?? ($username !== '' ? "https://www.tiktok.com/@{$username}/video/{$videoId}" : null),
            'embed_url' => "https://www.tiktok.com/embed/v2/{$videoId}",
            'song' => $this->firstString($item, self::PATHS['song']),
            'artist' => $this->firstString($item, self::PATHS['artist']),
            'uploaded_at' => $this->uploadedAt($item),
            'raw_payload' => $item,
        ];
    }

    /**
     * Hashtags arrive as strings, as objects with a name, or only inside the
     * caption. All three are folded into a plain list of bare tags.
     *
     * @param  array<string, mixed>  $item
     * @return array<int, string>
     */
    private function hashtags(array $item): array
    {
        $tags = [];

        foreach (['hashtags', 'challenges', 'textExtra'] as $key) {
            $value = Arr::get($item, $key);

            if (! is_array($value)) {
                continue;
            }

            foreach ($value as $entry) {
                $tag = is_array($entry)
                    ? ($entry['name'] ?? $entry['title'] ?? $entry['hashtagName'] ?? null)
                    : $entry;

                if (is_string($tag) && trim($tag) !== '') {
                    $tags[] = ltrim(trim($tag), '#');
                }
            }
        }

        $caption = $this->firstString($item, self::PATHS['title']) ?? '';

        if (preg_match_all('/#([\p{L}\p{N}_]+)/u', $caption, $matches)) {
            foreach ($matches[1] as $tag) {
                $tags[] = $tag;
            }
        }

        $unique = [];

        foreach ($tags as $tag) {
            $unique[mb_strtolower($tag)] = $tag;
        }

        return array_values($unique);
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function uploadedAt(array $item): ?CarbonImmutable
    {
        $value = null;

        foreach (self::PATHS['uploaded_at'] as $path) {
            $candidate = Arr::get($item, $path);

            if ($candidate !== null && $candidate !== '') {
                $value = $candidate;
                break;
            }
        }

        if ($value === null) {
            return null;
        }

        if (is_numeric($value)) {
            $timestamp = (int) $value;

            // Some actors report milliseconds.
            if ($timestamp > 9_999_999_999) {
                $timestamp = (int) ($timestamp / 1000);
            }

            return $timestamp > 0 ? CarbonImmutable::createFromTimestampUTC($timestamp) : null;
        }

        try {
            return CarbonImmutable::parse((string) $value)->utc();
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * @param  array<string, mixed>  $item
     * @param  array<int, string>  $paths
     */
    private function firstString(array $item, array $paths): ?string
    {
        foreach ($paths as $path) {
            $value = Arr::get($item, $path);

            if (is_string($value) && trim($value) !== '') {
                return trim($value);
            }

            if (is_numeric($value)) {
                return (string) $value;
            }
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $item
     * @param  array<int, string>  $paths
     */
    private function firstInt(array $item, array $paths): int
    {
        foreach ($paths as $path) {
            $value = Arr::get($item, $path);

            if (is_numeric($value)) {
                return (int) $value;
            }
        }

        return 0;
    }
}
