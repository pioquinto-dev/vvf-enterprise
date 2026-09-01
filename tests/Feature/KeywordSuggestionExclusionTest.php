<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use App\Services\IndexedKeywordService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Suggestions must never offer a subject the account has already searched —
 * running the same keyword again just burns a credit. The match is
 * case-insensitive so "American Eagle" indexed and "american eagle" searched
 * still collapse to the same subject.
 */
class KeywordSuggestionExclusionTest extends TestCase
{
    use RefreshDatabase;

    private function indexBrand(string $label): void
    {
        app(IndexedKeywordService::class)->touchTerm('brand', $label);
    }

    private function recordSearch(User $user, string $phrase): void
    {
        CustomKeywordSearch::query()->create([
            'user_id' => $user->id,
            'name' => $phrase,
            'phrase' => $phrase,
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
            'keywords' => [$phrase],
            'keyword_signature' => mb_strtolower($phrase),
        ]);
    }

    private function labels(array $suggestions): array
    {
        return array_map(fn (array $item): string => (string) $item['label'], $suggestions);
    }

    public function test_typed_suggestions_hide_already_searched_subjects(): void
    {
        $user = User::factory()->create();
        $this->indexBrand('American Eagle');
        $this->indexBrand('American Express');
        $this->recordSearch($user, 'american eagle');

        $suggestions = app(IndexedKeywordService::class)->suggest('brand', 'american', 10, $user->id);

        $labels = $this->labels($suggestions);
        $this->assertContains('American Express', $labels);
        $this->assertNotContains('American Eagle', $labels);
    }

    public function test_trending_suggestions_hide_already_searched_subjects(): void
    {
        $user = User::factory()->create();
        $this->indexBrand('American Eagle');
        $this->indexBrand('Google');
        $this->recordSearch($user, 'AMERICAN EAGLE');

        $suggestions = app(IndexedKeywordService::class)->suggest('brand', '', 10, $user->id);

        $labels = $this->labels($suggestions);
        $this->assertContains('Google', $labels);
        $this->assertNotContains('American Eagle', $labels);
    }

    public function test_other_users_searches_do_not_affect_suggestions(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->indexBrand('American Eagle');
        $this->recordSearch($other, 'american eagle');

        $suggestions = app(IndexedKeywordService::class)->suggest('brand', 'american', 10, $user->id);

        $this->assertContains('American Eagle', $this->labels($suggestions));
    }
}
