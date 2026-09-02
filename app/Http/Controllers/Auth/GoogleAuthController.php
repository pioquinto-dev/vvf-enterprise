<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\FreeSearchFunnelController;
use App\Jobs\SendRegistrationEmails;
use App\Models\PricingPlan;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Analytics\AnalyticsEvent;
use App\Services\Analytics\AnalyticsEventManager;
use App\Services\Auth\PostAuthenticationRedirector;
use App\Services\Billing\BillingService;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use App\Support\TrialCheckoutIntent;
use GuzzleHttp\Client;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Throwable;

class GoogleAuthController extends Controller
{
    private const CHECKOUT_PLAN_SLUGS = ['growth', 'growth-annual', 'scale', 'scale-annual'];

    public function __construct(
        private readonly PostAuthenticationRedirector $redirector,
        private readonly UserActivityService $activity,
        private readonly SavedSearchManager $searches,
        private readonly BillingService $billing,
        private readonly AnalyticsEventManager $analytics,
    ) {}

    public function redirect(Request $request): RedirectResponse
    {
        return $this->googleDriver($request)
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = $this->googleDriver($request)->user();
        } catch (Throwable) {
            return redirect()->route('login')->withErrors([
                'email' => 'Google sign-in could not be completed. Please try again.',
            ]);
        }

        $email = strtolower(trim((string) $googleUser->getEmail()));

        if ($email === '') {
            return redirect()->route('login')->withErrors([
                'email' => 'Your Google account did not provide an email address.',
            ]);
        }

        $user = User::withTrashed()->firstWhere('email', $email);
        if ($user?->trashed()) {
            return redirect()->route('login')->withErrors([
                'email' => 'This account has already been deleted.',
            ]);
        }

        $created = ! $user;
        if (! $user) {
            $user = User::create([
                'name' => trim((string) ($googleUser->getName() ?: $googleUser->getNickname() ?: Str::before($email, '@'))),
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make(Str::random(40)),
            ]);

            event(new Registered($user));
            SendRegistrationEmails::dispatch($user->id);
            $this->billing->ensureSubscriptionRecord($user);
        } elseif (! $user->email_verified_at) {
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        Auth::login($user);
        if ($created) {
            $this->activity->record($user, 'sign_up', 'account_created', 'Created account.');
            $this->analytics->queueForUser($user, AnalyticsEvent::make('sign_up', [
                'method' => 'google',
                'user_id' => $user->id,
            ]));
        }
        $this->activity->record($user, 'engagement', 'logged_in', 'Logged in.');
        $request->session()->regenerate();
        if ($checkoutRedirect = $this->checkoutRedirect($request, $user)) {
            return $checkoutRedirect;
        }

        if ($pending = FreeSearchFunnelController::pull($request)) {
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

                // Free-search visitors now land straight on the search's own
                // analytics page (still building), instead of the dashboard.
                // The flash flag tells that page to greet them with the
                // "report is still building" popup on first arrival.
                return redirect()->to($search->url())
                    ->with('free_search_new', true);
            } catch (ValidationException $exception) {
                return redirect()->route('dashboard')->with('search_access_prompt', [
                    'reason' => 'search_credit_exhausted',
                    'phrase' => $pending['phrase'] ?? '',
                    'message' => collect($exception->errors())->flatten()->first() ?? 'We could not start this search.',
                ]);
            }
        }

        return redirect()->intended($this->redirector->destination($request));
    }

    private function redirectUrl(Request $request): string
    {
        $configuredUrl = trim((string) config('services.google.redirect', ''));

        if (filter_var($configuredUrl, FILTER_VALIDATE_URL) !== false) {
            return $configuredUrl;
        }

        // Local development can omit GOOGLE_REDIRECT_URI. Production must use
        // the configured value because Google requires an exact URI match.
        return $request->getSchemeAndHttpHost().'/auth/google/callback';
    }

    private function googleDriver(Request $request): GoogleProvider
    {
        /** @var GoogleProvider $provider */
        $provider = Socialite::driver('google');

        // Google is required for sign-in, but an unbounded token exchange can
        // otherwise hold the PHP-FPM request until Nginx returns a 504.
        $provider->setHttpClient(new Client([
            'connect_timeout' => (float) config('services.google.connect_timeout', 3),
            'timeout' => (float) config('services.google.timeout', 12),
        ]));

        return $provider->redirectUrl($this->redirectUrl($request));
    }

    private function checkoutRedirect(Request $request, User $user): ?RedirectResponse
    {
        $intent = TrialCheckoutIntent::pull($request);

        if (! is_array($intent) || ! in_array($intent['plan_slug'] ?? null, self::CHECKOUT_PLAN_SLUGS, true)) {
            return null;
        }

        $plan = PricingPlan::query()->where('slug', $intent['plan_slug'])->first();

        if ($plan === null) {
            return null;
        }

        $withTrial = (bool) ($intent['with_trial'] ?? false);
        $cycle = ($intent['cycle'] ?? 'monthly') === 'annual' ? 'annual' : 'monthly';

        try {
            return redirect()->away($this->billing->checkout($user, $plan, $withTrial, $cycle));
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
}
