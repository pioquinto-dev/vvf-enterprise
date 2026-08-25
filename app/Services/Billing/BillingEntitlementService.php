<?php

namespace App\Services\Billing;

use App\Models\CustomKeywordSearch;
use App\Models\CustomKeywordSearchRun;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\VideoAnalysis;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Log;
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
                'current_plan_slug' => $user->current_plan_slug,
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
                'current_plan_slug' => $user->current_plan_slug,
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

        return in_array($user->current_plan_slug, ['basic', 'premium'], true)
            && ($user->plan_renews_at === null || $user->plan_renews_at->isFuture());
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
            $used = data_get($subscription?->metadata, 'subscription.search_bookmarks.used');

            if ($used !== null) {
                return max(0, (int) $used);
            }
        }

        return $this->searchBookmarkCount($user);
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
        $videoBookmarksUsed = $this->derivedVideoBookmarkUsed($user);
        $searchBookmarksUsed = $this->searchBookmarkCount($user);
        $videoAnalysisUsed = $this->derivedVideoAnalysisUsed($user);

        $subscription->forceFill([
            'metadata' => $this->subscriptionMetadata($plan, $searchCreditsUsed, $videoBookmarksUsed, $searchBookmarksUsed, $videoAnalysisUsed),
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
                'trialEnabled' => true,
                'searchLimit' => $user->current_plan_slug === 'free' ? 1 : 0,
                'searchUsed' => 0,
                'videoBookmarkLimit' => $user->current_plan_slug === 'free' ? -1 : 0,
                'videoBookmarkUsed' => 0,
                'searchBookmarkLimit' => 0,
                'searchBookmarkUsed' => 0,
                'videoAnalysisLimit' => 0,
                'videoAnalysisUsed' => 0,
                'searchCreditsLimit' => $user->current_plan_slug === 'free' ? 1 : 0,
                'searchCreditsUsed' => 0,
                'bookmarkLimit' => 0,
                'bookmarksUsed' => 0,
            ];
        }

        $limits = $this->limitsFor($plan);
        $subscription = $this->activeSubscriptionFor($user);

        if ($subscription === null) {
            return $limits;
        }

        $searchUsed = $this->derivedSearchCreditsUsed($user, $limits);
        $videoBookmarkUsed = $this->derivedVideoBookmarkUsed($user);
        $searchBookmarkUsed = $this->searchBookmarkCount($user);
        $videoAnalysisUsed = $this->derivedVideoAnalysisUsed($user);

        return array_merge($limits, [
            'searchUsed' => $searchUsed,
            'videoBookmarkUsed' => $videoBookmarkUsed,
            'searchBookmarkUsed' => $searchBookmarkUsed,
            'videoAnalysisUsed' => $videoAnalysisUsed,
            'searchCreditsUsed' => $searchUsed,
            'bookmarksUsed' => $searchBookmarkUsed,
        ]);
    }

    /**
     * @param  array<string, int>  $limits
     */
    private function derivedSearchCreditsUsed(User $user, array $limits): int
    {
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

        return max(0, ((int) ($limits['searchCreditsLimit'] ?? 0)) - $this->searchCreditsRemaining($user));
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

    private function subscriptionMetadata(PricingPlan $plan, int $searchCreditsUsed, int $videoBookmarksUsed, int $searchBookmarksUsed, int $videoAnalysisUsed): array
    {
        $limits = $this->limitsFor($plan);

        return [
            'plan_slug' => $plan->slug,
            'settings' => [
                'cta' => (string) data_get($plan->metadata, 'settings.cta', 'Choose plan'),
                'popular' => (bool) data_get($plan->metadata, 'settings.popular', false),
            ],
            'subscription' => [
                'trialEnabled' => (bool) ($limits['trialEnabled'] ?? false),
                'search_limits' => [
                    'used' => max(0, $searchCreditsUsed),
                    'limit' => (int) ($limits['searchLimit'] ?? 0),
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

    private function activeSubscriptionFor(User $user): ?Subscription
    {
        return Subscription::query()
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->orderByRaw("case when status = 'active' then 0 when status = 'trialing' then 1 when status = 'pending' then 2 else 3 end")
            ->orderByDesc('current_period_ends_at')
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
