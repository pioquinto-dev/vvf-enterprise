<?php

namespace App\Services\Billing;

use App\Models\ManagedCouponProgram;
use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Analytics\AnalyticsEvent;
use App\Services\Analytics\AnalyticsEventManager;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Stripe\StripeClient;
use App\Services\Utm\UtmAttributionService;
use App\Support\AppEventLogger;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BillingService
{
    private const TRIAL_DAYS = 8;

    public function __construct(
        private readonly StripeClient $stripe,
        private readonly BillingEntitlementService $entitlements,
        private readonly BrevoLifecycleEmailService $emails,
        private readonly UtmAttributionService $utmAttributionService,
        private readonly ?UserActivityService $activity = null,
        private readonly ?CouponAccessService $couponAccess = null,
        private readonly ?AnalyticsEventManager $analytics = null,
    ) {}

    public function checkout(User $user, PricingPlan $plan, bool $withTrial = false, string $cycle = 'monthly', ?ManagedCouponProgram $program = null): string
    {
        if (! $plan->is_active || $plan->archived_at !== null) {
            throw ValidationException::withMessages([
                'plan' => 'This plan is not purchasable yet.',
            ]);
        }

        $activeSubscription = $this->entitlements->activeSubscriptionFor($user);
        $activePlan = $activeSubscription?->plan;

        if ($activeSubscription !== null
            && $activePlan !== null
            && in_array((string) $activeSubscription->status, ['active', 'paid'], true)
            && $this->planTier($plan) < $this->planTier($activePlan)) {
            throw ValidationException::withMessages([
                'plan' => 'Your account already has a higher plan. Lower-tier checkout is unavailable.',
            ]);
        }

        if ($this->isActivePaidGrowthSubscriber($user) && str_starts_with($plan->slug, 'scale')) {
            throw ValidationException::withMessages([
                'plan' => 'Use the in-app Scale upgrade to preserve your current billing period and charge only the plan difference.',
            ]);
        }

        // Some plans (e.g. Scale) are gated behind a "Contact Us" flow, but only
        // for an existing active, paid subscriber: a mid-cycle plan change to a
        // higher tier needs proration/upgrade billing we do not run yet. A fresh
        // subscriber (free or trialing) can still self-serve straight into the
        // plan — the "Contact Us" route only exists for the upgrade case. This is
        // the single chokepoint every checkout entry point funnels through, so
        // gating here closes the direct-API backdoor regardless of the front-end.
        if (! (bool) data_get($plan->metadata, 'settings.self_serve', true)
            && $this->isActivePaidGrowthSubscriber($user)) {
            throw ValidationException::withMessages([
                'plan' => 'This plan is not available for self-serve checkout yet. Contact us to upgrade.',
            ]);
        }

        if ($withTrial && ! $this->canStartTrial($user)) {
            throw ValidationException::withMessages([
                'trial' => 'This account has already used its trial. Upgrade to continue with a paid plan.',
            ]);
        }

        $billingCycle = $this->billingCycleForPlan($plan, $cycle);
        $priceId = $this->stripePriceIdFor($plan);

        if (blank($priceId)) {
            throw ValidationException::withMessages([
                'plan' => $billingCycle === 'annual'
                    ? 'Annual checkout is not configured for this plan yet.'
                    : 'This plan is not purchasable yet.',
            ]);
        }

        $customerId = $this->ensureCustomer($user);

        // A managed coupon program can apply a Stripe discount server-side and,
        // for the no-card trial programs, skip payment-method collection.
        $collectPaymentMethod = $program === null || $program->collect_payment_method;
        $programMeta = $program === null ? [] : [
            'coupon_program_id' => (string) $program->id,
            'coupon_program_code' => $program->code,
        ];

        $sessionPayload = [
            'mode' => 'subscription',
            'customer' => $customerId,
            'line_items' => [[
                'price' => $priceId,
                'quantity' => 1,
            ]],
            'success_url' => route('billing.success').'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('plans'),
            'metadata' => array_merge([
                'plan_slug' => $plan->slug,
                'user_id' => (string) $user->id,
                'trial_days' => $withTrial ? (string) self::TRIAL_DAYS : '0',
                'billing_cycle' => $billingCycle,
            ], $programMeta),
            'subscription_data' => array_filter([
                'trial_period_days' => $withTrial ? self::TRIAL_DAYS : null,
                'metadata' => array_merge([
                    'plan_slug' => $plan->slug,
                    'billing_cycle' => $billingCycle,
                ], $programMeta),
                // No-card trial: cancel at trial end if no payment method was added.
                'trial_settings' => (! $collectPaymentMethod && $withTrial)
                    ? ['end_behavior' => ['missing_payment_method' => 'cancel']]
                    : null,
            ]),
        ];

        if (! $collectPaymentMethod) {
            $sessionPayload['payment_method_collection'] = 'if_required';
        }

        $discount = $this->couponDiscountPayload($program);

        if ($discount !== null) {
            $sessionPayload['discounts'] = [$discount];
        }

        $session = $this->stripe->createCheckoutSession($sessionPayload);

        AppEventLogger::result('billing.checkout.session_created', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_slug' => $plan->slug,
            'with_trial' => $withTrial,
            'billing_cycle' => $billingCycle,
            'stripe_customer_id' => $customerId,
            'stripe_checkout_session_id' => (string) ($session->id ?? ''),
            'coupon_program_code' => $program?->code,
        ]);

        if ($program !== null) {
            $this->activity()?->record($user, 'coupon_usage', 'coupon_checkout_initiated', "Started {$program->code} checkout for {$plan->name}.", ['plan' => $plan->slug, 'coupon_program' => $program->code], 'coupon-checkout:'.(string) ($session->id ?? ''));
        } else {
            $this->activity?->record($user, 'engagement', 'checkout_initiated', "Initiated checkout for {$plan->name}.", ['plan' => $plan->slug], 'checkout:'.(string) ($session->id ?? ''));
        }

        $this->analytics()->queueForUser($user, AnalyticsEvent::make('checkout_started', [
            'plan_slug' => $plan->slug,
            'billing_cycle' => $billingCycle,
            'with_trial' => $withTrial,
            'coupon_program' => $program?->code,
        ]));

        return $session->url;
    }

    public function upgradeGrowthToScale(User $user, PricingPlan $targetPlan): Subscription
    {
        $subscription = $this->entitlements->activeSubscriptionFor($user);
        $sourcePlan = $subscription?->plan;

        if ($subscription === null || $sourcePlan === null
            || ! in_array((string) $subscription->status, ['active', 'paid'], true)
            || ! str_starts_with($sourcePlan->slug, 'growth')
            || ! str_starts_with($targetPlan->slug, 'scale')) {
            throw ValidationException::withMessages(['plan' => 'This account is not eligible for a Scale upgrade.']);
        }

        if ($sourcePlan->currency !== $targetPlan->currency
            || $sourcePlan->interval !== $targetPlan->interval
            || $sourcePlan->interval_count !== $targetPlan->interval_count) {
            throw ValidationException::withMessages(['plan' => 'Choose the Scale plan with the same billing cycle as your Growth subscription.']);
        }

        $sourcePriceId = $this->stripePriceIdFor($sourcePlan);
        $targetPriceId = $this->stripePriceIdFor($targetPlan);
        $chargeCents = (int) $targetPlan->price_cents - (int) $sourcePlan->price_cents;

        if (blank($sourcePriceId) || blank($targetPriceId)
            || blank($subscription->stripe_subscription_id) || blank($subscription->stripe_customer_id) || $chargeCents <= 0) {
            throw ValidationException::withMessages(['plan' => 'This plan upgrade is not configured correctly yet.']);
        }

        $remote = $this->stripe->retrieveSubscription($subscription->stripe_subscription_id);
        $item = collect($remote->items->data ?? [])->first();
        $itemId = (string) ($item->id ?? '');

        if ($itemId === '') {
            throw ValidationException::withMessages(['plan' => 'The current Stripe subscription could not be updated.']);
        }

        $invoiceItem = null;
        $invoice = null;

        try {
            // Switch the renewal price without moving the current billing anchor.
            $this->stripe->updateSubscription($subscription->stripe_subscription_id, [
                'items' => [[
                    'id' => $itemId,
                    'price' => $targetPriceId,
                    'quantity' => (int) ($item->quantity ?? 1),
                ]],
                'proration_behavior' => 'none',
                'metadata' => ['plan_slug' => $targetPlan->slug],
            ]);

            // Charge the stated full plan difference once, independently of how
            // much of the current Growth period has elapsed.
            $invoiceItem = $this->stripe->createInvoiceItem([
                'customer' => $subscription->stripe_customer_id,
                'subscription' => $subscription->stripe_subscription_id,
                'currency' => strtolower($targetPlan->currency),
                'amount' => $chargeCents,
                'description' => "Upgrade from {$sourcePlan->name} to {$targetPlan->name}",
                'metadata' => ['upgrade_from' => $sourcePlan->slug, 'upgrade_to' => $targetPlan->slug],
            ]);
            $invoice = $this->stripe->createInvoice([
                'customer' => $subscription->stripe_customer_id,
                'subscription' => $subscription->stripe_subscription_id,
                'collection_method' => 'charge_automatically',
                'auto_advance' => false,
                'metadata' => ['upgrade_from' => $sourcePlan->slug, 'upgrade_to' => $targetPlan->slug],
            ]);
            $paidInvoice = $this->stripe->payInvoice($this->stripe->finalizeInvoice((string) $invoice->id)->id);

            if (($paidInvoice->status ?? null) !== 'paid') {
                throw ValidationException::withMessages(['plan' => 'The upgrade payment could not be completed.']);
            }
        } catch (\Throwable $exception) {
            AppEventLogger::error('billing.upgrade.failed', $exception->getMessage(), [
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'stripe_subscription_id' => $subscription->stripe_subscription_id,
                'from_plan' => $sourcePlan->slug,
                'to_plan' => $targetPlan->slug,
                'charge_cents' => $chargeCents,
                'invoice_item_created' => $invoiceItem !== null,
                'invoice_created' => $invoice !== null,
            ]);

            // Remove an unpaid difference item so retrying cannot bill it twice.
            try {
                if ($invoice !== null) {
                    $this->stripe->voidInvoice((string) $invoice->id);
                } elseif ($invoiceItem !== null) {
                    $this->stripe->deleteInvoiceItem((string) $invoiceItem->id);
                }
            } catch (\Throwable) {
                // The original payment/update failure is more actionable.
            }

            // Avoid leaving Stripe on Scale when the one-time difference charge fails.
            try {
                $this->stripe->updateSubscription($subscription->stripe_subscription_id, [
                    'items' => [['id' => $itemId, 'price' => $sourcePriceId, 'quantity' => (int) ($item->quantity ?? 1)]],
                    'proration_behavior' => 'none',
                    'metadata' => ['plan_slug' => $sourcePlan->slug],
                ]);
            } catch (\Throwable $rollbackException) {
                AppEventLogger::error('billing.upgrade.rollback_failed', $rollbackException->getMessage(), [
                    'user_id' => $user->id,
                    'stripe_subscription_id' => $subscription->stripe_subscription_id,
                    'from_plan' => $sourcePlan->slug,
                    'to_plan' => $targetPlan->slug,
                ]);
            }

            throw $exception;
        }

        return DB::transaction(function () use ($user, $subscription, $sourcePlan, $targetPlan, $chargeCents): Subscription {
            $metadata = $this->subscriptionMetadata(
                $targetPlan,
                (int) data_get($subscription->metadata, 'subscription.search_limits.used', 0),
                (int) data_get($subscription->metadata, 'subscription.viral_video_bookmarks.used', 0),
                (int) data_get($subscription->metadata, 'subscription.search_bookmarks.used', 0),
                (int) data_get($subscription->metadata, 'subscription.video_analysis.used', 0),
                (string) data_get($subscription->metadata, 'settings.billing_cycle', 'monthly'),
                $subscription->current_period_starts_at ? CarbonImmutable::instance($subscription->current_period_starts_at) : null,
                $subscription->current_period_ends_at ? CarbonImmutable::instance($subscription->current_period_ends_at) : null,
            );
            data_set($metadata, 'subscription.search_limits.window_starts_at', data_get($subscription->metadata, 'subscription.search_limits.window_starts_at'));
            data_set($metadata, 'subscription.search_limits.window_ends_at', data_get($subscription->metadata, 'subscription.search_limits.window_ends_at'));

            $subscription->forceFill(['plan_id' => $targetPlan->id, 'metadata' => $metadata])->save();
            $this->activity()?->record($user, 'subscription', 'subscription_upgraded', "Upgraded from {$sourcePlan->name} to {$targetPlan->name}.", ['from_plan' => $sourcePlan->slug, 'to_plan' => $targetPlan->slug, 'charged_cents' => $chargeCents, 'subscription_id' => $subscription->id]);
            $this->analytics()->queueForUser($user, AnalyticsEvent::make('subscription_upgraded', ['from_plan' => $sourcePlan->slug, 'to_plan' => $targetPlan->slug, 'charged_cents' => $chargeCents]));

            return $subscription->refresh();
        });
    }

    private function recordCouponRedemption(User $user, mixed $session, string $subscriptionId, string $status): void
    {
        $programId = (int) ($session->metadata->coupon_program_id ?? 0);

        if ($programId <= 0) {
            return;
        }

        $program = ManagedCouponProgram::query()->find($programId);

        if ($program === null) {
            return;
        }

        // Resolved lazily: the container does not inject constructor params that
        // carry a default value, so $this->couponAccess can be null in prod.
        $couponAccess = $this->couponAccess ?? app(CouponAccessService::class);

        $redemption = $couponAccess->recordRedemption(
            $program,
            $user,
            (string) ($session->id ?? ''),
            $subscriptionId !== '' ? $subscriptionId : null,
            $status,
        );

        if ($redemption === null) {
            AppEventLogger::error('billing.coupon.redemption_slot_lost', 'No slots remained when finalizing coupon redemption.', [
                'user_id' => $user->id,
                'coupon_program_code' => $program->code,
            ]);

            return;
        }

        $this->activity()?->record($user, 'coupon_usage', 'coupon_redeemed', "Redeemed {$program->code}.", ['coupon_program' => $program->code, 'status' => $status], 'coupon-redeemed:'.$program->id.':'.$user->id);
    }

    /**
     * Activity recorder — resolved lazily because the container leaves the
     * defaulted constructor dependency null (same reason as couponAccess).
     */
    private function activity(): ?UserActivityService
    {
        return $this->activity ?? app(UserActivityService::class);
    }

    private function analytics(): AnalyticsEventManager
    {
        return $this->analytics ?? app(AnalyticsEventManager::class);
    }

    private function couponDiscountPayload(?ManagedCouponProgram $program): ?array
    {
        if ($program === null) {
            return null;
        }

        $promo = trim((string) $program->stripe_promotion_code_id);

        if ($promo !== '') {
            // Real Stripe promotion-code IDs are prefixed `promo_`. Anything else
            // pasted here is almost certainly a coupon id in the wrong field, so
            // treat it as a coupon rather than 500ing with "No such promotion code".
            return str_starts_with($promo, 'promo_')
                ? ['promotion_code' => $promo]
                : ['coupon' => $promo];
        }

        $coupon = trim((string) $program->stripe_coupon_id);

        return $coupon !== '' ? ['coupon' => $coupon] : null;
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
        $billingCycle = (string) ($session->metadata->billing_cycle ?? 'monthly');
        $trialEndsAt = $trialDays > 0 ? $now->addDays($trialDays) : null;
        $endsAt = $trialEndsAt ?? $now->addMonths($this->renewalMonthsFor($plan, $billingCycle));
        $status = $trialEndsAt !== null ? 'trialing' : 'active';

        $limits = $this->limitsFor($plan);
        $searchCreditsUsed = 0;
        $videoBookmarksUsed = $this->entitlements->videoBookmarkCount($user);
        $searchBookmarksUsed = $this->entitlements->searchBookmarkCount($user);
        $videoAnalysisUsed = 0;

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
            'metadata' => $this->subscriptionMetadata($plan, $searchCreditsUsed, $videoBookmarksUsed, $searchBookmarksUsed, $videoAnalysisUsed, $billingCycle, $now, $endsAt),
        ]);

        // A subscription replaces the one-time public free-search offer.
        $this->markFreeSearchUsed($user);

        $this->utmAttributionService->createSubscriptionAttribution($user, $subscriptionId);
        $this->activity?->record($user, 'subscription', $status === 'trialing' ? 'trial_started' : 'subscription_paid', $status === 'trialing' ? "Started a trial on {$plan->name}." : "Started a paid subscription on {$plan->name}.", ['plan' => $plan->slug], 'subscription:'.$sessionId.':'.$status);
        $this->analytics()->queueForUser($user, AnalyticsEvent::make($status === 'trialing' ? 'trial_started' : 'subscription_started', [
            'plan_slug' => $plan->slug,
            'billing_cycle' => $billingCycle,
            'subscription_status' => $status,
            'currency' => strtoupper((string) ($plan->currency ?? 'usd')),
            'value' => $billingCycle === 'annual'
                ? (float) ($plan->annual_amount ?? ($plan->price_cents !== null ? ((int) $plan->price_cents / 100) : 0))
                : (float) ($plan->amount ?? ($plan->price_cents !== null ? ((int) $plan->price_cents / 100) : 0)),
            'trial_days' => $trialDays,
        ]));

        $this->recordCouponRedemption($user, $session, $subscriptionId, $status);

        if (! in_array((string) ($existingSubscription?->status ?? ''), ['active', 'trialing', 'trial'], true)) {
            $this->emails->sendSubscriptionStarted($user, $subscription);
        }

        AppEventLogger::result('billing.checkout.finalized', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'plan_slug' => $plan->slug,
            'billing_cycle' => $billingCycle,
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

    public function hasUsedTrial(?User $user): bool
    {
        return $this->entitlements->hasUsedTrial($user);
    }

    /**
     * A subscriber currently on an active, paid (non-trial) plan — the only case
     * where jumping to a higher, non-self-serve tier is a mid-cycle upgrade that
     * needs proration we do not run yet. Free and trialing accounts are excluded
     * so they can self-serve straight into the gated plan.
     */
    private function isActivePaidGrowthSubscriber(User $user): bool
    {
        $subscription = $this->entitlements->activeSubscriptionFor($user);

        return $subscription !== null
            && in_array((string) $subscription->status, ['active', 'paid'], true)
            && str_starts_with((string) data_get($subscription->metadata, 'plan_slug', $subscription->plan?->slug ?? ''), 'growth')
            && $this->hasPaidPlan($user);
    }

    private function planTier(PricingPlan $plan): int
    {
        return match (true) {
            $plan->plan_type === 'scale' || str_starts_with($plan->slug, 'scale') => 2,
            $plan->plan_type === 'growth' || str_starts_with($plan->slug, 'growth') => 1,
            default => 0,
        };
    }

    public function canStartTrial(?User $user): bool
    {
        return $user !== null
            && ! $this->hasPaidPlan($user)
            && ! $this->hasUsedTrial($user);
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
        $subscription = $this->entitlements->activeSubscriptionFor($user);

        if (filled($subscription?->stripe_customer_id)) {
            return $subscription->stripe_customer_id;
        }

        $customer = $this->stripe->createCustomer([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => ['user_id' => (string) $user->id],
        ]);

        $this->ensureSubscriptionRecord($user)->forceFill([
            'stripe_customer_id' => $customer->id,
        ])->save();

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

    public function currentPlanSlug(?User $user): string
    {
        if ($user === null) {
            return 'free';
        }

        return $this->entitlements->currentPlanSlug($user);
    }

    private function stripeCustomerId(User $user): ?string
    {
        return $this->entitlements->activeSubscriptionFor($user)?->stripe_customer_id;
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

    public function createBillingPortalSession(User $user, string $returnUrl, string $action = 'manage'): string
    {
        $customerId = $this->ensureCustomer($user);
        $payload = [
            'customer' => $customerId,
            'return_url' => $returnUrl,
        ];

        if ($action === 'payment_method') {
            $payload['flow_data'] = [
                'type' => 'payment_method_update',
                'after_completion' => [
                    'type' => 'redirect',
                    'redirect' => ['return_url' => $returnUrl],
                ],
            ];
        }

        if ($action === 'cancel') {
            $subscription = Subscription::query()
                ->where('user_id', $user->id)
                ->whereNotNull('stripe_subscription_id')
                ->whereNull('deleted_at')
                ->latest('current_period_ends_at')
                ->first();

            if ($subscription?->stripe_subscription_id) {
                $payload['flow_data'] = [
                    'type' => 'subscription_cancel',
                    'subscription_cancel' => [
                        'subscription' => $subscription->stripe_subscription_id,
                    ],
                    'after_completion' => [
                        'type' => 'redirect',
                        'redirect' => ['return_url' => $returnUrl],
                    ],
                ];
            }
        }

        $session = $this->stripe->createBillingPortalSession($payload);

        return (string) $session->url;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function invoiceHistory(User $user, int $limit = 12): array
    {
        $customerId = $this->stripeCustomerId($user);

        if (blank($customerId)) {
            return [];
        }

        $invoices = $this->stripe->listInvoices([
            'customer' => $customerId,
            'limit' => max(1, min($limit, 24)),
        ]);

        return collect($invoices->data ?? [])
            ->map(function ($invoice): array {
                $amountCents = (int) ($invoice->amount_paid ?? $invoice->amount_due ?? 0);
                $currency = strtoupper((string) ($invoice->currency ?? 'USD'));

                return [
                    'id' => (string) ($invoice->id ?? ''),
                    'number' => (string) ($invoice->number ?? ''),
                    'date' => isset($invoice->created) ? CarbonImmutable::createFromTimestampUTC((int) $invoice->created)->toIso8601String() : null,
                    'status' => (string) ($invoice->status ?? 'open'),
                    'amount' => $this->formatCurrencyAmount($amountCents, $currency),
                    'currency' => $currency,
                    'url' => (string) ($invoice->hosted_invoice_url ?? $invoice->invoice_pdf ?? ''),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * Structured data for our own branded receipt page, sourced from Stripe.
     * Returns null when the invoice does not exist or does not belong to the user.
     *
     * @return array<string, mixed>|null
     */
    public function receiptDetails(User $user, string $invoiceId): ?array
    {
        $customerId = $this->stripeCustomerId($user);

        if (blank($customerId) || blank($invoiceId)) {
            return null;
        }

        try {
            $invoice = $this->stripe->retrieveInvoice($invoiceId, [
                'expand' => ['charge', 'lines.data'],
            ]);
        } catch (\Throwable) {
            return null;
        }

        // Guard against reading another customer's invoice by id-guessing.
        if ((string) ($invoice->customer ?? '') !== $customerId) {
            return null;
        }

        $currency = strtoupper((string) ($invoice->currency ?? 'USD'));
        $card = $invoice->charge->payment_method_details->card ?? null;

        $lines = collect($invoice->lines->data ?? [])
            ->map(function ($line) use ($currency): array {
                $start = data_get($line, 'period.start');
                $end = data_get($line, 'period.end');

                return [
                    'description' => (string) ($line->description ?? 'Subscription'),
                    'quantity' => (int) ($line->quantity ?? 1),
                    'amount' => $this->formatCurrencyAmount((int) ($line->amount ?? 0), $currency),
                    'periodStart' => $start ? CarbonImmutable::createFromTimestampUTC((int) $start)->toIso8601String() : null,
                    'periodEnd' => $end ? CarbonImmutable::createFromTimestampUTC((int) $end)->toIso8601String() : null,
                ];
            })
            ->values()
            ->all();

        $taxCents = (int) ($invoice->tax ?? 0);

        return [
            'id' => (string) ($invoice->id ?? ''),
            'number' => (string) ($invoice->number ?? ''),
            'status' => (string) ($invoice->status ?? 'open'),
            'date' => isset($invoice->created) ? CarbonImmutable::createFromTimestampUTC((int) $invoice->created)->toIso8601String() : null,
            'currency' => $currency,
            'customerName' => (string) ($invoice->customer_name ?? ''),
            'customerEmail' => (string) ($invoice->customer_email ?? $user->email ?? ''),
            'lines' => $lines,
            'subtotal' => $this->formatCurrencyAmount((int) ($invoice->subtotal ?? 0), $currency),
            'tax' => $taxCents > 0 ? $this->formatCurrencyAmount($taxCents, $currency) : null,
            'total' => $this->formatCurrencyAmount((int) ($invoice->total ?? $invoice->amount_paid ?? 0), $currency),
            'amountPaid' => $this->formatCurrencyAmount((int) ($invoice->amount_paid ?? 0), $currency),
            'card' => $card ? [
                'brand' => ucfirst((string) ($card->brand ?? 'card')),
                'last4' => (string) ($card->last4 ?? ''),
            ] : null,
            'hostedUrl' => (string) ($invoice->hosted_invoice_url ?? ''),
            'pdfUrl' => (string) ($invoice->invoice_pdf ?? ''),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    public function paymentMethodSummary(User $user): ?array
    {
        $customerId = $this->stripeCustomerId($user);

        if (blank($customerId)) {
            return null;
        }

        $methods = $this->stripe->listPaymentMethods([
            'customer' => $customerId,
            'type' => 'card',
            'limit' => 1,
        ]);

        $method = $methods->data[0] ?? null;

        if ($method === null || ! isset($method->card)) {
            return null;
        }

        return [
            'brand' => ucfirst((string) ($method->card->brand ?? 'card')),
            'last4' => (string) ($method->card->last4 ?? ''),
            'expMonth' => (int) ($method->card->exp_month ?? 0),
            'expYear' => (int) ($method->card->exp_year ?? 0),
            'id' => (string) ($method->id ?? ''),
        ];
    }

    /**
     * @return array{clientSecret: string}
     */
    public function createPaymentMethodSetup(User $user): array
    {
        $customerId = $this->ensureCustomer($user);
        $intent = $this->stripe->createSetupIntent([
            'customer' => $customerId,
            'payment_method_types' => ['card'],
            'usage' => 'off_session',
        ]);

        return [
            'clientSecret' => (string) ($intent->client_secret ?? ''),
        ];
    }

    public function setDefaultPaymentMethod(User $user, string $paymentMethodId): void
    {
        $customerId = $this->ensureCustomer($user);

        $this->stripe->updateCustomer($customerId, [
            'invoice_settings' => [
                'default_payment_method' => $paymentMethodId,
            ],
        ]);

        $subscription = Subscription::query()
            ->where('user_id', $user->id)
            ->whereNotNull('stripe_subscription_id')
            ->whereNull('deleted_at')
            ->latest('current_period_ends_at')
            ->first();

        if ($subscription?->stripe_subscription_id) {
            $this->stripe->updateSubscription($subscription->stripe_subscription_id, [
                'default_payment_method' => $paymentMethodId,
            ]);
        }
    }

    public function cancelSubscription(User $user): void
    {
        $subscription = Subscription::query()
            ->where('user_id', $user->id)
            ->whereNotNull('stripe_subscription_id')
            ->whereNull('deleted_at')
            ->latest('current_period_ends_at')
            ->first();

        if ($subscription === null || blank($subscription->stripe_subscription_id)) {
            throw ValidationException::withMessages([
                'subscription' => 'No active Stripe subscription was found for this account.',
            ]);
        }

        $updated = $this->stripe->updateSubscription($subscription->stripe_subscription_id, [
            'cancel_at_period_end' => true,
        ]);

        // Mirror the cancellation onto our record immediately. The
        // customer.subscription.updated webhook writes the same keys, but it may
        // be delayed or (in local/dev) never fire, so the UI must not depend on
        // it to reflect a change the user just made.
        $cancelAtTs = data_get($updated, 'cancel_at') ?? data_get($updated, 'current_period_end');
        $cancelAt = is_numeric($cancelAtTs)
            ? CarbonImmutable::createFromTimestampUTC((int) $cancelAtTs)
            : ($subscription->current_period_ends_at !== null ? CarbonImmutable::instance($subscription->current_period_ends_at) : null);
        $this->applyCancellationState($subscription, true, $cancelAt);

        $this->activity?->record(
            $user,
            'subscription',
            'subscription_cancellation_requested',
            'Requested subscription cancellation at period end.',
            [
                'subscription_id' => $subscription->id,
                'plan' => data_get($subscription->metadata, 'plan_slug', 'free'),
                'stripe_subscription_id' => $subscription->stripe_subscription_id,
            ],
            'subscription:cancel-request:'.$subscription->id
        );

    }

    public function reactivateSubscription(User $user): void
    {
        $subscription = Subscription::query()
            ->where('user_id', $user->id)
            ->whereNotNull('stripe_subscription_id')
            ->whereNull('deleted_at')
            ->latest('current_period_ends_at')
            ->first();

        if ($subscription === null || blank($subscription->stripe_subscription_id)) {
            throw ValidationException::withMessages([
                'subscription' => 'No active Stripe subscription was found for this account.',
            ]);
        }

        $this->stripe->updateSubscription($subscription->stripe_subscription_id, [
            'cancel_at_period_end' => false,
        ]);

        // Clear the local cancellation flags right away (see cancelSubscription).
        $this->applyCancellationState($subscription, false, null);

        $this->activity?->record(
            $user,
            'subscription',
            'subscription_reactivation_requested',
            'Requested subscription reactivation.',
            [
                'subscription_id' => $subscription->id,
                'plan' => data_get($subscription->metadata, 'plan_slug', 'free'),
                'stripe_subscription_id' => $subscription->stripe_subscription_id,
            ],
            'subscription:reactivation-request:'.$subscription->id
        );

    }

    /**
     * Persist the cancel-at-period-end state onto our local record so the UI
     * reflects it without waiting on the Stripe webhook. Uses the same metadata
     * keys the webhook writes, so a later webhook is idempotent.
     */
    private function applyCancellationState(Subscription $subscription, bool $cancelAtPeriodEnd, ?CarbonImmutable $cancelAt): void
    {
        $metadata = is_array($subscription->metadata) ? $subscription->metadata : [];

        data_set($metadata, 'subscription.cancel_at_period_end', $cancelAtPeriodEnd);
        data_set($metadata, 'subscription.cancel_at', $cancelAtPeriodEnd ? $cancelAt?->toIso8601String() : null);

        $subscription->forceFill(['metadata' => $metadata])->save();
    }

    public function ensureSubscriptionRecord(User $user): Subscription
    {
        $existing = Subscription::query()
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->whereIn('status', ['active', 'trialing', 'pending', 'paid', 'free'])
            ->orderByRaw("case when status = 'active' then 0 when status = 'trialing' then 1 when status = 'pending' then 2 when status = 'paid' then 3 else 4 end")
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        $plan = PricingPlan::query()->where('slug', 'free')->first();
        $searchCreditsUsed = $this->entitlements->searchCreditsUsed($user);
        $videoBookmarksUsed = $this->entitlements->videoBookmarkCount($user);
        $searchBookmarksUsed = $this->entitlements->searchBookmarkCount($user);
        $videoAnalysisUsed = $this->entitlements->videoAnalysisUsed($user);
        $status = 'free';

        // The entitlement service may have created the missing metadata row
        // while deriving usage. Reuse it rather than creating a duplicate.
        $existing = Subscription::query()
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->whereIn('status', ['active', 'trialing', 'pending', 'paid', 'free'])
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return Subscription::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $user->id,
            'plan_id' => $plan?->id,
            'status' => $status,
            'current_period_starts_at' => CarbonImmutable::now(),
            'current_period_ends_at' => CarbonImmutable::now()->addMonth(),
            'metadata' => $plan !== null
                ? $this->subscriptionMetadata($plan, $searchCreditsUsed, $videoBookmarksUsed, $searchBookmarksUsed, $videoAnalysisUsed)
                : null,
        ]);
    }

    private function subscriptionMetadata(PricingPlan $plan, int $searchCreditsUsed, int $videoBookmarksUsed, int $searchBookmarksUsed, int $videoAnalysisUsed, string $billingCycle = 'monthly', ?CarbonImmutable $periodStart = null, ?CarbonImmutable $periodEnd = null): array
    {
        $limits = $this->limitsFor($plan);
        $window = $this->creditWindowFor($billingCycle, $periodStart, $periodEnd);

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
                    'window_starts_at' => $window['starts_at']?->toIso8601String(),
                    'window_ends_at' => $window['ends_at']?->toIso8601String(),
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

    private function stripePriceIdFor(PricingPlan $plan): ?string
    {
        return blank($plan->stripe_price_id) ? null : (string) $plan->stripe_price_id;
    }

    private function renewalMonthsFor(PricingPlan $plan, string $billingCycle): int
    {
        return max(1, (int) $plan->interval_count);
    }

    private function billingCycleForPlan(PricingPlan $plan, string $requestedCycle): string
    {
        $planCycle = (string) ($plan->duration ?: '');

        if ($planCycle === 'annual' || $plan->interval === 'year' || $plan->interval_count > 1) {
            return 'annual';
        }

        return $requestedCycle === 'annual' ? 'annual' : 'monthly';
    }

    /**
     * @return array{starts_at: ?CarbonImmutable, ends_at: ?CarbonImmutable}
     */
    private function creditWindowFor(string $billingCycle, ?CarbonImmutable $periodStart, ?CarbonImmutable $periodEnd): array
    {
        if ($periodStart === null || $periodEnd === null) {
            return ['starts_at' => $periodStart, 'ends_at' => $periodEnd];
        }

        if ($billingCycle !== 'annual') {
            return ['starts_at' => $periodStart, 'ends_at' => $periodEnd];
        }

        $monthlyEnd = $periodStart->addMonth();

        return [
            'starts_at' => $periodStart,
            'ends_at' => $monthlyEnd->lessThan($periodEnd) ? $monthlyEnd : $periodEnd,
        ];
    }

    private function formatCurrencyAmount(int $amountCents, string $currency): string
    {
        $amount = number_format($amountCents / 100, 2, '.', ',');

        return match ($currency) {
            'USD' => '$'.$amount,
            default => $amount.' '.$currency,
        };
    }
}
