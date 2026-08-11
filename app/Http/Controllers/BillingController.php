<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Services\Billing\BillingService;
use App\Support\TrialCheckoutIntent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function __construct(private readonly BillingService $billing) {}

    public function checkout(Request $request, string $slug): RedirectResponse
    {
        $user = $request->user();
        $withTrial = $request->boolean('trial');

        if ($user === null) {
            return redirect()->route('trial', [
                'redirect' => 'trial_checkout',
                'plan' => $slug,
                'trial' => $withTrial ? '1' : null,
            ]);
        }

        $plan = PricingPlan::query()
            ->where('slug', $slug)
            ->whereIn('slug', ['basic', 'premium'])
            ->firstOrFail();

        return redirect()->away($this->billing->checkout($user, $plan, $withTrial));
    }

    public function success(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect('/trial');
        }

        TrialCheckoutIntent::pull($request);

        $sessionId = (string) $request->query('session_id', '');

        if ($sessionId !== '') {
            $this->billing->finalizeCheckout($user, $sessionId);
        }

        return redirect('/bookmark')->with('status', 'Subscription activated.');
    }
}
