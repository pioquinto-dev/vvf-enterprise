<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Models\Subscription;
use App\Services\Billing\BillingEntitlementService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(
        private readonly BillingEntitlementService $billing,
    ) {}

    public function account(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Account', [
            'section' => 'account',
            'subscription' => $this->subscriptionPayload($user),
        ]);
    }

    public function updateAccount(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->update([
            'name' => $validated['name'],
        ]);

        return back()->with('status', 'Account details updated.');
    }

    public function appearance(Request $request): Response
    {
        return Inertia::render('Settings/Appearance', [
            'section' => 'appearance',
        ]);
    }

    public function subscription(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Settings/Subscription', [
            'section' => 'subscription',
            'subscription' => $this->subscriptionPayload($user),
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
            ->orderByRaw("case when status = 'pending' then 1 else 0 end")
            ->first();

        $limits = $this->billing->limitsForUser($user);
        $fallbackPlan = PricingPlan::query()->where('slug', $user->current_plan_slug)->first();
        $plan = $subscription?->status === 'pending' ? $fallbackPlan : ($subscription?->plan ?? $fallbackPlan);
        $price = $plan?->amount ?? ($plan?->price_cents !== null ? ((int) $plan->price_cents / 100) : null);
        $status = $subscription?->status === 'pending' ? ($user->current_plan_slug === 'free' ? 'free' : 'active') : ($subscription?->status ?? 'free');

        return [
            'status' => $status,
            'planName' => $plan?->name ?? ucfirst((string) ($user->current_plan_slug ?? 'free')),
            'planSlug' => $plan?->slug ?? ($user->current_plan_slug ?? 'free'),
            'price' => $price !== null ? number_format((float) $price, 2, '.', '') : null,
            'interval' => $plan?->interval ?? 'month',
            'startedAt' => $subscription?->status === 'pending' ? null : $subscription?->current_period_starts_at?->toIso8601String(),
            'renewsAt' => ($subscription?->status === 'pending' ? null : $subscription?->current_period_ends_at ?? $user->plan_renews_at)?->toIso8601String(),
            'limits' => [
                'searchCreditsLimit' => (int) ($limits['searchCreditsLimit'] ?? 0),
                'searchCreditsUsed' => $this->billing->searchCreditsUsed($user),
                'bookmarkLimit' => (int) ($limits['bookmarkLimit'] ?? 0),
                'bookmarksUsed' => $this->billing->bookmarksUsed($user),
            ],
        ];
    }
}
