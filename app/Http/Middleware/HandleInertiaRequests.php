<?php

namespace App\Http\Middleware;

use App\Models\Subscription;
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
        $limits = $request->user() ? $billing->limitsForUser($request->user()) : null;
        $subscription = $request->user()
            ? Subscription::query()->where('user_id', $request->user()->id)->first()
            : null;
        $trialEligible = $request->user() === null
            ? true
            : ! ($billing->hasPaidPlan($request->user()) && $subscription?->trial_started_at === null);

        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'env' => config('app.env'),
            ],
            'auth' => [
                'signedIn' => $request->user() !== null,
                'user' => $request->user()
                    ? [
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                    ]
                    : null,
            ],
            'admin' => [
                'signedIn' => $request->session()->get(config('admin.session_key')) === true,
                'user' => $request->session()->get('admin.user'),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            'services' => [
                'apifyConfigured' => filled(config('services.apify.token')),
                'googleConfigured' => filled(config('services.google.client_id')),
                'stripeConfigured' => filled(config('services.stripe.key')),
            ],
            'billing' => [
                'currentPlan' => $request->user()?->current_plan_slug ?? 'free',
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
            ],
            'pricingPlans' => fn () => $pricing->activePlans(),
        ];
    }
}
