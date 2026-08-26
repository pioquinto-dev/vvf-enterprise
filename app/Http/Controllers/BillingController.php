<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Services\Billing\BillingService;
use App\Support\TrialCheckoutIntent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BillingController extends Controller
{
    private const CHECKOUT_PLAN_SLUGS = ['basic', 'basic-annual', 'premium', 'premium-annual'];

    public function __construct(private readonly BillingService $billing) {}

    public function checkout(Request $request, string $slug): RedirectResponse
    {
        $user = $request->user();
        $withTrial = $request->boolean('trial');
        $cycle = $request->query('cycle') === 'annual' ? 'annual' : 'monthly';

        if ($user === null) {
            return redirect()->route('trial', [
                'redirect' => 'trial_checkout',
                'plan' => $slug,
                'trial' => $withTrial ? '1' : null,
                'cycle' => $cycle,
            ]);
        }

        $plan = PricingPlan::query()
            ->where('slug', $slug)
            ->whereIn('slug', self::CHECKOUT_PLAN_SLUGS)
            ->firstOrFail();

        try {
            return redirect()->away($this->billing->checkout($user, $plan, $withTrial, $cycle));
        } catch (ValidationException $exception) {
            if ($withTrial && $exception->errors()['trial'] ?? false) {
                return redirect()->route('plans')->with('trial_access_prompt', [
                    'reason' => 'already_used',
                    'plan_slug' => $slug,
                ]);
            }

            return redirect()->route('plans')->with('status', collect($exception->errors())->flatten()->first() ?? 'Checkout could not be started.');
        }
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

        return redirect('/bookmarks')->with('status', 'Subscription activated.');
    }
}
