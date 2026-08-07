<?php

namespace App\Http\Middleware;

use App\Support\TrialCheckoutIntent;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RememberTrialCheckoutIntent
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null && $request->query('redirect') === 'trial_checkout') {
            $plan = (string) $request->query('plan', 'basic');
            $withTrial = $request->boolean('trial');

            if (in_array($plan, ['basic', 'premium'], true)) {
                TrialCheckoutIntent::store($request, $plan, $withTrial);
            }
        }

        return $next($request);
    }
}
