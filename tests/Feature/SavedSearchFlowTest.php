<?php

namespace Tests\Feature;

use App\Jobs\RunCustomKeywordSearch;
use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SavedSearchFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Nothing in these tests should reach a third party.
        Http::preventStrayRequests();
        Queue::fake();
    }

    public function test_expansion_falls_back_to_templates_without_an_api_key(): void
    {
        config()->set('services.openai.api_key', null);

        $response = $this->postJson('/saved-searches/expand', ['phrase' => 'side hustle ideas']);

        $response->assertOk()
            ->assertJsonPath('phrase', 'side hustle ideas')
            ->assertJsonPath('source', 'fallback');

        $keywords = $response->json('keywords');

        $this->assertSame('side hustle ideas', $keywords[0]);
        $this->assertContains('side hustle ideas review', $keywords);
    }

    public function test_expansion_uses_openai_when_it_answers(): void
    {
        config()->set('services.openai.api_key', 'test-key');

        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => json_encode(['make money online', 'passive income'])],
                ]],
            ]),
        ]);

        $response = $this->postJson('/saved-searches/expand', ['phrase' => 'side hustle ideas']);

        $response->assertOk()
            ->assertJsonPath('source', 'ai')
            ->assertJsonPath('keywords.0', 'side hustle ideas')
            ->assertJsonPath('keywords.1', 'make money online');

        Http::assertSent(function ($request): bool {
            $messages = $request['messages'] ?? [];
            $system = $messages[0]['content'] ?? '';
            $user = $messages[1]['content'] ?? '';

            return str_contains($system, 'Return only a raw JSON array of strings')
                && str_contains($system, 'Stay very near the original phrase and avoid category drift')
                && str_contains($user, 'Niche phrase: side hustle ideas')
                && str_contains($user, 'Good outputs are close variants');
        });
    }

    public function test_expansion_can_bypass_cache_when_regenerating(): void
    {
        config()->set('services.openai.api_key', 'test-key');

        Http::fakeSequence()
            ->push([
                'choices' => [[
                    'message' => ['content' => json_encode(['gymshark review', 'gymshark leggings'])],
                ]],
            ])
            ->push([
                'choices' => [[
                    'message' => ['content' => json_encode(['gymshark haul', 'gymshark shorts'])],
                ]],
            ]);

        $first = $this->postJson('/saved-searches/expand', ['phrase' => 'gymshark']);
        $cached = $this->postJson('/saved-searches/expand', ['phrase' => 'gymshark']);
        $fresh = $this->postJson('/saved-searches/expand', ['phrase' => 'gymshark', 'fresh' => true]);

        $first->assertOk()
            ->assertJsonPath('keywords.1', 'gymshark review');

        $cached->assertOk()
            ->assertJsonPath('keywords.1', 'gymshark review');

        $fresh->assertOk()
            ->assertJsonPath('keywords.1', 'gymshark haul');
    }

    public function test_expansion_filters_out_terms_that_drift_off_the_phrase_anchor(): void
    {
        config()->set('services.openai.api_key', 'test-key');

        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => json_encode([
                        'jaxxon rings',
                        'jaxxon bracelet',
                        'mens bracelets',
                        'minimalist rings',
                    ])],
                ]],
            ]),
        ]);

        $response = $this->postJson('/saved-searches/expand', ['phrase' => 'jaxxon jewelry']);

        $response->assertOk()
            ->assertJsonPath('source', 'ai');

        $keywords = $response->json('keywords');

        $this->assertContains('jaxxon rings', $keywords);
        $this->assertContains('jaxxon bracelet', $keywords);
        $this->assertNotContains('mens bracelets', $keywords);
        $this->assertNotContains('minimalist rings', $keywords);
    }

    public function test_expansion_requires_a_phrase(): void
    {
        $this->postJson('/saved-searches/expand', ['phrase' => ''])
            ->assertStatus(422)
            ->assertJsonValidationErrors('phrase');
    }

    public function test_creating_a_search_queues_a_run(): void
    {
        $response = $this->postJson('/saved-searches', [
            'phrase' => 'side hustle ideas',
            'keywords' => ['side hustle ideas', 'make money online'],
            'frequency' => 'weekly',
        ]);

        $response->assertCreated()->assertJsonPath('status', 'scraping');

        $search = CustomKeywordSearch::firstOrFail();

        $this->assertSame('side hustle ideas', $search->phrase);
        $this->assertSame('side hustle ideas', $search->name);
        $this->assertNotNull($search->guest_token);
        $this->assertNotNull($search->next_run_at);
        $this->assertDatabaseHas('custom_keyword_search_runs', [
            'custom_keyword_search_id' => $search->id,
            'status' => CustomKeywordSearchRun::STATUS_QUEUED,
        ]);

        Queue::assertPushed(RunCustomKeywordSearch::class);
    }

    public function test_creating_a_product_search_queues_a_run_without_sources(): void
    {
        $response = $this->postJson('/saved-searches', [
            'type' => 'product',
            'phrase' => 'lip oil',
            'keywords' => ['lip oil', 'lip oil review', 'best lip oil'],
            'frequency' => 'weekly',
        ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'scraping');

        $search = CustomKeywordSearch::firstOrFail();

        $this->assertSame(CustomKeywordSearch::TYPE_PRODUCT, $search->search_type);
        $this->assertSame('lip oil', $search->phrase);
        $this->assertNull($search->source_tiktok_handle);
        $this->assertNull($search->source_website);

        Queue::assertPushed(RunCustomKeywordSearch::class);
    }

    public function test_creating_a_search_persists_optional_sources(): void
    {
        $this->postJson('/saved-searches', [
            'type' => 'brand',
            'phrase' => 'rhode skin',
            'keywords' => ['rhode skin', 'rhode'],
            'frequency' => 'weekly',
            'sources' => [
                'tiktokHandle' => '@rhode',
                'website' => 'https://rhodeskin.com/',
            ],
        ])->assertCreated();

        $search = CustomKeywordSearch::firstOrFail();

        $this->assertSame('rhode', $search->source_tiktok_handle);
        $this->assertSame('rhodeskin.com', $search->source_website);
    }

    public function test_creating_a_product_search_persists_optional_sources(): void
    {
        $this->postJson('/saved-searches', [
            'type' => 'product',
            'phrase' => 'lip oil',
            'keywords' => ['lip oil', 'lip oil review'],
            'frequency' => 'weekly',
            'sources' => [
                'tiktokHandle' => '@not-a-brand',
                'website' => 'https://example.com/',
            ],
        ])->assertCreated();

        $search = CustomKeywordSearch::firstOrFail();

        $this->assertSame(CustomKeywordSearch::TYPE_PRODUCT, $search->search_type);
        $this->assertSame('not-a-brand', $search->source_tiktok_handle);
        $this->assertSame('example.com', $search->source_website);
    }

    public function test_creating_the_same_keyword_set_reuses_the_existing_search(): void
    {
        // This exercises dedupe, not the quota — a real guest only gets one
        // search, so give this visitor headroom to make the second call.
        config()->set('custom_keyword_search.limits.max_saved_guest', 5);

        $this->postJson('/saved-searches', [
            'phrase' => 'side hustle ideas',
            'keywords' => ['side hustle ideas', 'make money online'],
            'frequency' => 'weekly',
        ])->assertCreated();

        CustomKeywordSearch::query()->update(['status' => CustomKeywordSearch::STATUS_DONE]);
        CustomKeywordSearchRun::query()->update(['status' => CustomKeywordSearchRun::STATUS_DONE]);

        // Same keywords, different order and a new name.
        $second = $this->postJson('/saved-searches', [
            'phrase' => 'side hustle ideas',
            'name' => 'Renamed',
            'keywords' => ['make money online', 'side hustle ideas'],
            'frequency' => 'monthly',
        ])->assertCreated();

        $this->assertSame(1, CustomKeywordSearch::count());

        $search = CustomKeywordSearch::firstOrFail();
        $this->assertSame($search->id, $second->json('id'));
        $this->assertSame('Renamed', $search->name);
        $this->assertSame('monthly', $search->frequency);
        $this->assertSame(2, $search->runs()->count());
    }

    public function test_creation_validates_its_input(): void
    {
        $this->postJson('/saved-searches', ['phrase' => '', 'keywords' => [], 'frequency' => 'daily'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['phrase', 'keywords', 'frequency']);
    }

    public function test_notifications_only_return_searches_owned_by_the_caller(): void
    {
        $created = $this->postJson('/saved-searches', [
            'phrase' => 'korean skincare',
            'keywords' => ['korean skincare'],
            'frequency' => 'weekly',
        ])->json('id');

        $this->getJson("/saved-searches/notifications?ids[]={$created}")
            ->assertOk()
            ->assertJsonCount(1, 'searches')
            ->assertJsonPath('searches.0.id', $created);

        // A different session holds no guest token, so it sees nothing.
        $this->flushSession();

        $this->getJson("/saved-searches/notifications?ids[]={$created}")
            ->assertOk()
            ->assertJsonCount(0, 'searches');
    }

    public function test_pause_fails_active_runs_and_resume_reschedules(): void
    {
        $id = $this->postJson('/saved-searches', [
            'phrase' => 'korean skincare',
            'keywords' => ['korean skincare'],
            'frequency' => 'weekly',
        ])->json('id');

        $this->patchJson("/saved-searches/{$id}/pause")
            ->assertOk()
            ->assertJsonPath('search.status', 'paused');

        $search = CustomKeywordSearch::findOrFail($id);
        $this->assertNull($search->next_run_at);
        $this->assertSame(0, $search->runs()->whereIn('status', ['queued', 'running'])->count());

        $this->patchJson("/saved-searches/{$id}/resume")
            ->assertOk()
            ->assertJsonPath('search.status', 'done');

        $this->assertNotNull(CustomKeywordSearch::findOrFail($id)->next_run_at);
    }

    public function test_frequency_update_leaves_keywords_alone(): void
    {
        $id = $this->postJson('/saved-searches', [
            'phrase' => 'korean skincare',
            'keywords' => ['korean skincare', 'glass skin'],
            'frequency' => 'weekly',
        ])->json('id');

        $this->patchJson("/saved-searches/{$id}/frequency", ['name' => 'K-beauty', 'frequency' => 'monthly'])
            ->assertOk()
            ->assertJsonPath('search.name', 'K-beauty')
            ->assertJsonPath('search.frequency', 'monthly');

        $this->assertSame(['korean skincare', 'glass skin'], CustomKeywordSearch::findOrFail($id)->keywords);
    }

    public function test_frequency_update_can_edit_brand_sources(): void
    {
        $id = $this->postJson('/saved-searches', [
            'type' => 'brand',
            'phrase' => 'rhode skin',
            'keywords' => ['rhode skin', 'rhode'],
            'frequency' => 'weekly',
            'sources' => [
                'tiktokHandle' => '@rhode',
                'website' => 'https://rhodeskin.com/',
            ],
        ])->json('id');

        $this->patchJson("/saved-searches/{$id}/frequency", [
            'name' => 'Rhode',
            'frequency' => 'monthly',
            'sources' => [
                'tiktokHandle' => '@haileybieber',
                'website' => 'https://rhode.co/',
            ],
        ])->assertOk()
            ->assertJsonPath('search.name', 'Rhode')
            ->assertJsonPath('search.frequency', 'monthly')
            ->assertJsonPath('search.source_tiktok_handle', 'haileybieber')
            ->assertJsonPath('search.source_website', 'rhode.co');

        $search = CustomKeywordSearch::findOrFail($id);

        $this->assertSame(['rhode skin', 'rhode'], $search->keywords);
        $this->assertSame('haileybieber', $search->source_tiktok_handle);
        $this->assertSame('rhode.co', $search->source_website);
    }

    public function test_frequency_update_can_edit_sources_for_product_searches(): void
    {
        $id = $this->postJson('/saved-searches', [
            'type' => 'product',
            'phrase' => 'lip oil',
            'keywords' => ['lip oil', 'lip oil review'],
            'frequency' => 'weekly',
        ])->json('id');

        $this->patchJson("/saved-searches/{$id}/frequency", [
            'sources' => [
                'tiktokHandle' => '@not-a-brand',
                'website' => 'https://example.com/',
            ],
        ])->assertOk()
            ->assertJsonPath('search.source_tiktok_handle', 'not-a-brand')
            ->assertJsonPath('search.source_website', 'example.com');

        $search = CustomKeywordSearch::findOrFail($id);

        $this->assertSame('not-a-brand', $search->source_tiktok_handle);
        $this->assertSame('example.com', $search->source_website);
    }

    public function test_delete_soft_deletes_the_search(): void
    {
        $id = $this->postJson('/saved-searches', [
            'phrase' => 'korean skincare',
            'keywords' => ['korean skincare'],
            'frequency' => 'weekly',
        ])->json('id');

        $this->deleteJson("/saved-searches/{$id}")->assertOk();

        $this->assertSoftDeleted('custom_keyword_searches', ['id' => $id]);
        $this->getJson("/saved-searches/{$id}/json")->assertNotFound();
    }

    public function test_another_visitor_cannot_read_a_search(): void
    {
        $id = $this->postJson('/saved-searches', [
            'phrase' => 'korean skincare',
            'keywords' => ['korean skincare'],
            'frequency' => 'weekly',
        ])->json('id');

        $this->flushSession();

        $this->getJson("/saved-searches/{$id}/json")->assertNotFound();
    }
}
