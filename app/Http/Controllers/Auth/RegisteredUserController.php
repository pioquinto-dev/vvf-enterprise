<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\FreeSearchFunnelController;
use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Auth\PostAuthenticationRedirector;
use App\Services\Billing\BillingService;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use App\Services\Utm\UtmAttributionService;
use App\Support\TrialCheckoutIntent;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class RegisteredUserController extends Controller
{
    public function __construct(
        private readonly PostAuthenticationRedirector $redirector,
        private readonly BillingService $billing,
        private readonly BrevoLifecycleEmailService $emails,
        private readonly SavedSearchManager $searches,
        private readonly UtmAttributionService $utmAttributionService,
        private readonly UserActivityService $activity,
    ) {}

    public function create(Request $request): Response
    {
        $this->rememberCheckoutIntent($request);

        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse|SymfonyResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'current_plan_slug' => 'free',
            'monthly_credits_remaining' => 1,
            'plan_renews_at' => CarbonImmutable::now()->addMonth(),
        ]);

        event(new Registered($user));
        $this->utmAttributionService->createSignupAttribution($user, $request);
        $this->emails->sendNewRegistration($user);
        $this->emails->sendVerifyEmail($user);
        $this->billing->ensureSubscriptionRecord($user);
        Auth::login($user);
        $this->activity->record($user, 'sign_up', 'account_created', 'Created account.');
        $this->activity->record($user, 'engagement', 'logged_in', 'Logged in.');

        $request->session()->regenerate();

        if ($checkout = $this->checkoutRedirect($request)) {
            return Inertia::location($checkout);
        }

        if ($pendingRedirect = $this->pendingFreeSearchRedirect($request)) {
            return $pendingRedirect;
        }

        return redirect($this->redirector->destination($request));
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
        } catch (\Illuminate\Validation\ValidationException $exception) {
            return redirect()->route('dashboard')->with('search_access_prompt', [
                'reason' => 'search_credit_exhausted',
                'phrase' => $pending['phrase'] ?? '',
                'message' => collect($exception->errors())->flatten()->first() ?? 'We could not start this search.',
            ]);
        }
    }
}
