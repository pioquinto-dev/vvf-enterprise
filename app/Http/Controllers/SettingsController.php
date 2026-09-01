<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Services\Analytics\AnalyticsEvent;
use App\Services\Billing\BillingService;
use App\Services\Admin\UserActivityService;
use App\Services\Billing\BillingEntitlementService;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    private const ACCOUNT_DELETION_GRACE_DAYS = 30;
    private const TRIAL_DAYS = 8;

    private const DEFAULT_NOTIFICATION_PREFERENCES = [
        'search_finished' => true,
        'virality_alerts' => true,
        'weekly_viral_digest' => false,
    ];

    private const DEFAULT_APPEARANCE_PREFERENCES = [
        'disable_animations' => false,
        'compact_rows' => false,
        'autoplay_previews' => true,
    ];

    public function __construct(
        private readonly BillingService $billingService,
        private readonly BillingEntitlementService $billing,
        private readonly UserActivityService $activity,
    ) {}

    public function account(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Account', [
            'section' => 'account',
            'subscription' => $this->subscriptionPayload($user),
            'preferences' => $this->preferencesPayload($user?->preferences ?? []),
            'accountDeletion' => $this->accountDeletionPayload($user),
        ]);
    }

    public function updateAccount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'preferences' => ['nullable', 'array'],
            'preferences.notifications' => ['nullable', 'array'],
            'preferences.notifications.search_finished' => ['required_with:preferences.notifications', 'boolean'],
            'preferences.notifications.virality_alerts' => ['required_with:preferences.notifications', 'boolean'],
            'preferences.notifications.weekly_viral_digest' => ['required_with:preferences.notifications', 'boolean'],
        ]);

        $request->user()->update([
            'name' => $validated['name'],
            'preferences' => $this->mergedPreferencesPayload($request->user()->preferences ?? [], $validated['preferences'] ?? []),
        ]);

        return back()->with('status', 'Account details updated.');
    }

    public function requestAccountDeletion(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($this->hasActiveSubscription($user)) {
            return back()->with('status', 'Cancel your active subscription before requesting account deletion.');
        }

        $scheduledFor = CarbonImmutable::now()->addDays(self::ACCOUNT_DELETION_GRACE_DAYS);

        $user->forceFill([
            'deletion_requested_at' => CarbonImmutable::now(),
            'deletion_scheduled_for' => $scheduledFor,
        ])->save();
        $this->activity->record($user, 'engagement', 'account_deletion_requested', 'Requested account deletion.');

        return back()->with('status', sprintf(
            'Account deletion scheduled. You can still use your account and cancel this request before %s.',
            $scheduledFor->toFormattedDateString()
        ));
    }

    public function cancelAccountDeletion(Request $request): RedirectResponse
    {
        $request->user()->forceFill([
            'deletion_requested_at' => null,
            'deletion_scheduled_for' => null,
        ])->save();

        return back()->with('status', 'Account deletion canceled. Your account will stay active.');
    }

    public function appearance(Request $request): Response
    {
        return Inertia::render('Settings/Appearance', [
            'section' => 'appearance',
            'preferences' => $this->preferencesPayload($request->user()?->preferences ?? []),
        ]);
    }

    public function updateAppearance(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferences' => ['required', 'array'],
            'preferences.appearance' => ['required', 'array'],
            'preferences.appearance.disable_animations' => ['required', 'boolean'],
            'preferences.appearance.compact_rows' => ['required', 'boolean'],
            'preferences.appearance.autoplay_previews' => ['required', 'boolean'],
        ]);

        $request->user()->update([
            'preferences' => $this->mergedPreferencesPayload($request->user()->preferences ?? [], $validated['preferences']),
        ]);

        return back()->with('status', 'Appearance preferences updated.');
    }

    public function subscription(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Subscription', [
            'section' => 'subscription',
            'subscription' => $this->subscriptionPayload($user),
            'stripePublishableKey' => config('services.stripe.key'),
        ]);
    }

    public function createPaymentMethodSetup(Request $request): JsonResponse
    {
        return response()->json(
            $this->billingService->createPaymentMethodSetup($request->user())
        );
    }

    public function updatePaymentMethod(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_method_id' => ['required', 'string', 'max:255'],
        ]);

        $this->billingService->setDefaultPaymentMethod(
            $request->user(),
            $validated['payment_method_id'],
        );

        return response()->json([
            'paymentMethod' => $this->safePaymentMethodSummary($request->user()),
            'message' => 'Payment method updated.',
        ]);
    }

    public function cancelSubscription(Request $request): JsonResponse
    {
        $this->billingService->cancelSubscription($request->user());

        return response()->json([
            'message' => 'Subscription cancellation scheduled. Access stays active until the end of the current billing period.',
            'analytics' => [
                AnalyticsEvent::make('subscription_cancellation_requested', [
                    'plan_slug' => $this->billingService->currentPlanSlug($request->user()),
                ]),
            ],
        ]);
    }

    public function reactivateSubscription(Request $request): JsonResponse
    {
        $this->billingService->reactivateSubscription($request->user());

        return response()->json([
            'message' => 'Subscription reactivated. Auto-renew is back on.',
            'analytics' => [
                AnalyticsEvent::make('subscription_reactivation_requested', [
                    'plan_slug' => $this->billingService->currentPlanSlug($request->user()),
                ]),
            ],
        ]);
    }

    public function receipt(Request $request, string $invoice): Response
    {
        $details = $this->billingService->receiptDetails($request->user(), $invoice);

        abort_if($details === null, 404);

        return Inertia::render('Settings/Receipt', [
            'receipt' => $details,
        ]);
    }

    public function plans(Request $request): Response
    {
        return Inertia::render('Plans', [
            'subscription' => $request->user() ? $this->subscriptionPayload($request->user()) : null,
        ]);
    }

    private function subscriptionPayload($user): array
    {
        $subscription = Subscription::query()
            ->with('plan')
            ->where('user_id', $user->id)
            ->whereNull('deleted_at')
            ->orderByRaw("case when status = 'pending' then 1 else 0 end")
            ->orderByDesc('current_period_ends_at')
            ->first();

        $limits = $this->billing->limitsForUser($user);
        $fallbackPlan = PricingPlan::query()->where('slug', $this->billing->currentPlanSlug($user))->first();
        $plan = $subscription?->plan ?? $fallbackPlan;
        $billingCycle = (string) data_get($subscription?->metadata, 'settings.billing_cycle', 'monthly');
        $price = $billingCycle === 'annual'
            ? ($plan?->annual_amount ?? null)
            : ($plan?->amount ?? ($plan?->price_cents !== null ? ((int) $plan->price_cents / 100) : null));
        $status = $subscription?->status ?? 'free';
        $videoAnalysisUsed = max(0, (int) data_get($subscription?->metadata, 'subscription.video_analysis.used', $limits['videoAnalysisUsed'] ?? 0));
        $cancelAtPeriodEnd = (bool) data_get($subscription?->metadata, 'subscription.cancel_at_period_end', false);
        $cancelAt = data_get($subscription?->metadata, 'subscription.cancel_at');
        $trialStartedAt = $subscription?->trial_started_at;
        $trialEndsAt = in_array($status, ['trialing', 'trial'], true) && $trialStartedAt !== null
            ? CarbonImmutable::instance($trialStartedAt)->addDays(self::TRIAL_DAYS)
            : null;
        $renewsAt = $status === 'pending'
            ? null
            : ($trialEndsAt ?? $subscription?->current_period_ends_at);
        $planSlug = $plan?->slug ?? $this->billing->currentPlanSlug($user);
        $paymentMethod = $this->safePaymentMethodSummary($user);
        $invoices = $this->safeInvoiceHistory($user);

        return [
            'status' => $status,
            'planName' => $this->formatPlanDisplayName($planSlug, $plan?->name),
            'planSlug' => $planSlug,
            'price' => $price !== null ? number_format((float) $price, 2, '.', '') : null,
            'interval' => $billingCycle === 'annual' ? 'year' : ($plan?->interval ?? 'month'),
            'billingCycle' => $billingCycle === 'annual' ? 'annual' : 'monthly',
            'startedAt' => $subscription?->status === 'pending' ? null : $subscription?->current_period_starts_at?->toIso8601String(),
            'trialStartedAt' => $trialStartedAt?->toIso8601String(),
            'trialEndsAt' => $trialEndsAt?->toIso8601String(),
            'renewsAt' => $renewsAt?->toIso8601String(),
            'cancelAtPeriodEnd' => $cancelAtPeriodEnd,
            'cancelsAt' => is_string($cancelAt) ? $cancelAt : ($cancelAtPeriodEnd ? $renewsAt?->toIso8601String() : null),
            'paymentMethod' => $paymentMethod,
            'invoices' => $invoices,
            'limits' => [
                'searchCreditsLimit' => (int) ($limits['searchCreditsLimit'] ?? 0),
                'searchCreditsUsed' => $this->billing->searchCreditsUsed($user),
                'videoBookmarkLimit' => (int) ($limits['videoBookmarkLimit'] ?? 0),
                'videoBookmarkUsed' => $this->billing->videoBookmarkCount($user),
                'searchBookmarkLimit' => (int) ($limits['searchBookmarkLimit'] ?? 0),
                'searchBookmarkUsed' => $this->billing->searchBookmarkCount($user),
                'videoAnalysisLimit' => (int) ($limits['videoAnalysisLimit'] ?? 0),
                'videoAnalysisUsed' => $videoAnalysisUsed,
                'bookmarkLimit' => (int) ($limits['searchBookmarkLimit'] ?? 0),
                'bookmarksUsed' => $this->billing->searchBookmarkCount($user),
            ],
        ];
    }

    private function safeInvoiceHistory($user): array
    {
        try {
            return $this->billingService->invoiceHistory($user);
        } catch (\Throwable) {
            return [];
        }
    }

    private function safePaymentMethodSummary($user): ?array
    {
        try {
            return $this->billingService->paymentMethodSummary($user);
        } catch (\Throwable) {
            return null;
        }
    }

    private function formatPlanDisplayName(string $planSlug, ?string $fallbackName = null): string
    {
        return match ($planSlug) {
            'growth' => 'Growth',
            'growth-annual' => 'Growth (Annual)',
            'scale' => 'Scale',
            'scale-annual' => 'Scale (Annual)',
            default => $fallbackName ?? ucfirst($planSlug),
        };
    }

    private function accountDeletionPayload($user): array
    {
        return [
            'requestedAt' => $user?->deletion_requested_at?->toIso8601String(),
            'scheduledFor' => $user?->deletion_scheduled_for?->toIso8601String(),
            'hasActiveSubscription' => $this->hasActiveSubscription($user),
            'graceDays' => self::ACCOUNT_DELETION_GRACE_DAYS,
        ];
    }

    private function preferencesPayload(array $preferences): array
    {
        return [
            'notifications' => array_merge(
                self::DEFAULT_NOTIFICATION_PREFERENCES,
                (array) data_get($preferences, 'notifications', [])
            ),
            'appearance' => array_merge(
                self::DEFAULT_APPEARANCE_PREFERENCES,
                (array) data_get($preferences, 'appearance', [])
            ),
        ];
    }

    private function mergedPreferencesPayload(array $currentPreferences, array $incomingPreferences): array
    {
        return array_replace_recursive(
            $this->preferencesPayload($currentPreferences),
            $incomingPreferences
        );
    }

    private function hasActiveSubscription($user): bool
    {
        if ($user === null) {
            return false;
        }

        return Subscription::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'paid', 'trialing', 'trial'])
            ->exists();
    }
}
