<?php

namespace App\Http\Controllers\Auth;

use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Admin\AdminImpersonationService;
use App\Services\Auth\PostAuthenticationRedirector;
use App\Services\Billing\BillingService;
use App\Support\TrialCheckoutIntent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        private readonly PostAuthenticationRedirector $redirector,
        private readonly BillingService $billing,
        private readonly AdminImpersonationService $impersonation,
    ) {}

    public function create(Request $request): Response
    {
        $this->rememberCheckoutIntent($request);

        return Inertia::render('Auth/Login');
    }

    public function store(Request $request): RedirectResponse|SymfonyResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $trashedUser = User::withTrashed()->firstWhere('email', strtolower(trim($credentials['email'])));

        if ($trashedUser?->trashed()) {
            throw ValidationException::withMessages([
                'email' => 'This account has already been deleted.',
            ]);
        }

        $remember = $request->boolean('remember');

        if (! Auth::attempt($credentials, $remember)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();

        if ($checkout = $this->checkoutRedirect($request)) {
            return Inertia::location($checkout);
        }

        return redirect()->intended($this->redirector->destination($request));
    }

    public function destroy(Request $request): RedirectResponse
    {
        if ($request->session()->has(AdminImpersonationService::SESSION_KEY)) {
            $this->impersonation->stop($request, 'customer_sign_out');

            return redirect()->route('admin.dashboard');
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function rememberCheckoutIntent(Request $request): void
    {
        if ($request->user() !== null || $request->query('redirect') !== 'trial_checkout') {
            return;
        }

        $plan = (string) $request->query('plan', 'basic');
        $withTrial = $request->boolean('trial');

        if (in_array($plan, ['basic', 'premium'], true)) {
            TrialCheckoutIntent::store($request, $plan, $withTrial);
        }
    }

    private function checkoutRedirect(Request $request): ?string
    {
        $intent = TrialCheckoutIntent::pull($request);

        if (! is_array($intent) || ! in_array($intent['plan_slug'] ?? null, ['basic', 'premium'], true)) {
            return null;
        }

        $user = $request->user();

        if ($user === null) {
            return null;
        }

        $plan = PricingPlan::query()->where('slug', $intent['plan_slug'])->first();

        if ($plan === null) {
            return null;
        }

        return $this->billing->checkout($user, $plan, (bool) ($intent['with_trial'] ?? false));
    }
}
