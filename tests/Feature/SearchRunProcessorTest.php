<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\CustomKeywordSearchVideo;
use App\Models\User;
use App\Models\VideoAnalysis;
use App\Models\ViralVideo;
use App\Jobs\PrepareVideoAnalysis;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\CustomKeywordSearch\SearchRunProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Tests\TestCase;

class SearchRunProcessorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.apify.token', 'test-token');
        config()->set('services.apify.base_url', 'https://api.apify.com');
        config()->set('custom_keyword_search.scrape.task_id', 'test-task');
    }

    private function search(array $overrides = []): CustomKeywordSearch
    {
        return CustomKeywordSearch::create(array_merge([
            'name' => 'Korean skincare',
            'phrase' => 'korean skincare',
            'keywords' => ['korean skincare', 'glass skin'],
            'keyword_signature' => 'glass skin'."\n".'korean skincare',
            'frequency' => 'weekly',
            'status' => CustomKeywordSearch::STATUS_SCRAPING,
            'guest_token' => 'guest-1',
        ], $overrides));
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    private function fakeApify(array $items, string $status = 'SUCCEEDED'): void
    {
        Http::fake([
            '*/actor-tasks/test-task/runs' => Http::response([
                'data' => ['id' => 'run-1', 'status' => 'RUNNING', 'defaultDatasetId' => 'dataset-1'],
            ]),
            '*/actor-runs/run-1' => Http::response([
                'data' => ['id' => 'run-1', 'status' => $status, 'defaultDatasetId' => 'dataset-1'],
            ]),
            '*/datasets/dataset-1/items*' => Http::response($items),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function apifyItem(array $overrides = []): array
    {
        return array_merge([
            'id' => '7300000000000000001',
            'text' => 'my korean skincare routine #glassskin',
            'webVideoUrl' => 'https://www.tiktok.com/@tester/video/7300000000000000001',
            'playCount' => 1_200_000,
            'diggCount' => 90_000,
            'commentCount' => 1_200,
            'shareCount' => 400,
            'createTimeISO' => now()->subDays(3)->toIso8601String(),
            'authorMeta' => ['name' => 'tester', 'nickName' => 'Tester', 'fans' => 20_000],
            'videoMeta' => ['coverUrl' => 'https://example.test/cover.jpg', 'duration' => 21],
            'hashtags' => [['name' => 'glassskin']],
        ], $overrides);
    }

    public function test_a_successful_run_imports_and_attaches_results(): void
    {
        $this->fakeApify([
            'bad payload',
            $this->apifyItem(),
            // Off-topic: should be filtered out locally.
            $this->apifyItem([
                'id' => '7300000000000000002',
                'text' => 'car detailing asmr',
                'webVideoUrl' => 'https://www.tiktok.com/@other/video/7300000000000000002',
                'hashtags' => [['name' => 'cars']],
            ]),
            // Below the follower floor.
            $this->apifyItem([
                'id' => '7300000000000000003',
                'authorMeta' => ['name' => 'tiny', 'nickName' => 'Tiny', 'fans' => 12],
                'webVideoUrl' => 'https://www.tiktok.com/@tiny/video/7300000000000000003',
            ]),
        ]);

        $search = $this->search();
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        $run->refresh();
        $search->refresh();

        $this->assertSame(CustomKeywordSearchRun::STATUS_DONE, $run->status);
        $this->assertSame(CustomKeywordSearch::STATUS_DONE, $search->status);
        $this->assertNotNull($search->next_run_at);

        $this->assertSame(1, $search->videos()->count());
        $this->assertSame(4, $run->raw_summary['received']);
        $this->assertSame(1, $run->raw_summary['kept']);
        $this->assertSame(1, $run->raw_summary['invalid_item']);
        $this->assertSame(1, $run->raw_summary['below_min_followers']);
        $this->assertSame(1, $run->raw_summary['main_keyword_mismatch']);

        $video = ViralVideo::firstOrFail();
        $this->assertSame('tester', $video->username);
        $this->assertSame(1_200_000, $video->views);
        $this->assertContains('glassskin', $video->hashtags);

        $attached = $search->videos()->first();
        $this->assertSame(1, $attached->rank);
        $this->assertFalse($attached->is_new_breakout);
    }

    public function test_a_repeat_run_updates_rows_instead_of_duplicating_them(): void
    {
        $this->fakeApify([$this->apifyItem()]);

        $search = $this->search();

        foreach (range(1, 2) as $ignored) {
            $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);
            app(SearchRunProcessor::class)->process($run);
        }

        $this->assertSame(1, $search->videos()->count());
        $this->assertSame(1, ViralVideo::count());
    }

    public function test_a_new_winner_is_automatically_analyzed_without_using_a_credit(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $search = $this->search(['user_id' => $user->id, 'guest_token' => null]);

        $this->fakeApify([$this->apifyItem()]);
        $first = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);
        app(SearchRunProcessor::class)->process($first);

        $firstAnalysis = VideoAnalysis::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertFalse($firstAnalysis->counts_toward_quota);
        Queue::assertPushed(PrepareVideoAnalysis::class, 1);

        // A higher-scoring different video takes the rank-one slot on the
        // next run, so it earns its own free winner analysis.
        $this->fakeApify([
            $this->apifyItem([
                'id' => '7300000000000000002',
                'webVideoUrl' => 'https://www.tiktok.com/@winner/video/7300000000000000002',
                'playCount' => 9_000_000,
                'diggCount' => 500_000,
                'authorMeta' => ['name' => 'winner', 'nickName' => 'Winner', 'fans' => 20_000],
            ]),
        ]);
        $second = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);
        app(SearchRunProcessor::class)->process($second);

        $winner = $search->videos()
            ->where('custom_keyword_search_run_id', $second->id)
            ->where('rank', 1)
            ->firstOrFail();

        $this->assertNotSame($firstAnalysis->video_id, $winner->video->video_id);
        $this->assertSame(2, VideoAnalysis::query()->where('user_id', $user->id)->count());
        $this->assertSame(0, VideoAnalysis::query()->where('user_id', $user->id)->where('counts_toward_quota', true)->count());
        Queue::assertPushed(PrepareVideoAnalysis::class, 2);
    }

    public function test_a_claimed_guest_search_still_sends_the_completion_email(): void
    {
        Queue::fake();

        config()->set('brevo_notifications.search_done_enabled', true);
        config()->set('brevo_notifications.notifications.search_done.template_id', 20);

        $emails = Mockery::mock(BrevoLifecycleEmailService::class);
        $this->app->instance(BrevoLifecycleEmailService::class, $emails);

        $emails->shouldReceive('sendSearchDone')
            ->once()
            ->with(
                Mockery::on(fn (User $user): bool => $user->email === 'owner@example.com'),
                Mockery::on(fn (CustomKeywordSearch $search): bool => $search->user_id !== null)
            )
            ->andReturn(true);

        $user = User::factory()->create(['email' => 'owner@example.com']);
        $search = $this->search();
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        $this->fakeApify([$this->apifyItem()]);

        CustomKeywordSearch::whereKey($search->id)->update([
            'user_id' => $user->id,
            'guest_token' => null,
        ]);

        app(SearchRunProcessor::class)->process($run);
    }

    public function test_local_corpus_matches_are_pooled_with_the_scrape(): void
    {
        // Imported earlier by a sibling search — this run's scrape does not
        // return it, but the phrase matches, so recall should surface it.
        $local = ViralVideo::create([
            'video_id' => '7100000000000000009',
            'platform' => 'tiktok',
            'title' => 'korean skincare dupes i actually use',
            'hashtags' => ['glassskin'],
            'username' => 'oldimport',
            'name' => 'Old Import',
            'followers' => 30_000,
            'views' => 500_000,
            'likes' => 40_000,
            'comments' => 900,
            'thumbnail_url' => 'https://example.test/old.jpg',
            'post_url' => 'https://www.tiktok.com/@oldimport/video/7100000000000000009',
            'video_status' => 'visible',
        ]);

        $this->fakeApify([$this->apifyItem()]);

        $search = $this->search();
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        $this->assertSame(2, $search->videos()->count());

        $summary = $run->refresh()->raw_summary;
        $this->assertSame(1, $summary['local_pool']);
        $this->assertSame(1, $summary['kept_local']);

        $pivot = $search->videos()->where('viral_video_id', $local->id)->firstOrFail();
        $this->assertSame(CustomKeywordSearchVideo::SOURCE_LOCAL_MATCH, $pivot->source);

        // The canonical row was recalled, not re-imported: this run's trigger
        // must not claim a video it never scraped.
        $this->assertNull($local->refresh()->apify_trigger_id);
    }

    public function test_scraped_items_win_collisions_with_stale_local_rows(): void
    {
        // Same video already in the corpus with week-old stats.
        ViralVideo::create([
            'video_id' => '7300000000000000001',
            'platform' => 'tiktok',
            'title' => 'my korean skincare routine #glassskin',
            'hashtags' => ['glassskin'],
            'username' => 'tester',
            'name' => 'Tester',
            'followers' => 20_000,
            'views' => 10,
            'likes' => 1,
            'comments' => 0,
            'thumbnail_url' => 'https://example.test/stale.jpg',
            'post_url' => 'https://www.tiktok.com/@tester/video/7300000000000000001',
            'video_status' => 'visible',
        ]);

        $this->fakeApify([$this->apifyItem()]);

        $search = $this->search();
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        // One video, not two — and the scrape's fresh stats won the collision.
        $this->assertSame(1, ViralVideo::count());
        $this->assertSame(1_200_000, ViralVideo::firstOrFail()->views);

        $pivot = $search->videos()->firstOrFail();
        $this->assertSame(CustomKeywordSearchVideo::SOURCE_EXTERNAL_SCRAPE, $pivot->source);

        $summary = $run->refresh()->raw_summary;
        $this->assertSame(1, $summary['local_pool']);
        $this->assertSame(0, $summary['kept_local']);
    }

    public function test_local_recall_faces_the_same_gates_as_the_scrape(): void
    {
        // Matches the phrase but sits under the follower floor — recall must
        // not become a side door around prescreen.
        ViralVideo::create([
            'video_id' => '7100000000000000010',
            'platform' => 'tiktok',
            'title' => 'korean skincare haul for you',
            'hashtags' => [],
            'username' => 'tinyaccount',
            'name' => 'Tiny',
            'followers' => 12,
            'views' => 900,
            'likes' => 4,
            'comments' => 0,
            'thumbnail_url' => 'https://example.test/tiny.jpg',
            'post_url' => 'https://www.tiktok.com/@tinyaccount/video/7100000000000000010',
            'video_status' => 'visible',
        ]);

        $this->fakeApify([$this->apifyItem()]);

        $search = $this->search();
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        $this->assertSame(1, $search->videos()->count());
        $this->assertSame(0, $run->refresh()->raw_summary['kept_local']);
    }

    public function test_a_failed_apify_run_fails_the_search_when_it_has_no_results(): void
    {
        $this->fakeApify([], status: 'FAILED');

        $search = $this->search();
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        $this->assertSame(CustomKeywordSearchRun::STATUS_FAILED, $run->refresh()->status);
        $this->assertSame(CustomKeywordSearch::STATUS_FAILED, $search->refresh()->status);
    }

    public function test_a_failed_refresh_keeps_an_established_search_usable(): void
    {
        $this->fakeApify([$this->apifyItem()]);

        $search = $this->search();
        $first = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);
        app(SearchRunProcessor::class)->process($first);

        $this->fakeApify([], status: 'FAILED');
        $second = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);
        app(SearchRunProcessor::class)->process($second);

        $this->assertSame(CustomKeywordSearchRun::STATUS_FAILED, $second->refresh()->status);
        // The earlier results are still there, so the search stays "done".
        $this->assertSame(CustomKeywordSearch::STATUS_DONE, $search->refresh()->status);
    }

    public function test_a_paused_search_is_not_scraped(): void
    {
        Http::preventStrayRequests();

        $search = $this->search(['status' => CustomKeywordSearch::STATUS_PAUSED]);
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        $this->assertSame(CustomKeywordSearchRun::STATUS_FAILED, $run->refresh()->status);
        $this->assertSame(CustomKeywordSearch::STATUS_PAUSED, $search->refresh()->status);
    }

    public function test_only_the_primary_phrase_is_sent_to_the_scraper(): void
    {
        $this->fakeApify([$this->apifyItem()]);

        $search = $this->search();
        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        Http::assertSent(function ($request): bool {
            if (! str_contains($request->url(), 'actor-tasks/test-task/runs')) {
                return true;
            }

            // Supporting keywords must not narrow the remote query.
            return $request['keywords'] === ['korean skincare'];
        });
    }

    public function test_processor_keeps_matching_items_from_channel_based_tiktok_payloads(): void
    {
        $this->fakeApify([
            [
                'id' => '7664391395162983693',
                'title' => 'This Go Pure Instant Lift Eye Gel has been a game changer for me! #gopure #gopurebeauty',
                'channel' => [
                    'username' => 'farmeralysha',
                    'name' => 'farmeralysha[sahm]',
                    'followers' => 16058,
                    'avatar' => 'https://example.test/avatar.jpg',
                ],
                'video' => [
                    'url' => 'https://example.test/video.mp4',
                    'cover' => 'https://example.test/cover.jpg',
                    'thumbnail' => 'https://example.test/thumb.jpg',
                ],
                'postPage' => 'https://www.tiktok.com/@farmeralysha/video/7664391395162983693',
                'views' => 992,
                'likes' => 4,
                'comments' => 0,
                'shares' => 7,
                'bookmarks' => 3,
                'hashtags' => ['gopure', 'gopurebeauty', 'tighten'],
                'uploadedAtFormatted' => '2026-07-19T23:53:22.000Z',
            ],
        ]);

        $search = $this->search([
            'name' => 'goPure',
            'phrase' => 'gopure beauty',
            'keywords' => ['gopure beauty'],
            'keyword_signature' => 'gopure beauty',
        ]);

        $run = $search->runs()->create(['status' => CustomKeywordSearchRun::STATUS_QUEUED]);

        app(SearchRunProcessor::class)->process($run);

        $run->refresh();
        $search->refresh();

        $this->assertSame(CustomKeywordSearchRun::STATUS_DONE, $run->status);
        $this->assertSame(1, $run->raw_summary['kept']);
        $this->assertSame(1, $search->videos()->count());

        $video = ViralVideo::firstOrFail();
        $this->assertSame('farmeralysha', $video->username);
        $this->assertSame(16058, $video->followers);
        $this->assertSame('https://example.test/video.mp4', $video->video_url);
    }
}
