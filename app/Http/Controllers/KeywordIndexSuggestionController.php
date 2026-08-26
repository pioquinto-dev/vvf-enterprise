<?php

namespace App\Http\Controllers;

use App\Services\IndexedKeywordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KeywordIndexSuggestionController extends Controller
{
    public function __construct(
        private readonly IndexedKeywordService $keywords,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', 'in:brand,product'],
            'q' => ['nullable', 'string', 'max:120'],
        ]);

        return response()->json([
            'suggestions' => $this->keywords->suggest(
                (string) ($validated['type'] ?? 'brand'),
                (string) ($validated['q'] ?? ''),
                10,
                $request->user()?->id,
            ),
        ]);
    }
}
