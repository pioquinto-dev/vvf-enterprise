<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavedSearchRequest;
use App\Http\Resources\SavedSearchPresenter;
use App\Models\CustomKeywordSearch;
use App\Services\CustomKeywordSearch\KeywordExpansionService;
use App\Services\CustomKeywordSearch\SavedSearchManager;
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
        $search = $this->manager->create(
            userId: $request->user()?->id,
            guestToken: $request->user() ? null : GuestIdentity::token($request, create: true),
            phrase: $request->string('phrase')->toString(),
            keywords: $request->input('keywords', []),
            name: $request->input('name'),
            frequency: $request->string('frequency')->toString(),
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

        $searches = CustomKeywordSearch::query()
            ->ownedBy($request->user()?->id, GuestIdentity::token($request))
            ->whereIn('id', $ids)
            ->with('latestRun')
            ->withCount('videos')
            ->get()
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::summary($search))
            ->all();

        return response()->json(['searches' => $searches]);
    }

    /**
     * GET /saved-searches — the saved list.
     */
    public function index(Request $request): Response
    {
        $searches = CustomKeywordSearch::query()
            ->ownedBy($request->user()?->id, GuestIdentity::token($request))
            ->with('latestRun')
            ->withCount('videos')
            ->latest()
            ->get()
            ->map(fn (CustomKeywordSearch $search): array => SavedSearchPresenter::summary($search))
            ->all();

        return Inertia::render('SavedSearches/Index', [
            'searches' => $searches,
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /**
     * GET /saved-searches/{id} — detail with the ranked result list.
     */
    public function show(Request $request, int $id): Response
    {
        $search = $this->findOwned($request, $id);

        return Inertia::render('SavedSearches/Show', [
            'search' => SavedSearchPresenter::detail($search),
            'isAuthenticated' => $request->user() !== null,
        ]);
    }

    /** JSON twin of show(), used to refresh the results page in place. */
    public function showJson(Request $request, int $id): JsonResponse
    {
        return response()->json(['search' => SavedSearchPresenter::detail($this->findOwned($request, $id))]);
    }

    public function pause(Request $request, int $id): JsonResponse
    {
        $search = $this->manager->pause($this->findOwned($request, $id));

        return response()->json(['search' => SavedSearchPresenter::summary($search)]);
    }

    public function resume(Request $request, int $id): JsonResponse
    {
        $search = $this->manager->resume($this->findOwned($request, $id));

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
            $this->findOwned($request, $id),
            $validated['name'] ?? null,
            $validated['frequency'] ?? null,
        );

        return response()->json(['search' => SavedSearchPresenter::summary($search)]);
    }

    public function refresh(Request $request, int $id): JsonResponse
    {
        $search = $this->findOwned($request, $id);

        if ($search->hasActiveRun()) {
            return response()->json([
                'message' => 'This search is already refreshing.',
                'search' => SavedSearchPresenter::summary($search),
            ], 409);
        }

        $this->manager->queueRun($search);

        return response()->json(['search' => SavedSearchPresenter::summary($search->refresh())]);
    }

    public function destroy(Request $request, int $id): RedirectResponse|JsonResponse
    {
        $this->manager->delete($this->findOwned($request, $id));

        if ($request->expectsJson()) {
            return response()->json(['deleted' => true]);
        }

        return redirect('/saved-searches');
    }

    /**
     * Ownership check for both signed-in users and guests holding the session
     * token. A miss is a 404 rather than a 403 so ids cannot be probed.
     */
    private function findOwned(Request $request, int $id): CustomKeywordSearch
    {
        $search = CustomKeywordSearch::query()
            ->ownedBy($request->user()?->id, GuestIdentity::token($request))
            ->with('latestRun')
            ->find($id);

        if ($search === null) {
            throw new NotFoundHttpException('Saved search not found.');
        }

        return $search;
    }
}
