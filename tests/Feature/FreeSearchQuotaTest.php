<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\GuestSearchGrant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * The free search is one forever. These cover the routes that used to hand out
 * extras: the signed-out session, the login/logout cycle, deleting searches,
 * and refreshing an existing one.
 */
class FreeSearchQuotaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
        Queue::fake();
        config()->set('services.openai.api_key', null);
    }

    private function search(array $overrides = []): \Illuminate\Testing\TestResponse
    {
        return $this->postJson('/saved-searches', array_merge([
            'phrase' => 'side hustle ideas',
            'keywords' => ['side hustle ideas'],
            'frequency' => 'weekly',
        ], $overrides));
    }

    private function freeUser(): User
    {
        $user = User::factory()->create();

        $user->forceFill([
            'current_plan_slug' => 'free',
            'monthly_credits_remaining' => 0,
            'plan_renews_at' => null,
            'free_search_used_at' => null,
        ])->save();

        return $user;
    }

    public function test_a_guest_gets_exactly_one_search(): void
    {
        $this->search()->assertCreated();

        $this->search(['phrase' => 'korean skincare', 'keywords' => ['korean skincare']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');

        $this->assertSame(1, CustomKeywordSearch::count());
    }

    public function test_a_new_session_does_not_earn_another_guest_search(): void
    {
        $this->search()->assertCreated();

        // Clearing the session is what logging out does. The old code minted a
        // fresh guest token here and handed out another free scrape.
        $this->flushSession();

        $this->search(['phrase' => 'korean skincare', 'keywords' => ['korean skincare']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');

        $this->assertSame(1, CustomKeywordSearch::count());
    }

    /** Sign in through the real endpoint so the Login event and its claim run. */
    private function login(User $user): void
    {
        $this->post('/login', ['email' => $user->email, 'password' => 'password']);
    }

    public function test_the_logout_and_relogin_loop_cannot_mint_free_searches(): void
    {
        $user = $this->freeUser();

        // Round one: search as a guest, then sign in and inherit it.
        $this->search()->assertCreated();
        $this->login($user);

        $this->assertSame(1, CustomKeywordSearch::where('user_id', $user->id)->count());
        $this->assertNotNull($user->refresh()->free_search_used_at);
        $this->assertSame(0, (int) $user->monthly_credits_remaining);

        // Round two: sign out, try the whole cycle again.
        Auth::logout();
        $this->flushSession();


        $this->search(['phrase' => 'korean skincare', 'keywords' => ['korean skincare']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');

        // And signed in, the account has nothing left to spend either.
        $this->actingAs($user)
            ->search(['phrase' => 'korean skincare', 'keywords' => ['korean skincare']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');

        $this->assertSame(1, CustomKeywordSearch::count());
    }

    public function test_claiming_a_guest_search_marks_the_grant_so_it_cannot_be_reused(): void
    {
        $this->search()->assertCreated();

        $this->login($user = $this->freeUser());

        $grant = GuestSearchGrant::firstOrFail();

        $this->assertSame($user->id, $grant->claimed_by_user_id);
        $this->assertTrue($grant->isClaimed());
    }

    public function test_deleting_searches_does_not_refill_the_free_credit(): void
    {
        $user = $this->freeUser();

        $id = $this->actingAs($user)->search()->assertCreated()->json('id');

        $this->assertSame(0, (int) $user->refresh()->monthly_credits_remaining);
        $this->assertNotNull($user->free_search_used_at);

        // Searches are soft-deleted, so the old "do any rows exist?" check came
        // back empty here and handed the credit straight back.
        CustomKeywordSearch::findOrFail($id)->delete();

        $this->actingAs($user)
            ->search(['phrase' => 'korean skincare', 'keywords' => ['korean skincare']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');
    }

    public function test_a_lapsed_plan_falling_back_to_free_does_not_regrant(): void
    {
        $user = $this->freeUser();

        $this->actingAs($user)->search()->assertCreated();

        // Simulate a plan that has expired and needs resetting.
        $user->forceFill([
            'current_plan_slug' => 'basic',
            'plan_renews_at' => now()->subDay(),
        ])->save();

        $this->actingAs($user)
            ->search(['phrase' => 'korean skincare', 'keywords' => ['korean skincare']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');

        $this->assertSame('free', $user->refresh()->current_plan_slug);
        $this->assertSame(0, (int) $user->monthly_credits_remaining);
    }

    public function test_a_guest_cannot_re_search_the_same_keywords_for_free(): void
    {
        $this->search()->assertCreated();

        CustomKeywordSearch::query()->update(['status' => CustomKeywordSearch::STATUS_DONE]);
        \App\Models\CustomKeywordSearchRun::query()->update(['status' => 'done']);

        // Same signature reuses the record, but it is still a fresh scrape.
        $this->search()
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');

        $this->assertSame(1, CustomKeywordSearch::firstOrFail()->runs()->count());
    }

    public function test_refresh_spends_a_credit(): void
    {
        config()->set('features.bypass_paid_features', true);

        $user = $this->freeUser();
        $user->forceFill(['monthly_credits_remaining' => 2])->save();

        $id = $this->actingAs($user)->search()->assertCreated()->json('id');

        CustomKeywordSearch::findOrFail($id)->runs()->update(['status' => 'done', 'completed_at' => now()]);
        $this->assertSame(1, (int) $user->refresh()->monthly_credits_remaining);

        $this->actingAs($user)->postJson("/saved-searches/{$id}/refresh")->assertOk();
        $this->assertSame(0, (int) $user->refresh()->monthly_credits_remaining);

        CustomKeywordSearch::findOrFail($id)->runs()->update(['status' => 'done', 'completed_at' => now()]);

        // Out of credits, so the scrape must not start.
        $this->actingAs($user)->postJson("/saved-searches/{$id}/refresh")
            ->assertStatus(422)
            ->assertJsonValidationErrors('billing');

        $this->assertSame(2, CustomKeywordSearch::findOrFail($id)->runs()->count());
    }
}
