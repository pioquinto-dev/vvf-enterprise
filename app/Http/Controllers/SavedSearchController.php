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
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
class SavedSearchController extends Controller
{
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
        ]);

        // Expansion hits OpenAI on a cache miss, so keep it from being hammered.
        $key = 'cks-expand:'.($request->user()?->id ?? $request->ip());

        if (RateLimiter::tooManyAttempts($key, 30)) {
            return response()->json([
                'message' => 'Too many keyword suggestions requested. Try again shortly.',
            ], 429);
        }

        RateLimiter::hit($key, 60);

        return response()->json($this->expansion->expand($validated['phrase']));
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

        return Inertia::render('SavedSearches/Index', [
            'searches' => $searches,
            'filterType' => $filterType,
            'watchlistedOnly' => $bookmarkedOnly,
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /**
     * GET /bookmark/{id} — detail with the ranked result list.
     */
    public function show(Request $request, int $id): Response
    {
        $search = $this->searches->resolve($request, $id);
        $bookmarkedVideoIds = $this->bookmarks->idsForUser($request->user());

        return Inertia::render('SavedSearches/Show', [
            'search' => SavedSearchPresenter::detail($search, $bookmarkedVideoIds),
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /** JSON twin of show(), used to refresh the results page in place. */
    public function showJson(Request $request, int $id): JsonResponse
    {
        return response()->json([
            'search' => SavedSearchPresenter::detail($this->searches->resolve($request, $id), $this->bookmarks->idsForUser($request->user())),
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

    /** Name and frequency only — keywords are fixed once a search exists. */
    public function updateFrequency(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:'.config('custom_keyword_search.limits.max_name_length', 80)],
            'frequency' => ['nullable', 'in:'.CustomKeywordSearch::FREQUENCY_WEEKLY.','.CustomKeywordSearch::FREQUENCY_MONTHLY],
        ]);

        $search = $this->manager->updateSettings(
            $this->searches->resolve($request, $id),
            $validated['name'] ?? null,
            $validated['frequency'] ?? null,
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

        $this->manager->queueRun($search);

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
