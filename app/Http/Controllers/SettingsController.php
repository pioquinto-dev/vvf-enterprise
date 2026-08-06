<?php

namespace App\Http\Controllers;

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
        return Inertia::render('Settings/Account', [
            'section' => 'account',
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
        $subscription = Subscription::query()
            ->with('plan')
            ->where('user_id', $user->id)
            ->first();

        $limits = $this->billing->limitsForUser($user);
        $plan = $subscription?->plan;
        $price = $plan?->amount ?? ($plan?->price_cents !== null ? ((int) $plan->price_cents / 100) : null);

        return Inertia::render('Settings/Subscription', [
            'section' => 'subscription',
            'subscription' => [
                'status' => $subscription?->status ?? 'free',
                'planName' => $plan?->name ?? ucfirst((string) ($user->current_plan_slug ?? 'free')),
                'planSlug' => $plan?->slug ?? ($user->current_plan_slug ?? 'free'),
                'price' => $price !== null ? number_format((float) $price, 2, '.', '') : null,
                'interval' => $plan?->interval ?? 'month',
                'startedAt' => $subscription?->current_period_starts_at?->toIso8601String(),
                'renewsAt' => ($subscription?->current_period_ends_at ?? $user->plan_renews_at)?->toIso8601String(),
                'limits' => [
                    'searchCreditsLimit' => (int) ($limits['searchCreditsLimit'] ?? 0),
                    'searchCreditsUsed' => (int) ($limits['searchCreditsUsed'] ?? 0),
                    'bookmarkLimit' => (int) ($limits['bookmarkLimit'] ?? 0),
                    'bookmarksUsed' => (int) ($limits['bookmarksUsed'] ?? 0),
                ],
            ],
        ]);
    }
}
