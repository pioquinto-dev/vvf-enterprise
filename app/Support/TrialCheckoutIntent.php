<?php

namespace App\Support;

use Illuminate\Http\Request;

class TrialCheckoutIntent
{
    public const SESSION_KEY = 'billing.pending_checkout';

    public static function store(Request $request, string $planSlug): void
    {
        $request->session()->put(self::SESSION_KEY, [
            'plan_slug' => $planSlug,
            'stored_at' => now()->toIso8601String(),
        ]);
    }

    public static function pull(Request $request): ?array
    {
        $intent = $request->session()->pull(self::SESSION_KEY);

        return is_array($intent) ? $intent : null;
    }

    public static function peek(Request $request): ?array
    {
        $intent = $request->session()->get(self::SESSION_KEY);

        return is_array($intent) ? $intent : null;
    }
}
