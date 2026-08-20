<?php

namespace App\Services\Billing;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Stripe\StripeClient;
use App\Services\Utm\UtmAttributionService;
use App\Support\AppEventLogger;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BillingService
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly BillingEntitlementService $entitlements,
        private readonly BrevoLifecycleEmailService $emails,
        private readonly UtmAttributionService $utmAttributionService,
        private readonly ?UserActivityService $activity = null,
    ) {}

    public function checkout(User $user, PricingPlan $plan, bool $withTrial = false): string
    {
        if (! $plan->is_active || $plan->archived_at !== null || blank($plan->stripe_price_id)) {
            throw ValidationException::withMessages([
                'plan' => 'This plan is not purchasable yet.',
            ]);
        }

        $customerId = $this->ensureCustomer($user);

        $session = $this->stripe->createCheckoutSession([
            'mode' => 'subscription',
            'customer' => $customerId,
            'line_items' => [[
                'price' => $plan->stripe_price_id,
                'quantity' => 1,
            ]],
            'success_url' => route('billing.success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('plans'),
            'metadata' => [
                'plan_slug' => $plan->slug,
                'user_id' => (string) $user->id,
                'trial_days' => $withTrial ? '7' : '0',
            ],
            ...($withTrial ? ['subscription_data' => ['trial_period_days' => 7]] : []),
        ]);

        AppEventLogger::result('billing.checkout.session_created', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_slug' => $plan->slug,
            'with_trial' => $withTrial,
            'stripe_customer_id' => $customerId,
            'stripe_checkout_session_id' => (string) ($session->id ?? ''),
        ]);
        $this->activity?->record($user, 'engagement', 'checkout_initiated', "Initiated checkout for {$plan->name}.", ['plan' => $plan->slug], 'checkout:'.(string) ($session->id ?? ''));

        return $session->url;
    }

    public function finalizeCheckout(User $user, string $sessionId): void
    {
        AppEventLogger::result('billing.checkout.finalize_started', [
            'user_id' => $user->id,
            'stripe_checkout_session_id' => $sessionId,
        ]);

        $session = $this->stripe->retrieveCheckoutSession($sessionId);

        if (($session->payment_status ?? null) !== 'paid' && ($session->status ?? null) !== 'complete') {
            AppEventLogger::error('billing.checkout.finalize_incomplete', 'Stripe checkout is not complete yet.', [
                'user_id' => $user->id,
                'stripe_checkout_session_id' => $sessionId,
                'payment_status' => $session->payment_status ?? null,
                'session_status' => $session->status ?? null,
            ]);

            throw ValidationException::withMessages([
                'billing' => 'Stripe checkout is not complete yet.',
            ]);
        }

        $planSlug = (string) ($session->metadata->plan_slug ?? '');
        $plan = PricingPlan::query()->where('slug', $planSlug)->firstOrFail();
        $subscriptionId = (string) ($session->subscription ?? '');
        $customerId = (string) ($session->customer ?? '');
        $now = CarbonImmutable::now();
        $trialDays = max(0, (int) ($session->metadata->trial_days ?? 0));
        $trialEndsAt = $trialDays > 0 ? $now->addDays($trialDays) : null;
        $endsAt = $trialEndsAt ?? $now->addMonths(max(1, (int) $plan->interval_count));
        $status = $trialEndsAt !== null ? 'trialing' : 'active';

        $limits = $this->limitsFor($plan);
        $searchCreditsUsed = 0;
        $videoBookmarksUsed = $this->entitlements->videoBookmarkCount($user);
        $searchBookmarksUsed = $this->entitlements->searchBookmarkCount($user);
        $videoAnalysisUsed = 0;

        $user->forceFill([
            'stripe_customer_id' => $customerId !== '' ? $customerId : $user->stripe_customer_id,
            'current_plan_slug' => $plan->slug,
            'monthly_credits_remaining' => $this->remainingSearchCreditsFrom($limits, $searchCreditsUsed),
            'plan_renews_at' => $endsAt,
        ])->save();

        $existingSubscription = Subscription::query()->where('user_id', $user->id)->first();

        $subscription = $this->upsertUserSubscription($user, [
            'plan_id' => $plan->id,
            'stripe_checkout_session_id' => $sessionId,
            'stripe_subscription_id' => $subscriptionId !== '' ? $subscriptionId : null,
            'stripe_customer_id' => $customerId !== '' ? $customerId : null,
            'status' => $status,
            'current_period_starts_at' => $now,
            'current_period_ends_at' => $endsAt,
            'trial_started_at' => $trialEndsAt !== null ? $now : null,
            'trial_ends_at' => $trialEndsAt,
            'metadata' => $this->subscriptionMetadata($plan, $searchCreditsUsed, $videoBookmarksUsed, $searchBookmarksUsed, $videoAnalysisUsed),
        ]);

        $this->utmAttributionService->createSubscriptionAttribution($user, $subscriptionId);
        $this->activity?->record($user, $status === 'trialing' ? 'regular_trial' : 'paid', $status === 'trialing' ? 'trial_started' : 'subscription_paid', $status === 'trialing' ? "Started a trial on {$plan->name}." : "Started a paid subscription on {$plan->name}.", ['plan' => $plan->slug], 'subscription:'.$sessionId.':'.$status);

        if (! in_array((string) ($existingSubscription?->status ?? ''), ['active', 'trialing', 'trial'], true)) {
            $this->emails->sendSubscriptionStarted($user, $subscription);
        }

        AppEventLogger::result('billing.checkout.finalized', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_slug' => $plan->slug,
            'stripe_checkout_session_id' => $sessionId,
            'stripe_subscription_id' => $subscriptionId,
            'stripe_customer_id' => $customerId,
            'current_period_ends_at' => $endsAt?->toIso8601String(),
        ]);
    }

    public function ensureCanCreateSearch(User $user): void
    {
        $this->entitlements->ensureCanCreateSearch($user);
    }

    public function consumeSearchCredit(User $user): void
    {
        $this->entitlements->consumeSearchCredit($user);
    }

    public function absorbClaimedGuestSearches(User $user, int $claimedCount): void
    {
        $this->entitlements->absorbClaimedGuestSearches($user, $claimedCount);
    }

    public function refundSearchCredit(User $user): void
    {
        $this->entitlements->refundSearchCredit($user);
    }

    public function markFreeSearchUsed(User $user): void
    {
        $this->entitlements->markFreeSearchUsed($user);
    }

    public function ensureCanBookmark(User $user): void
    {
        $this->entitlements->ensureCanBookmark($user);
    }

    public function consumeVideoBookmark(User $user): void
    {
        $this->entitlements->consumeVideoBookmark($user);
    }

    public function ensureCanBookmarkSearch(User $user): void
    {
        $this->entitlements->ensureCanBookmarkSearch($user);
    }

    public function ensureCanAnalyzeVideo(User $user): void
    {
        $this->entitlements->ensureCanAnalyzeVideo($user);
    }

    public function consumeVideoAnalysis(User $user): void
    {
        $this->entitlements->consumeVideoAnalysis($user);
    }

    public function refundVideoAnalysis(User $user): void
    {
        $this->entitlements->refundVideoAnalysis($user);
    }

    public function hasPaidPlan(?User $user): bool
    {
        return $this->entitlements->hasPaidPlan($user);
    }

    public function bookmarkLimit(?User $user): int
    {
        return $this->entitlements->bookmarkLimit($user);
    }

    public function bookmarkCount(User $user): int
    {
        return $this->entitlements->bookmarkCount($user);
    }

    public function videoBookmarkCount(User $user): int
    {
        return $this->entitlements->videoBookmarkCount($user);
    }

    public function videoBookmarkLimit(?User $user): int
    {
        return $this->entitlements->videoBookmarkLimit($user);
    }

    public function searchBookmarkLimit(?User $user): int
    {
        return $this->entitlements->searchBookmarkLimit($user);
    }

    public function videoAnalysisLimit(?User $user): int
    {
        return $this->entitlements->videoAnalysisLimit($user);
    }

    public function videoAnalysisUsed(?User $user): int
    {
        return $this->entitlements->videoAnalysisUsed($user);
    }

    public function limitsFor(PricingPlan $plan): array
    {
        return $this->entitlements->limitsFor($plan);
    }

    private function ensureCustomer(User $user): string
    {
        if (filled($user->stripe_customer_id)) {
            return $user->stripe_customer_id;
        }

        $customer = $this->stripe->createCustomer([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => ['user_id' => (string) $user->id],
        ]);

        $user->forceFill(['stripe_customer_id' => $customer->id])->save();

        return $customer->id;
    }

    private function upsertUserSubscription(User $user, array $attributes): Subscription
    {
        return Subscription::query()->updateOrCreate(
            ['user_id' => $user->id],
            array_merge(
                ['id' => (string) Str::ulid()],
                $attributes
            )
        );
    }

    public function searchCreditsRemaining(?User $user): int
    {
        return $this->entitlements->searchCreditsRemaining($user);
    }

    public function searchCreditsUsed(?User $user): int
    {
        return $this->entitlements->searchCreditsUsed($user);
    }

    public function bookmarksUsed(?User $user): int
    {
        return $this->entitlements->bookmarksUsed($user);
    }

    public function syncSubscriptionUsage(User $user, ?PricingPlan $plan = null): void
    {
        $this->entitlements->syncSubscriptionUsage($user, $plan);
    }

    public function limitsForUser(User $user): array
    {
        return $this->entitlements->limitsForUser($user);
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

    private function remainingSearchCreditsFrom(array $limits, int $used): int
    {
        return $this->entitlements->remainingSearchCreditsFrom($limits, $used);
    }
}
