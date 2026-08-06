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
            return redirect('/trial')->with('status', 'Upgrade to Basic or Premium to access this feature.');
        }

        return $next($request);
    }
}
