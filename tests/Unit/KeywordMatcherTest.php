<?php

namespace Tests\Unit;

use App\Services\CustomKeywordSearch\KeywordMatcher;
use App\Services\CustomKeywordSearch\KeywordNormalizer;
use Carbon\CarbonImmutable;
use Tests\TestCase;

class KeywordMatcherTest extends TestCase
{
    private KeywordMatcher $matcher;

    protected function setUp(): void
    {
        parent::setUp();
        $this->matcher = new KeywordMatcher(new KeywordNormalizer);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function item(array $overrides = []): array
    {
        return array_merge([
            'video_id' => '123',
            'title' => 'my korean skincare routine',
            'hashtags' => ['skincare'],
            'post_url' => 'https://www.tiktok.com/@x/video/123',
            'thumbnail_url' => 'https://example.test/thumb.jpg',
            'followers' => 10_000,
            'views' => 100_000,
            'likes' => 5_000,
            'comments' => 200,
            'uploaded_at' => null,
        ], $overrides);
    }

    public function test_phrase_matches_in_the_caption(): void
    {
        $this->assertTrue($this->matcher->matchesPhrase($this->item(), 'korean skincare'));
    }

    public function test_phrase_match_requires_whole_words(): void
    {
        $item = $this->item(['title' => 'koreanskincareroutine']);

        $this->assertFalse($this->matcher->matchesPhrase($item, 'korean skincare'));
    }

    public function test_phrase_matches_a_compacted_hashtag(): void
    {
        $item = $this->item(['title' => 'my routine', 'hashtags' => ['koreanskincare']]);

        $this->assertTrue($this->matcher->matchesPhrase($item, 'korean skincare'));
    }

    public function test_unrelated_items_do_not_match(): void
    {
        $item = $this->item(['title' => 'car detailing asmr', 'hashtags' => ['cars']]);

        $this->assertFalse($this->matcher->matchesPhrase($item, 'korean skincare'));
    }

    public function test_secondary_main_keyword_can_satisfy_the_main_match(): void
    {
        $item = $this->item(['title' => 'my gopure routine']);

        $this->assertTrue($this->matcher->matchesPhrase($item, 'gopure beauty'));
    }

    public function test_primary_phrase_token_can_match_in_a_hashtag(): void
    {
        $item = $this->item([
            'title' => 'my routine',
            'hashtags' => ['gopure', 'skincarefinds'],
        ]);

        $this->assertTrue($this->matcher->matchesPhrase($item, 'gopure beauty review'));
    }

    public function test_secondary_main_keyword_does_not_partial_match(): void
    {
        $item = $this->item(['title' => 'my gopurest routine']);

        $this->assertFalse($this->matcher->matchesPhrase($item, 'gopure beauty'));
    }

    public function test_prescreen_drops_items_below_the_follower_floor(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item(['followers' => 100])],
            'korean skincare',
            ['korean skincare']
        );

        $this->assertSame(0, $result['summary']['kept']);
        $this->assertSame(1, $result['summary']['below_min_followers']);
    }

    public function test_prescreen_drops_items_without_usable_media(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item(['thumbnail_url' => null, 'cover' => null])],
            'korean skincare',
            ['korean skincare']
        );

        $this->assertSame(1, $result['summary']['broken_media']);
    }

    public function test_prescreen_drops_non_english_titles(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item(['title' => '韓国語のタイトルです'])],
            'korean skincare',
            ['korean skincare']
        );

        $this->assertSame(1, $result['summary']['non_english_title_confidence']);
    }

    public function test_prescreen_drops_explicit_non_english_language_signal(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item(['raw_payload' => ['language' => 'es']])],
            'korean skincare',
            ['korean skincare']
        );

        $this->assertSame(1, $result['summary']['non_english_title_confidence']);
    }

    public function test_empty_title_after_cleanup_is_allowed_for_us_region(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item([
                'title' => '#fyp 12345 https://example.test',
                'hashtags' => ['koreanskincare', 'glassskin'],
                'raw_payload' => ['region' => 'US'],
            ])],
            'korean skincare',
            ['korean skincare']
        );

        $this->assertSame(1, $result['summary']['kept']);
    }

    public function test_ambiguous_single_word_signal_does_not_reject_by_itself(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item(['title' => 'la skincare'])],
            'skincare',
            ['skincare']
        );

        $this->assertSame(1, $result['summary']['kept']);
    }

    public function test_non_english_word_signal_rejects_title(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item(['title' => 'hola skincare'])],
            'skincare',
            ['skincare']
        );

        $this->assertSame(1, $result['summary']['non_english_title_confidence']);
    }

    public function test_insufficient_title_content_can_fall_back_to_hashtags(): void
    {
        $result = $this->matcher->prescreen(
            [$this->item([
                'title' => 'skincare',
                'hashtags' => ['koreanskincare', 'glassskin'],
            ])],
            'skincare',
            ['skincare']
        );

        $this->assertSame(1, $result['summary']['kept']);
    }

    public function test_supporting_keywords_add_score_but_are_not_required(): void
    {
        $withSupport = $this->item(['title' => 'korean skincare glass skin routine']);
        $withoutSupport = $this->item(['title' => 'korean skincare routine']);

        $keywords = ['korean skincare', 'glass skin'];

        $result = $this->matcher->prescreen([$withSupport, $withoutSupport], 'korean skincare', $keywords);

        // Both survive — the supporting keyword only nudges the score.
        $this->assertSame(2, $result['summary']['kept']);
        $this->assertSame(['glass skin'], $result['kept'][0]['matched_keywords']);
        $this->assertSame([], $result['kept'][1]['matched_keywords']);
        $this->assertGreaterThan($result['kept'][1]['virality_score'], $result['kept'][0]['virality_score']);
    }

    public function test_score_rewards_engagement_relative_to_following(): void
    {
        $smallCreator = $this->item(['followers' => 1_000, 'views' => 1_000_000]);
        $largeCreator = $this->item(['followers' => 1_000_000, 'views' => 1_000_000]);

        $this->assertGreaterThan(
            $this->matcher->score($largeCreator),
            $this->matcher->score($smallCreator)
        );
    }

    public function test_ranking_is_deterministic_and_score_first(): void
    {
        $items = [
            $this->item(['video_id' => 'low', 'virality_score' => 1.0, 'views' => 10]),
            $this->item(['video_id' => 'high', 'virality_score' => 9.0, 'views' => 5]),
            $this->item(['video_id' => 'mid', 'virality_score' => 4.0, 'views' => 900]),
        ];

        $ranked = $this->matcher->rank($items);

        $this->assertSame(['high', 'mid', 'low'], array_column($ranked, 'video_id'));
    }

    public function test_recent_uploads_score_higher_than_old_ones(): void
    {
        $fresh = $this->item(['uploaded_at' => CarbonImmutable::now()->subDay()]);
        $old = $this->item(['uploaded_at' => CarbonImmutable::now()->subYear()]);

        $this->assertGreaterThan($this->matcher->score($old), $this->matcher->score($fresh));
    }
}
