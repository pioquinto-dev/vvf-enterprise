<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\FreeSearchFunnelController;
use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Admin\AdminImpersonationService;
use App\Services\Admin\UserActivityService;
use App\Services\Auth\PostAuthenticationRedirector;
use App\Services\Billing\BillingService;
use App\Services\CustomKeywordSearch\SavedSearchManager;
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
    private const CHECKOUT_PLAN_SLUGS = ['growth', 'growth-annual', 'scale', 'scale-annual'];

    public function __construct(
        private readonly PostAuthenticationRedirector $redirector,
        private readonly BillingService $billing,
        private readonly SavedSearchManager $searches,
        private readonly AdminImpersonationService $impersonation,
        private readonly UserActivityService $activity,
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

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();
        if ($user = $request->user()) {
            $this->activity->record($user, 'engagement', 'logged_in', 'Logged in.');
        }

        if ($checkoutRedirect = $this->checkoutRedirect($request)) {
            return $checkoutRedirect;
        }

        if ($pendingRedirect = $this->pendingFreeSearchRedirect($request)) {
            return $pendingRedirect;
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

        $plan = (string) $request->query('plan', 'growth');
        $withTrial = $request->boolean('trial');
        $cycle = (string) $request->query('cycle', 'monthly');

        if (in_array($plan, self::CHECKOUT_PLAN_SLUGS, true)) {
            TrialCheckoutIntent::store($request, $plan, $withTrial, $cycle);
        }
    }

    private function checkoutRedirect(Request $request): RedirectResponse|SymfonyResponse|null
    {
        $intent = TrialCheckoutIntent::pull($request);

        if (! is_array($intent) || ! in_array($intent['plan_slug'] ?? null, self::CHECKOUT_PLAN_SLUGS, true)) {
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

        $withTrial = (bool) ($intent['with_trial'] ?? false);
        $cycle = ($intent['cycle'] ?? 'monthly') === 'annual' ? 'annual' : 'monthly';

        try {
            return Inertia::location($this->billing->checkout($user, $plan, $withTrial, $cycle));
        } catch (ValidationException $exception) {
            if ($withTrial && isset($exception->errors()['trial'])) {
                return redirect()->route('plans')->with('trial_access_prompt', [
                    'reason' => 'already_used',
                    'plan_slug' => $plan->slug,
                ]);
            }

            return redirect()->route('plans')->with('status', collect($exception->errors())->flatten()->first() ?? 'Checkout could not be started.');
        }
    }

    private function pendingFreeSearchRedirect(Request $request): ?RedirectResponse
    {
        $pending = FreeSearchFunnelController::pull($request);

        if (! is_array($pending)) {
            return null;
        }

        $user = $request->user();

        if (! $user instanceof User) {
            FreeSearchFunnelController::put($request, $pending);

            return null;
        }

        if ($this->billing->hasPaidPlan($user)) {
            return redirect()->route('dashboard')->with('search_access_prompt', [
                'reason' => 'public_free_search_unavailable',
                'message' => 'This public free search is only available before starting a subscription. Use your plan\'s search credits from the dashboard.',
            ]);
        }

        try {
            $this->billing->ensureCanCreateSearch($user);
            $search = $this->searches->create(
                user: $user,
                guestToken: null,
                type: $pending['type'],
                phrase: $pending['phrase'],
                keywords: $pending['keywords'],
                name: $pending['phrase'],
                frequency: $pending['frequency'],
                sources: $pending['sources'] ?? null,
            );

            $tracked = [[
                'id' => $search->id,
                'name' => $search->name,
                'url' => $search->url(),
                'status' => $search->status,
            ]];

            return redirect()->route('dashboard')
                ->with('tracked_searches', $tracked)
                ->with('processing_searches', $tracked);
        } catch (ValidationException $exception) {
            return redirect()->route('dashboard')->with('search_access_prompt', [
                'reason' => 'search_credit_exhausted',
                'phrase' => $pending['phrase'] ?? '',
                'message' => collect($exception->errors())->flatten()->first() ?? 'We could not start this search.',
            ]);
        }
    }
}
