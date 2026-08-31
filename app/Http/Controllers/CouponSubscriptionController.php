<?php

namespace App\Http\Controllers;

use App\Models\ManagedCouponProgram;
use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Billing\BillingService;
use App\Services\Billing\CouponAccessService;
use App\Support\CouponCheckoutIntent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CouponSubscriptionController extends Controller
{
    public function __construct(
        private readonly CouponAccessService $couponAccess,
        private readonly BillingService $billing,
        private readonly ?UserActivityService $activity = null,
    ) {}

    /**
     * Entry point for the managed subscription links
     * (/internal-subscription, /vip-subscription). The program is resolved
     * from the path, never from user input.
     */
    public function enter(Request $request): RedirectResponse
    {
        $program = $this->couponAccess->resolveByLinkPath($request->path());

        if ($program === null) {
            abort(404);
        }

        $user = $request->user();

        if ($user === null) {
            CouponCheckoutIntent::store($request, $program->code);

            return redirect()->route('login', ['redirect' => 'coupon_checkout']);
        }

        return $this->startCheckout($request, $program, $user);
    }

    private function startCheckout(Request $request, ManagedCouponProgram $program, User $user): RedirectResponse
    {
        $eligibility = $this->couponAccess->evaluate($program, $user);

        if (! $eligibility->allowed) {
            ($this->activity ?? app(UserActivityService::class))->record(
                $user,
                'coupon_usage',
                'coupon_blocked_'.strtolower(str_replace(' ', '_', (string) $eligibility->errorKey)),
                "Blocked from {$program->code}: {$eligibility->errorKey}.",
                ['coupon_program' => $program->code, 'reason' => $eligibility->errorKey],
            );

            return redirect()->route('dashboard')->with('coupon_access_prompt', $eligibility->toPromptArray($program->code));
        }

        $plan = PricingPlan::query()->where('slug', $program->plan_slug)->first();

        if ($plan === null) {
            return redirect()->route('dashboard')->with('coupon_access_prompt', [
                'errorKey' => 'Unavailable',
                'title' => "This offer isn't available",
                'detail' => 'The plan for this offer is not configured yet. Please contact support.',
                'program' => $program->code,
            ]);
        }

        try {
            $url = $this->billing->checkout($user, $plan, $program->trial_only, $program->billing_cycle, $program);
        } catch (ValidationException $exception) {
            return redirect()->route('dashboard')->with('coupon_access_prompt', [
                'errorKey' => 'Not eligible',
                'title' => 'Not eligible',
                'detail' => collect($exception->errors())->flatten()->first() ?? 'This offer could not be started.',
                'program' => $program->code,
            ]);
        }

        return redirect()->away($url);
    }
}
