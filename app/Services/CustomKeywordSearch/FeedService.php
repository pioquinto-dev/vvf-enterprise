<?php

namespace App\Services\CustomKeywordSearch;

use App\Http\Resources\SavedSearchPresenter;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\ViralVideo;
use App\Repositories\CustomKeywordSearch\FeedRepository;
use App\Services\Bookmarks\BookmarkService;
use App\Services\IndexedKeywordService;
use App\Support\GuestIdentity;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Builds "My Feed" (the signed-in home) and the cold-visitor showcase used on
 * the running-search wait screen. Everything is derived from the caller's own
 * searches; accounts without any browse visible global videos instead.
 */
class FeedService
{
    /**
     * How many feed cards ship with the page. The stream shows a first batch
     * and reveals the rest on "Load more" without another request.
     */
    private const FEED_STREAM_LIMIT = 21;

    public function __construct(
        private readonly FeedRepository $repository,
        private readonly BookmarkService $bookmarks,
        private readonly FeedDiscoveryService $discovery,
        private readonly IndexedKeywordService $keywords,
    ) {}

    /**
     * "My Feed" — the signed-in home. Everything is derived from the user's
     * own searches: their strongest breakout videos, the sounds and hashtags
     * those breakouts lean on, and the videos they saved. Accounts without
     * searches browse visible global videos until they have their own
     * results.
     *
     * @return array<string, mixed>
     */
    public function payload(Request $request): array
    {
        $userId = $request->user()?->id;
        $guestToken = GuestIdentity::token($request);
        $searchIds = $this->repository->ownedSearchIds($userId, $guestToken);

        $discoveryPayload = $this->discovery->payload();
        $climbing = $discoveryPayload['climbingHashtags'] ?? [];
        $suggestions = $this->suggestionsForRequest($request);

        $empty = [
            'videos' => [],
            'totalCount' => 0,
            'searches' => [],
            'searchesCount' => 0,
            'hashtags' => [],
            'hashtagsCount' => 0,
            'climbing' => $climbing,
            'popularSearches' => $discoveryPayload['popularSearches'] ?? [],
            'suggestions' => $suggestions,
        ];

        // Nothing of their own yet (a free user who has not spent their search):
        // fill the feed with the best of what everyone else surfaced, so the
        // page shows the product working instead of an empty column.
        if ($searchIds->isEmpty()) {
            $videos = $this->globalFeedVideos($discoveryPayload['topVideoIds'] ?? []);

            return array_merge($empty, [
                'isDiscoveryFeed' => true,
                'videos' => $videos,
                'totalCount' => count($videos),
            ]);
        }

        // The breakout rows, search summary cards, and hashtags only change
        // when a search run completes (minutes-scale), so they're safe to
        // cache briefly. The key is derived from the owner's current search
        // ids, so creating/deleting a search naturally busts it — no manual
        // invalidation needed. Bookmark/analysis state is always read live
        // below, since those must reflect the user's last click immediately.
        $cacheKey = 'feed:content:'.($userId ?? "guest:{$guestToken}").':'.md5($searchIds->sort()->implode(','));

        $content = Cache::remember($cacheKey, 60, fn (): array => $this->buildCachedContent($searchIds));

        // The save and analyze buttons both need to open in the right state, so
        // the user's bookmarks and any existing analyses ride along with the
        // cards. Without the analysis, a video the user already analysed would
        // offer "Analyze video" again and re-prompt to spend a credit.
        $savedIds = array_flip(array_map('strval', $this->bookmarks->idsForUser($request->user())));
        $analyses = $userId === null ? collect() : $this->repository->analysesForUser($userId, array_column($content['videos'], 'id'));

        foreach ($content['videos'] as $index => $card) {
            $content['videos'][$index]['bookmarked'] = isset($savedIds[(string) $card['id']]);
            $content['videos'][$index]['analysis'] = $analyses->has($card['id'])
                ? SavedSearchPresenter::analysisPayload($analyses->get($card['id']))
                : null;
        }

        return array_merge($empty, $content);
    }

    /**
     * Real breakout videos featured as examples on the cold-free-user
     * "while you wait" screen (M4 / M4b). Top scorers from the corpus that
     * already carry content analysis, so the Hook / Format / Angle rows are
     * populated. One card per creator, capped at five, cached briefly since it
     * is identical for every visitor.
     *
     * @return array<int, array<string, mixed>>
     */
    public function showcase(): array
    {
        return Cache::remember('free_search_showcase_v1', 600, function (): array {
            $videos = $this->repository->showcaseVideos(24);

            $seen = [];
            $cards = [];

            foreach ($videos as $video) {
                $creator = strtolower((string) $video->username);

                if ($creator !== '' && isset($seen[$creator])) {
                    continue;
                }

                $seen[$creator] = true;
                $cards[] = $this->showcaseCard($video);

                if (count($cards) >= 5) {
                    break;
                }
            }

            return $cards;
        });
    }

