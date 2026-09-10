<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A saved search can be relabelled Brand <-> Product from the edit form. The
 * scrape and matching ignore the type, so switching is a metadata-only change
 * that leaves the collected results untouched.
 */
class SearchTypeSwitchTest extends TestCase
{
    use RefreshDatabase;

    private function manager(): SavedSearchManager
    {
        return app(SavedSearchManager::class);
    }

    private function brandSearch(User $user): CustomKeywordSearch
    {
        return CustomKeywordSearch::query()->create([
            'user_id' => $user->id,
            'name' => 'Rhode',
            'phrase' => 'rhode skin',
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
            'keywords' => ['rhode skin'],
            'keyword_signature' => 'rhode skin',
            'frequency' => CustomKeywordSearch::FREQUENCY_WEEKLY,
            'source_tiktok_handle' => 'rhode',
            'source_website' => 'rhode.com',
        ]);
    }

    public function test_switching_a_brand_search_to_product_clears_source_fields(): void
    {
        $user = User::factory()->create();
        $search = $this->brandSearch($user);

        $updated = $this->manager()->updateSettings($search, null, null, null, null, CustomKeywordSearch::TYPE_PRODUCT);

        $this->assertSame(CustomKeywordSearch::TYPE_PRODUCT, $updated->search_type);
        $this->assertNull($updated->source_tiktok_handle);
        $this->assertNull($updated->source_website);
    }

    public function test_switching_product_back_to_brand_keeps_the_type(): void
    {
        $user = User::factory()->create();
        $search = $this->brandSearch($user);

        $this->manager()->updateSettings($search, null, null, null, null, CustomKeywordSearch::TYPE_PRODUCT);
        $updated = $this->manager()->updateSettings($search->refresh(), null, null, null, null, CustomKeywordSearch::TYPE_BRAND);

        $this->assertSame(CustomKeywordSearch::TYPE_BRAND, $updated->search_type);
    }

    public function test_an_unknown_type_is_ignored(): void
    {
        $user = User::factory()->create();
        $search = $this->brandSearch($user);

        $updated = $this->manager()->updateSettings($search, null, null, null, null, 'competitor');

        // 'competitor' is not an allowed type, so nothing changes.
        $this->assertSame(CustomKeywordSearch::TYPE_BRAND, $updated->search_type);
        $this->assertSame('rhode', $updated->source_tiktok_handle);
    }

    public function test_switching_type_does_not_touch_the_keyword_set(): void
    {
        $user = User::factory()->create();
        $search = $this->brandSearch($user);

        $updated = $this->manager()->updateSettings($search, null, null, null, null, CustomKeywordSearch::TYPE_PRODUCT);

        $this->assertSame(['rhode skin'], $updated->keywords);
    }
}
