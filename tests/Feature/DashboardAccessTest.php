<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_redirects_to_plain_dashboard_when_run_is_not_owned_by_the_signed_in_user(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();

        $search = CustomKeywordSearch::create([
            'user_id' => $owner->id,
            'name' => 'Rhode',
            'phrase' => 'rhode',
            'search_type' => CustomKeywordSearch::TYPE_BRAND,
            'keywords' => ['rhode'],
            'keyword_signature' => 'rhode',
            'frequency' => CustomKeywordSearch::FREQUENCY_WEEKLY,
            'status' => CustomKeywordSearch::STATUS_SCRAPING,
        ]);

        $run = $search->runs()->create([
            'status' => CustomKeywordSearchRun::STATUS_RUNNING,
        ]);

        $this->actingAs($intruder)
            ->get("/dashboard?run={$run->id}")
            ->assertRedirect('/dashboard');
    }
}