    /**
     * @param  Collection<int, int>  $searchIds
     * @return array<string, mixed>
     */
    private function buildCachedContent(Collection $searchIds): array
    {
        $searchModels = $this->repository->searchesByIds($searchIds);
        $searchNames = $searchModels->pluck('name', 'id');
        $searchUrls = $searchModels->mapWithKeys(fn (CustomKeywordSearch $s): array => [$s->id => $s->url()]);
        $searchTypes = $searchModels->mapWithKeys(fn (CustomKeywordSearch $s): array => [
            $s->id => $s->search_type === CustomKeywordSearch::TYPE_PRODUCT ? 'product' : 'brand',
        ]);

        $rows = $this->repository->topBreakoutRows($searchIds, 80);

        $seen = [];
        $unique = [];
        foreach ($rows as $row) {
            $vid = $row->viral_video_id;
            if ($vid === null || isset($seen[$vid])) {
                continue;
            }
            $seen[$vid] = true;
            $unique[] = $row;
        }

        $totalBreakouts = count($unique);
        // The stream renders the first few and reveals the rest client-side, so
        // "Load more" costs no extra round trip.
        $videos = array_map(
            fn (CustomKeywordSearchVideo $row): array => $this->feedVideoCard($row, $searchNames, $searchUrls, $searchTypes),
            array_slice($unique, 0, self::FEED_STREAM_LIMIT),
        );

        $hashtags = $this->aggregateFeedHashtags($unique);

        return [
            'videos' => $videos,
            'totalCount' => $totalBreakouts,
            'searches' => $this->feedSearchRows($searchModels, $searchIds),
            'searchesCount' => $searchModels->count(),
            'hashtags' => array_slice($hashtags, 0, 6),
            'hashtagsCount' => count($hashtags),
        ];
    }

    /**
     * The "Suggested to track" chips under the search field, split by keyword
     * type so the row only ever offers what the Brand/Product toggle is set to.
     *
     * They come from the same keyword index that feeds the field's own
     * suggestion dropdown, which is personalised and already drops anything the
     * user has searched — offering a keyword they have run is not a useful
     * suggestion.
     *
     * @return array<string, array<int, array<string, string>>>
     */
    private function suggestionsForRequest(Request $request): array
    {
        $userId = $request->user()?->id;

        $byType = [];
        foreach (['brand', 'product'] as $type) {
            $byType[$type] = array_values(array_filter(array_map(
                fn (array $row): ?array => trim((string) ($row['label'] ?? '')) === ''
                    ? null
                    : ['phrase' => $row['label'], 'type' => $type],
                $this->keywords->suggest($type, '', 6, $userId),
            )));
        }

        return $byType;
    }

    /**
     * The "Your searches" rail card: each search with how many breakouts it has
     * surfaced and its strongest score, best first.
     *
     * @param  Collection<int, CustomKeywordSearch>  $searches
     * @param  Collection<int, int>  $searchIds
     * @return array<int, array<string, mixed>>
     */
    private function feedSearchRows(Collection $searches, Collection $searchIds): array
    {
        $stats = $this->repository->breakoutStatsBySearch($searchIds);

        return $searches
            ->map(function (CustomKeywordSearch $search) use ($stats): array {
                $row = $stats[$search->id] ?? null;
                $score = (float) ($row->top_score ?? 0);

                return [
                    'id' => $search->id,
                    'name' => $search->name,
                    'type' => $search->search_type === CustomKeywordSearch::TYPE_PRODUCT ? 'product' : 'brand',
                    'initials' => $this->feedInitials((string) $search->name),
                    'breakouts' => (int) ($row->breakouts ?? 0),
                    'score' => $score > 0 ? round($score).'x' : null,
                    'sort' => $score,
                    'url' => $search->url(),
                ];
            })
            ->sortByDesc('sort')
            ->take(4)
            ->map(function (array $row): array {
                unset($row['sort']);

                return $row;
            })
            ->values()
            ->all();
    }

    /** Two-letter monogram for a search's rail avatar. */
    private function feedInitials(string $name): string
    {
        $clean = trim(preg_replace('/[^\p{L}\p{N} ]+/u', '', $name) ?? '');

        if ($clean === '') {
            return '??';
        }

        $words = preg_split('/\s+/', $clean) ?: [];

        return mb_strtoupper(count($words) > 1
            ? mb_substr($words[0], 0, 1).mb_substr($words[1], 0, 1)
            : mb_substr($clean, 0, 2));
    }

