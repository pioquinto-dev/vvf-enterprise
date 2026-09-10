<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use App\Models\ViralVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * A free user who has not spent their search still gets a populated feed: the
 * strongest videos, sounds and hashtags from across Brand Beacon.
 */
class DiscoveryFeedTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    private function video(string $handle, float $score): ViralVideo
    {
        return ViralVideo::create([
            'id' => (string) Str::ulid(),
            'video_id' => Str::random(12),
            'username' => $handle,
            'title' => "A breakout from {$handle}",
            'views' => 1_000_000,
            'likes' => 50_000,
            'comments' => 900,
            'shares' => 2_000,
            'followers' => 20_000,
            'virality_score' => $score,
            'hashtags' => ['dupe', 'skincare'],
            'platform' => 'tiktok',
            'post_url' => 'https://www.tiktok.com/@'.$handle.'/video/123',
        ]);
    }

    public function test_a_user_without_searches_sees_global_breakout_videos(): void
    {
        $this->video('cleangirl.ari', 88);
        $this->video('dermbydana', 41);

        $this->actingAs(User::factory()->create())
            ->get('/home')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('feed.isDiscoveryFeed', true)
                ->has('feed.popularSearches')
                ->has('feed.videos', 2)
                // Borrowed videos belong to no search of theirs.
                ->where('feed.videos.0.search_url', null)
                ->where('feed.videos.0.brand', null)
                // Best first, and playable through the TikTok embed.
                ->where('feed.videos.0.handle', '@cleangirl.ari')
                ->where('feed.videos.0.score', '88x')
                ->whereNot('feed.videos.0.video_id', null));
    }

    public function test_a_user_with_their_own_searches_is_not_given_the_discovery_feed(): void
    {
        $this->video('cleangirl.ari', 88);
        $user = User::factory()->create();

        CustomKeywordSearch::create([
            'user_id' => $user->id,
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
            'keywords' => ['rhode'],
            'keyword_signature' => 'rhode',
            'frequency' => CustomKeywordSearch::FREQUENCY_WEEKLY,
            'status' => CustomKeywordSearch::STATUS_DONE,
        ]);

        $this->actingAs($user)
            ->get('/home')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                // The flag is only sent for the borrowed feed; the page treats
                // its absence as "these are the user's own results".
                ->missing('feed.isDiscoveryFeed')
                ->where('feed.popularSearches.0.keyword', 'rhode')
                ->has('feed.videos', 0));
    }

    public function test_unused_free_search_accounts_can_browse_older_and_unscored_global_records(): void
    {
        $user = User::factory()->create(['free_search_used_at' => null]);
        $older = $this->video('older.breakout', 88);
        $older->update(['created_at' => now()->subMonths(3)]);
        $this->video('unscored.creator', 0)->update(['created_at' => now()->subMonth()]);
        $this->video('hidden.creator', 100)->update(['archived_at' => now()]);

        $this->actingAs($user)->get('/home')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('feed.isDiscoveryFeed', true)
                ->where('feed.totalCount', 2)
                ->has('feed.videos', 2)
                ->where('feed.videos.0.handle', '@older.breakout')
                ->where('feed.videos.1.handle', '@unscored.creator')
                ->where('feed.videos.0.search_url', null));

        $this->assertNull($user->fresh()->free_search_used_at);
        $this->assertSame(0, CustomKeywordSearch::count());
    }

    public function test_archived_videos_stay_out_of_the_discovery_feed(): void
    {
        $this->video('cleangirl.ari', 88)->update(['archived_at' => now()]);
        $this->video('dermbydana', 41);

        $this->actingAs(User::factory()->create())
            ->get('/home')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('feed.videos', 1)
                ->where('feed.videos.0.handle', '@dermbydana'));
    }
}
