<?php

namespace App\Services\Admin;

use Illuminate\Http\Request;

class AdminAuthenticationService
{
    /**
     * Plain env-backed root credentials keep admin auth isolated from users.
     */
    public function attempt(Request $request, string $email, string $password): bool
    {
        $configuredEmail = (string) config('admin.root_email');
        $configuredPassword = (string) config('admin.root_password');

        if ($configuredEmail === '' || $configuredPassword === '') {
            return false;
        }

        $emailMatches = hash_equals(
            mb_strtolower($configuredEmail),
            mb_strtolower(trim($email)),
        );

        if (! $emailMatches || ! hash_equals($configuredPassword, $password)) {
            return false;
        }

        $request->session()->regenerate();
        $request->session()->put(config('admin.session_key'), true);
        $request->session()->put('admin.user', [
            'name' => (string) config('admin.root_name'),
            'email' => $configuredEmail,
        ]);

        return true;
    }

    public function logout(Request $request): void
    {
        $request->session()->forget([
            config('admin.session_key'),
            'admin.user',
        ]);
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