    /**
     * One card in the stream, owned by the search that surfaced it.
     */
    private function feedVideoCard(CustomKeywordSearchVideo $row, Collection $names, Collection $urls, Collection $types): array
    {
        $video = $row->video;
        $score = (float) ($row->viral_score ?: $video->virality_score);

        return [
            'id' => $video->id,
            'brand' => $names[$row->custom_keyword_search_id] ?? null,
            'search_url' => $urls[$row->custom_keyword_search_id] ?? null,
            'search_type' => $types[$row->custom_keyword_search_id] ?? 'brand',
            // Playback goes through TikTok's embed, never video_url: that is a
            // signed CDN address that expires and 403s from a browser origin.
            'video_id' => $video->video_id,
            'embed_url' => $video->embed_url,
            'post_url' => $video->post_url,
            'social_media_source' => $video->platform,
            'score' => $score > 0 ? round($score).'x' : null,
            'duration' => $this->formatFeedDuration($video->duration),
            'handle' => $video->username ? '@'.ltrim((string) $video->username, '@') : null,
            'uploaded_at' => $video->uploaded_at?->toDateString(),
            'uploaded_date' => $video->uploaded_at?->format('M j'),
            'caption' => $video->title,
            'views' => $this->compactNumber((float) $video->views),
            'likes' => $this->compactNumber((float) $video->likes),
            'comments' => $this->compactNumber((float) $video->comments),
            'shares' => $this->compactNumber((float) $video->shares),
            'followers' => $this->compactNumber((float) $video->followers),
            'engagement' => $this->formatEngagementRate($video),
            'hashtags' => $this->feedHashtagList($video),
            'thumbnail' => $video->thumbnail_url ?: $video->cover,
            'gradient' => $this->showcaseGradient((string) $video->id),
        ];
    }

    /** Interactions over views, already formatted, or null when there are no views. */
    private function formatEngagementRate(ViralVideo $video): ?string
    {
        $rate = $video->engagementRate();

        return $rate === null ? null : $rate.'%';
    }

    /**
     * The video's hashtags, stripped of their leading "#", so the caption can
     * be rendered with each tag linked back to TikTok.
     *
     * @return array<int, string>
     */
    private function feedHashtagList(ViralVideo $video): array
    {
        return array_values(array_filter(array_map(
            fn ($tag): string => ltrim(trim((string) $tag), '#'),
            (array) $video->hashtags,
        )));
    }

