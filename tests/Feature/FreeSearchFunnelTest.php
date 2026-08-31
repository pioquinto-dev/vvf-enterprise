<?php

namespace Tests\Feature;

use App\Models\CustomKeywordSearch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\User as SocialiteUserContract;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class FreeSearchFunnelTest extends TestCase
{
    use RefreshDatabase;

    public function test_pending_free_search_is_not_created_before_google_sign_in(): void
    {
        $this->postJson('/search/pending', [
            'type' => 'brand',
            'phrase' => 'rhode skin',
            'keywords' => ['rhode skin', 'skincare'],
            'frequency' => 'weekly',
            'sources' => [
                'tiktokHandle' => 'rhode',
                'website' => 'rhodeskin.com',
            ],
        ])->assertOk()->assertJson(['ready' => true]);

        $this->assertSame(0, CustomKeywordSearch::count());
        $this->assertSame('rhode skin', session('free_search.pending.phrase'));
        $this->assertSame('rhode', session('free_search.pending.sources.tiktokHandle'));
    }

    public function test_product_pending_search_discards_brand_sources(): void
    {
        $this->postJson('/search/pending', [
            'type' => 'product',
            'phrase' => 'lip oil',
            'keywords' => ['lip oil'],
            'frequency' => 'weekly',
            'sources' => [
                'tiktokHandle' => 'not-used',
                'website' => 'not-used.example',
            ],
        ])->assertOk();

        $this->assertNull(session('free_search.pending.sources'));
    }

    public function test_google_callback_redirects_to_dashboard_with_upgrade_prompt_when_pending_search_cannot_start(): void
    {
        $user = User::factory()->create([
            'email' => 'existing@example.com',
            'current_plan_slug' => 'free',
            'monthly_credits_remaining' => 0,
            'free_search_used_at' => now()->subDay(),
        ]);

        $googleUser = Mockery::mock(SocialiteUserContract::class);
        $googleUser->shouldReceive('getEmail')->andReturn('existing@example.com');
        $googleUser->shouldReceive('getName')->andReturn('Existing User');
        $googleUser->shouldReceive('getNickname')->andReturn(null);

        $provider = Mockery::mock();
        $provider->shouldReceive('redirectUrl')->andReturnSelf();
        $provider->shouldReceive('user')->andReturn($googleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this
            ->withSession([
                'free_search.pending' => [
                    'type' => 'brand',
                    'phrase' => 'rhode skin',
                    'keywords' => ['rhode skin', 'skincare'],
                    'frequency' => 'weekly',
                ],
            ])
            ->get('/auth/google/callback');

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('search_access_prompt', function (array $prompt) {
            return $prompt['reason'] === 'search_credit_exhausted'
                && $prompt['phrase'] === 'rhode skin'
                && $prompt['message'] === 'You are out of search credits for this billing period.';
        });
        $response->assertSessionMissing('free_search.pending');
        $this->assertSame(0, CustomKeywordSearch::count());
        $this->assertAuthenticatedAs($user->fresh());
    }
}
