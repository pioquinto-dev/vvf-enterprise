<?php

namespace App\Http\Controllers;

use App\Models\PricingPlan;
use App\Services\Billing\BillingService;
use App\Support\TrialCheckoutIntent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BillingController extends Controller
{
    private const CHECKOUT_PLAN_SLUGS = ['growth', 'growth-annual', 'scale', 'scale-annual'];

    private const PORTAL_ACTIONS = ['manage', 'payment_method', 'cancel'];

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
            if ($withTrial && isset($exception->errors()['trial'])) {
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

        return redirect('/library')->with('status', 'Subscription activated.');
    }

    public function upgrade(Request $request, string $slug): JsonResponse
    {
        $user = $request->user();
        $plan = PricingPlan::query()
            ->where('slug', $slug)
            ->whereIn('slug', ['scale', 'scale-annual'])
            ->firstOrFail();

        try {
            $subscription = $this->billing->upgradeGrowthToScale($user, $plan);

            return response()->json([
                'ok' => true,
                'plan' => $subscription->plan?->slug,
            ]);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => collect($exception->errors())->flatten()->first()
                    ?? 'The Scale upgrade could not be completed.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'The Scale upgrade could not be completed. Your subscription was not changed.',
            ], 422);
        }
    }

    public function portal(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user === null) {
            return redirect('/login');
        }

        $action = (string) $request->query('action', 'manage');
        $action = in_array($action, self::PORTAL_ACTIONS, true) ? $action : 'manage';

        try {
            return redirect()->away($this->billing->createBillingPortalSession(
                $user,
                route('settings.subscription'),
                $action,
            ));
        } catch (ValidationException $exception) {
            return redirect()->route('settings.subscription')
                ->with('status', collect($exception->errors())->flatten()->first() ?? 'Billing settings are unavailable right now.');
        } catch (\Throwable) {
            return redirect()->route('settings.subscription')
                ->with('status', 'Billing settings are unavailable right now.');
        }
    }
}
