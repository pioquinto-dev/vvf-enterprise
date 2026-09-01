<?php

namespace App\Http\Middleware;

use App\Services\Billing\BillingEntitlementService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePaidFeaturesAccess
{
    public function __construct(private readonly BillingEntitlementService $billing) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ((bool) config('features.bypass_paid_features', false)) {
            return $next($request);
        }

        $user = $request->user();

        if (! $this->billing->hasPaidPlan($user)) {
            $message = 'Upgrade to Growth or Scale to access this feature.';

            // XHR/API callers can't follow a redirect — hand them a clean 403.
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json(['message' => $message], 403);
            }

            return redirect('/trial')->with('status', $message);
        }

        return $next($request);
    }
}
