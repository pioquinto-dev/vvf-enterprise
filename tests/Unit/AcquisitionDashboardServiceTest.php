<?php

namespace Tests\Unit;

use App\Models\Subscription;
use App\Models\User;
use App\Models\UtmAttribution;
use App\Models\UtmPageVisit;
use App\Services\Admin\AcquisitionDashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcquisitionDashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_groups_visits_signups_and_card_trials_by_signup_source(): void
    {
        $attributedUser = User::factory()->create(['created_at' => now()]);
        $directUser = User::factory()->create(['created_at' => now()]);

        UtmPageVisit::query()->create(['visit_key' => (string) str()->uuid(), 'utm_source' => 'chatgpt.com']);
        UtmPageVisit::query()->create(['visit_key' => (string) str()->uuid(), 'utm_source' => null]);

        UtmAttribution::query()->create([
            'user_id' => $attributedUser->id,
            'utm_source' => 'Meta',
        ]);
        UtmAttribution::query()->create([
            'user_id' => $attributedUser->id,
            'subscription_id' => 'sub_attribution_copy',
            'utm_source' => 'should-not-count',
        ]);

        Subscription::query()->create([
            'id' => (string) str()->ulid(),
            'user_id' => $attributedUser->id,
            'status' => 'trialing',
            'trial_started_at' => now(),
        ]);

        $payload = app(AcquisitionDashboardService::class)->payload(30);

        $metrics = collect($payload['metrics'])->keyBy('key');
        $this->assertSame(2, $metrics['page_views']['value']);
        $this->assertSame(2, $metrics['sign_ups']['value']);
        $this->assertSame(1, $metrics['trial_cc']['value']);
        $this->assertTrue($metrics['trial_no_cc']['locked']);
        $this->assertNull($metrics['trial_no_cc']['value']);

        $signupSources = collect($payload['details']['sign_ups']['sources'])->keyBy('source');
        $this->assertSame(1, $signupSources['meta']['count']);
        $this->assertSame(1, $signupSources['direct']['count']);
        $this->assertSame('meta', $payload['details']['trial_cc']['rows'][0]['source']);

        $funnel = collect($payload['funnel']['steps'])->keyBy('key');
        $this->assertSame(2, $funnel['signups']['value']);
        $this->assertSame(1, $funnel['trialing']['value']);
        $this->assertSame(50.0, $funnel['trialing']['percentage']);
        $this->assertSame(0, $funnel['paid']['value']);
    }
}
