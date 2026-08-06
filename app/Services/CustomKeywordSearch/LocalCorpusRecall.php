<?php

namespace App\Services\CustomKeywordSearch;

use App\Models\CustomKeywordSearch;
use App\Models\ViralVideo;
use Carbon\CarbonImmutable;

/**
 * The corpus we already paid for. Every run of every search imports canonical
 * rows into `viral_videos`, so by the time a new search fires, videos matching
 * its phrase may already be sitting in the database — imported by a sibling
 * search, the TikTok Shop pipeline, or an earlier run of this very search.
 *
 * This pulls those candidates and hands them to the same prescreen the scrape
 * goes through. Nothing here relaxes matching: local candidates face the exact
 * same gates, they just get the chance to face them.
 *
 * The SQL prefilter is deliberately broad-but-indexed-cheap (LIKE on title and
 * creator identity). Precision is the matcher's job; this only has to avoid
 * shipping the whole table into PHP.
 */
class LocalCorpusRecall
{
    public function __construct(private readonly KeywordNormalizer $normalizer) {}

    /**
     * Candidate rows shaped like mapped scrape items, keyed by video_id.
     *
     * @return array<string, array<string, mixed>>
     */
    public function candidates(CustomKeywordSearch $search): array
    {
        $limit = max(0, (int) config('custom_keyword_search.matching.local_pool_limit', 400));

        if ($limit === 0) {
            return [];
        }

        $phrase = trim($search->phrase);
        $compact = $this->normalizer->compact($phrase);

        if ($phrase === '') {
            return [];
        }

        $query = ViralVideo::query()
            ->where('platform', 'tiktok')
            ->where('video_status', 'visible')
            ->where(function ($outer) use ($phrase, $compact): void {
                $outer->where('title', 'like', '%'.$this->escapeLike($phrase).'%');

                // Multi-word phrases also live in captions as one hashtag word
                // ("korean skincare" → #koreanskincare), and brands live in
                // their own handle.
                if ($compact !== '' && mb_strlen($compact) >= 4) {
                    $outer->orWhere('title', 'like', '%'.$this->escapeLike($compact).'%')
                        ->orWhere('username', 'like', '%'.$this->escapeLike($compact).'%')
                        ->orWhere('name', 'like', '%'.$this->escapeLike($compact).'%');
                }
            })
            ->orderByDesc('virality_score')
            ->limit($limit);

        $candidates = [];

        foreach ($query->get() as $video) {
            $candidates[$video->video_id] = $this->toItem($video);
        }

        return $candidates;
    }

    /**
     * Reshape a canonical row into the array shape TikTokItemMapper produces,
     * so the matcher cannot tell a local candidate from a scraped one.
     *
     * @return array<string, mixed>
     */
    private function toItem(ViralVideo $video): array
    {
        return [
            'video_id' => $video->video_id,
            'platform' => $video->platform,
            'title' => (string) $video->title,
            'hashtags' => $video->hashtags ?? [],
            'username' => $video->username,
            'name' => $video->name,
            'avatar' => $video->avatar,
            'followers' => $video->followers,
            'views' => $video->views,
            'likes' => $video->likes,
            'comments' => $video->comments,
            'shares' => $video->shares,
            'bookmarks' => $video->bookmarks,
            'duration' => (float) $video->duration,
            'cover' => $video->cover,
            'thumbnail_url' => $video->thumbnail_url,
            'video_url' => $video->video_url,
            'post_url' => $video->post_url,
            'embed_url' => $video->embed_url,
            'song' => $video->song,
            'artist' => $video->artist,
            'uploaded_at' => $video->uploaded_at !== null
                ? CarbonImmutable::instance($video->uploaded_at)
                : null,
            'raw_payload' => $video->raw_payload ?? [],
            // Read by persist(): local items attach to the search but never
            // rewrite the canonical row they came from.
            'origin' => 'local',
        ];
    }

    private function escapeLike(string $value): string
    {
        return addcslashes($value, '%_\\');
    }
}
