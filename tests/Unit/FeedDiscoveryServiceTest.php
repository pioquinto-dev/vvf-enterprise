<?php

namespace Tests\Unit;

use App\Models\CustomKeywordSearch;
use App\Models\ViralVideo;
use App\Services\CustomKeywordSearch\FeedDiscoveryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedDiscoveryServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_discovery_counts_recent_searches_and_compares_unique_hashtags_per_video(): void
    {
        foreach (['Brand', 'brand'] as $phrase) {
            CustomKeywordSearch::create(['name' => $phrase, 'phrase' => $phrase, 'search_type' => 'brand', 'keywords' => [$phrase], 'keyword_signature' => $phrase]);
        }
        foreach ([10, 2, 1] as $days) {
            ViralVideo::create(['video_id' => 'video-'.$days, 'hashtags' => ['#Test', 'test'], 'song' => 'Song', 'created_at' => now()->subDays($days)]);
        }
        ViralVideo::create(['video_id' => 'hidden', 'hashtags' => ['test'], 'song' => 'Hidden', 'archived_at' => now()]);
        $data = app(FeedDiscoveryService::class)->payload();
        $this->assertSame([['phrase' => 'brand', 'count' => 2]], $data['mostSearched']['brand']);
        $this->assertSame([], $data['mostSearched']['product']);
        $this->assertSame('test', $data['climbingHashtags'][0]['tag']);
        $this->assertSame(2, $data['climbingHashtags'][0]['count']);
        $this->assertEquals(100, $data['climbingHashtags'][0]['growth']);
        $this->assertSame([['label' => 'Song', 'count' => 2]], $data['topSounds']);
    }

    public function test_empty_index_returns_empty_lists(): void
    {
        $data = app(FeedDiscoveryService::class)->payload();
        $this->assertSame([], $data['topSounds']);
        $this->assertSame([], $data['climbingHashtags']);
        $this->assertSame(['brand' => [], 'product' => []], $data['mostSearched']);
    }
}
