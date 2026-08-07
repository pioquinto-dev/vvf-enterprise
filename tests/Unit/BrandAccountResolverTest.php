<?php

namespace Tests\Unit;

use App\Services\CustomKeywordSearch\BrandAccountResolver;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BrandAccountResolverTest extends TestCase
{
    private BrandAccountResolver $resolver;

    protected function setUp(): void
    {
        parent::setUp();
        Http::preventStrayRequests();
        $this->resolver = new BrandAccountResolver;
    }

    /**
     * @return array<string, mixed>
     */
    private function row(string $handle, int $views, array $overrides = []): array
    {
        return array_merge([
            'handle' => $handle,
            'views' => $views,
            'creator_name' => null,
            'avatar' => null,
            'followers' => 0,
        ], $overrides);
    }

    /**
     * @param  array<string, mixed>  $choice
     */
    private function fakeChoice(array $choice): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.base_url' => 'https://api.openai.test/v1',
            'custom_keyword_search.analysis.model' => 'gpt-4.1-mini',
            'custom_keyword_search.analysis.timeout' => 45,
        ]);

        Http::fake([
            'https://api.openai.test/v1/chat/completions' => Http::response([
                'choices' => [[
                    'message' => [
                        'content' => json_encode($choice),
                    ],
                ]],
            ]),
        ]);
    }

    public function test_it_returns_null_without_a_phrase(): void
    {
        $this->assertNull($this->resolver->resolve([$this->row('@brand', 100)]));
        $this->assertNull($this->resolver->resolve([$this->row('@brand', 100)], ''));
    }

    public function test_it_returns_null_when_openai_is_not_configured(): void
    {
        config([
            'services.openai.api_key' => null,
        ]);

        $this->assertNull($this->resolver->resolve([$this->row('@brand', 100)], 'brand'));
    }

    public function test_it_can_use_openai_to_pick_the_official_brand_account_from_the_phrase(): void
    {
        $this->fakeChoice([
            'handle' => '@americaneagle',
            'confidence' => 0.91,
        ]);

        $account = $this->resolver->resolve([
            $this->row('@abbikallyn1', 4_000_000, ['creator_name' => 'Abbi Kallyn']),
            $this->row('@americaneagle', 120_000, ['creator_name' => 'American Eagle', 'followers' => 367_000]),
            $this->row('@abbikallyn1', 3_000_000, ['creator_name' => 'Abbi Kallyn']),
        ], 'American Eagle Outfitters');

        $this->assertSame('@americaneagle', $account['handle']);
        $this->assertSame('ai', $account['source']);
        $this->assertTrue($account['is_confident']);
        $this->assertSame(1, $account['posts_in_search']);
        $this->assertSame(367_000, $account['followers']);
    }

    public function test_it_keeps_the_openai_handle_even_when_it_is_not_in_matched_results(): void
    {
        $this->fakeChoice([
            'handle' => '@americaneagle',
            'confidence' => 0.88,
        ]);

        $account = $this->resolver->resolve([
            $this->row('@abbikallyn1', 4_000_000, ['creator_name' => 'Abbi Kallyn']),
        ], 'American Eagle Outfitters');

        $this->assertSame('@americaneagle', $account['handle']);
        $this->assertSame(0, $account['posts_in_search']);
        $this->assertNull($account['followers']);
        $this->assertNull($account['avatar']);
    }

    public function test_it_hides_the_handle_when_openai_is_not_confident(): void
    {
        $this->fakeChoice([
            'handle' => '@brand',
            'confidence' => 0.2,
        ]);

        $this->assertNull($this->resolver->resolve([
            $this->row('@brand', 100),
            $this->row('@creator', 9_000),
        ], 'brand'));
    }

    public function test_a_decline_is_cached_so_it_is_not_re_asked(): void
    {
        $this->fakeChoice([
            'handle' => null,
            'confidence' => 0.0,
        ]);

        $rows = [$this->row('@creator', 100), $this->row('@other', 50)];

        $this->assertNull($this->resolver->resolve($rows, 'brand'));
        $this->assertNull($this->resolver->resolve($rows, 'brand'));

        Http::assertSentCount(1);
    }

    public function test_an_unreadable_reply_is_cached_as_a_decline(): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.base_url' => 'https://api.openai.test/v1',
        ]);

        Http::fake([
            'https://api.openai.test/v1/chat/completions' => Http::response([
                'choices' => [['message' => ['content' => 'Sure! Here is the answer:']]],
            ]),
        ]);

        $rows = [$this->row('@brand', 100)];

        $this->assertNull($this->resolver->resolve($rows, 'brand'));
        $this->assertNull($this->resolver->resolve($rows, 'brand'));

        Http::assertSentCount(1);
    }

    public function test_a_failed_request_is_not_cached(): void
    {
        config([
            'services.openai.api_key' => 'test-key',
            'services.openai.base_url' => 'https://api.openai.test/v1',
        ]);

        Http::fake([
            'https://api.openai.test/v1/chat/completions' => Http::response([], 500),
        ]);

        $rows = [$this->row('@brand', 100)];

        $this->resolver->resolve($rows, 'brand');
        $this->resolver->resolve($rows, 'brand');

        Http::assertSentCount(2);
    }

    public function test_the_account_decision_is_only_requested_once_per_phrase(): void
    {
        $this->fakeChoice([
            'handle' => '@brand',
            'confidence' => 0.9,
        ]);

        $rows = [$this->row('@brand', 100), $this->row('@creator', 200)];

        $this->resolver->resolve($rows, 'brand');
        $this->resolver->resolve($rows, 'brand');
        $this->resolver->resolve([$this->row('@newcreator', 500)], 'brand');

        Http::assertSentCount(1);
    }

    public function test_a_new_phrase_re_asks_the_model(): void
    {
        $this->fakeChoice([
            'handle' => '@brand',
            'confidence' => 0.9,
        ]);

        $this->resolver->resolve([$this->row('@brand', 100)], 'brand');
        $this->resolver->resolve([$this->row('@brand', 100)], 'other brand');

        Http::assertSentCount(2);
    }

    public function test_a_cached_decision_is_rehydrated_from_the_current_rows(): void
    {
        $this->fakeChoice([
            'handle' => '@brand',
            'confidence' => 0.9,
        ]);

        $this->resolver->resolve([
            $this->row('@brand', 100, ['followers' => 12_000, 'avatar' => 'https://cdn/old.jpg']),
        ], 'brand');

        $account = $this->resolver->resolve([
            $this->row('@brand', 100, ['followers' => 367_000, 'avatar' => 'https://cdn/new.jpg']),
        ], 'brand');

        $this->assertSame('ai', $account['source']);
        $this->assertSame(367_000, $account['followers']);
        $this->assertSame('https://cdn/new.jpg', $account['avatar']);
        Http::assertSentCount(1);
    }

    public function test_the_account_median_only_counts_that_handles_videos(): void
    {
        $rows = [
            $this->row('@brand', 100),
            $this->row('@brand', 300),
            $this->row('@brand', 500),
            $this->row('@other', 9_000_000),
        ];

        $this->assertSame(300, $this->resolver->medianViewsForHandle($rows, '@brand'));
        $this->assertSame(0, $this->resolver->medianViewsForHandle($rows, '@nobody'));
    }
}
