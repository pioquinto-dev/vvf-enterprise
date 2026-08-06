<?php

namespace Tests\Unit;

use App\Models\CustomKeywordSearchSnapshot;
use App\Services\CustomKeywordSearch\BrandAccountResolver;
use App\Services\CustomKeywordSearch\PlaceholderProfileData;
use App\Services\CustomKeywordSearch\SearchInsights;
use App\Services\CustomKeywordSearch\SearchMetrics;
use App\Services\CustomKeywordSearch\TrendBuilder;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Tests\TestCase;

class TrendBuilderTest extends TestCase
{
    private TrendBuilder $trends;

    protected function setUp(): void
    {
        parent::setUp();

        $insights = new SearchInsights(new BrandAccountResolver, new PlaceholderProfileData);
        $this->app->instance(SearchInsights::class, $insights);

        $this->trends = new TrendBuilder(new SearchMetrics($insights));

        CarbonImmutable::setTestNow('2026-08-07T12:00:00Z');
    }

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();
        parent::tearDown();
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function row(int $views, string $uploadedAt, array $overrides = []): array
    {
        return array_merge([
            'views' => $views,
            'likes' => 0,
            'comments' => 0,
            'shares' => 0,
            'saves' => 0,
            'engagement_rate' => null,
            'hashtags' => [],
            'sound_label' => null,
            'uploaded_at' => $uploadedAt,
        ], $overrides);
    }

    private function snapshot(array $attributes): CustomKeywordSearchSnapshot
    {
        return new CustomKeywordSearchSnapshot(array_merge([
            'is_reconstructed' => false,
            'video_count' => 0,
            'total_views' => 0,
            'total_engagement' => 0,
            'avg_engagement_rate' => 0,
            'median_views' => 0,
            'outlier_count' => 0,
            'top_multiple' => 0,
        ], $attributes));
    }

    public function test_it_returns_twelve_weekly_points_ending_now(): void
    {
        $trend = $this->trends->build([], new Collection);

        $this->assertCount(12, $trend['points']);
        $this->assertSame('11w ago', $trend['points'][0]['label']);
        $this->assertSame('now', $trend['points'][11]['label']);
    }

    public function test_videos_land_in_the_week_they_were_posted(): void
    {
        // 2026-08-03 is the Monday of the current week; 2026-07-27 the one before.
        $trend = $this->trends->build([
            $this->row(1000, '2026-08-04T10:00:00+00:00'),
            $this->row(500, '2026-08-05T10:00:00+00:00'),
            $this->row(300, '2026-07-28T10:00:00+00:00'),
        ], new Collection);

        $points = collect($trend['points'])->keyBy('label');

        $this->assertSame(2, $points['now']['posts']);
        $this->assertSame(1500, $points['now']['views']);
        $this->assertSame(1, $points['1w ago']['posts']);
        $this->assertSame(300, $points['1w ago']['views']);
        $this->assertSame(0, $points['2w ago']['posts']);
    }

    public function test_cohort_points_are_flagged_reconstructed(): void
    {
        $trend = $this->trends->build([$this->row(1000, '2026-08-04T10:00:00+00:00')], new Collection);

        $this->assertTrue($trend['has_reconstructed']);
        $this->assertTrue($trend['fully_reconstructed']);
        $this->assertSame(0, $trend['recorded_count']);
    }

    public function test_a_recorded_snapshot_replaces_the_reconstruction_for_its_week(): void
    {
        $snapshots = new Collection([
            $this->snapshot([
                'captured_at' => CarbonImmutable::parse('2026-08-06T09:00:00Z'),
                'video_count' => 42,
                'total_views' => 9_999,
            ]),
        ]);

        // The cohort for this week says 1 post; the recorded snapshot says 42.
        $trend = $this->trends->build([$this->row(1000, '2026-08-04T10:00:00+00:00')], $snapshots);

        $now = collect($trend['points'])->firstWhere('label', 'now');

        $this->assertFalse($now['reconstructed']);
        $this->assertSame(42, $now['posts']);
        $this->assertSame(9_999, $now['views']);
        $this->assertSame(1, $trend['recorded_count']);
        $this->assertFalse($trend['fully_reconstructed']);
    }

