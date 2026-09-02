<?php

namespace App\Http\Controllers;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FreeSearchFunnelController extends Controller
{
    public const SESSION_KEY = 'free_search.pending';

    /** Store form progress only. The search is created after Google sign-in. */
    public function store(Request $request): JsonResponse
    {
        $maxPhrase = config('custom_keyword_search.limits.max_phrase_length', 120);
        $validated = $request->validate([
            'type' => ['required', 'in:'.implode(',', CustomKeywordSearch::allowedTypes())],
            'phrase' => ['required', 'string', 'max:'.$maxPhrase],
            'keywords' => ['required', 'array', 'min:1', 'max:'.config('custom_keyword_search.limits.max_keywords', 12)],
            'keywords.*' => ['string', 'max:'.$maxPhrase],
            'frequency' => ['required', 'in:'.CustomKeywordSearch::FREQUENCY_WEEKLY.','.CustomKeywordSearch::FREQUENCY_MONTHLY],
            'sources' => ['nullable', 'array'],
            'sources.tiktokHandle' => ['nullable', 'string', 'max:120'],
            'sources.website' => ['nullable', 'string', 'max:255'],
        ]);

        // Products do not have a single canonical brand account to attach.
        if ($validated['type'] === CustomKeywordSearch::TYPE_PRODUCT) {
            unset($validated['sources']);
        }

        $request->session()->put(self::SESSION_KEY, $validated);

        return response()->json(['ready' => true]);
    }

    /** @return array<string, mixed>|null */
    public static function pull(Request $request): ?array
    {
        $payload = $request->session()->pull(self::SESSION_KEY);

        return is_array($payload) ? $payload : null;
    }

    /** @param array<string, mixed> $payload */
    public static function put(Request $request, array $payload): void
    {
        $request->session()->put(self::SESSION_KEY, $payload);
    }

    /** A pending funnel draft can only redeem an account's first free search. */
    public static function canStartFor(User $user): bool
    {
        return $user->free_search_used_at === null;
    }
}
