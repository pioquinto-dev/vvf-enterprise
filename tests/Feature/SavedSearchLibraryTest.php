<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\ViralVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SavedSearchLibraryTest extends TestCase
{
    use RefreshDatabase;

    public function test_matching_primary_keywords_require_confirmation_before_merging_and_refreshing(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $this->setSearchCredits($user, 5);

        $search = CustomKeywordSearch::query()->create([
            'user_id' => $user->id,
            'name' => 'Existing Rhode search',
            'phrase' => 'rhode skin',
            'search_type' => CustomKeywordSearch::TYPE_COMPETITOR,
            'keywords' => ['rhode skin', 'rhode review'],
            'keyword_signature' => "rhode review\nrhode skin",
            'frequency' => CustomKeywordSearch::FREQUENCY_MONTHLY,
            'status' => CustomKeywordSearch::STATUS_DONE,
        ]);

        $payload = [
            'type' => CustomKeywordSearch::TYPE_BRAND,
            'phrase' => 'rhode skin',
            'name' => 'A new label',
            'keywords' => ['rhode vlog', 'rhode skin'],
            'frequency' => CustomKeywordSearch::FREQUENCY_WEEKLY,
        ];

        $search->delete();

        $this->actingAs($user)
            ->postJson('/api/v1/saved-searches', $payload)
            ->assertConflict()
            ->assertJsonPath('code', 'existing_search')
            ->assertJsonPath('search.id', $search->id)
            ->assertJsonPath('new_keywords.0', 'rhode vlog');

        $this->actingAs($user)
            ->postJson('/api/v1/saved-searches', [...$payload, 'refresh_existing' => true])
            ->assertCreated()
            ->assertJsonPath('id', $search->id);

        $search->refresh();
        $this->assertFalse($search->trashed());
        $this->assertSame('Existing Rhode search', $search->name);
        $this->assertSame(CustomKeywordSearch::FREQUENCY_MONTHLY, $search->frequency);
        $this->assertSame(['rhode skin', 'rhode review', 'rhode vlog'], $search->keywords);
        $this->assertSame(1, $search->runs()->count());
        $this->assertSame(4, $this->searchCreditsRemaining($user));
    }

    public function test_library_page_includes_analysis_history_rows_for_signed_in_user(): void
    {
        $user = User::factory()->create();

        $search = CustomKeywordSearch::query()->create([
            'user_id' => $user->id,
            'public_id' => 'librarycase1',
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
            'keywords' => ['rhode'],
            'keyword_signature' => 'rhode',
            'status' => CustomKeywordSearch::STATUS_DONE,
            'is_watchlisted' => true,
        ]);

        $video = ViralVideo::query()->create([
            'video_id' => 'tt-123',
            'title' => 'Rhode peptide lip tint review',
            'username' => 'creator',
            'name' => 'Creator Name',
            'thumbnail_url' => 'https://example.com/thumb.jpg',
            'post_url' => 'https://www.tiktok.com/@creator/video/123',
            'embed_url' => 'https://www.tiktok.com/embed/123',
        ]);

        CustomKeywordSearchVideo::query()->create([
            'custom_keyword_search_id' => $search->id,
            'viral_video_id' => $video->id,
            'source' => CustomKeywordSearchVideo::SOURCE_EXTERNAL_SCRAPE,
            'viral_score' => 12.4,
            'rank' => 1,
            'is_new_breakout' => true,
        ]);

        VideoAnalysis::query()->create([
            'user_id' => $user->id,
            'viral_video_id' => $video->id,
            'video_id' => $video->video_id,
            'status' => VideoAnalysis::STATUS_COMPLETE,
            'result' => ['summary' => 'done'],
            'counts_toward_quota' => false,
            'analyzed_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/library')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('SavedSearches/Index')
                ->where('analysisHistory.0.status', VideoAnalysis::STATUS_COMPLETE)
                ->where('analysisHistory.0.search_name', 'Rhode')
                ->where('analysisHistory.0.search_url', '/results/librarycase1')
                ->where('analysisHistory.0.video.title', 'Rhode peptide lip tint review')
                ->where('analysisHistory.0.counts_toward_quota', false));
    }
}
