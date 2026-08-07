<?php

namespace App\Services\Billing;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Stripe\StripeClient;
use Carbon\CarbonImmutable;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BillingService
{
    public function __construct(
        private readonly StripeClient $stripe,
        private readonly BillingEntitlementService $entitlements,
    ) {}

    public function checkout(User $user, PricingPlan $plan): string
    {
        if (! $plan->is_active || blank($plan->stripe_price_id)) {
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
            'cancel_url' => route('trial'),
            'metadata' => [
                'plan_slug' => $plan->slug,
                'user_id' => (string) $user->id,
            ],
        ]);

        $this->upsertUserSubscription($user, [
            'plan_id' => $plan->id,
            'stripe_checkout_session_id' => $session->id,
            'stripe_customer_id' => $customerId,
            'status' => 'pending',
            'metadata' => $this->subscriptionMetadata($plan, 0, $this->bookmarkCount($user)),
        ]);

        return $session->url;
    }

    public function finalizeCheckout(User $user, string $sessionId): void
    {
        $session = $this->stripe->retrieveCheckoutSession($sessionId);

        if (($session->payment_status ?? null) !== 'paid' && ($session->status ?? null) !== 'complete') {
            throw ValidationException::withMessages([
                'billing' => 'Stripe checkout is not complete yet.',
            ]);
        }

        $planSlug = (string) ($session->metadata->plan_slug ?? '');
        $plan = PricingPlan::query()->where('slug', $planSlug)->firstOrFail();
        $subscriptionId = (string) ($session->subscription ?? '');
        $customerId = (string) ($session->customer ?? '');
        $now = CarbonImmutable::now();
        $endsAt = $now->addMonths(max(1, (int) $plan->interval_count));

        $limits = $this->limitsFor($plan);
        $searchCreditsUsed = 0;
        $bookmarksUsed = $this->bookmarkCount($user);

        $user->forceFill([
            'stripe_customer_id' => $customerId !== '' ? $customerId : $user->stripe_customer_id,
            'current_plan_slug' => $plan->slug,
            'monthly_credits_remaining' => $this->remainingSearchCreditsFrom($limits, $searchCreditsUsed),
            'plan_renews_at' => $endsAt,
        ])->save();

        $this->upsertUserSubscription($user, [
            'plan_id' => $plan->id,
            'stripe_checkout_session_id' => $sessionId,
            'stripe_subscription_id' => $subscriptionId !== '' ? $subscriptionId : null,
            'stripe_customer_id' => $customerId !== '' ? $customerId : null,
            'status' => 'active',
            'current_period_starts_at' => $now,
            'current_period_ends_at' => $endsAt,
            'metadata' => $this->subscriptionMetadata($plan, $searchCreditsUsed, $bookmarksUsed),
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

    public function markFreeSearchUsed(User $user): void
    {
        $this->entitlements->markFreeSearchUsed($user);
    }

    public function ensureCanBookmark(User $user): void
    {
        $this->entitlements->ensureCanBookmark($user);
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

    private function remainingSearchCreditsFrom(array $limits, int $used): int
    {
        return $this->entitlements->remainingSearchCreditsFrom($limits, $used);
    }
}
