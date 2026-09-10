<?php

namespace Tests\Unit;

use App\Services\Support\SupportAssistant;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SupportAssistantTest extends TestCase
{
    public function test_it_returns_a_single_turn_product_answer(): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.base_url' => 'https://openai.test/v1',
        ]);

        Http::fake([
            'https://openai.test/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => 'Bookmarks let you save videos and searches for later review.'],
                ]],
            ]),
        ]);

        $result = app(SupportAssistant::class)->reply('What does Brand Beacon help teams do?');

        $this->assertSame('Bookmarks let you save videos and searches for later review.', $result['answer']);
        $this->assertFalse($result['needsContact']);
        Http::assertSent(fn ($request) => str_contains((string) data_get($request->data(), 'messages.1.content'), 'What does Brand Beacon help teams do?'));
    }

    public function test_it_sends_unknown_questions_to_contact(): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.base_url' => 'https://openai.test/v1',
        ]);

        Http::fake([
            'https://openai.test/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => ['content' => 'NEEDS_CONTACT'],
                ]],
            ]),
        ]);

        $result = app(SupportAssistant::class)->reply('Can you change my billing address?');

        $this->assertTrue($result['needsContact']);
        $this->assertStringContainsString('do not have enough detail', $result['answer']);
    }

    public function test_it_answers_indexed_questions_without_an_ai_request(): void
    {
        config()->set('services.openai.api_key', null);
        Http::fake();

        $result = app(SupportAssistant::class)->reply('How do bookmarks work?');

        $this->assertFalse($result['needsContact']);
        $this->assertStringContainsString('save videos and saved searches', $result['answer']);
        Http::assertNothingSent();
    }
}
