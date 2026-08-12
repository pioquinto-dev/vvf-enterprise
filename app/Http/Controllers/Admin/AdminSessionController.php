<?php

namespace App\Http\Controllers\Admin;

use App\Services\Admin\AdminAuthenticationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminSessionController extends Controller
{
    public function __construct(
        private readonly AdminAuthenticationService $auth,
    ) {}

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Login', [
            'adminRootEmail' => (string) config('admin.root_email'),
        ]);
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
        $this->auth->logout($request);

        return redirect()->route('admin.login');
    }
}
