<?php

namespace App\Services\Auth;

use App\Support\TrialCheckoutIntent;
use Illuminate\Http\Request;

class PostAuthenticationRedirector
{
    public function destination(Request $request, string $fallback = '/dashboard'): string
    {
        $intent = TrialCheckoutIntent::pull($request);

        if (is_array($intent) && in_array($intent['plan_slug'] ?? null, ['basic', 'premium'], true)) {
            return route('billing.checkout', ['slug' => $intent['plan_slug']]);
        }

        return $fallback;
    }
}
