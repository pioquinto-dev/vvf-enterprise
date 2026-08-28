<?php

namespace Tests\Feature;

use App\Jobs\RunCustomKeywordSearch;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\IndexedKeyword;
use App\Models\User;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class SavedSearchManagerTest extends TestCase
{
    use RefreshDatabase;

    private SavedSearchManager $manager;

    protected function setUp(): void
    {
        parent::setUp();

        Bus::fake([RunCustomKeywordSearch::class]);
        $this->manager = app(SavedSearchManager::class);
    }

    private function user(int $credits = 5): User
    {
        $user = User::factory()->create();

        // 'free' with a future-less renewal keeps the entitlement service from
        // resetting the balance mid-test.
        $user->forceFill([
            'current_plan_slug' => 'free',
            'monthly_credits_remaining' => $credits,
            'plan_renews_at' => null,
        ])->save();

        return $user;
    }

    private function create(User $user): CustomKeywordSearch
    {
        return $this->manager->create(
            user: $user,
            guestToken: null,
            type: CustomKeywordSearch::TYPE_BRAND,
            phrase: 'gopure beauty',
            keywords: ['gopure beauty', 'gopure review'],
            name: null,
            frequency: CustomKeywordSearch::FREQUENCY_WEEKLY,
        );
    }

    public function test_re_searching_the_same_keywords_charges_but_does_not_duplicate(): void
    {
        $user = $this->user(credits: 5);

        $first = $this->create($user);
        $this->assertSame(4, (int) $user->refresh()->monthly_credits_remaining);

        // Finish the first run so the re-search actually starts a new scrape.
        $first->runs()->update(['status' => CustomKeywordSearchRun::STATUS_DONE, 'completed_at' => now()]);

        $second = $this->create($user);

        // Same record, second run, second credit.
        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, CustomKeywordSearch::count());
        $this->assertSame(2, $second->runs()->count());
        $this->assertSame(3, (int) $user->refresh()->monthly_credits_remaining);
    }

    public function test_re_searching_while_a_run_is_active_charges_nothing(): void
    {
        $user = $this->user(credits: 5);

        $first = $this->create($user);
        $this->assertSame(4, (int) $user->refresh()->monthly_credits_remaining);

        // The first run is still queued — no new scrape starts, so the user is
        // brought back to the search in flight without paying again.
        $again = $this->create($user);

        $this->assertSame($first->id, $again->id);
        $this->assertSame(1, $again->runs()->count());
        $this->assertSame(4, (int) $user->refresh()->monthly_credits_remaining);
    }

    public function test_different_keyword_order_still_reuses_the_record(): void
    {
        $user = $this->user(credits: 5);

        $first = $this->create($user);
        $first->runs()->update(['status' => CustomKeywordSearchRun::STATUS_DONE, 'completed_at' => now()]);

        $second = $this->manager->create(
            user: $user,
            guestToken: null,
            type: CustomKeywordSearch::TYPE_BRAND,
            phrase: 'gopure beauty',
            keywords: ['gopure review', 'gopure beauty'],
            name: null,
            frequency: CustomKeywordSearch::FREQUENCY_WEEKLY,
        );

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, CustomKeywordSearch::count());
    }

    public function test_learning_from_a_search_only_seeds_the_main_phrase_into_the_keyword_index(): void
    {
        $user = $this->user(credits: 5);

        $this->manager->create(
            user: $user,
            guestToken: null,
            type: CustomKeywordSearch::TYPE_BRAND,
            phrase: 'american eagle',
            keywords: ['american eagle', 'american eagle haul', 'american eagle unboxing'],
            name: null,
            frequency: CustomKeywordSearch::FREQUENCY_WEEKLY,
        );

        $this->assertDatabaseHas('indexed_keywords', [
            'normalized_label' => 'american eagle',
            'keyword_type' => IndexedKeyword::TYPE_BRAND,
            'source' => 'search',
        ]);

        $this->assertDatabaseMissing('indexed_keywords', [
            'normalized_label' => 'american eagle haul',
        ]);

        $this->assertDatabaseMissing('indexed_keywords', [
            'normalized_label' => 'american eagle unboxing',
        ]);
    }
}
