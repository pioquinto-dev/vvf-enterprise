<?php

namespace App\Services\Billing;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class BillingEntitlementService
{
    private const FREE_PLAN_RENEWAL_MONTHS = 1;

    public function ensureCanCreateSearch(User $user): void
    {
        $this->initializeFreeCreditsIfNeeded($user);
        $this->refreshCreditsIfNeeded($user);

        $limits = $this->limitsForUser($user);

        if (($limits['searchCreditsLimit'] ?? 0) <= 0) {
            throw ValidationException::withMessages([
                'billing' => 'This plan does not include any search credits.',
            ]);
        }

        if ($this->searchCreditsRemaining($user) <= 0) {
            throw ValidationException::withMessages([
                'billing' => 'You are out of search credits for this billing period.',
            ]);
        }
    }

    public function consumeSearchCredit(User $user): void
    {
        $this->initializeFreeCreditsIfNeeded($user);
        $this->refreshCreditsIfNeeded($user);

        // The column is unsigned, so a raw decrement at zero is a database
        // error rather than a clamp. Floor it here.
        $user->forceFill([
            'monthly_credits_remaining' => max(0, (int) $user->monthly_credits_remaining - 1),
        ])->save();

        $this->markFreeSearchUsed($user);
    }

    public function refundSearchCredit(User $user): void
    {
        $this->initializeFreeCreditsIfNeeded($user);
        $this->refreshCreditsIfNeeded($user);

        $limit = (int) ($this->limitsForUser($user)['searchCreditsLimit'] ?? 0);

        $user->forceFill([
            'monthly_credits_remaining' => min(
                $limit,
                max(0, (int) $user->monthly_credits_remaining + 1)
            ),
        ])->save();

        $this->syncSubscriptionUsage($user);
    }

    /**
     * Records that this account has spent a free-plan credit at least once.
     *
     * Free users now renew monthly, so this stamp no longer blocks future
     * cycles. It remains useful for migration-safe bootstrapping and audit
     * visibility.
     */
    public function markFreeSearchUsed(User $user): void
    {
        if ($user->free_search_used_at !== null) {
            return;
        }

        $user->forceFill(['free_search_used_at' => now()])->save();
    }

    /**
     * Folds searches run while signed out into the account's balance.
     *
     * Claiming used to be free: the row's user_id was reassigned and no credit
     * was ever charged, so log out / search / log back in minted an unlimited
     * supply of scrapes. Each claimed search is now paid for.
     */
    public function absorbClaimedGuestSearches(User $user, int $claimedCount): void
    {
        if ($claimedCount <= 0) {
            return;
        }

        $this->markFreeSearchUsed($user);

        $user->forceFill([
            'monthly_credits_remaining' => max(0, (int) $user->monthly_credits_remaining - $claimedCount),
        ])->save();

        $this->syncSubscriptionUsage($user);
    }

    public function ensureCanBookmark(User $user): void
    {
        if (! $this->hasPaidPlan($user)) {
            throw ValidationException::withMessages([
                'billing' => 'Upgrade to Basic or Premium to bookmark videos.',
            ]);
        }
    }

    public function ensureCanBookmarkSearch(User $user): void
    {
        if (! $this->hasPaidPlan($user)) {
            throw ValidationException::withMessages([
                'billing' => 'Upgrade to Basic or Premium to bookmark searches.',
            ]);
        }

        $limit = $this->bookmarkLimit($user);

        if ($limit !== -1 && $this->bookmarkCount($user) >= $limit) {
            throw ValidationException::withMessages([
                'billing' => 'You have reached your bookmark limit for this plan.',
            ]);
        }
    }

    public function hasPaidPlan(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        return in_array($user->current_plan_slug, ['basic', 'premium'], true)
            && ($user->plan_renews_at === null || $user->plan_renews_at->isFuture());
    }

    public function bookmarkLimit(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        return (int) ($this->limitsForUser($user)['bookmarkLimit'] ?? 0);
    }

    public function bookmarkCount(User $user): int
    {
        return CustomKeywordSearch::query()
            ->where('user_id', $user->id)
            ->where('is_watchlisted', true)
            ->count();
    }

    /**
     * @return array<string, int>
     */
    public function limitsFor(PricingPlan $plan): array
    {
        return [
            'searchCreditsLimit' => (int) data_get($plan->metadata, 'searchCreditsLimit', 0),
            'searchCreditsUsed' => (int) data_get($plan->metadata, 'searchCreditsUsed', 0),
            'bookmarkLimit' => (int) data_get($plan->metadata, 'bookmarkLimit', 0),
            'bookmarksUsed' => (int) data_get($plan->metadata, 'bookmarksUsed', 0),
        ];
    }

    public function searchCreditsRemaining(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        return max(0, (int) $user->monthly_credits_remaining);
    }

    public function searchCreditsUsed(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        if ($this->hasPaidPlan($user)) {
            [$startsAt, $endsAt] = $this->currentBillingWindow($user);

            if ($startsAt !== null && $endsAt !== null) {
                return CustomKeywordSearchRun::query()
                    ->where('status', CustomKeywordSearchRun::STATUS_DONE)
                    ->whereNotNull('completed_at')
                    ->where('completed_at', '>=', $startsAt)
                    ->where('completed_at', '<', $endsAt)
                    ->whereJsonContains('raw_summary->credit_reserved', true)
                    ->whereHas('search', fn ($query) => $query->where('user_id', $user->id))
                    ->count();
            }
        }

        $limits = $this->limitsForUser($user);

        return max(0, ((int) ($limits['searchCreditsLimit'] ?? 0)) - $this->searchCreditsRemaining($user));
    }

