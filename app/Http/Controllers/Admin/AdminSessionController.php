<?php

namespace App\Http\Controllers\Admin;

use App\Services\Admin\AdminAuthenticationService;
use App\Services\Admin\AdminImpersonationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminSessionController extends Controller
{
    public function __construct(
        private readonly AdminAuthenticationService $auth,
        private readonly AdminImpersonationService $impersonation,
    ) {}

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Login');
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! $this->auth->attempt($request, $credentials['email'], $credentials['password'])) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our admin records.',
            ]);
        }

        return redirect()->intended(route('admin.dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        if ($request->session()->has(AdminImpersonationService::SESSION_KEY)) {
            $this->impersonation->stop($request, 'admin_sign_out');
        }

        $this->auth->logout($request);

        return redirect()->route('admin.login');
    }
}
