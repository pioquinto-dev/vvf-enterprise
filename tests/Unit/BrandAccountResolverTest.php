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

    public function test_it_picks_the_handle_posting_the_most_matched_videos(): void
    {
        $account = $this->resolver->resolve([
            $this->row('@gopurebeauty', 100),
            $this->row('@gopurebeauty', 200),
            $this->row('@gopurebeauty', 300),
            $this->row('@somecreator', 9_000_000),
        ]);

        // Post count beats view count: one viral fan video does not make that
        // creator the brand.
        $this->assertSame('@gopurebeauty', $account['handle']);
        $this->assertSame(3, $account['posts_in_search']);
        $this->assertSame(0.75, $account['confidence']);
        $this->assertTrue($account['is_confident']);
        $this->assertSame(2, $account['distinct_accounts']);
    }

    public function test_views_break_a_tie_on_post_count(): void
    {
        $account = $this->resolver->resolve([
            $this->row('@quiet', 100),
            $this->row('@loud', 5_000),
        ]);

        $this->assertSame('@loud', $account['handle']);
    }

    public function test_a_thin_majority_is_flagged_as_low_confidence(): void
    {
        $rows = [$this->row('@brand', 100)];

        for ($i = 0; $i < 19; $i++) {
            $rows[] = $this->row('@creator'.$i, 50);
        }

        $account = $this->resolver->resolve($rows);

        $this->assertSame('@brand', $account['handle']);
        $this->assertSame(0.05, $account['confidence']);
        $this->assertFalse($account['is_confident']);
    }

    public function test_it_takes_the_highest_follower_count_seen(): void
    {
        $account = $this->resolver->resolve([
            $this->row('@brand', 100, ['followers' => 12_000]),
            $this->row('@brand', 200, ['followers' => 367_000]),
        ]);

        $this->assertSame(367_000, $account['followers']);
    }

    public function test_it_backfills_a_missing_avatar_from_a_later_row(): void
    {
        $account = $this->resolver->resolve([
            $this->row('@brand', 100, ['avatar' => null]),
            $this->row('@brand', 200, ['avatar' => 'https://cdn/a.jpg']),
        ]);

        $this->assertSame('https://cdn/a.jpg', $account['avatar']);
    }

    public function test_it_returns_null_when_no_row_carries_a_handle(): void
    {
        $this->assertNull($this->resolver->resolve([]));
        $this->assertNull($this->resolver->resolve([$this->row('', 100)]));
    }

    public function test_it_can_use_openai_to_pick_the_official_brand_account_from_the_keyword(): void
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
                        'content' => json_encode([
                            'handle' => '@anisadhoorefit',
                            'confidence' => 0.91,
                        ]),
                    ],
                ]],
            ]),
        ]);

        $account = $this->resolver->resolve([
            $this->row('@creatorfinds', 4_000_000, ['creator_name' => 'creator finds']),
            $this->row('@anisadhoorefit', 120_000, ['creator_name' => 'trysnow']),
            $this->row('@creatorfinds', 3_000_000, ['creator_name' => 'creator finds']),
        ], 'trysnow');

        $this->assertSame('@anisadhoorefit', $account['handle']);
        $this->assertSame('ai', $account['source']);
        $this->assertTrue($account['is_confident']);
        $this->assertSame(1, $account['posts_in_search']);
    }

    public function test_it_falls_back_to_detected_account_when_openai_is_not_confident(): void
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
                        'content' => json_encode([
                            'handle' => '@brand',
                            'confidence' => 0.2,
                        ]),
                    ],
                ]],
            ]),
        ]);

        $account = $this->resolver->resolve([
            $this->row('@brand', 100),
            $this->row('@brand', 200),
            $this->row('@creator', 9_000),
        ], 'brand');

        $this->assertSame('@brand', $account['handle']);
        $this->assertSame('detected', $account['source']);
        $this->assertSame(0.6667, $account['confidence']);
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
                'choices' => [['message' => ['content' => json_encode($choice)]]],
            ]),
        ]);
    }

    public function test_the_account_decision_is_only_requested_once_per_candidate_set(): void
    {
        $this->fakeChoice(['handle' => '@brand', 'confidence' => 0.9]);

        $rows = [$this->row('@brand', 100), $this->row('@creator', 200)];

        $this->resolver->resolve($rows, 'brand');
        $this->resolver->resolve($rows, 'brand');
        $this->resolver->resolve($rows, 'brand');

        // The detail page resolves on every render and every poll; one paid
        // call per page view would be a real bill.
        Http::assertSentCount(1);
    }

    public function test_a_new_candidate_set_re_asks_the_model(): void
    {
        $this->fakeChoice(['handle' => '@brand', 'confidence' => 0.9]);

        $this->resolver->resolve([$this->row('@brand', 100)], 'brand');
        $this->resolver->resolve([$this->row('@brand', 100), $this->row('@newcomer', 50)], 'brand');

        Http::assertSentCount(2);
    }

    public function test_candidates_swapping_rank_does_not_re_ask(): void
    {
        $this->fakeChoice(['handle' => '@brand', 'confidence' => 0.9]);

        // Same two accounts, opposite rank order between refreshes.
        $this->resolver->resolve([
            $this->row('@brand', 100),
            $this->row('@brand', 100),
            $this->row('@creator', 50),
        ], 'brand');

        $this->resolver->resolve([
            $this->row('@creator', 50),
            $this->row('@creator', 50),
            $this->row('@brand', 100),
        ], 'brand');

        Http::assertSentCount(1);
    }

    public function test_a_decline_is_cached_so_it_is_not_re_asked(): void
    {
        $this->fakeChoice(['handle' => null, 'confidence' => 0]);

        $rows = [$this->row('@creator', 100), $this->row('@creator', 200), $this->row('@other', 50)];

        $first = $this->resolver->resolve($rows, 'brand');
        $second = $this->resolver->resolve($rows, 'brand');

        $this->assertSame('detected', $first['source']);
        $this->assertSame('detected', $second['source']);
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

        $this->assertSame('detected', $this->resolver->resolve($rows, 'brand')['source']);
        $this->assertSame('detected', $this->resolver->resolve($rows, 'brand')['source']);

        // The call completed; the body was just unusable. Re-asking on every
        // render would bill for the same bad answer forever.
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

        // One network blip must not suppress detection until the TTL expires.
        Http::assertSentCount(2);
    }

    public function test_a_cached_decision_is_rehydrated_from_the_current_rows(): void
    {
        $this->fakeChoice(['handle' => '@brand', 'confidence' => 0.9]);

        $this->resolver->resolve([
            $this->row('@brand', 100, ['followers' => 12_000, 'avatar' => 'https://cdn/old.jpg']),
        ], 'brand');

        // Same candidate set, fresher stats. The cache holds the choice, not
        // the account, so the second call must not serve the stale avatar.
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