    public function bookmarksUsed(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        if ($this->hasPaidPlan($user)) {
            $subscription = $this->activeSubscriptionFor($user);
            $used = data_get($subscription?->metadata, 'bookmarksUsed');

            if ($used !== null) {
                return max(0, (int) $used);
            }
        }

        return $this->bookmarkCount($user);
    }

    public function syncSubscriptionUsage(User $user, ?PricingPlan $plan = null): void
    {
        $subscription = Subscription::query()->where('user_id', $user->id)->first();

        if ($subscription === null) {
            return;
        }

        $plan ??= $subscription->plan ?? PricingPlan::query()->find($subscription->plan_id);

        if ($plan === null) {
            return;
        }

        $searchCreditsUsed = $this->searchCreditsUsed($user);
        $bookmarksUsed = $this->bookmarkCount($user);

        $subscription->forceFill([
            'metadata' => $this->subscriptionMetadata($plan, $searchCreditsUsed, $bookmarksUsed),
        ])->save();
    }

    /**
     * @return array<string, int>
     */
    public function limitsForUser(User $user): array
    {
        $plan = PricingPlan::query()->where('slug', $user->current_plan_slug)->first();

        if ($plan === null) {
            return [
                'searchCreditsLimit' => $user->current_plan_slug === 'free' ? 1 : 0,
                'searchCreditsUsed' => 0,
                'bookmarkLimit' => 0,
                'bookmarksUsed' => 0,
            ];
        }

        return $this->limitsFor($plan);
    }

    /**
     * @param  array<string, int>  $limits
     */
    public function remainingSearchCreditsFrom(array $limits, int $used): int
    {
        return max(0, ((int) ($limits['searchCreditsLimit'] ?? 0)) - max(0, $used));
    }

    private function refreshCreditsIfNeeded(User $user): void
    {
        if ($user->plan_renews_at === null || $user->plan_renews_at->isFuture()) {
            return;
        }

        $plan = PricingPlan::query()->where('slug', $user->current_plan_slug)->first();

        if ($plan === null) {
            $user->forceFill([
                'current_plan_slug' => 'free',
                'monthly_credits_remaining' => 1,
                'plan_renews_at' => CarbonImmutable::now()->addMonths(self::FREE_PLAN_RENEWAL_MONTHS),
            ])->save();

            return;
        }

        $endsAt = CarbonImmutable::now()->addMonths(max(1, (int) $plan->interval_count));
        $limits = $this->limitsFor($plan);

        $user->forceFill([
            'monthly_credits_remaining' => $this->remainingSearchCreditsFrom($limits, 0),
            'plan_renews_at' => $endsAt,
        ])->save();

        $this->syncSubscriptionUsage($user, $plan);
    }

    private function initializeFreeCreditsIfNeeded(User $user): void
    {
        if ($user->current_plan_slug !== 'free') {
            return;
        }

        /*
         * This used to ask whether any custom_keyword_searches rows existed.
         * They are soft-deletable, so deleting your searches made the query
         * come back empty and handed the credit straight back — an unlimited
         * refill loop. The stamp below is written once and never cleared.
         */
        if ($user->plan_renews_at !== null) {
            return;
        }

        $user->forceFill([
            'monthly_credits_remaining' => (int) $user->monthly_credits_remaining > 0
                ? (int) $user->monthly_credits_remaining
                : ($user->free_search_used_at === null ? 1 : 0),
            'plan_renews_at' => CarbonImmutable::now()->addMonths(self::FREE_PLAN_RENEWAL_MONTHS),
        ])->save();
    }

    private function subscriptionMetadata(PricingPlan $plan, int $searchCreditsUsed, int $bookmarksUsed): array
    {
        $limits = $this->limitsFor($plan);

        return [
            'plan_slug' => $plan->slug,
            'searchCreditsLimit' => (int) $limits['searchCreditsLimit'],
            'searchCreditsUsed' => max(0, $searchCreditsUsed),
            'bookmarkLimit' => (int) $limits['bookmarkLimit'],
            'bookmarksUsed' => max(0, $bookmarksUsed),
        ];
    }

    private function activeSubscriptionFor(User $user): ?Subscription
    {
        return Subscription::query()
            ->where('user_id', $user->id)
            ->first();
    }

    /**
     * @return array{0: ?CarbonImmutable, 1: ?CarbonImmutable}
     */
    private function currentBillingWindow(User $user): array
    {
        $subscription = $this->activeSubscriptionFor($user);
        $startsAt = $subscription?->current_period_starts_at;
        $endsAt = $subscription?->current_period_ends_at ?? $user->plan_renews_at;

        if ($startsAt === null || $endsAt === null) {
            return [null, null];
        }

        return [
            CarbonImmutable::instance($startsAt),
            CarbonImmutable::instance($endsAt),
        ];
    }
}
