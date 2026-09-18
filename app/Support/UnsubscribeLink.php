<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Str;

/**
 * One-click unsubscribe links.
 *
 * The token is stored on the user rather than signed per-send so the link
 * survives password changes and never expires — a recipient who finds a
 * six-month-old email must still be able to opt out, and must never be asked
 * to log in to do it.
 */
class UnsubscribeLink
{
    public static function for(User $user): string
    {
        return url('/email/unsubscribe/'.self::token($user));
    }

    /**
     * Mint the token on first use so existing users do not need a backfill.
     */
    public static function token(User $user): string
    {
        if (blank($user->unsubscribe_token)) {
            $user->forceFill(['unsubscribe_token' => Str::random(48)])->save();
        }

        return (string) $user->unsubscribe_token;
    }
}
