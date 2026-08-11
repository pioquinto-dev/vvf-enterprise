<?php

namespace Tests\Unit;

use App\Services\CustomKeywordSearch\BrandAccountResolver;
use App\Services\CustomKeywordSearch\PlaceholderProfileData;
use App\Services\CustomKeywordSearch\SearchInsights;
use Tests\TestCase;

class SearchInsightsTest extends TestCase
{
    private SearchInsights $insights;

    protected function setUp(): void
    {
        parent::setUp();
        $this->insights = new SearchInsights(new BrandAccountResolver, new PlaceholderProfileData);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function row(int $views, array $overrides = []): array
    {
        return array_merge([
            'id' => uniqid('v', true),
            'views' => $views,
            'likes' => 0,
            'comments' => 0,
            'hashtags' => [],
            'sound_label' => null,
            'engagement_rate' => null,
            'uploaded_at' => null,
        ], $overrides);
    }

    public function test_median_of_an_odd_set_is_the_middle_value(): void
    {
        $rows = [$this->row(100), $this->row(900), $this->row(300)];

        $this->assertSame(300, $this->insights->medianViews($rows));
    }

    public function test_median_of_an_even_set_averages_the_two_centre_values(): void
    {
        $rows = [$this->row(100), $this->row(200), $this->row(400), $this->row(1000)];

        $this->assertSame(300, $this->insights->medianViews($rows));
    }

    public function test_zero_view_videos_do_not_drag_the_median_down(): void
    {
        $rows = [$this->row(0), $this->row(0), $this->row(200), $this->row(400)];

        $this->assertSame(300, $this->insights->medianViews($rows));
    }

    public function test_median_is_zero_when_nothing_has_views(): void
    {
        $this->assertSame(0, $this->insights->medianViews([$this->row(0)]));
        $this->assertSame(0, $this->insights->medianViews([]));
    }

    public function test_multiples_are_views_over_the_median(): void
    {
        $rows = $this->insights->withMultiples([
            $this->row(100),
            $this->row(300),
            $this->row(1500),
        ]);

        $this->assertSame(0.33, $rows[0]['outlier_multiple']);
        $this->assertSame(1.0, $rows[1]['outlier_multiple']);
        $this->assertSame(5.0, $rows[2]['outlier_multiple']);
    }

    public function test_multiple_is_null_when_there_is_no_usable_baseline(): void
    {
        $rows = $this->insights->withMultiples([$this->row(0), $this->row(0)]);

        $this->assertNull($rows[0]['outlier_multiple']);
    }

    public function test_tiles_report_counts_top_multiple_and_average_rate(): void
    {
        $payload = $this->insights->build([
            $this->row(1500, ['engagement_rate' => 10.0]),
            $this->row(300, ['engagement_rate' => 6.0]),
            $this->row(100, ['engagement_rate' => null]),
        ]);

        $tiles = collect($payload['tiles'])->keyBy('key');

        $this->assertSame(3, $tiles['videos']['value']);
        // Only the 1500-view video clears 3x against the 300 median.
        $this->assertSame(1, $tiles['outliers']['value']);
        $this->assertSame(5.0, $tiles['top_multiple']['value']);
        $this->assertSame(300, $tiles['median_views']['value']);
        // Null rates are skipped rather than counted as zero.
        $this->assertSame(8.0, $tiles['avg_engagement']['value']);
    }

    public function test_distribution_buckets_cover_outliers_only(): void
    {
        // Seven values, median 300. Multiples: .17, .33, .67, 1, 3, 5, 8.33 —
        // the three sub-3x videos fall outside every bucket by design; the
        // panel describes the outliers, matching the mockup.
        $rows = [
            $this->row(50),
            $this->row(100),
            $this->row(200),
            $this->row(300),   // <- median
            $this->row(900),   // 3.0x
            $this->row(1500),  // 5.0x
            $this->row(2500),  // 8.33x
        ];

        $distribution = collect($this->insights->build($rows)['distribution']);
        $counts = $distribution->mapWithKeys(fn (array $b): array => [$b['label'] => $b['count']])->all();

        $this->assertSame(['3 - 5x', '5 - 8x', '8 - 12x', '12x+'], array_keys($counts));
        $this->assertSame(1, $counts['3 - 5x']);
        $this->assertSame(1, $counts['5 - 8x']);
        $this->assertSame(1, $counts['8 - 12x']);
        $this->assertSame(0, $counts['12x+']);
        $this->assertSame(3, array_sum($counts));

        // Share is a fraction of the outliers, not of all seven videos.
        $this->assertSame(0.3333, $distribution->firstWhere('label', '3 - 5x')['share']);
    }

    public function test_a_hashtag_repeated_in_one_caption_only_counts_that_post_once(): void
    {
        $rows = [
            $this->row(100, ['hashtags' => ['gopure', 'GoPure', 'cleanbeauty']]),
            $this->row(200, ['hashtags' => ['gopure']]),
        ];

        $hashtags = collect($this->insights->build($rows)['hashtags'])->keyBy('tag');

        $this->assertSame(2, $hashtags['gopure']['posts']);
        $this->assertSame(1, $hashtags['cleanbeauty']['posts']);
        $this->assertSame(1.0, $hashtags['gopure']['share']);
    }

    public function test_hashtags_are_not_truncated_to_the_first_five_rows(): void
    {
        $rows = [
            $this->row(100, ['hashtags' => ['tag01']]),
            $this->row(100, ['hashtags' => ['tag02']]),
            $this->row(100, ['hashtags' => ['tag03']]),
            $this->row(100, ['hashtags' => ['tag04']]),
            $this->row(100, ['hashtags' => ['tag05']]),
            $this->row(100, ['hashtags' => ['tag06']]),
            $this->row(100, ['hashtags' => ['tag07']]),
        ];

        $hashtags = $this->insights->build($rows)['hashtags'];

        $this->assertCount(7, $hashtags);
        $this->assertSame('tag07', $hashtags[6]['tag']);
    }

    public function test_sounds_group_case_insensitively_and_flag_the_top_video(): void
    {
        $rows = [
            $this->row(3000, ['sound_label' => 'Golden Hour · JVKE']),
            $this->row(300, ['sound_label' => 'golden hour · jvke']),
            $this->row(100, ['sound_label' => 'Calm Loop']),
        ];

        $sounds = $this->insights->build($rows)['sounds'];

        $this->assertSame('Golden Hour · JVKE', $sounds[0]['label']);
        $this->assertSame(2, $sounds[0]['posts']);
        $this->assertTrue($sounds[0]['on_top_video']);
        $this->assertFalse($sounds[1]['on_top_video']);
    }

    public function test_heatmap_is_monday_first_and_utc(): void
    {
        $rows = [
            // Monday 2026-08-03, 14:00 UTC
            $this->row(100, ['uploaded_at' => '2026-08-03T14:00:00+00:00']),
            $this->row(200, ['uploaded_at' => '2026-08-03T14:30:00+00:00']),
            // Sunday 2026-08-09, 09:00 UTC
            $this->row(300, ['uploaded_at' => '2026-08-09T09:00:00+00:00']),
        ];

        $heatmap = $this->insights->build($rows)['heatmap'];

        $this->assertSame('Mon', $heatmap['days'][0]);
        $this->assertSame('UTC', $heatmap['timezone']);
        $this->assertSame(3, $heatmap['counted']);
        $this->assertSame(2, $heatmap['cells'][0][14]);
        $this->assertSame(1, $heatmap['cells'][6][9]);
        $this->assertSame(2, $heatmap['max']);
        $this->assertSame(['day' => 'Mon', 'hour' => 14, 'count' => 2], $heatmap['peak']);
    }

    public function test_heatmap_skips_unparsable_and_missing_timestamps(): void
    {
        $heatmap = $this->insights->build([
            $this->row(100, ['uploaded_at' => null]),
            $this->row(100, ['uploaded_at' => 'not a date']),
        ])['heatmap'];

        $this->assertSame(0, $heatmap['counted']);
        $this->assertNull($heatmap['peak']);
    }

    public function test_an_empty_search_produces_a_usable_payload(): void
    {
        $payload = $this->insights->build([]);

        $this->assertSame(0, $payload['baseline']['median_views']);
        $this->assertSame([], $payload['hashtags']);
        $this->assertSame([], $payload['sounds']);
        $this->assertNull(collect($payload['tiles'])->firstWhere('key', 'top_multiple')['value']);
        $this->assertSame(0, collect($payload['distribution'])->sum('count'));
    }
}
