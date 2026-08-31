<?php

namespace App\Services\Billing;

use App\Models\ManagedCouponProgram;
use App\Models\ManagedCouponRedemption;
use App\Models\ManagedCouponWhitelistEntry;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Central authority for managed coupon-program access (IGNITEBB, IVANVIP, ...).
 * All eligibility policy lives here so controllers never re-derive it.
 */
class CouponAccessService
{
    public function __construct(private readonly BillingEntitlementService $entitlements) {}

    public function resolveByLinkPath(string $path): ?ManagedCouponProgram
    {
        $normalized = '/'.ltrim(trim($path), '/');

        return ManagedCouponProgram::query()->active()->where('link_path', $normalized)->first();
    }

    public function resolveByCode(string $code): ?ManagedCouponProgram
    {
        return ManagedCouponProgram::query()->active()->where('code', strtoupper(trim($code)))->first();
    }

    /**
     * Decide whether the user may redeem this program right now.
     */
    public function evaluate(ManagedCouponProgram $program, ?User $user): CouponEligibility
    {
        if (! $program->is_active) {
            return CouponEligibility::block(
                'Program Inactive',
                "This offer isn't available",
                'This subscription link is no longer active.',
            );
        }

        // Guests are eligible in principle; the resume flow re-checks once they authenticate.
        $email = $user?->email;

        if ($user !== null && ! $this->isEmailEligible($program, $email)) {
            return CouponEligibility::block(
                'Invalid Email',
                'Invalid Email',
                "This email isn't eligible for this offer. Ask your contact to add you to the list.",
            );
        }

        if ($user !== null && $this->entitlements->hasPaidPlan($user)) {
            return CouponEligibility::block(
                'Already Paid',
                'You are already on a paid plan',
                'This account already has paid access. For upgrades or plan transition requests, please contact us and we can help from there.',
            );
        }

        if ($user !== null && $this->hasRedeemed($program, $user)) {
            return CouponEligibility::block(
                'Already Redeemed',
                'Already redeemed',
                "You've already used this offer on your account.",
            );
        }

        if ($program->remainingSlots() === 0) {
            return CouponEligibility::block(
                'Slots Exhausted',
                'All spots are taken',
                'Every slot for this offer has already been claimed.',
            );
        }

        if ($user !== null && $program->block_trial_used && $this->entitlements->hasUsedTrial($user)) {
            return CouponEligibility::block(
                'Trial Already Used',
                'Trial already used',
                "This account has already used its trial, so it can't use this offer.",
            );
        }

        if ($user !== null && $program->block_reverted_free && $this->hasRevertedToFreeAfterFailedPayment($user)) {
            return CouponEligibility::block(
                'Reverted To Free',
                'Not eligible',
                'This account moved back to the free plan after a payment issue, so it cannot use this offer.',
            );
        }

        return CouponEligibility::allow();
    }

    public function isEmailEligible(ManagedCouponProgram $program, ?string $email): bool
    {
        $normalized = ManagedCouponWhitelistEntry::normalizeEmail($email);

        if ($normalized === '') {
            return false;
        }

        if ($this->isWhitelisted($program, $normalized)) {
            return true;
        }

        if ($program->whitelist_only) {
            return false;
        }

        $domain = strtolower(trim((string) $program->allowed_domain));

        if ($domain === '') {
            return true;
        }

        return Str::endsWith($normalized, '@'.$domain);
    }

    public function isWhitelisted(ManagedCouponProgram $program, string $normalizedEmail): bool
    {
        return $program->whitelistEntries()->where('email', $normalizedEmail)->exists();
    }

    public function hasRedeemed(ManagedCouponProgram $program, User $user): bool
    {
        return $program->redemptions()
            ->where('user_id', $user->id)
            ->whereNotNull('redeemed_at')
            ->exists();
    }

    /**
     * Heuristic: the account is currently on free but previously carried a
     * subscription that failed payment. Refine the status list if the billing
     * webhook layer starts stamping an explicit marker.
     */
    public function hasRevertedToFreeAfterFailedPayment(User $user): bool
    {
        if (($user->current_plan_slug ?? 'free') !== 'free') {
            return false;
        }

        return Subscription::query()
            ->where('user_id', $user->id)
            ->where(function ($query): void {
                $query->whereIn('status', ['past_due', 'unpaid', 'incomplete_expired', 'canceled'])
                    ->orWhere('metadata->subscription->reverted_from_failed_payment', true);
            })
            ->exists();
    }

    /**
     * Atomically claim a slot and write the durable redemption. Returns the
     * redemption on success, or null when the final slot was lost in a race.
     */
    public function recordRedemption(
        ManagedCouponProgram $program,
        User $user,
        ?string $checkoutSessionId = null,
        ?string $subscriptionId = null,
        ?string $subscriptionStatus = null,
    ): ?ManagedCouponRedemption {
        return DB::transaction(function () use ($program, $user, $checkoutSessionId, $subscriptionId, $subscriptionStatus): ?ManagedCouponRedemption {
            /** @var ManagedCouponProgram $locked */
            $locked = ManagedCouponProgram::query()->whereKey($program->id)->lockForUpdate()->firstOrFail();

            $existing = $locked->redemptions()->where('user_id', $user->id)->first();

            if ($existing !== null && $existing->redeemed_at !== null) {
                return $existing;
            }

            if ($existing === null && $locked->remainingSlots() === 0) {
                return null;
            }

            return $locked->redemptions()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'email' => ManagedCouponWhitelistEntry::normalizeEmail($user->email),
                    'stripe_checkout_session_id' => $checkoutSessionId,
                    'stripe_subscription_id' => $subscriptionId,
                    'subscription_status' => $subscriptionStatus,
                    'redeemed_at' => CarbonImmutable::now(),
                ],
            );
        });
    }
}
