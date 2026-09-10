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

    public function test_popular_searches_rank_all_time_occurrences_and_count_distinct_users(): void
    {
        $users = \App\Models\User::factory()->count(2)->create();
        foreach ([[' RhOde ', 'brand', 0], ['rhode', 'competitor', 0], ['rhode', 'brand', 1], ['lip oil', 'product', 0]] as $i => [$phrase, $type, $user]) {
            $search = CustomKeywordSearch::create([
                'user_id' => $users[$user]->id, 'name' => $phrase, 'phrase' => $phrase,
                'search_type' => $type, 'keywords' => [$phrase], 'keyword_signature' => 'popular-'.$i,
                'created_at' => now()->subMonths(2),
            ]);
            if ($i === 0) $search->delete();
        }
        for ($i = 0; $i < 6; $i++) {
            CustomKeywordSearch::create(['user_id' => $users[0]->id, 'name' => 'z'.$i, 'phrase' => 'z'.$i, 'search_type' => 'brand', 'keywords' => ['z'.$i], 'keyword_signature' => 'z'.$i]);
        }
        \Illuminate\Support\Facades\Cache::flush();
        $rows = app(FeedDiscoveryService::class)->payload()['popularSearches'];
        $this->assertCount(5, $rows);
        $this->assertSame(['keyword' => 'rhode', 'type' => 'brand', 'occurrences' => 3, 'users' => 2], $rows[0]);
        $this->assertSame(['keyword' => 'lip oil', 'type' => 'product', 'occurrences' => 1, 'users' => 1], $rows[1]);
    }

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
