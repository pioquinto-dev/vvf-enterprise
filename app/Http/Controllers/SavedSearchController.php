<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavedSearchRequest;
use App\Http\Resources\SavedSearchPresenter;
use App\Jobs\EnrichSearchResults;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\User;
use App\Services\Analytics\AnalyticsEvent;
use App\Services\Billing\BillingService;
use App\Services\Bookmarks\BookmarkService;
use App\Services\CustomKeywordSearch\FeedService;
use App\Services\CustomKeywordSearch\GuestSearchQuota;
use App\Services\CustomKeywordSearch\KeywordExpansionService;
use App\Services\CustomKeywordSearch\LibraryService;
use App\Services\CustomKeywordSearch\OwnedSearchResolver;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use App\Services\CustomKeywordSearch\SearchHubService;
use App\Support\GuestIdentity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class SavedSearchController extends Controller
{
    public function __construct(
        private readonly KeywordExpansionService $expansion,
        private readonly SavedSearchManager $manager,
        private readonly BillingService $billing,
        private readonly OwnedSearchResolver $searches,
        private readonly BookmarkService $bookmarks,
        private readonly GuestSearchQuota $guestQuota,
        private readonly FeedService $feed,
        private readonly SearchHubService $searchHub,
        private readonly LibraryService $library,
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
            'examples' => $this->feed->showcase(),
        ]);
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
     * GET /home — "My Feed", the signed-in landing page. A single feed built
     * from the user's own searches (their breakout videos, sounds, hashtags and
     * saved videos). Searches start from the brand/product hubs.
     */
    public function home(Request $request): Response
    {
        return Inertia::render('Feed', [
            'feed' => $this->feed->payload($request),
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
            'analysisHistoryCount' => $bookmarkedOnly ? $this->library->analysisHistoryCount($request->user()) : 0,
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
        $videoIds = $this->bookmarks->idsForUser($request->user());

        return response()->json([
            'videos' => $this->library->bookmarkedVideos($videoIds),
        ]);
    }

    public function analysisHistoryJson(Request $request): JsonResponse
    {
        return response()->json([
            'history' => $this->library->analysisHistory($request->user()),
        ]);
    }

    /**
     * GET /brands — the dedicated brand search hub.
     */
    public function brands(Request $request): Response
    {
        return $this->renderSearchHub(
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
        return $this->renderSearchHub($request, [CustomKeywordSearch::TYPE_PRODUCT], 'Products');
    }

    /**
     * Shared body for the brand/product hubs.
     *
     * @param  array<int, string>  $types
     */
    private function renderSearchHub(Request $request, array $types, string $page): Response
    {
        return Inertia::render($page, $this->searchHub->payload($request, $types));
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