    public function test_the_last_snapshot_in_a_week_wins_that_week(): void
    {
        $snapshots = new Collection([
            $this->snapshot(['captured_at' => CarbonImmutable::parse('2026-08-03T09:00:00Z'), 'video_count' => 10]),
            $this->snapshot(['captured_at' => CarbonImmutable::parse('2026-08-06T09:00:00Z'), 'video_count' => 20]),
        ]);

        $trend = $this->trends->build([], $snapshots);

        $this->assertSame(20, collect($trend['points'])->firstWhere('label', 'now')['posts']);
    }

    public function test_reconstructed_weeks_are_scored_against_the_whole_search_median(): void
    {
        // Median across all four is 300. In its own week the 1200-view video
        // would be its own median and score 1x; against the search median it is
        // 4x and correctly counts as an outlier.
        $trend = $this->trends->build([
            $this->row(100, '2026-07-21T10:00:00+00:00'),
            $this->row(200, '2026-07-21T11:00:00+00:00'),
            $this->row(400, '2026-07-21T12:00:00+00:00'),
            $this->row(1200, '2026-08-04T10:00:00+00:00'),
        ], new Collection);

        $this->assertSame(1, collect($trend['points'])->firstWhere('label', 'now')['outliers']);

        // The busy week is not graded on its own curve either: three videos
        // clustered near the median produce no outliers.
        $this->assertSame(0, collect($trend['points'])->firstWhere('label', '2w ago')['outliers']);
    }

    public function test_tile_deltas_need_two_populated_weeks(): void
    {
        $single = $this->trends->build([$this->row(1000, '2026-08-04T10:00:00+00:00')], new Collection);

        $this->assertNull($this->trends->tileDeltas($single)['outliers']);
    }

    public function test_tile_deltas_compare_the_two_most_recent_populated_weeks(): void
    {
        $trend = $this->trends->build([
            $this->row(300, '2026-07-28T10:00:00+00:00'),
            $this->row(3000, '2026-08-04T10:00:00+00:00'),
            $this->row(3000, '2026-08-05T10:00:00+00:00'),
        ], new Collection);

        $deltas = $this->trends->tileDeltas($trend);

        // Median across all three is 3000, so only the 300-view week is quiet.
        $this->assertSame('up', $deltas['median_views']['direction']);
        $this->assertTrue($deltas['median_views']['reconstructed']);
    }

    public function test_tag_growth_is_empty_until_two_recorded_snapshots_exist(): void
    {
        $snapshots = new Collection([
            $this->snapshot([
                'captured_at' => CarbonImmutable::parse('2026-08-06T09:00:00Z'),
                'hashtag_counts' => ['gopure' => 5],
            ]),
        ]);

        $this->assertSame([], $this->trends->tagGrowth($snapshots, 'hashtag_counts'));
    }

    public function test_tag_growth_reports_change_and_flags_new_tags(): void
    {
        $snapshots = new Collection([
            $this->snapshot([
                'captured_at' => CarbonImmutable::parse('2026-07-30T09:00:00Z'),
                'hashtag_counts' => ['gopure' => 10, 'cleanbeauty' => 4],
            ]),
            $this->snapshot([
                'captured_at' => CarbonImmutable::parse('2026-08-06T09:00:00Z'),
                'hashtag_counts' => ['gopure' => 15, 'cleanbeauty' => 2, 'bellycream' => 3],
            ]),
        ]);

        $growth = $this->trends->tagGrowth($snapshots, 'hashtag_counts');

        $this->assertSame(50.0, $growth['gopure']['change_pct']);
        $this->assertSame(-50.0, $growth['cleanbeauty']['change_pct']);
        $this->assertTrue($growth['bellycream']['is_new']);
        $this->assertNull($growth['bellycream']['change_pct']);
    }

    public function test_reconstructed_snapshots_never_feed_tag_growth(): void
    {
        $snapshots = new Collection([
            $this->snapshot([
                'captured_at' => CarbonImmutable::parse('2026-07-30T09:00:00Z'),
                'is_reconstructed' => true,
                'hashtag_counts' => ['gopure' => 10],
            ]),
            $this->snapshot([
                'captured_at' => CarbonImmutable::parse('2026-08-06T09:00:00Z'),
                'hashtag_counts' => ['gopure' => 15],
            ]),
        ]);

        $this->assertSame([], $this->trends->tagGrowth($snapshots, 'hashtag_counts'));
    }
}
