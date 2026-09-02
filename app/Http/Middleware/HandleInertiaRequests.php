<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
use App\Services\Analytics\AnalyticsEventManager;
use App\Services\Admin\AdminImpersonationService;
use App\Services\Billing\BillingEntitlementService;
use App\Services\Billing\PricingPlanViewService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $billing = app(BillingEntitlementService::class);
        $pricing = app(PricingPlanViewService::class);
        $analytics = app(AnalyticsEventManager::class);
        $impersonation = app(AdminImpersonationService::class)->active($request);
        $limits = $request->user() ? $billing->limitsForUser($request->user()) : null;
        $subscription = $request->user()
            ? Subscription::query()
                ->where('user_id', $request->user()->id)
                ->orderByRaw("case when status = 'active' then 0 when status = 'trialing' then 1 when status = 'pending' then 2 else 3 end")
                ->orderByDesc('current_period_ends_at')
                ->first()
            : null;
        $isTrialing = in_array((string) ($subscription?->status ?? ''), ['trialing', 'trial'], true);
        $hasUsedTrial = $billing->hasUsedTrial($request->user());
        $trialEligible = $request->user() === null
            ? true
            : ! $billing->hasPaidPlan($request->user()) && ! $hasUsedTrial;

        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'env' => config('app.env'),
            ],
            'features' => [
                'videoAnalysisRefresh' => (bool) config('viral_video_analysis.allow_refresh'),
            ],
            'auth' => [
                'signedIn' => $request->user() !== null,
                'user' => $request->user()
                    ? [
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                    ]
                    : null,
                'impersonation' => $impersonation,
            ],
            'admin' => [
                'signedIn' => $request->session()->get(config('admin.session_key')) === true,
                'user' => $request->session()->get('admin.user'),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
                'trackedSearches' => fn () => $request->session()->get('tracked_searches', []),
                'processingSearches' => fn () => $request->session()->get('processing_searches', []),
                'freeSearchNew' => fn () => (bool) $request->session()->get('free_search_new', false),
                'searchAccessPrompt' => fn () => $request->session()->get('search_access_prompt'),
                'trialAccessPrompt' => fn () => $request->session()->get('trial_access_prompt'),
                'couponAccessPrompt' => fn () => $request->session()->get('coupon_access_prompt'),
            ],
            'services' => [
                'apifyConfigured' => filled(config('services.apify.token')),
                'googleConfigured' => filled(config('services.google.client_id')),
                'stripeConfigured' => filled(config('services.stripe.key')),
            ],
            'analytics' => [
                'enabled' => (bool) config('services.analytics.enabled'),
                'gtmContainerId' => (string) config('services.analytics.gtm_container_id', ''),
                'ga4MeasurementId' => (string) config('services.analytics.ga4_measurement_id', ''),
                'debugMode' => (bool) config('services.analytics.debug_mode'),
                'events' => fn () => $analytics->pullForRequest($request),
            ],
            'billing' => [
                'currentPlan' => $billing->currentPlanSlug($request->user()),
                'searchCreditsRemaining' => $billing->searchCreditsRemaining($request->user()),
                'searchCreditsUsed' => $billing->searchCreditsUsed($request->user()),
                'searchCreditsLimit' => $limits['searchCreditsLimit'] ?? 0,
                'bookmarkCount' => $request->user() ? $billing->bookmarkCount($request->user()) : 0,
                'bookmarkLimit' => $billing->bookmarkLimit($request->user()),
                'bookmarksUsed' => $billing->bookmarksUsed($request->user()),
                'videoBookmarkCount' => $request->user() ? $billing->videoBookmarkCount($request->user()) : 0,
                'videoBookmarkLimit' => $limits['videoBookmarkLimit'] ?? 0,
                'searchBookmarkCount' => $request->user() ? $billing->searchBookmarkCount($request->user()) : 0,
                'searchBookmarkLimit' => $limits['searchBookmarkLimit'] ?? 0,
                'videoAnalysisUsed' => $limits['videoAnalysisUsed'] ?? 0,
                'videoAnalysisLimit' => $limits['videoAnalysisLimit'] ?? 0,
                'hasPaidPlan' => $billing->hasPaidPlan($request->user()),
                'trialEligible' => $trialEligible,
                'isTrialing' => $isTrialing,
                'hasUsedTrial' => $hasUsedTrial,
            ],
            'pricingPlans' => fn () => $pricing->activePlans(),
        ];
    }
}
