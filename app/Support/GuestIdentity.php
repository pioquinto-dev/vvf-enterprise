<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * A visitor gets one free search before signing in, so searches need an owner
 * before there is a user. The session carries a token that stands in until the
 * account exists, at which point the searches are claimed.
 */
class GuestIdentity
{
    public const SESSION_KEY = 'cks_guest_token';

    public static function token(Request $request, bool $create = false): ?string
    {
        $token = $request->session()->get(self::SESSION_KEY);

        if (is_string($token) && $token !== '') {
            return $token;
        }

        if (! $create) {
            return null;
        }

        $token = (string) Str::ulid();
        $request->session()->put(self::SESSION_KEY, $token);

        return $token;
    }

    public static function forget(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }
}
