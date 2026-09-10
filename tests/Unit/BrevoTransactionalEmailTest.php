<?php

namespace Tests\Unit;

use App\Models\CustomKeywordSearchVideo;
use App\Models\CustomKeywordSearch;
use App\Models\User;
use App\Models\ViralVideo;
use App\Support\BrevoTransactionalEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class BrevoTransactionalEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_done_uses_fallback_completion_label_when_latest_run_is_missing(): void
    {
        config()->set('brevo_notifications.notifications.search_done.template_id', 20);

        $user = User::factory()->make([
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
        ]);

        $search = new CustomKeywordSearch([
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => 'brand',
            'result_count' => 14,
            'public_id' => 'abcd1234efgh',
        ]);

        $payload = BrevoTransactionalEmail::searchDone($user, $search);

        $this->assertSame('just now', data_get($payload, 'params.latestRunAt'));
    }

    public function test_search_done_counts_attached_videos_when_relation_is_not_loaded(): void
    {
        config()->set('brevo_notifications.notifications.search_done.template_id', 20);

        $user = User::factory()->create([
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
        ]);

        $search = CustomKeywordSearch::create([
            'user_id' => $user->id,
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'keywords' => ['rhode'],
            'keyword_signature' => 'rhode',
            'status' => CustomKeywordSearch::STATUS_DONE,
        ]);

        $video = ViralVideo::create([
            'video_id' => '7300000000000000001',
            'platform' => 'tiktok',
            'title' => 'Rhode routine',
            'hashtags' => ['rhode'],
            'username' => 'tester',
            'name' => 'Tester',
            'followers' => 20_000,
            'views' => 1_200_000,
            'likes' => 90_000,
            'comments' => 1_200,
            'shares' => 400,
            'bookmarks' => 300,
            'virality_score' => 12.34,
            'video_status' => 'visible',
        ]);

        CustomKeywordSearchVideo::create([
            'custom_keyword_search_id' => $search->id,
            'viral_video_id' => $video->id,
            'source' => CustomKeywordSearchVideo::SOURCE_EXTERNAL_SCRAPE,
            'viral_score' => 12.34,
            'rank' => 1,
            'is_new_breakout' => false,
        ]);

        $payload = BrevoTransactionalEmail::searchDone($user, $search->fresh());

        $this->assertSame(1, data_get($payload, 'params.resultsCount'));
    }

    public function test_payload_throws_when_template_id_is_missing(): void
    {
        config()->set('brevo_notifications.notifications.search_done.template_id', null);

        $user = User::factory()->make([
            'name' => 'Jane Example',
            'email' => 'jane@example.com',
        ]);

        $search = new CustomKeywordSearch([
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => 'brand',
            'result_count' => 14,
            'public_id' => 'abcd1234efgh',
        ]);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Brevo template ID is not configured for [search_done].');

        BrevoTransactionalEmail::searchDone($user, $search);
    }

}
