<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FreeSearchFunnelTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_free_search_is_not_created_before_google_sign_in(): void
    {
        $this->postJson('/search/pending', [
            'type' => 'brand',
            'phrase' => 'rhode skin',
            'keywords' => ['rhode skin', 'skincare'],
            'frequency' => 'weekly',
            'sources' => [
                'tiktokHandle' => 'rhode',
                'website' => 'rhodeskin.com',
            ],
        ])->assertOk()->assertJson(['ready' => true]);

        $this->assertSame(0, CustomKeywordSearch::count());
        $this->assertSame('rhode skin', session('free_search.pending.phrase'));
        $this->assertSame('rhode', session('free_search.pending.sources.tiktokHandle'));
    }

    public function test_product_pending_search_discards_brand_sources(): void
    {
        $this->postJson('/search/pending', [
            'type' => 'product',
            'phrase' => 'lip oil',
            'keywords' => ['lip oil'],
            'frequency' => 'weekly',
            'sources' => [
                'tiktokHandle' => 'not-used',
                'website' => 'not-used.example',
            ],
        ])->assertOk();

        $this->assertNull(session('free_search.pending.sources'));
    }
}
