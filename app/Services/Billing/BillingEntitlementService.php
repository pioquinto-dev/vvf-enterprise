<?php

namespace App\Services\Billing;

use App\Models\CustomKeywordSearch;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\VideoAnalysis;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BillingEntitlementService
{
    private const FREE_PLAN_RENEWAL_MONTHS = 1;

    public function ensureCanCreateSearch(User $user): void
    {
        $this->initializeFreeCreditsIfNeeded($user);
        $this->refreshCreditsIfNeeded($user);

        $limits = $this->limitsForUser($user);
        $searchLimit = (int) ($limits['searchCreditsLimit'] ?? 0);

        if ($searchLimit === -1) {
            return;
        }

        if ($searchLimit <= 0) {
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

        if ((int) ($this->limitsForUser($user)['searchCreditsLimit'] ?? 0) === -1) {
            return;
        }

        $this->adjustSearchCreditsUsed($user, 1);

        $this->markFreeSearchUsed($user);
    }

    public function refundSearchCredit(User $user): void
    {
        $this->initializeFreeCreditsIfNeeded($user);
        $this->refreshCreditsIfNeeded($user);

        if ((int) ($this->limitsForUser($user)['searchCreditsLimit'] ?? 0) === -1) {
            return;
        }

        $this->adjustSearchCreditsUsed($user, -1);

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

        $this->adjustSearchCreditsUsed($user, $claimedCount);

        $this->syncSubscriptionUsage($user);
    }

    public function ensureCanBookmark(User $user): void
    {
        $limit = $this->videoBookmarkLimit($user);

        if ($limit !== -1 && $this->videoBookmarkCount($user) >= $limit) {
            throw ValidationException::withMessages([
                'billing' => 'You have reached your video bookmark limit for this plan.',
            ]);
        }
    }

    public function consumeVideoBookmark(User $user): void
    {
        $subscription = $this->activeSubscriptionFor($user);

        if ($subscription === null) {
            Log::warning('Video bookmark credit increment skipped because no active subscription was found.', [
                'user_id' => $user->id,
                'subscription_id' => null,
            ]);

            return;
        }

        $before = max(0, (int) data_get($subscription->metadata, 'subscription.viral_video_bookmarks.used', 0));
        $baseline = max($before, $user->videoBookmarks()->count());
        $used = $baseline + 1;

        $metadata = (array) $subscription->metadata;
        data_set($metadata, 'subscription.viral_video_bookmarks.used', $used);

        $subscription->forceFill([
            'metadata' => $metadata,
        ])->save();
    }

    public function ensureCanBookmarkSearch(User $user): void
    {
        if (! $this->hasPaidPlan($user)) {
            throw ValidationException::withMessages([
                'billing' => 'Upgrade to Growth or Scale to bookmark searches.',
            ]);
        }

        $limit = $this->searchBookmarkLimit($user);

        if ($limit !== -1 && $this->searchBookmarkCount($user) >= $limit) {
            throw ValidationException::withMessages([
                'billing' => 'You have reached your search bookmark limit for this plan.',
            ]);
        }
    }

    public function ensureCanAnalyzeVideo(User $user): void
    {
        if (! $this->hasPaidPlan($user)) {
            throw ValidationException::withMessages([
                'billing' => 'Upgrade to Growth or Scale to analyze videos.',
            ]);
        }

        $limit = $this->videoAnalysisLimit($user);

        if ($limit !== -1 && $this->videoAnalysisUsed($user) >= $limit) {
            throw ValidationException::withMessages([
                'billing' => 'You have reached your video analysis limit for this plan.',
            ]);
        }
    }

    public function consumeVideoAnalysis(User $user): void
    {
        $subscription = $this->activeSubscriptionFor($user);

        if ($subscription === null) {
            Log::warning('Video analysis credit increment skipped because no active subscription was found.', [
                'user_id' => $user->id,
                'subscription_id' => null,
            ]);
            return;
        }

        $before = max(0, (int) data_get($subscription->metadata, 'subscription.video_analysis.used', 0));
        $used = max($before, $this->derivedVideoAnalysisUsed($user));

        $metadata = (array) $subscription->metadata;
        data_set($metadata, 'subscription.video_analysis.used', $used);

        $subscription->forceFill([
            'metadata' => $metadata,
        ])->save();

        Log::info('Video analysis credit incremented.', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'before' => $before,
            'after' => $used,
            'status' => $subscription->status,
            'current_period_ends_at' => $subscription->current_period_ends_at?->toIso8601String(),
        ]);
    }

    public function refundVideoAnalysis(User $user): void
    {
        $subscription = $this->activeSubscriptionFor($user);

        if ($subscription === null) {
            return;
        }

        $used = max(0, (int) data_get($subscription->metadata, 'subscription.video_analysis.used', 0) - 1);

        $metadata = (array) $subscription->metadata;
        data_set($metadata, 'subscription.video_analysis.used', $used);

        $subscription->forceFill([
            'metadata' => $metadata,
        ])->save();
    }

    public function hasPaidPlan(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        $subscription = $this->subscriptionForUser($user);

        return $subscription !== null
            && $subscription->status !== 'free'
            && ! in_array($subscription->status, ['canceled', 'unpaid', 'incomplete_expired'], true)
            && ($subscription->current_period_ends_at === null || $subscription->current_period_ends_at->isFuture());
    }

    public function currentPlanSlug(?User $user): string
    {
        if ($user === null) {
            return 'free';
        }

        $subscription = $this->subscriptionForUser($user);

        return $subscription?->plan?->slug
            ?? (string) data_get($subscription?->metadata, 'plan_slug', 'free');
    }

    public function hasUsedTrial(?User $user): bool
    {
        if ($user === null) {
            return false;
        }

        // A completed or canceled trial is replaced by a free subscription
        // record, so eligibility must be based on subscription history rather
        // than only the current entitlement record.
        return Subscription::query()
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->where(function ($query): void {
                $query->whereNotNull('trial_started_at')
                    ->orWhereNotNull('trial_completed_at')
                    ->orWhereNotNull('trial_ends_at');
            })
            ->exists();
    }

    public function bookmarkLimit(?User $user): int
    {
        return $this->searchBookmarkLimit($user);
    }

    public function bookmarkCount(User $user): int
    {
        return $this->searchBookmarkCount($user);
    }

    public function videoBookmarkLimit(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        return (int) ($this->limitsForUser($user)['videoBookmarkLimit'] ?? 0);
    }

    public function videoBookmarkCount(User $user): int
    {
        return $this->derivedVideoBookmarkUsed($user);
    }

    public function searchBookmarkLimit(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        return (int) ($this->limitsForUser($user)['searchBookmarkLimit'] ?? 0);
    }

    public function searchBookmarkCount(User $user): int
    {
        return CustomKeywordSearch::query()
            ->where('user_id', $user->id)
            ->where('is_watchlisted', true)
            ->count();
    }

    public function videoAnalysisLimit(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        return (int) ($this->limitsForUser($user)['videoAnalysisLimit'] ?? 0);
    }

    public function videoAnalysisUsed(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        return $this->derivedVideoAnalysisUsed($user);
    }

    /**
     * @return array<string, int>
     */
    public function limitsFor(PricingPlan $plan): array
    {
        $trialEnabled = (bool) data_get($plan->metadata, 'subscription.trialEnabled', false);
        $searchLimit = (int) data_get($plan->metadata, 'subscription.search_limits.limit', data_get($plan->metadata, 'searchCreditsLimit', 0));
        $videoBookmarkLimit = (int) data_get($plan->metadata, 'subscription.viral_video_bookmarks.limit', data_get($plan->metadata, 'bookmarkLimit', 0));
        $searchBookmarkLimit = (int) data_get($plan->metadata, 'subscription.search_bookmarks.limit', data_get($plan->metadata, 'bookmarkLimit', 0));
        $videoAnalysisLimit = (int) data_get($plan->metadata, 'subscription.video_analysis.limit', 0);

        return [
            'trialEnabled' => $trialEnabled,
            'searchLimit' => $searchLimit,
            'searchUsed' => (int) data_get($plan->metadata, 'subscription.search_limits.used', 0),
            'videoBookmarkLimit' => $videoBookmarkLimit,
            'videoBookmarkUsed' => (int) data_get($plan->metadata, 'subscription.viral_video_bookmarks.used', 0),
            'searchBookmarkLimit' => $searchBookmarkLimit,
            'searchBookmarkUsed' => (int) data_get($plan->metadata, 'subscription.search_bookmarks.used', 0),
            'videoAnalysisLimit' => $videoAnalysisLimit,
            'videoAnalysisUsed' => (int) data_get($plan->metadata, 'subscription.video_analysis.used', 0),
            'searchCreditsLimit' => $searchLimit,
            'searchCreditsUsed' => (int) data_get($plan->metadata, 'subscription.search_limits.used', 0),
            'bookmarkLimit' => $searchBookmarkLimit,
            'bookmarksUsed' => (int) data_get($plan->metadata, 'subscription.search_bookmarks.used', 0),
        ];
    }

    public function searchCreditsRemaining(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        $subscription = $this->subscriptionForUser($user);
        $limit = (int) data_get($subscription?->metadata, 'subscription.search_limits.limit', 0);

        if ($limit === -1) {
            return -1;
        }

        $used = max(0, (int) data_get($subscription?->metadata, 'subscription.search_limits.used', 0));

        return max(0, $limit - $used);
    }

    public function searchCreditsUsed(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        return max(0, (int) data_get(
            $this->subscriptionForUser($user)?->metadata,
            'subscription.search_limits.used',
            0,
        ));
    }

    public function bookmarksUsed(?User $user): int
    {
        if ($user === null) {
            return 0;
        }

        if ($this->hasPaidPlan($user)) {
            $subscription = $this->activeSubscriptionFor($user);
            $used = data_get($subscription?->metadata, 'subscription.search_bookmarks.used');

            if ($used !== null) {
                return max(0, (int) $used);
            }
        }

        return $this->searchBookmarkCount($user);
    }

    public function syncSubscriptionUsage(User $user, ?PricingPlan $plan = null): void
    {
        $subscription = $this->subscriptionForUser($user);

        if ($subscription === null) {
            return;
        }

        $plan ??= $subscription->plan ?? PricingPlan::query()->find($subscription->plan_id);

        if ($plan === null) {
            return;
        }

        $searchCreditsUsed = $this->searchCreditsUsed($user);
        $videoBookmarksUsed = $this->derivedVideoBookmarkUsed($user);
        $searchBookmarksUsed = $this->searchBookmarkCount($user);
        $videoAnalysisUsed = $this->derivedVideoAnalysisUsed($user);

        $cycle = $this->billingCycleFor($subscription);
        $periodStart = $subscription->current_period_starts_at ? CarbonImmutable::instance($subscription->current_period_starts_at) : null;
        $periodEnd = $subscription->current_period_ends_at ? CarbonImmutable::instance($subscription->current_period_ends_at) : null;

        $subscription->forceFill([
            'metadata' => $this->subscriptionMetadata($plan, $searchCreditsUsed, $videoBookmarksUsed, $searchBookmarksUsed, $videoAnalysisUsed, $cycle, $periodStart, $periodEnd, $subscription->metadata ?? []),
        ])->save();
    }

    /**
     * @return array<string, int>
     */
    public function limitsForUser(User $user): array
    {
        $subscription = $this->subscriptionForUser($user);
        $plan = $subscription?->plan ?? PricingPlan::query()->find($subscription?->plan_id);
        $planSlug = $plan?->slug ?? data_get($subscription?->metadata, 'plan_slug', 'free');

        if ($plan === null) {
            return [
                'trialEnabled' => true,
                'searchLimit' => $planSlug === 'free' ? 1 : 0,
                'searchUsed' => 0,
                'videoBookmarkLimit' => $planSlug === 'free' ? -1 : 0,
                'videoBookmarkUsed' => 0,
                'searchBookmarkLimit' => 0,
                'searchBookmarkUsed' => 0,
                'videoAnalysisLimit' => 0,
                'videoAnalysisUsed' => 0,
                'searchCreditsLimit' => $planSlug === 'free' ? 1 : 0,
                'searchCreditsUsed' => 0,
                'bookmarkLimit' => 0,
                'bookmarksUsed' => 0,
            ];
        }

        $limits = $this->limitsFor($plan);
        if ($subscription === null) {
            return $limits;
        }

        $searchLimit = (int) data_get($subscription->metadata, 'subscription.search_limits.limit', $limits['searchCreditsLimit'] ?? 0);
        $searchUsed = max(0, (int) data_get($subscription->metadata, 'subscription.search_limits.used', 0));
        $videoBookmarkUsed = $this->derivedVideoBookmarkUsed($user);
        $searchBookmarkUsed = $this->searchBookmarkCount($user);
        $videoAnalysisUsed = $this->derivedVideoAnalysisUsed($user);

        return array_merge($limits, [
            'searchUsed' => $searchUsed,
            'videoBookmarkUsed' => $videoBookmarkUsed,
            'searchBookmarkUsed' => $searchBookmarkUsed,
            'videoAnalysisUsed' => $videoAnalysisUsed,
            'searchLimit' => $searchLimit,
            'searchCreditsLimit' => $searchLimit,
            'searchCreditsUsed' => $searchUsed,
            'bookmarksUsed' => $searchBookmarkUsed,
        ]);
    }

    private function derivedVideoAnalysisUsed(User $user): int
    {
        $query = VideoAnalysis::query()
            ->where('user_id', $user->id)
            ->where('counts_toward_quota', true)
            ->where(function ($builder) {
                $builder
                    ->where(function ($complete) {
                        $complete
                            ->where('status', VideoAnalysis::STATUS_COMPLETE)
                            ->whereNotNull('analyzed_at');
                    })
                    ->orWhere('status', VideoAnalysis::STATUS_PROCESSING);
            });

        if ($this->hasPaidPlan($user)) {
            [$startsAt, $endsAt] = $this->currentBillingWindow($user);

            if ($startsAt !== null && $endsAt !== null) {
                $query
                    ->where(function ($window) use ($startsAt, $endsAt) {
                        $window
                            ->where(function ($complete) use ($startsAt, $endsAt) {
                                $complete
                                    ->where('status', VideoAnalysis::STATUS_COMPLETE)
                                    ->where('analyzed_at', '>=', $startsAt)
                                    ->where('analyzed_at', '<', $endsAt);
                            })
                            ->orWhere(function ($processing) use ($startsAt, $endsAt) {
                                $processing
                                    ->where('status', VideoAnalysis::STATUS_PROCESSING)
                                    ->where('created_at', '>=', $startsAt)
                                    ->where('created_at', '<', $endsAt);
                            });
                    });
            }
        }

        return $query->count();
    }

    private function derivedVideoBookmarkUsed(User $user): int
    {
        $current = $user->videoBookmarks()->count();

        if (! $this->hasPaidPlan($user)) {
            return $current;
        }

        $subscription = $this->activeSubscriptionFor($user);
        $used = data_get($subscription?->metadata, 'subscription.viral_video_bookmarks.used');

        if ($used === null) {
            return $current;
        }

        return max($current, (int) $used);
    }

    /**
     * @param  array<string, int>  $limits
     */
    public function remainingSearchCreditsFrom(array $limits, int $used): int
    {
        if ((int) ($limits['searchCreditsLimit'] ?? 0) === -1) {
            return -1;
        }

        return max(0, ((int) ($limits['searchCreditsLimit'] ?? 0)) - max(0, $used));
    }

    private function refreshCreditsIfNeeded(User $user): void
    {
        if ($this->hasPaidPlan($user)) {
            $this->refreshPaidCreditsIfNeeded($user);

            return;
        }

        $subscription = $this->subscriptionForUser($user);

        if ($subscription === null || $subscription->current_period_ends_at === null || $subscription->current_period_ends_at->isFuture()) {
            return;
        }

        $plan = $subscription->plan ?? PricingPlan::query()->find($subscription->plan_id);

        if ($plan === null) {
            return;
        }

        $startsAt = CarbonImmutable::now();
        $endsAt = CarbonImmutable::now()->addMonths(max(1, (int) $plan->interval_count));
        $subscription->forceFill([
            'current_period_starts_at' => $startsAt,
            'current_period_ends_at' => $endsAt,
        ])->save();

        $this->resetSearchCredits($subscription, $plan, $endsAt);
    }

    private function refreshPaidCreditsIfNeeded(User $user): void
    {
        $subscription = $this->activeSubscriptionFor($user);

        if ($subscription === null) {
            return;
        }

        $windowEnd = data_get($subscription->metadata, 'subscription.search_limits.window_ends_at');
        $windowStart = data_get($subscription->metadata, 'subscription.search_limits.window_starts_at');

        if (! is_string($windowEnd) || ! is_string($windowStart)) {
            return;
        }

        $currentEnd = CarbonImmutable::parse($windowEnd);
        $currentStart = CarbonImmutable::parse($windowStart);

        if ($currentEnd->isFuture()) {
            return;
        }

        $periodEnd = $subscription->current_period_ends_at ? CarbonImmutable::instance($subscription->current_period_ends_at) : null;

        if ($periodEnd === null) {
            return;
        }

        $plan = $subscription->plan ?? PricingPlan::query()->find($subscription->plan_id);

        if ($plan === null) {
            return;
        }

        $billingCycle = $this->billingCycleFor($subscription);
        $nextStart = $currentStart;
        $nextEnd = $currentEnd;

        while ($nextEnd->lessThanOrEqualTo(CarbonImmutable::now()) && $nextEnd->lessThan($periodEnd)) {
            $nextStart = $nextEnd;
            $candidateEnd = $billingCycle === 'annual' ? $nextStart->addMonth() : $periodEnd;
            $nextEnd = $candidateEnd->lessThan($periodEnd) ? $candidateEnd : $periodEnd;
        }

        $limits = $this->limitsFor($plan);
        $metadata = (array) $subscription->metadata;

        data_set($metadata, 'settings.billing_cycle', $billingCycle);
        data_set($metadata, 'subscription.search_limits.used', 0);
        data_set($metadata, 'subscription.search_limits.limit', (int) ($limits['searchLimit'] ?? 0));
        data_set($metadata, 'subscription.search_limits.window_starts_at', $nextStart->toIso8601String());
        data_set($metadata, 'subscription.search_limits.window_ends_at', $nextEnd->toIso8601String());

        $subscription->forceFill([
            'metadata' => $metadata,
        ])->save();

        $this->syncSubscriptionUsage($user, $plan);
    }

    private function initializeFreeCreditsIfNeeded(User $user): void
    {
        $subscription = $this->subscriptionForUser($user);

        if ($subscription === null || $subscription->status !== 'free') {
            return;
        }

        /*
         * This used to ask whether any custom_keyword_searches rows existed.
         * They are soft-deletable, so deleting your searches made the query
         * come back empty and handed the credit straight back — an unlimited
         * refill loop. The stamp below is written once and never cleared.
         */
        if ($subscription->current_period_ends_at !== null) {
            return;
        }

        $subscription->forceFill([
            'current_period_starts_at' => CarbonImmutable::now(),
            'current_period_ends_at' => CarbonImmutable::now()->addMonths(self::FREE_PLAN_RENEWAL_MONTHS),
        ])->save();
    }

    private function adjustSearchCreditsUsed(User $user, int $change): void
    {
        $subscription = $this->subscriptionForUser($user);

        if ($subscription === null) {
            throw ValidationException::withMessages([
                'billing' => 'Search credits could not be loaded for this account.',
            ]);
        }

        $metadata = (array) $subscription->metadata;
        $limit = (int) data_get($metadata, 'subscription.search_limits.limit', 0);

        if ($limit === -1) {
            return;
        }

        $used = max(0, (int) data_get($metadata, 'subscription.search_limits.used', 0));
        $used = max(0, min($limit, $used + $change));

        data_set($metadata, 'subscription.search_limits.used', $used);

        $subscription->forceFill(['metadata' => $metadata])->save();
    }

    private function resetSearchCredits(?Subscription $subscription, PricingPlan $plan, CarbonImmutable $endsAt): void
    {
        if ($subscription === null) {
            return;
        }

        $metadata = (array) $subscription->metadata;
        $limits = $this->limitsFor($plan);

        data_set($metadata, 'subscription.search_limits.used', 0);
        data_set($metadata, 'subscription.search_limits.limit', (int) ($limits['searchLimit'] ?? 0));
        data_set($metadata, 'subscription.search_limits.window_starts_at', CarbonImmutable::now()->toIso8601String());
        data_set($metadata, 'subscription.search_limits.window_ends_at', $endsAt->toIso8601String());

        $subscription->forceFill(['metadata' => $metadata])->save();
    }

    private function subscriptionForUser(User $user): ?Subscription
    {
        $subscription = $this->activeSubscriptionFor($user);

        if ($subscription !== null) {
            return $subscription;
        }

        $plan = PricingPlan::query()->where('slug', 'free')->first();

        if ($plan === null) {
            return null;
        }

        $now = CarbonImmutable::now();
        $searchCreditsUsed = $user->free_search_used_at !== null ? 1 : 0;
        $endsAt = $now->addMonths(self::FREE_PLAN_RENEWAL_MONTHS);

        return Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'free',
            'current_period_starts_at' => $now,
            'current_period_ends_at' => $endsAt,
            'metadata' => $this->subscriptionMetadata(
                $plan,
                $searchCreditsUsed,
                // A subscription does not exist yet, so these must not use
                // entitlement helpers that resolve the user's subscription.
                $user->videoBookmarks()->count(),
                $this->searchBookmarkCount($user),
                $this->bootstrapVideoAnalysisUsed($user),
                'monthly',
                $now,
                $endsAt,
            ),
        ]);
    }

    private function bootstrapVideoAnalysisUsed(User $user): int
    {
        return VideoAnalysis::query()
            ->where('user_id', $user->id)
            ->where('counts_toward_quota', true)
            ->where(function ($builder): void {
                $builder
                    ->where(function ($complete): void {
                        $complete
                            ->where('status', VideoAnalysis::STATUS_COMPLETE)
                            ->whereNotNull('analyzed_at');
                    })
                    ->orWhere('status', VideoAnalysis::STATUS_PROCESSING);
            })
            ->count();
    }

    private function subscriptionMetadata(PricingPlan $plan, int $searchCreditsUsed, int $videoBookmarksUsed, int $searchBookmarksUsed, int $videoAnalysisUsed, string $billingCycle = 'monthly', ?CarbonImmutable $periodStart = null, ?CarbonImmutable $periodEnd = null, array $existingMetadata = []): array
    {
        $limits = $this->limitsFor($plan);
        $windowStart = data_get($existingMetadata, 'subscription.search_limits.window_starts_at');
        $windowEnd = data_get($existingMetadata, 'subscription.search_limits.window_ends_at');

        if (! is_string($windowStart) || ! is_string($windowEnd)) {
            $windowStartAt = $periodStart;
            $windowEndAt = $periodEnd;

            if ($billingCycle === 'annual' && $periodStart !== null && $periodEnd !== null) {
                $candidateEnd = $periodStart->addMonth();
                $windowEndAt = $candidateEnd->lessThan($periodEnd) ? $candidateEnd : $periodEnd;
            }

            $windowStart = $windowStartAt?->toIso8601String();
            $windowEnd = $windowEndAt?->toIso8601String();
        }

        return [
            'plan_slug' => $plan->slug,
            'settings' => [
                'cta' => (string) data_get($plan->metadata, 'settings.cta', 'Choose plan'),
                'popular' => (bool) data_get($plan->metadata, 'settings.popular', false),
                'billing_cycle' => $billingCycle,
            ],
            'subscription' => [
                'trialEnabled' => (bool) ($limits['trialEnabled'] ?? false),
                'search_limits' => [
                    'used' => max(0, $searchCreditsUsed),
                    'limit' => (int) ($limits['searchLimit'] ?? 0),
                    'window_starts_at' => $windowStart,
                    'window_ends_at' => $windowEnd,
                ],
                'viral_video_bookmarks' => [
                    'used' => max(0, $videoBookmarksUsed),
                    'limit' => (int) ($limits['videoBookmarkLimit'] ?? 0),
                ],
                'search_bookmarks' => [
                    'used' => max(0, $searchBookmarksUsed),
                    'limit' => (int) ($limits['searchBookmarkLimit'] ?? 0),
                ],
                'video_analysis' => [
                    'used' => max(0, $videoAnalysisUsed),
                    'limit' => (int) ($limits['videoAnalysisLimit'] ?? 0),
                ],
            ],
        ];
    }

    public function activeSubscriptionFor(User $user): ?Subscription
    {
        return Subscription::query()
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->whereIn('status', ['active', 'trialing', 'pending', 'paid', 'free'])
            ->orderByRaw("case when status = 'active' then 0 when status = 'trialing' then 1 when status = 'pending' then 2 when status = 'paid' then 3 else 4 end")
            ->orderByDesc('current_period_ends_at')
            ->first();
    }

    private function billingCycleFor(Subscription $subscription): string
    {
        $cycle = (string) data_get($subscription->metadata, 'settings.billing_cycle', 'monthly');

        return $cycle === 'annual' ? 'annual' : 'monthly';
    }

    /**
     * @return array{0: ?CarbonImmutable, 1: ?CarbonImmutable}
     */
    private function currentBillingWindow(User $user): array
    {
        $subscription = $this->activeSubscriptionFor($user);
        $windowStart = data_get($subscription?->metadata, 'subscription.search_limits.window_starts_at');
        $windowEnd = data_get($subscription?->metadata, 'subscription.search_limits.window_ends_at');

        if (is_string($windowStart) && is_string($windowEnd)) {
            return [
                CarbonImmutable::parse($windowStart),
                CarbonImmutable::parse($windowEnd),
            ];
        }

        $startsAt = $subscription?->current_period_starts_at;
        $endsAt = $subscription?->current_period_ends_at;

        if ($startsAt === null || $endsAt === null) {
            return [null, null];
        }

        return [
            CarbonImmutable::instance($startsAt),
            CarbonImmutable::instance($endsAt),
        ];
    }
}
