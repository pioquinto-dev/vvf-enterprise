<?php

namespace App\Services\Admin;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminImpersonationService
{
    public const SESSION_KEY = 'admin.impersonation';

    public const DURATION_MINUTES = 60;

    public function start(Request $request, User $user): void
    {
        $admin = $request->session()->get('admin.user', []);

        // Rotate the customer session ID without dropping the separate admin session.
        $request->session()->regenerate();
        Auth::guard('web')->login($user);

        $expiresAt = now()->addMinutes(self::DURATION_MINUTES);

        $request->session()->put(self::SESSION_KEY, [
            'user_id' => $user->id,
            'admin_email' => is_array($admin) ? ($admin['email'] ?? null) : null,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);

        Log::info('Admin impersonation started.', [
            'admin_email' => is_array($admin) ? ($admin['email'] ?? null) : null,
            'user_id' => $user->id,
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    public function stop(Request $request, string $reason = 'returned'): void
    {
        $impersonation = $request->session()->get(self::SESSION_KEY, []);

        Auth::guard('web')->logout();
        $request->session()->forget(self::SESSION_KEY);
        $request->session()->regenerate();

        Log::info('Admin impersonation ended.', [
            'admin_email' => is_array($impersonation) ? ($impersonation['admin_email'] ?? null) : null,
            'user_id' => is_array($impersonation) ? ($impersonation['user_id'] ?? null) : null,
            'reason' => $reason,
        ]);
    }

    /**
     * @return array{user_id: mixed, admin_email: mixed, expires_at: string}|null
     */
    public function active(Request $request): ?array
    {
        $impersonation = $request->session()->get(self::SESSION_KEY);

        if (! is_array($impersonation) || blank($impersonation['user_id'] ?? null) || blank($impersonation['expires_at'] ?? null)) {
            return null;
        }

        try {
            $expiresAt = CarbonImmutable::parse($impersonation['expires_at']);
        } catch (\Throwable) {
            return null;
        }

        if ($expiresAt->isPast() || (string) $request->user()?->getAuthIdentifier() !== (string) $impersonation['user_id']) {
            return null;
        }

        return [
            'user_id' => $impersonation['user_id'],
            'admin_email' => $impersonation['admin_email'] ?? null,
            'expires_at' => $expiresAt->toIso8601String(),
        ];
    }

    public function expireInvalidSession(Request $request): void
    {
        if (! $request->session()->has(self::SESSION_KEY) || $this->active($request) !== null) {
            return;
        }

        $this->stop($request, 'expired_or_invalid');
    }
}
