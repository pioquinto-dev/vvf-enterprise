<?php

namespace Tests\Unit;

use App\Services\CustomKeywordSearch\KeywordExpansionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class KeywordExpansionPreviewTest extends TestCase
{
    use RefreshDatabase;

    private function service(): KeywordExpansionService
    {
        return app(KeywordExpansionService::class);
    }

    public function test_preview_is_instant_and_never_calls_openai(): void
    {
        config()->set('services.openai.api_key', 'test-key');
        Http::preventStrayRequests();

        $payload = $this->service()->preview('gymshark');

        $this->assertSame('gymshark', $payload['phrase']);
        $this->assertSame('preview', $payload['source']);
        $this->assertSame('gymshark', $payload['keywords'][0]);
        Http::assertNothingSent();
    }

    public function test_preview_does_not_poison_the_ai_cache(): void
    {
        config()->set('services.openai.api_key', 'test-key');
        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => json_encode(['gymshark review', 'gymshark leggings'])]]],
            ]),
        ]);

        // Preview first, exactly as the expand screen fires it.
        $this->assertSame('preview', $this->service()->preview('gymshark')['source']);

        // The real AI pass must still run and win.
        $ai = $this->service()->expand('gymshark');
        $this->assertSame('ai', $ai['source']);
        $this->assertSame('gymshark review', $ai['keywords'][1]);
    }

    public function test_preview_serves_a_cached_ai_result_when_present(): void
    {
        config()->set('services.openai.api_key', 'test-key');
        Http::fake([
            '*/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => json_encode(['gymshark review', 'gymshark leggings'])]]],
            ]),
        ]);

        $this->assertSame('ai', $this->service()->expand('gymshark')['source']);

        $preview = $this->service()->preview('gymshark');
        $this->assertSame('ai', $preview['source']);
        $this->assertSame('gymshark review', $preview['keywords'][1]);
    }
}
