<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Preserves the coupon program a guest was trying to redeem across the
 * login/registration round-trip. The program is fixed here so the user
 * cannot swap it after authenticating.
 */
class CouponCheckoutIntent
{
    public const SESSION_KEY = 'billing.pending_coupon_program';

    public static function store(Request $request, string $programCode): void
    {
        $request->session()->put(self::SESSION_KEY, [
            'program_code' => strtoupper(trim($programCode)),
            'stored_at' => now()->toIso8601String(),
        ]);
    }

    public static function pull(Request $request): ?string
    {
        $intent = $request->session()->pull(self::SESSION_KEY);

        return is_array($intent) ? ($intent['program_code'] ?? null) : null;
    }

    public static function peek(Request $request): ?string
    {
        $intent = $request->session()->get(self::SESSION_KEY);

        return is_array($intent) ? ($intent['program_code'] ?? null) : null;
    }
}
