<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\FreeSearchFunnelController;
use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Analytics\AnalyticsEvent;
use App\Services\Analytics\AnalyticsEventManager;
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
    private const CHECKOUT_PLAN_SLUGS = ['basic', 'basic-annual', 'premium', 'premium-annual'];

    public function __construct(
        private readonly PostAuthenticationRedirector $redirector,
        private readonly BillingService $billing,
        private readonly BrevoLifecycleEmailService $emails,
        private readonly SavedSearchManager $searches,
        private readonly UtmAttributionService $utmAttributionService,
        private readonly UserActivityService $activity,
        private readonly AnalyticsEventManager $analytics,
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
        ]);

        event(new Registered($user));
        $this->utmAttributionService->createSignupAttribution($user, $request);
        $this->emails->sendNewRegistration($user);
        $this->emails->sendVerifyEmail($user);
        $this->billing->ensureSubscriptionRecord($user);
        Auth::login($user);
        $this->activity->record($user, 'sign_up', 'account_created', 'Created account.');
        $this->activity->record($user, 'engagement', 'logged_in', 'Logged in.');
        $this->analytics->queueForUser($user, AnalyticsEvent::make('sign_up', [
            'method' => 'email',
            'user_id' => $user->id,
        ]));

        $request->session()->regenerate();

        if ($checkoutRedirect = $this->checkoutRedirect($request)) {
            return $checkoutRedirect;
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
        } catch (\Illuminate\Validation\ValidationException $exception) {
            if ($withTrial && $exception->errors()['trial'] ?? false) {
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
