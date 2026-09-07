<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use App\Support\GuestIdentity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SearchRunningPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_missing_invalid_and_unknown_ids_redirect_to_search(): void
    {
        $this->actingAs(User::factory()->create());
        foreach (['', '?id=0', '?id=abc', '?id[]=1', '?id=999999'] as $query) {
            $this->get('/search/running'.$query)->assertRedirect('/search');
        }
    }

    public function test_public_access_is_locked_even_for_the_guest_owner(): void
    {
        $search = $this->search();
        $this->get('/search/running')->assertRedirect('/');
        $this->get('/search/running?id='.$search->id)->assertRedirect('/');
        $this->withSession([GuestIdentity::SESSION_KEY => 'owner'])
            ->get('/search/running?id='.$search->id)
            ->assertRedirect('/');
    }

    public function test_account_search_requires_its_owner_and_excludes_deleted_searches(): void
    {
        $user = User::factory()->create();
        $search = $this->search(['user_id' => $user->id, 'guest_token' => null]);
        $url = '/search/running?id='.$search->id;
        $this->get($url)->assertRedirect('/');
        $this->actingAs(User::factory()->create())->get($url)->assertRedirect('/search');
        $this->actingAs($user)->get($url)->assertInertia(fn (Assert $page) => $page
            ->component('Search/Running')->where('searchId', $search->id));
        $search->delete();
        $this->get($url)->assertRedirect('/search');
    }

    public function test_inactive_searches_redirect_to_results(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $search = $this->search(['user_id' => $user->id, 'guest_token' => null]);
        foreach (['done', 'failed', 'paused'] as $status) {
            $search->update(['status' => $status]);
            $this->get('/search/running?id='.$search->id)->assertRedirect($search->url());
        }
    }

    private function search(array $attributes = []): CustomKeywordSearch
    {
        return CustomKeywordSearch::create(array_merge([
            'guest_token' => 'owner',
            'name' => 'Test brand',
            'phrase' => 'test brand',
            'keywords' => ['test brand'],
            'keyword_signature' => 'test brand',
            'status' => 'scraping',
        ], $attributes));
    }
}
