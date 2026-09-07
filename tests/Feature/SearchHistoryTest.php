<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SearchHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_history_contains_every_owned_search_in_search_date_order(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $older = $this->search($user, 'Older search', now()->subDays(2));
        $newer = $this->search($user, 'Newest search', now()->subHour());
        $this->search($otherUser, 'Someone else search', now());

        $this->actingAs($user)
            ->get('/library?tab=history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('SavedSearches/Index')
                ->has('searchHistory', 2)
                ->where('searchHistory.0.id', $newer->id)
                ->where('searchHistory.0.name', 'Newest search')
                ->where('searchHistory.1.id', $older->id)
                ->where('searchHistory.1.name', 'Older search'));
    }

    public function test_search_history_requires_authentication(): void
    {
        $this->get('/library?tab=history')->assertRedirect('/login');
    }

    private function search(User $user, string $name, \DateTimeInterface $createdAt): CustomKeywordSearch
    {
        $search = CustomKeywordSearch::query()->create([
            'user_id' => $user->id,
            'name' => $name,
            'phrase' => strtolower(str_replace(' ', '-', $name)),
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
            'keywords' => [$name],
            'keyword_signature' => strtolower($name),
            'frequency' => CustomKeywordSearch::FREQUENCY_WEEKLY,
            'status' => CustomKeywordSearch::STATUS_DONE,
        ]);

        $search->forceFill(['created_at' => $createdAt, 'updated_at' => $createdAt])->saveQuietly();

        return $search;
    }
}
