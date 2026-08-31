<?php

namespace Tests\Unit;

use App\Models\ManagedCouponProgram;
use App\Models\ManagedCouponRedemption;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Billing\CouponAccessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponAccessServiceTest extends TestCase
{
    use RefreshDatabase;

    private function service(): CouponAccessService
    {
        return app(CouponAccessService::class);
    }

    private function ignite(array $overrides = []): ManagedCouponProgram
    {
        return ManagedCouponProgram::create(array_merge([
            'code' => 'IGNITEBB',
            'name' => 'Ignite Team',
            'link_path' => '/internal-subscription',
            'plan_slug' => 'basic',
            'billing_cycle' => 'monthly',
            'max_redemptions' => 10,
            'allowed_domain' => 'igniteamz.com',
            'whitelist_only' => false,
            'trial_only' => true,
            'collect_payment_method' => false,
            'block_trial_used' => false,
            'block_reverted_free' => false,
            'is_active' => true,
        ], $overrides));
    }

    private function vip(array $overrides = []): ManagedCouponProgram
    {
        return ManagedCouponProgram::create(array_merge([
            'code' => 'IVANVIP',
            'name' => 'Ivan VIP',
            'link_path' => '/vip-subscription',
            'plan_slug' => 'basic',
            'billing_cycle' => 'monthly',
            'max_redemptions' => 30,
            'allowed_domain' => null,
            'whitelist_only' => true,
            'trial_only' => false,
            'collect_payment_method' => false,
            'block_trial_used' => true,
            'block_reverted_free' => true,
            'is_active' => true,
        ], $overrides));
    }

    public function test_ignite_domain_email_is_eligible(): void
    {
        $program = $this->ignite();
        $user = User::factory()->create(['email' => 'staff@igniteamz.com']);

        $this->assertTrue($this->service()->evaluate($program, $user)->allowed);
    }

    public function test_ignite_whitelisted_non_domain_email_is_eligible(): void
    {
        $program = $this->ignite();
        $user = User::factory()->create(['email' => 'friend@gmail.com']);
        $program->whitelistEntries()->create(['email' => 'friend@gmail.com']);

        $this->assertTrue($this->service()->evaluate($program, $user)->allowed);
    }

    public function test_ignite_invalid_email_is_blocked(): void
    {
        $program = $this->ignite();
        $user = User::factory()->create(['email' => 'random@gmail.com']);

        $result = $this->service()->evaluate($program, $user);

        $this->assertFalse($result->allowed);
        $this->assertSame('Invalid Email', $result->errorKey);
    }

    public function test_blank_domain_allows_any_email_when_not_whitelist_only(): void
    {
        $program = $this->ignite([
            'allowed_domain' => null,
            'whitelist_only' => false,
        ]);
        $user = User::factory()->create(['email' => 'anyone@example.com']);

        $this->assertTrue($this->service()->evaluate($program, $user)->allowed);
    }

    public function test_vip_is_whitelist_only(): void
    {
        $program = $this->vip();
        $user = User::factory()->create(['email' => 'exec@igniteamz.com']);

        $this->assertSame('Invalid Email', $this->service()->evaluate($program, $user)->errorKey);

        $program->whitelistEntries()->create(['email' => 'exec@igniteamz.com']);

        $this->assertTrue($this->service()->evaluate($program->fresh(), $user)->allowed);
    }

    public function test_programs_are_isolated(): void
    {
        $ignite = $this->ignite();
        $vip = $this->vip();
        $user = User::factory()->create(['email' => 'friend@gmail.com']);
        $ignite->whitelistEntries()->create(['email' => 'friend@gmail.com']);

        // Whitelisted for Ignite, but VIP is whitelist-only and separate.
        $this->assertSame('Invalid Email', $this->service()->evaluate($vip, $user)->errorKey);
    }

    public function test_exhausted_slots_are_blocked(): void
    {
        $program = $this->ignite(['max_redemptions' => 1]);
        $claimed = User::factory()->create(['email' => 'first@igniteamz.com']);
        ManagedCouponRedemption::create([
            'managed_coupon_program_id' => $program->id,
            'user_id' => $claimed->id,
            'email' => $claimed->email,
            'redeemed_at' => now(),
        ]);

        $next = User::factory()->create(['email' => 'second@igniteamz.com']);

        $this->assertSame('Slots Exhausted', $this->service()->evaluate($program->fresh(), $next)->errorKey);
    }

    public function test_second_redemption_by_same_user_is_blocked(): void
    {
        $program = $this->ignite();
        $user = User::factory()->create(['email' => 'staff@igniteamz.com']);
        ManagedCouponRedemption::create([
            'managed_coupon_program_id' => $program->id,
            'user_id' => $user->id,
            'email' => $user->email,
            'redeemed_at' => now(),
        ]);

        $this->assertSame('Already Redeemed', $this->service()->evaluate($program->fresh(), $user)->errorKey);
    }

    public function test_paid_account_is_blocked_with_contact_prompt_copy(): void
    {
        $program = $this->vip();
        $user = User::factory()->create([
            'email' => 'exec@vip.com',
            'current_plan_slug' => 'basic',
            'plan_renews_at' => now()->addMonth(),
        ]);
        $program->whitelistEntries()->create(['email' => 'exec@vip.com']);

        $result = $this->service()->evaluate($program->fresh(), $user);

        $this->assertFalse($result->allowed);
        $this->assertSame('Already Paid', $result->errorKey);
        $this->assertSame('You are already on a paid plan', $result->title);
        $this->assertStringContainsString('contact us', strtolower((string) $result->detail));
    }

    public function test_record_redemption_is_idempotent_per_user(): void
    {
        $program = $this->ignite();
        $user = User::factory()->create(['email' => 'staff@igniteamz.com']);
        $service = $this->service();

        $first = $service->recordRedemption($program, $user, 'cs_1', 'sub_1', 'trialing');
        $second = $service->recordRedemption($program->fresh(), $user, 'cs_2', 'sub_2', 'trialing');

        $this->assertNotNull($first);
        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, $program->fresh()->redeemedCount());
    }

    public function test_vip_blocks_trial_already_used(): void
    {
        $program = $this->vip();
        $user = User::factory()->create(['email' => 'exec@vip.com']);
        $program->whitelistEntries()->create(['email' => 'exec@vip.com']);
        Subscription::create([
            'user_id' => $user->id,
            'status' => 'trialing',
            'trial_started_at' => now()->subDays(2),
        ]);

        $this->assertSame('Trial Already Used', $this->service()->evaluate($program->fresh(), $user)->errorKey);
    }

    public function test_vip_blocks_reverted_to_free(): void
    {
        $program = $this->vip();
        $user = User::factory()->create(['email' => 'exec@vip.com', 'current_plan_slug' => 'free']);
        $program->whitelistEntries()->create(['email' => 'exec@vip.com']);
        Subscription::create([
            'user_id' => $user->id,
            'status' => 'past_due',
        ]);

        $this->assertSame('Reverted To Free', $this->service()->evaluate($program->fresh(), $user)->errorKey);
    }
}
