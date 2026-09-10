<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavedSearchRequest;
use App\Http\Resources\SavedSearchPresenter;
use App\Jobs\EnrichSearchResults;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\CustomKeywordSearchSnapshot;
use App\Models\CustomKeywordSearchVideo;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\ViralVideo;
use App\Services\Analytics\AnalyticsEvent;
use App\Services\Billing\BillingService;
use App\Services\Bookmarks\BookmarkService;
use App\Services\CustomKeywordSearch\FeedDiscoveryService;
use App\Services\CustomKeywordSearch\GuestSearchQuota;
use App\Services\CustomKeywordSearch\KeywordExpansionService;
use App\Services\CustomKeywordSearch\OwnedSearchResolver;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use App\Services\IndexedKeywordService;
use App\Support\GuestIdentity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SavedSearchController extends Controller
{
    /**
     * How many feed cards ship with the page. The stream shows a first batch
     * and reveals the rest on "Load more" without another request.
     */
    private const FEED_STREAM_LIMIT = 21;

    private const SEARCH_SUGGESTION_TARGET = 5;

    public function __construct(
        private readonly KeywordExpansionService $expansion,
        private readonly SavedSearchManager $manager,
        private readonly BillingService $billing,
        private readonly OwnedSearchResolver $searches,
        private readonly BookmarkService $bookmarks,
        private readonly GuestSearchQuota $guestQuota,
    ) {}

    /**
     * POST /saved-searches/expand — phrase in, phrase plus suggestions out.
     */
    public function expand(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phrase' => ['required', 'string', 'max:'.config('custom_keyword_search.limits.max_phrase_length', 120)],
            'fresh' => ['nullable', 'boolean'],
            'instant' => ['nullable', 'boolean'],
            'type' => ['nullable', 'in:brand,product'],
        ]);

        $type = (string) ($validated['type'] ?? 'brand');

        // The instant pass is OpenAI-free (templates + indexed terms) and only
        // paints the first frame, so it skips the AI rate limiter entirely.
        if ((bool) ($validated['instant'] ?? false)) {
            return response()->json($this->expansion->preview($validated['phrase'], $type));
        }

        // Expansion hits OpenAI on a cache miss, so keep it from being hammered.
        $key = 'cks-expand:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, 30)) {
            return response()->json([
                'message' => 'Too many keyword suggestions requested. Try again shortly.',
            ], 429);
        }

        RateLimiter::hit($key, 60);

        return response()->json($this->expansion->expand(
            $validated['phrase'],
            (bool) ($validated['fresh'] ?? false),
            true,
            $type,
        ));
    }

    /**
     * POST /saved-searches — create (or reuse) a search and queue its first run.
     */
    public function store(StoreSavedSearchRequest $request): JsonResponse
    {
        $user = $request->user();
        $guestToken = $user ? null : GuestIdentity::token($request, create: true);
        $duplicate = $this->duplicatePayload($request, $user, $guestToken);
        $existing = $duplicate['search'] ?? null;

        if ($existing !== null && ! $request->boolean('refresh_existing')) {
            return response()->json([
                'code' => 'existing_search',
                'message' => 'This keyword already has a search in your history.',
                'search' => SavedSearchPresenter::summary($existing),
                'new_keywords' => $duplicate['new_keywords'],
            ], 409);
        }

        // A scrape costs real money whoever starts it, so both branches are
        // checked here. Guests used to fall through unchecked entirely.
        if ($user !== null) {
            $this->billing->ensureCanCreateSearch($user);
        } else {
            $this->guestQuota->ensureCanCreateSearch($request);
        }

        $search = $existing !== null
            ? $this->manager->refreshWithKeywords(
                $existing,
                $user,
                $request->input('keywords', []),
                fn () => $this->guestQuota->consume($request),
            )
            : $this->manager->create(
                user: $user,
                guestToken: $guestToken,
                type: $request->string('type')->toString(),
                phrase: $request->string('phrase')->toString(),
                keywords: $request->input('keywords', []),
                name: $request->input('name'),
                frequency: $request->string('frequency')->toString(),
                sources: $request->input('sources'),
                chargeGuest: fn () => $this->guestQuota->consume($request),
            );

        return response()->json([
            'id' => $search->id,
            'name' => $search->name,
            'url' => $search->url(),
            'status' => $search->status,
            'initial_count' => $search->videos()->count(),
            'analytics' => [
                AnalyticsEvent::make('search_created', [
                    'search_id' => $search->id,
                    'search_type' => $search->search_type,
                    'search_phrase' => $search->phrase,
                    'search_frequency' => $search->frequency,
                    'is_authenticated' => $user !== null,
                ]),
            ],
        ], 201);
    }

    /** Check the full account history before asking the user to spend a credit. */
    public function checkDuplicate(StoreSavedSearchRequest $request): JsonResponse
    {
        $user = $request->user();
        $guestToken = $user ? null : GuestIdentity::token($request, create: true);
        $duplicate = $this->duplicatePayload($request, $user, $guestToken);

        if ($duplicate['search'] === null) {
            return response()->json(['existing' => false]);
        }

        return response()->json([
            'existing' => true,
            'search' => SavedSearchPresenter::summary($duplicate['search']),
            'new_keywords' => $duplicate['new_keywords'],
        ]);
    }

    /** @return array{search: ?CustomKeywordSearch, new_keywords: array<int, string>} */
    private function duplicatePayload(Request $request, ?User $user, ?string $guestToken): array
    {
        $existing = $this->manager->findExisting($user, $guestToken, $request->string('phrase')->toString());

        if ($existing === null) {
            return ['search' => null, 'new_keywords' => []];
        }

        $mergedKeywords = $this->manager->mergedKeywords($existing, $request->input('keywords', []));
        $existingKeywordKeys = array_map('mb_strtolower', (array) $existing->keywords);
        $newKeywords = array_values(array_filter(
            $mergedKeywords,
            fn (string $keyword): bool => ! in_array(mb_strtolower($keyword), $existingKeywordKeys, true),
        ));

        return ['search' => $existing, 'new_keywords' => $newKeywords];
    }

    /**
     * Show progress only for an accessible search that is still scraping.
     */
    public function running(Request $request): Response|RedirectResponse
    {
        $id = filter_var($request->query('id'), FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);

        if ($id === false) {
            return redirect()->route('search.keywords');
        }

        $search = $this->searches->findMany($request, [$id])->first();

        if ($search === null) {
            return redirect()->route('search.keywords');
        }

        if ($search->status !== CustomKeywordSearch::STATUS_SCRAPING) {
            return redirect()->to($search->url());
        }

        return Inertia::render('Search/Running', [
            'searchId' => $search->id,
            'search' => SavedSearchPresenter::summary($search),
            'examples' => $this->freeSearchShowcase(),
        ]);
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
    private function freeSearchShowcase(): array
    {
        return Cache::remember('free_search_showcase_v1', 600, function (): array {
            $videos = ViralVideo::query()
                ->visible()
                ->whereNotNull('content_hook')
                ->where('virality_score', '>', 3)
                ->orderByDesc('virality_score')
                ->limit(24)
                ->get();

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

    /**
     * "My Feed" — the signed-in home. Everything is derived from the user's own
     * searches: their strongest breakout videos, the sounds and hashtags those
     * breakouts lean on, and the videos they saved. Accounts without searches
     * browse visible global videos until they have their own results.
     *
     * @return array<string, mixed>
     */
    private function feedPayload(Request $request): array
    {
        $userId = $request->user()?->id;
        $guestToken = GuestIdentity::token($request);
        $searchIds = CustomKeywordSearch::query()->ownedBy($userId, $guestToken)->pluck('id');

        $discovery = app(FeedDiscoveryService::class)->payload();
        $climbing = $discovery['climbingHashtags'] ?? [];
        $suggestions = $this->feedSuggestions($request);

        $empty = [
            'videos' => [],
            'totalCount' => 0,
            'searches' => [],
            'searchesCount' => 0,
            'hashtags' => [],
            'hashtagsCount' => 0,
            'climbing' => $climbing,
            'popularSearches' => $discovery['popularSearches'] ?? [],
            'suggestions' => $suggestions,
        ];

        // Nothing of their own yet (a free user who has not spent their search):
        // fill the feed with the best of what everyone else surfaced, so the
        // page shows the product working instead of an empty column.
        if ($searchIds->isEmpty()) {
            $videos = $this->globalFeedVideos($discovery['topVideoIds'] ?? []);

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

        $content = Cache::remember($cacheKey, 60, function () use ($searchIds): array {
            $searchModels = CustomKeywordSearch::query()->whereIn('id', $searchIds)->get();
            $searchNames = $searchModels->pluck('name', 'id');
            $searchUrls = $searchModels->mapWithKeys(fn (CustomKeywordSearch $s): array => [$s->id => $s->url()]);
            $searchTypes = $searchModels->mapWithKeys(fn (CustomKeywordSearch $s): array => [
                $s->id => $s->search_type === CustomKeywordSearch::TYPE_PRODUCT ? 'product' : 'brand',
            ]);

            // The user's strongest breakouts across every search, best first, one
            // row per underlying video.
            $rows = CustomKeywordSearchVideo::query()
                ->whereIn('custom_keyword_search_id', $searchIds)
                ->whereHas('video', fn ($query) => $query->visible())
                ->with('video')
                ->orderByDesc('viral_score')
                ->limit(80)
                ->get();

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
        });

        // The save and analyze buttons both need to open in the right state, so
        // the user's bookmarks and any existing analyses ride along with the
        // cards. Without the analysis, a video the user already analysed would
        // offer "Analyze video" again and re-prompt to spend a credit.
        $savedIds = array_flip(array_map('strval', $this->bookmarks->idsForUser($request->user())));
        $analyses = $this->feedAnalyses($request, array_column($content['videos'], 'id'));

        foreach ($content['videos'] as $index => $card) {
            $content['videos'][$index]['bookmarked'] = isset($savedIds[(string) $card['id']]);
            $content['videos'][$index]['analysis'] = $analyses[$card['id']] ?? null;
        }

        return array_merge($empty, $content);
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
    private function feedSuggestions(Request $request): array
    {
        $keywords = app(IndexedKeywordService::class);
        $userId = $request->user()?->id;

        $byType = [];
        foreach (['brand', 'product'] as $type) {
            $byType[$type] = array_values(array_filter(array_map(
                fn (array $row): ?array => trim((string) ($row['label'] ?? '')) === ''
                    ? null
                    : ['phrase' => $row['label'], 'type' => $type],
                $keywords->suggest($type, '', 6, $userId),
            )));
        }

        return $byType;
    }

    /**
     * The "Your searches" rail card: each search with how many breakouts it has
     * surfaced and its strongest score, best first.
     *
     * @param  Collection<int, CustomKeywordSearch>  $searches
     * @param  Collection<int, string>  $searchIds
     * @return array<int, array<string, mixed>>
     */
    private function feedSearchRows(Collection $searches, Collection $searchIds): array
    {
        $stats = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->selectRaw('custom_keyword_search_id, COUNT(*) as breakouts, MAX(viral_score) as top_score')
            ->where('is_new_breakout', true)
            ->groupBy('custom_keyword_search_id')
            ->get()
            ->keyBy('custom_keyword_search_id');

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

    /**
     * The user's analyses for the videos in the stream, keyed by video id, in
     * the same shape the results page sends so the shared analyze CTA and
     * modal read them identically.
     *
     * @param  array<int, mixed>  $videoIds
     * @return array<string, array<string, mixed>>
     */
    private function feedAnalyses(Request $request, array $videoIds): array
    {
        $user = $request->user();

        if ($user === null || $videoIds === []) {
            return [];
        }

        return VideoAnalysis::query()
            ->where('user_id', $user->id)
            ->whereIn('viral_video_id', $videoIds)
            ->get()
            ->keyBy('viral_video_id')
            ->map(fn (VideoAnalysis $analysis): array => SavedSearchPresenter::analysisPayload($analysis))
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

    private function globalFeedVideos(array $ids): array
    {
        if ($ids === []) {
            return [];
        }

        $order = array_flip(array_map('strval', $ids));

        return ViralVideo::query()
            ->visible()
            ->whereIn('id', $ids)
            ->get()
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

    /** GET /saved-searches/notifications?ids[]=1 — what the running screen polls. */
    public function notifications(Request $request): JsonResponse
    {
        $ids = array_slice(array_filter(array_map('intval', (array) $request->query('ids', []))), 0, 25);

        if ($ids === []) {
            return response()->json(['searches' => []]);
        }

        $searches = $this->searches->findMany($request, $ids)
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::summary($search))
            ->all();

        return response()->json(['searches' => $searches]);
    }

    /** @return array<int, array<string, mixed>> */
    private function recentSearches(Request $request): array
    {
        return $this->searches->all($request, null, false)
            ->take(3)
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::summary($search))
            ->values()
            ->all();
    }

    /** GET /saved-searches/recent — canonical data for the dashboard card. */
    public function recent(Request $request): JsonResponse
    {
        return response()->json(['searches' => $this->recentSearches($request)]);
    }

    /**
     * "Your tracking at a glance" — portfolio-wide counters shown above the
     * recent list. Everything is a single aggregate query so the payload stays
     * cheap even when the account has hundreds of saved searches.
     *
     * @return array<string, int>
     */
    private function dashboardStats(Request $request): array
    {
        $userId = $request->user()?->id;
        $guestToken = GuestIdentity::token($request);

        $searchIds = CustomKeywordSearch::query()
            ->ownedBy($userId, $guestToken)
            ->pluck('id');

        $empty = [
            'videos_tracked' => 0,
            'videos_tracked_delta_week' => 0,
            'outliers_this_week' => 0,
            'outliers_delta_week' => 0,
            'avg_outlier_score' => 0,
            'creators_surfaced' => 0,
            'searches_count' => 0,
        ];

        if ($searchIds->isEmpty()) {
            return $empty;
        }

        $weekAgo = now()->subDays(7);
        $twoWeeksAgo = now()->subDays(14);

        // Videos tracked = all rows across the user's searches, with "new this
        // week" derived from when the join row was written.
        $videosTracked = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->count();

        $videosThisWeek = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('created_at', '>=', $weekAgo)
            ->count();

        // Breakouts are rows above the threshold. Delta compares the current 7-day window to
        // the prior 7-day window.
        $outliersThisWeek = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('is_new_breakout', true)
            ->where('created_at', '>=', $weekAgo)
            ->count();

        $outliersPriorWeek = CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('is_new_breakout', true)
            ->whereBetween('created_at', [$twoWeeksAgo, $weekAgo])
            ->count();

        // Average Breakout Score = each search's most recent snapshot
        // `top_multiple`, rounded to a whole "N×".
        $latestPerSearch = CustomKeywordSearchSnapshot::query()
            ->selectRaw('custom_keyword_search_id, MAX(captured_at) as latest_at')
            ->whereIn('custom_keyword_search_id', $searchIds)
            ->where('is_reconstructed', false)
            ->groupBy('custom_keyword_search_id');

        $avgScore = (float) CustomKeywordSearchSnapshot::query()
            ->joinSub($latestPerSearch, 'latest', function ($join) {
                $join->on('custom_keyword_search_snapshots.custom_keyword_search_id', '=', 'latest.custom_keyword_search_id')
                    ->on('custom_keyword_search_snapshots.captured_at', '=', 'latest.latest_at');
            })
            ->avg('custom_keyword_search_snapshots.top_multiple');

        // Distinct creators across all videos surfaced by the user's searches.
        $creatorsSurfaced = CustomKeywordSearchVideo::query()
            ->join('viral_videos', 'viral_videos.id', '=', 'custom_keyword_search_videos.viral_video_id')
            ->whereIn('custom_keyword_search_videos.custom_keyword_search_id', $searchIds)
            ->whereNotNull('viral_videos.username')
            ->distinct()
            ->count('viral_videos.username');

        return [
            'videos_tracked' => (int) $videosTracked,
            'videos_tracked_delta_week' => (int) $videosThisWeek,
            'outliers_this_week' => (int) $outliersThisWeek,
            'outliers_delta_week' => (int) ($outliersThisWeek - $outliersPriorWeek),
            'avg_outlier_score' => (int) round($avgScore),
            'creators_surfaced' => (int) $creatorsSurfaced,
            'searches_count' => (int) $searchIds->count(),
        ];
    }

    /**
     * GET /home — "My Feed", the signed-in landing page. A single feed built
     * from the user's own searches (their breakout videos, sounds, hashtags and
     * saved videos). Searches start from the brand/product hubs.
     */
    public function home(Request $request): Response
    {
        return Inertia::render('Feed', [
            'feed' => $this->feedPayload($request),
        ]);
    }

    /**
     * GET /library — the saved list.
     */
    public function index(Request $request): Response
    {
        $filterType = $this->filterType($request);
        $bookmarkedOnly = $filterType === null;
        $queryType = $filterType === 'brand-group'
            ? [CustomKeywordSearch::TYPE_BRAND, CustomKeywordSearch::TYPE_COMPETITOR]
            : $filterType;

        $searches = $this->searches->all($request, $queryType, $bookmarkedOnly)
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::summary($search))
            ->all();
        $searchHistory = $bookmarkedOnly && $filterType === null
            ? $this->searches->all($request, null, false)
                ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::summary($search))
                ->values()
                ->all()
            : [];

        // The Library "Saved videos" tab lives in the same default view.
        $videoIds = $bookmarkedOnly ? $this->bookmarks->idsForUser($request->user()) : [];

        return Inertia::render('SavedSearches/Index', [
            'searches' => $searches,
            'bookmarkedVideos' => [],
            'bookmarkedVideosCount' => count($videoIds),
            'analysisHistory' => [],
            'analysisHistoryCount' => $bookmarkedOnly ? $this->analysisHistoryCount($request) : 0,
            'searchHistory' => $searchHistory,
            'initialTab' => $request->query('tab') === 'history' ? 'history' : 'searches',
            'filterType' => $filterType,
            'watchlistedOnly' => $bookmarkedOnly,
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /**
     * GET /search-history — every search, ordered by the date it was created.
     */
    public function history(Request $request): RedirectResponse
    {
        return redirect('/library?tab=history');
    }

    public function bookmarkedVideos(Request $request): JsonResponse
    {
        return response()->json([
            'videos' => $this->bookmarkedVideosPayload($request),
        ]);
    }

    public function analysisHistoryJson(Request $request): JsonResponse
    {
        return response()->json([
            'history' => $this->analysisHistory($request),
        ]);
    }

    /**
     * Analysis history belongs to the Library hub and is intentionally a flat
     * log so users can quickly jump back into finished or in-flight analyses.
     *
     * @return array<int, array<string, mixed>>
     */
    private function analysisHistory(Request $request): array
    {
        $user = $request->user();

        if ($user === null) {
            return [];
        }

        $analyses = VideoAnalysis::query()
            ->where('user_id', $user->id)
            ->whereNotNull('viral_video_id')
            ->with(['viralVideo' => fn ($query) => $query->visible()])
            ->latest('updated_at')
            ->get();

        if ($analyses->isEmpty()) {
            return [];
        }

        $videoIds = $analyses
            ->pluck('viral_video_id')
            ->filter()
            ->unique()
            ->values();

        $searchLinks = CustomKeywordSearchVideo::query()
            ->with('search')
            ->whereIn('viral_video_id', $videoIds)
            ->orderByDesc('updated_at')
            ->get()
            ->groupBy('viral_video_id');

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

    private function analysisHistoryCount(Request $request): int
    {
        $user = $request->user();

        if ($user === null) {
            return 0;
        }

        return VideoAnalysis::query()
            ->where('user_id', $user->id)
            ->whereNotNull('viral_video_id')
            ->count();
    }

    private function bookmarkedVideosPayload(Request $request): array
    {
        $videoIds = $this->bookmarks->idsForUser($request->user());

        if ($videoIds === []) {
            return [];
        }

        return ViralVideo::query()
            ->visible()
            ->whereIn('id', $videoIds)
            ->get()
            ->map(fn (ViralVideo $video): array => $video->toCardArray())
            ->all();
    }

    /**
     * GET /brands — the dedicated brand search hub.
     */
    public function brands(Request $request): Response
    {
        return $this->searchHub(
            $request,
            [CustomKeywordSearch::TYPE_BRAND, CustomKeywordSearch::TYPE_COMPETITOR],
            'Brands'
        );
    }

    /**
     * GET /products — the dedicated product search hub.
     */
    public function products(Request $request): Response
    {
        return $this->searchHub($request, [CustomKeywordSearch::TYPE_PRODUCT], 'Products');
    }

    /**
     * Shared body for the brand/product hubs: the tracked searches with their
     * headline stats, plus the single best breakout across them ("Moving this
     * week"). Stats are loaded as collection aggregates to avoid N+1.
     *
     * @param  array<int, string>  $types
     */
    private function searchHub(Request $request, array $types, string $page): Response
    {
        $searches = $this->searches->all($request, $types, false);
        $searches->loadCount([
            'videos',
            'videos as outlier_count' => fn ($query) => $query->where('is_new_breakout', true),
        ]);
        $searches->loadMax('videos', 'viral_score');
        $searches->load('latestSnapshot');

        $searchIds = $searches->pluck('id');

        // Pure video-stat aggregates that only move when a search run
        // completes (minutes-scale) — safe to cache briefly. Search status
        // (paused/bookmarked) and counts stay live above, so a pause/resume
        // toggle on this page always reflects immediately.
        $aggregateKey = 'search-hub:aggregates:'.md5($searchIds->sort()->implode(','));

        $aggregates = Cache::remember($aggregateKey, 60, function () use ($searches, $searchIds): array {
            $averageViewsBySearchId = CustomKeywordSearchVideo::query()
                ->join('viral_videos', 'viral_videos.id', '=', 'custom_keyword_search_videos.viral_video_id')
                ->whereIn('custom_keyword_search_videos.custom_keyword_search_id', $searchIds)
                ->whereNull('viral_videos.archived_at')
                ->groupBy('custom_keyword_search_videos.custom_keyword_search_id')
                ->selectRaw('custom_keyword_search_videos.custom_keyword_search_id, AVG(viral_videos.views) as average_video_views')
                ->pluck('average_video_views', 'custom_keyword_search_videos.custom_keyword_search_id')
                ->all();

            return [
                'averageViews' => $averageViewsBySearchId,
                'moving' => $this->movingThisWeek($searches),
            ];
        });

        $averageViewsBySearchId = collect($aggregates['averageViews']);

        $searches->each(function (CustomKeywordSearch $search) use ($averageViewsBySearchId): void {
            $search->average_video_views = $averageViewsBySearchId->get($search->id);
        });

        $cards = $searches
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::card($search))
            ->values()
            ->all();

        return Inertia::render($page, [
            'searches' => $cards,
            'moving' => $aggregates['moving'],
            'suggestions' => $this->suggestions($searches, $types),
            // ?q= drops someone straight into the inline flow with the subject
            // filled in — this is where My Feed's search box hands off to.
            'prefillQuery' => trim((string) $request->query('q', '')),
        ]);
    }

    /**
     * "Suggested to track" — a tiered, mostly real signal:
     *   1. other users' searches (of this kind) that share the most creators
     *      with the ones this user already tracks;
     *   2. otherwise the most-tracked searches across other users;
     *   3. otherwise a small curated set of subjects trending in the US.
     * Tiers 1–2 come from real data; tier 3 is an explicit sample fallback for
     * a fresh install with nothing to learn from yet.
     *
     * @param  Collection<int, CustomKeywordSearch>  $searches
     * @param  array<int, string>  $types
     * @return array<int, array<string, mixed>>
     */
    private function suggestions($searches, array $types): array
    {
        $userId = $searches->first()?->user_id;
        $trackedPhrases = $searches
            ->flatMap(fn (CustomKeywordSearch $s): array => [
                $this->normalizeSuggestionName((string) $s->phrase),
                $this->normalizeSuggestionName((string) $s->name),
            ])
            ->filter()
            ->unique()
            ->values()
            ->all();

        $out = [];
        $seen = [];

        $target = self::SEARCH_SUGGESTION_TARGET;

        $add = function (?string $name, string $why) use (&$out, &$seen, $trackedPhrases, $target): void {
            $name = trim((string) $name);
            $key = $this->normalizeSuggestionName($name);
            $coveredByTrackedPhrase = collect($trackedPhrases)->contains(function (string $tracked) use ($key): bool {
                return $tracked === $key
                    || str_contains($tracked, $key)
                    || str_contains($key, $tracked);
            });

            if ($name === '' || $key === '' || count($out) >= $target || isset($seen[$key]) || $coveredByTrackedPhrase) {
                return;
            }
            $seen[$key] = true;
            $out[] = ['name' => $name, 'why' => $why];
        };

        // Tier 1 — other users' searches that share creators with this user's.
        if ($userId !== null && ! $searches->isEmpty()) {
            $creators = DB::table('custom_keyword_search_videos as csv')
                ->join('viral_videos as v', 'v.id', '=', 'csv.viral_video_id')
                ->whereIn('csv.custom_keyword_search_id', $searches->pluck('id'))
                ->whereNull('v.archived_at')
                ->whereNotNull('v.username')
                ->pluck('v.username')
                ->map(fn ($u) => mb_strtolower((string) $u))
                ->unique()
                ->values()
                ->all();

            if ($creators !== []) {
                $shared = DB::table('custom_keyword_search_videos as csv')
                    ->join('viral_videos as v', 'v.id', '=', 'csv.viral_video_id')
                    ->join('custom_keyword_searches as s', 's.id', '=', 'csv.custom_keyword_search_id')
                    ->whereIn('s.search_type', $types)
                    ->where('s.user_id', '!=', $userId)
                    ->whereNull('s.deleted_at')
                    ->whereNull('v.archived_at')
                    ->whereIn(DB::raw('LOWER(v.username)'), $creators)
                    ->groupBy('s.phrase')
                    ->select('s.phrase', DB::raw('COUNT(DISTINCT LOWER(v.username)) as overlap'))
                    ->orderByDesc('overlap')
                    ->limit(8)
                    ->get();

                foreach ($shared as $row) {
                    $add($row->phrase, 'Shares '.$row->overlap.' creator'.($row->overlap == 1 ? '' : 's').' with your searches');
                }
            }
        }

        // Tier 2 — the most-tracked searches across other users.
        if (count($out) < $target && $userId !== null) {
            $popular = DB::table('custom_keyword_searches')
                ->whereIn('search_type', $types)
                ->where('user_id', '!=', $userId)
                ->whereNull('deleted_at')
                ->groupBy('phrase')
                ->select('phrase', DB::raw('COUNT(*) as c'))
                ->orderByDesc('c')
                ->limit(12)
                ->get();

            foreach ($popular as $row) {
                $add($row->phrase, $row->c > 1 ? 'Tracked by '.$row->c.' others' : 'Popular right now');
            }
        }

        // Tier 3 — AI expands the user's recent searches into adjacent but
        // not-yet-tracked ideas so the chip row stays useful and full.
        if (count($out) < $target) {
            $expandedBySearch = $searches
                ->take(5)
                ->map(fn (CustomKeywordSearch $search): array => array_values((array) ($this->expansion->expand((string) $search->phrase, allowAi: false, type: (string) $search->search_type)['keywords'] ?? [])))
                ->filter(fn (array $keywords): bool => $keywords !== [])
                ->values();

            $round = 0;

            while (count($out) < $target && $expandedBySearch->isNotEmpty()) {
                $addedThisRound = false;

                foreach ($expandedBySearch as $keywords) {
                    if (! array_key_exists($round, $keywords)) {
                        continue;
                    }

                    $before = count($out);
                    $add($keywords[$round], 'Suggested from your recent searches');
                    $addedThisRound = $addedThisRound || count($out) > $before;

                    if (count($out) >= $target) {
                        break;
                    }
                }

                if (! $addedThisRound) {
                    break;
                }

                $round++;
            }
        }

        // Tier 4 — curated fallback when there is still nothing else to show.
        if (count($out) < $target) {
            $samples = $types === [CustomKeywordSearch::TYPE_PRODUCT]
                ? ['sol de janeiro', 'laneige lip mask', 'stanley cup', 'brow gel', 'neck cream']
                : ['rhode', 'olipop', 'gymshark', 'rare beauty', 'summer fridays'];

            foreach ($samples as $name) {
                $add($name, 'Trending in the US');
            }
        }

        return $out;
    }

    private function normalizeSuggestionName(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = preg_replace('/[^\pL\pN]+/u', ' ', $value) ?? $value;

        return preg_replace('/\s+/u', ' ', trim($value)) ?? trim($value);
    }

    /**
     * Top breakout videos across a set of searches, newest-scored first.
     *
     * @param  Collection<int, CustomKeywordSearch>  $searches
     * @return array<int, array<string, mixed>>
     */
    private function movingThisWeek($searches): array
    {
        if ($searches->isEmpty()) {
            return [];
        }

        $names = $searches->pluck('name', 'id');
        $urls = $searches->mapWithKeys(fn (CustomKeywordSearch $s): array => [$s->id => $s->url()]);

        return CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searches->pluck('id'))
            ->whereHas('video', fn ($query) => $query->visible())
            ->with('video')
            ->orderByDesc('viral_score')
            ->limit(3)
            ->get()
            ->map(function (CustomKeywordSearchVideo $row) use ($names, $urls): array {
                $card = $row->video?->toCardArray() ?? [];

                return [
                    'subject' => $names[$row->custom_keyword_search_id] ?? null,
                    'url' => $urls[$row->custom_keyword_search_id] ?? null,
                    'multiplier' => $row->viral_score > 0 ? round($row->viral_score).'x' : null,
                    'caption' => $card['title'] ?? null,
                    'handle' => $card['handle'] ?? null,
                    'views' => $card['views'] ?? null,
                    'thumbnail_url' => $card['thumbnail_url'] ?? null,
                ];
            })
            ->all();
    }

    /**
     * GET /results/{search} — detail with the ranked result list. `{search}` is
     * the search's public id (numeric ids still resolve for old links).
     */
    public function show(Request $request, string $search): Response|RedirectResponse
    {
        try {
            $model = $this->searches->resolveByKey($request, $search);
        } catch (NotFoundHttpException) {
            return redirect()->route('landing');
        }

        $bookmarkedVideoIds = $this->bookmarks->idsForUser($request->user());

        $this->backfillEnrichmentIfMissing($model);

        return Inertia::render('SavedSearches/Show', [
            'search' => SavedSearchPresenter::detail($model, $bookmarkedVideoIds, $request->user()),
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /**
     * Kick off enrichment when a search has videos but no analysis on them.
     *
     * The scrape job dispatches EnrichSearchResults itself, but that dispatch
     * can quietly fail (queue worker not running, AI call errored, retries
     * exhausted). Re-dispatching on view is cheap — the job's
     * WithoutOverlapping middleware dedupes concurrent runs — and it means a
     * user hitting the results page always converges on a fully enriched
     * search rather than staring at a Winner card with no tags or analysis.
     */
    private function backfillEnrichmentIfMissing(CustomKeywordSearch $search): void
    {
        if ($search->hasActiveRun()) {
            return;
        }

        $needsEnrichment = $search->videos()
            ->whereHas('video', fn ($q) => $q->whereNull('content_why_broke_out'))
            ->exists();

        if (! $needsEnrichment) {
            return;
        }

        try {
            EnrichSearchResults::dispatch($search->id)
                ->onQueue((string) config('custom_keyword_search.queue', 'default'));
        } catch (\Throwable $e) {
            // Never let a page-view side effect break the render.
        }
    }

    /** Old /library/{id}, /bookmarks/{id}, and /bookmark/{id} links redirect to the canonical /results/{public_id}. */
    public function showLegacyRedirect(Request $request, int $id): RedirectResponse
    {
        try {
            return redirect($this->searches->resolve($request, $id)->url());
        } catch (NotFoundHttpException) {
            return redirect()->route('landing');
        }
    }

    /** JSON twin of show(), used to refresh the results page in place. */
    public function showJson(Request $request, int $id): JsonResponse
    {
        $model = $this->searches->resolve($request, $id);
        $this->backfillEnrichmentIfMissing($model);

        return response()->json([
            'search' => SavedSearchPresenter::detail(
                $model,
                $this->bookmarks->idsForUser($request->user()),
                $request->user(),
            ),
        ]);
    }

    public function pause(Request $request, int $id): JsonResponse
    {
        $search = $this->manager->pause($this->searches->resolve($request, $id));

        return response()->json(['search' => SavedSearchPresenter::summary($search)]);
    }

    public function resume(Request $request, int $id): JsonResponse
    {
        $search = $this->manager->resume($this->searches->resolve($request, $id));

        return response()->json(['search' => SavedSearchPresenter::summary($search)]);
    }

    /** Name, schedule, type, and brand account metadata only — keywords are fixed once a search exists. */
    public function updateFrequency(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:'.config('custom_keyword_search.limits.max_name_length', 80)],
            'frequency' => ['nullable', 'in:'.CustomKeywordSearch::FREQUENCY_WEEKLY.','.CustomKeywordSearch::FREQUENCY_MONTHLY],
            'type' => ['nullable', 'in:'.implode(',', CustomKeywordSearch::allowedTypes())],
            'sources' => ['nullable', 'array'],
            'sources.tiktokHandle' => ['nullable', 'string', 'max:120'],
            'sources.website' => ['nullable', 'string', 'max:255'],
        ]);

        $search = $this->searches->resolve($request, $id);
        $requestedFrequency = $validated['frequency'] ?? null;

        // Everyone can rename and re-type a search, but changing the refresh
        // schedule stays a paid feature. A no-op frequency (unchanged) passes.
        if ($requestedFrequency !== null
            && $requestedFrequency !== $search->frequency
            && ! (bool) config('features.bypass_paid_features', false)
            && ! $this->billing->hasPaidPlan($request->user())
        ) {
            return response()->json([
                'message' => 'Upgrade to Growth or Scale to change the refresh schedule.',
            ], 403);
        }

        $search = $this->manager->updateSettings(
            $search,
            $validated['name'] ?? null,
            $requestedFrequency,
            data_get($validated, 'sources.tiktokHandle'),
            data_get($validated, 'sources.website'),
            $validated['type'] ?? null,
        );

        return response()->json(['search' => SavedSearchPresenter::summary($search)]);
    }

    public function refresh(Request $request, int $id): JsonResponse
    {
        $search = $this->searches->resolve($request, $id);

        if ($search->hasActiveRun()) {
            return response()->json([
                'message' => 'This search is already refreshing.',
                'search' => SavedSearchPresenter::summary($search),
            ], 409);
        }

        // A refresh is a full scrape, identical in cost to creating a search.
        // It was previously free and unmetered, so a plan's credit limit could
        // be sidestepped entirely by refreshing one saved search on a loop.
        if ($request->user() === null) {
            $this->guestQuota->ensureCanCreateSearch($request);
            $this->guestQuota->consume($request);
        } else {
            $this->billing->ensureCanCreateSearch($request->user());
            $this->billing->consumeSearchCredit($request->user());
        }

        $this->manager->queueRun($search, $request->user() !== null);

        return response()->json([
            'search' => SavedSearchPresenter::summary($search->refresh()),
            'analytics' => [
                AnalyticsEvent::make('search_refresh_requested', [
                    'search_id' => $search->id,
                    'search_type' => $search->search_type,
                    'search_phrase' => $search->phrase,
                ]),
            ],
        ]);
    }

    public function retryInitial(Request $request, int $id): JsonResponse
    {
        $search = $this->searches->resolve($request, $id);

        if ($search->hasActiveRun()) {
            return response()->json([
                'message' => 'This search is already refreshing.',
                'search' => SavedSearchPresenter::summary($search),
            ], 409);
        }

        $latestRun = $search->latestRun;

        if (
            $search->status !== CustomKeywordSearch::STATUS_FAILED
            || $latestRun?->status !== CustomKeywordSearchRun::STATUS_FAILED
            || $search->videos()->exists()
        ) {
            return response()->json([
                'message' => 'Only an initial failed search can be retried here.',
            ], 422);
        }

        // The failed first run refunded its reserved credit, so this retry is
        // deliberately not metered as a separate refresh.
        $this->manager->queueRun($search);

        return response()->json([
            'search' => SavedSearchPresenter::summary($search->refresh()),
            'analytics' => [
                AnalyticsEvent::make('search_refresh_requested', [
                    'search_id' => $search->id,
                    'search_type' => $search->search_type,
                    'search_phrase' => $search->phrase,
                ]),
            ],
        ]);
    }

    public function destroy(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $this->manager->delete($this->searches->resolve($request, $id));

        if ($request->expectsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect('/library');
    }

    public function bookmark(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'bookmarked' => ['required', 'boolean'],
        ]);

        $search = $this->manager->setBookmarked(
            $this->searches->resolve($request, $id),
            (bool) $validated['bookmarked'],
        );

        return response()->json([
            'search' => SavedSearchPresenter::summary($search),
            'analytics' => $validated['bookmarked']
                ? [
                    AnalyticsEvent::make('search_bookmarked', [
                        'search_id' => $search->id,
                        'search_type' => $search->search_type,
                        'search_phrase' => $search->phrase,
                    ]),
                ]
                : [
                    AnalyticsEvent::make('search_unbookmarked', [
                        'search_id' => $search->id,
                        'search_type' => $search->search_type,
                        'search_phrase' => $search->phrase,
                    ]),
                ],
        ]);
    }

    private function filterType(Request $request): ?string
    {
        $type = (string) $request->query('type', '');

        if ($type === 'brand-group') {
            return $type;
        }

        if ($type === CustomKeywordSearch::TYPE_COMPETITOR) {
            return CustomKeywordSearch::TYPE_BRAND;
        }

        return in_array($type, CustomKeywordSearch::allowedTypes(), true) ? $type : null;
    }
}
