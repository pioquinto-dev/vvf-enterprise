<?php

namespace App\Services\Auth;

use App\Support\TrialCheckoutIntent;
use Illuminate\Http\Request;

class PostAuthenticationRedirector
{
    private const CHECKOUT_PLAN_SLUGS = ['basic', 'basic-annual', 'premium', 'premium-annual'];

    public function destination(Request $request, string $fallback = '/dashboard'): string
    {
        $intent = TrialCheckoutIntent::pull($request);

        if (is_array($intent) && in_array($intent['plan_slug'] ?? null, self::CHECKOUT_PLAN_SLUGS, true)) {
            return route('billing.checkout', [
                'slug' => $intent['plan_slug'],
                'trial' => ! empty($intent['with_trial']) ? '1' : null,
                'cycle' => ($intent['cycle'] ?? 'monthly') === 'annual' ? 'annual' : 'monthly',
            ]);
        }

        return $fallback;
    }
}
