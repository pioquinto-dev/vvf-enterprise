<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Tests\TestCase;

class SettingsAccountDeletionTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_user_with_active_subscription_cannot_request_account_deletion(): void
    {
        $user = User::factory()->create();

        Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => null,
            'stripe_customer_id' => 'cus_123',
            'stripe_subscription_id' => 'sub_123',
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->post('/settings/account/delete-request')
            ->assertRedirect();

        $user->refresh();

        $this->assertNull($user->deletion_requested_at);
        $this->assertNull($user->deletion_scheduled_for);
    }

    public function test_user_can_schedule_account_deletion_for_thirty_days_later(): void
    {
        Carbon::setTestNow('2026-08-14 09:00:00');

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/settings/account/delete-request')
            ->assertRedirect();

        $user->refresh();

        $this->assertNotNull($user->deletion_requested_at);
        $this->assertNotNull($user->deletion_scheduled_for);
        $this->assertSame('2026-09-13', $user->deletion_scheduled_for?->toDateString());
    }

    public function test_user_can_cancel_scheduled_account_deletion(): void
    {
        $user = User::factory()->create([
            'deletion_requested_at' => Carbon::parse('2026-08-14 09:00:00'),
            'deletion_scheduled_for' => Carbon::parse('2026-09-13 09:00:00'),
        ]);

        $this->actingAs($user)
            ->delete('/settings/account/delete-request')
            ->assertRedirect();

        $user->refresh();

        $this->assertNull($user->deletion_requested_at);
        $this->assertNull($user->deletion_scheduled_for);
        $this->assertNull($user->deleted_at);
    }

    public function test_due_account_deletions_are_soft_deleted_by_the_scheduled_command(): void
    {
        Carbon::setTestNow('2026-09-13 10:00:00');

        $user = User::factory()->create([
            'deletion_requested_at' => Carbon::parse('2026-08-14 09:00:00'),
            'deletion_scheduled_for' => Carbon::parse('2026-09-13 09:00:00'),
        ]);

        $this->artisan('users:process-pending-account-deletions')
            ->assertSuccessful();

        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }
}
