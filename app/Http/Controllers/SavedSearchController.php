<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavedSearchRequest;
use App\Http\Resources\SavedSearchPresenter;
use App\Models\CustomKeywordSearch;
use App\Services\Bookmarks\BookmarkService;
use App\Services\Billing\BillingService;
use App\Services\CustomKeywordSearch\GuestSearchQuota;
use App\Services\CustomKeywordSearch\KeywordExpansionService;
use App\Services\CustomKeywordSearch\OwnedSearchResolver;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use App\Support\GuestIdentity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
class SavedSearchController extends Controller
{
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
        ]);

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
        ));
    }

    /**
     * POST /saved-searches — create (or reuse) a search and queue its first run.
     */
    public function store(StoreSavedSearchRequest $request): JsonResponse
    {
        // A scrape costs real money whoever starts it, so both branches are
        // checked here. Guests used to fall through unchecked entirely.
        if ($request->user() !== null) {
            $this->billing->ensureCanCreateSearch($request->user());
        } else {
            $this->guestQuota->ensureCanCreateSearch($request);
        }

        $search = $this->manager->create(
            user: $request->user(),
            guestToken: $request->user() ? null : GuestIdentity::token($request, create: true),
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
        ], 201);
    }

    /**
     * GET /saved-searches/notifications?ids[]=1 — what the running screen polls.
     */
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

    /**
     * GET /dashboard — the search launcher plus the few most recent searches
     * for the "Pick up where you left off" card.
     */
    public function dashboard(Request $request): Response|RedirectResponse
    {
        $runId = $request->integer('run');

        if ($runId > 0) {
            $ownedRun = \App\Models\CustomKeywordSearchRun::query()
                ->whereKey($runId)
                ->whereHas('search', fn ($query) => $query->where('user_id', $request->user()->id))
                ->exists();

            if (! $ownedRun) {
                return redirect('/dashboard');
            }
        }

        $recent = $this->searches->all($request, null, false)
            ->take(3)
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::summary($search))
            ->values()
            ->all();

        return Inertia::render('Dashboard', [
            'recent' => $recent,
            'searchSuggestions' => [
                'brand' => $this->suggestions($this->searches->all($request, [CustomKeywordSearch::TYPE_BRAND], false), [CustomKeywordSearch::TYPE_BRAND]),
                'competitor' => $this->suggestions($this->searches->all($request, [CustomKeywordSearch::TYPE_COMPETITOR], false), [CustomKeywordSearch::TYPE_COMPETITOR]),
                'product' => $this->suggestions($this->searches->all($request, [CustomKeywordSearch::TYPE_PRODUCT], false), [CustomKeywordSearch::TYPE_PRODUCT]),
            ],
        ]);
    }

    /**
     * GET /bookmark — the saved list.
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

        // The Library's "Bookmarked videos" tab lives in the same default view.
        $videoIds = $bookmarkedOnly ? $this->bookmarks->idsForUser($request->user()) : [];
        $bookmarkedVideos = $videoIds === []
            ? []
            : \App\Models\ViralVideo::query()
                ->visible()
                ->whereIn('id', $videoIds)
                ->get()
                ->map(fn (\App\Models\ViralVideo $video): array => $video->toCardArray())
                ->all();

        return Inertia::render('SavedSearches/Index', [
            'searches' => $searches,
            'bookmarkedVideos' => $bookmarkedVideos,
            'filterType' => $filterType,
            'watchlistedOnly' => $bookmarkedOnly,
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /**
     * GET /brands — the dedicated brand + competitor search hub.
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
     * headline stats, plus the single best outlier across them ("Moving this
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

        $cards = $searches
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::card($search))
            ->values()
            ->all();

        return Inertia::render($page, [
            'searches' => $cards,
            'moving' => $this->movingThisWeek($searches),
            'suggestions' => $this->suggestions($searches, $types),
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
     * @param  \Illuminate\Support\Collection<int, CustomKeywordSearch>  $searches
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
                ->map(fn (CustomKeywordSearch $search): array => array_values((array) ($this->expansion->expand((string) $search->phrase)['keywords'] ?? [])))
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
     * Top outlier videos across a set of searches, newest-scored first.
     *
     * @param  \Illuminate\Support\Collection<int, CustomKeywordSearch>  $searches
     * @return array<int, array<string, mixed>>
     */
    private function movingThisWeek($searches): array
    {
        if ($searches->isEmpty()) {
            return [];
        }

        $names = $searches->pluck('name', 'id');
        $urls = $searches->mapWithKeys(fn (CustomKeywordSearch $s): array => [$s->id => $s->url()]);

        return \App\Models\CustomKeywordSearchVideo::query()
            ->whereIn('custom_keyword_search_id', $searches->pluck('id'))
            ->whereHas('video', fn ($query) => $query->visible())
            ->with('video')
            ->orderByDesc('viral_score')
            ->limit(3)
            ->get()
            ->map(function (\App\Models\CustomKeywordSearchVideo $row) use ($names, $urls): array {
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
    public function show(Request $request, string $search): Response
    {
        $model = $this->searches->resolveByKey($request, $search);
        $bookmarkedVideoIds = $this->bookmarks->idsForUser($request->user());

        return Inertia::render('SavedSearches/Show', [
            'search' => SavedSearchPresenter::detail($model, $bookmarkedVideoIds, $request->user()),
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /** Old /bookmark/{id} links redirect to the canonical /results/{public_id}. */
    public function showLegacyRedirect(Request $request, int $id): RedirectResponse
    {
        return redirect($this->searches->resolve($request, $id)->url());
    }

    /** JSON twin of show(), used to refresh the results page in place. */
    public function showJson(Request $request, int $id): JsonResponse
    {
        return response()->json([
            'search' => SavedSearchPresenter::detail(
                $this->searches->resolve($request, $id),
                $this->bookmarks->idsForUser($request->user()),
                $request->user(),
            ),
        ]);
    }

    /**
     * Print-friendly export page intended for the browser's "Save as PDF".
     */
    public function exportPdf(Request $request, string $search): HttpResponse
    {
        $model = $this->searches->resolveByKey($request, $search);
        $detail = SavedSearchPresenter::detail($model, $this->bookmarks->idsForUser($request->user()), $request->user());
        $insights = $detail['insights'] ?? [];
        $results = array_slice((array) ($detail['results'] ?? []), 0, 12);
        $trendPoints = (array) data_get($insights, 'trend.points', []);
        $latestTrend = $trendPoints === [] ? null : $trendPoints[array_key_last($trendPoints)];

        return response()
            ->view('reports.saved-search-export', [
                'search' => $detail,
                'insights' => $insights,
                'results' => $results,
                'latestTrend' => $latestTrend,
                'print' => $request->boolean('print', true),
            ])
            ->header('Content-Type', 'text/html; charset=UTF-8');
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

    /** Name, schedule, and brand account metadata only — keywords are fixed once a search exists. */
    public function updateFrequency(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:'.config('custom_keyword_search.limits.max_name_length', 80)],
            'frequency' => ['nullable', 'in:'.CustomKeywordSearch::FREQUENCY_WEEKLY.','.CustomKeywordSearch::FREQUENCY_MONTHLY],
            'sources' => ['nullable', 'array'],
            'sources.tiktokHandle' => ['nullable', 'string', 'max:120'],
            'sources.website' => ['nullable', 'string', 'max:255'],
        ]);

        $search = $this->manager->updateSettings(
            $this->searches->resolve($request, $id),
            $validated['name'] ?? null,
            $validated['frequency'] ?? null,
            data_get($validated, 'sources.tiktokHandle'),
            data_get($validated, 'sources.website'),
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

        return response()->json(['search' => SavedSearchPresenter::summary($search->refresh())]);
    }

    public function destroy(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $this->manager->delete($this->searches->resolve($request, $id));

        if ($request->expectsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect('/bookmark');
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
        ]);
    }

    private function filterType(Request $request): ?string
    {
        $type = (string) $request->query('type', '');

        if ($type === 'brand-group') {
            return $type;
        }

        return in_array($type, CustomKeywordSearch::allowedTypes(), true) ? $type : null;
    }
}
