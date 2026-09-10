<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SupportAssistantTest extends TestCase
{
    use RefreshDatabase;

    public function test_support_page_allows_two_openings_per_minute(): void
    {
        $this->get('/support')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('sessionAvailable', true));

        $this->get('/support')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('sessionAvailable', true));

        $this->get('/support')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('sessionAvailable', false)
                ->where('retryAfter', fn (int $seconds) => $seconds > 0));
    }

    public function test_support_chat_returns_a_stateless_ai_reply(): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.base_url' => 'https://openai.test/v1',
        ]);

        Http::fake([
            'https://openai.test/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => 'Start a search from the homepage, then add keywords to refine it.'],
                ]],
            ]),
        ]);

        $this->postJson('/support/chat', ['question' => 'How do I start a search?'])
            ->assertOk()
            ->assertJson([
                'answer' => 'Start a search from the homepage, then add keywords to refine it.',
                'needsContact' => false,
            ]);
    }
}
