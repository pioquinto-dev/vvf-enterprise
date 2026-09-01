<?php

namespace App\Http\Middleware;

use App\Support\TrialCheckoutIntent;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RememberTrialCheckoutIntent
{
    private const CHECKOUT_PLAN_SLUGS = ['growth', 'growth-annual', 'scale', 'scale-annual'];

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null && $request->query('redirect') === 'trial_checkout') {
            $plan = (string) $request->query('plan', 'growth');
            $withTrial = $request->boolean('trial');
            $cycle = (string) $request->query('cycle', 'monthly');

            if (in_array($plan, self::CHECKOUT_PLAN_SLUGS, true)) {
                TrialCheckoutIntent::store($request, $plan, $withTrial, $cycle);
            }
        }

        return $next($request);
    }
}