    /**
     * @param  array<int, mixed>  $ids
     * @return array<int, array<string, mixed>>
     */
    private function globalFeedVideos(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $order = array_flip(array_map('strval', $ids));

        return $this->repository->visibleVideosByIds($ids)
            ->sortBy(fn (ViralVideo $video): int => $order[(string) $video->id] ?? PHP_INT_MAX)
            ->map(function (ViralVideo $video): array {
                $score = (float) $video->virality_score;

                return [
                    'id' => $video->id,
                    // No owning search, so the card carries no brand chip and
                    // does not link through to search results.
                    'brand' => null,
                    'search_url' => null,
                    'video_id' => $video->video_id,
                    'embed_url' => $video->embed_url,
                    'post_url' => $video->post_url,
                    'social_media_source' => $video->platform,
                    'score' => $score > 0 ? round($score).'x' : null,
                    'duration' => $this->formatFeedDuration($video->duration),
                    'handle' => $video->username ? '@'.ltrim((string) $video->username, '@') : null,
                    'uploaded_at' => $video->uploaded_at?->toDateString(),
                    'uploaded_date' => $video->uploaded_at?->format('M j, Y'),
                    'caption' => $video->title,
                    'views' => $this->compactNumber((float) $video->views),
                    'likes' => $this->compactNumber((float) $video->likes),
                    'comments' => $this->compactNumber((float) $video->comments),
                    'shares' => $this->compactNumber((float) $video->shares),
                    'followers' => $this->compactNumber((float) $video->followers),
                    'engagement' => $this->formatEngagementRate($video),
                    'hashtags' => $this->feedHashtagList($video),
                    'thumbnail' => $video->thumbnail_url ?: $video->cover,
                    'gradient' => $this->showcaseGradient((string) $video->id),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Top hashtags across the user's breakout videos.
     *
     * @param  array<int, CustomKeywordSearchVideo>  $rows
     * @return array<int, array<string, mixed>>
     */
    private function aggregateFeedHashtags(array $rows): array
    {
        $byTag = [];
        foreach ($rows as $row) {
            $tags = $row->video->hashtags;
            if (! is_array($tags)) {
                continue;
            }
            foreach ($tags as $tag) {
                $clean = ltrim((string) $tag, '#');
                if ($clean === '') {
                    continue;
                }
                $key = strtolower($clean);
                if (! isset($byTag[$key])) {
                    $byTag[$key] = ['tag' => $clean, 'count' => 0];
                }
                $byTag[$key]['count']++;
            }
        }

        usort($byTag, fn ($a, $b) => $b['count'] <=> $a['count']);

        return array_slice(array_values($byTag), 0, 6);
    }

    private function formatFeedDuration(mixed $seconds): ?string
    {
        if ($seconds === null) {
            return null;
        }
        $total = (int) round((float) $seconds);
        if ($total <= 0) {
            return null;
        }

        return floor($total / 60).':'.str_pad((string) ($total % 60), 2, '0', STR_PAD_LEFT);
    }

    /** @return array<string, mixed> */
    private function showcaseCard(ViralVideo $video): array
    {
        $score = (float) $video->virality_score;
        $views = (float) $video->views;
        $usual = $score > 1 ? $views / $score : null;
        $multiplier = $score > 0 ? round($score).'x' : null;
        $engagement = $video->engagementRate();

        $rows = [];
        foreach ([['Hook', $video->content_hook], ['Format', $video->content_format], ['Angle', $video->content_angle]] as [$label, $text]) {
            if (filled($text)) {
                $rows[] = ['label' => $label, 'text' => $text];
            }
        }

        $hashtags = is_array($video->hashtags) ? $video->hashtags : [];
        $tag = isset($hashtags[0]) ? ltrim((string) $hashtags[0], '#') : null;

        $stats = array_values(array_filter([
            ['label' => 'Views', 'value' => $this->compactNumber($views)],
            $usual !== null ? ['label' => 'Their usual', 'value' => $this->compactNumber($usual)] : null,
            $multiplier !== null ? ['label' => 'Beat their own account by', 'value' => $multiplier, 'accent' => true] : null,
            $engagement !== null ? ['label' => 'Engagement rate', 'value' => rtrim(rtrim(number_format($engagement, 1), '0'), '.').'%'] : null,
        ]));

        return [
            'id' => 'v'.$video->id,
            'handle' => $video->username ? '@'.ltrim((string) $video->username, '@') : null,
            'tag' => $tag !== '' ? $tag : null,
            'caption' => $video->title,
            'score' => $multiplier,
            'thumbnail' => $video->thumbnail_url ?: $video->cover,
            'gradient' => $this->showcaseGradient((string) $video->id),
            'summary' => $this->showcaseSummary($views, $usual),
            'rows' => $rows,
            'stats' => $stats,
            'beats' => null,
            'post_url' => $video->post_url,
        ];
    }

    private function showcaseSummary(float $views, ?float $usual): string
    {
        if ($usual === null || $usual <= 0) {
            return number_format($views).' views.';
        }

        return number_format($views).' views, off an account that normally does '.number_format(round($usual)).'.';
    }

    private function compactNumber(float $number): string
    {
        if ($number >= 1_000_000) {
            return rtrim(rtrim(number_format($number / 1_000_000, 1), '0'), '.').'M';
        }

        if ($number >= 1_000) {
            return rtrim(rtrim(number_format($number / 1_000, 1), '0'), '.').'K';
        }

        return (string) (int) round($number);
    }

    /** Stable placeholder gradient behind a card when a thumbnail is missing. */
    private function showcaseGradient(string $seed): string
    {
        $palettes = [
            'linear-gradient(150deg,#3a2b6b,#6a3ca8 55%,#c07a9a)',
            'linear-gradient(150deg,#2f3d2b,#4a5c3a 55%,#7aa060)',
            'linear-gradient(150deg,#5c1030,#a8324f 55%,#ff8fb0)',
            'linear-gradient(150deg,#0f3d5c,#2a6f9c 55%,#7ab6d8)',
            'linear-gradient(150deg,#4a2b1a,#8a5230 55%,#d69a6a)',
            'linear-gradient(150deg,#1a2f4a,#30528a 55%,#6a8fd6)',
        ];

        $hash = 0;
        $length = strlen($seed);
        for ($i = 0; $i < $length; $i++) {
            $hash = ($hash * 31 + ord($seed[$i])) & 0x7FFFFFFF;
        }

        return $palettes[$hash % count($palettes)];
    }
}
