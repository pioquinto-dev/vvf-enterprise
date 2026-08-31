<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchVideo;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\ViralVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SavedSearchLibraryTest extends TestCase
{
    use RefreshDatabase;

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
