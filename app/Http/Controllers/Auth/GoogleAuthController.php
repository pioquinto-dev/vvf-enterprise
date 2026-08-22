<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\FreeSearchFunnelController;
use App\Models\User;
use App\Services\Admin\UserActivityService;
use App\Services\Auth\PostAuthenticationRedirector;
use App\Services\Brevo\BrevoLifecycleEmailService;
use App\Services\Billing\BillingService;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function __construct(
        private readonly PostAuthenticationRedirector $redirector,
        private readonly BrevoLifecycleEmailService $emails,
        private readonly UserActivityService $activity,
        private readonly SavedSearchManager $searches,
        private readonly BillingService $billing,
    ) {}

    public function redirect(Request $request): RedirectResponse
    {
        return Socialite::driver('google')
            ->redirectUrl($this->redirectUrl($request))
            ->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')
                ->redirectUrl($this->redirectUrl($request))
                ->user();
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
                'current_plan_slug' => 'free',
                'monthly_credits_remaining' => 1,
                'plan_renews_at' => CarbonImmutable::now()->addMonth(),
            ]);

            event(new Registered($user));
            $this->emails->sendNewRegistration($user);
        } elseif (! $user->email_verified_at) {
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        Auth::login($user);
        if ($created) {
            $this->activity->record($user, 'sign_up', 'account_created', 'Created account.');
        }
        $this->activity->record($user, 'engagement', 'logged_in', 'Logged in.');
        $request->session()->regenerate();

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

                return redirect()->route('search.running', ['id' => $search->id]);
            } catch (\Illuminate\Validation\ValidationException $exception) {
                return redirect()->route('search.keywords')->with(
                    'free_search_error',
                    collect($exception->errors())->flatten()->first() ?? 'We could not start this search.',
                );
            }
        }

        return redirect()->intended($this->redirector->destination($request));
    }

    private function redirectUrl(Request $request): string
    {
        return $request->getSchemeAndHttpHost().'/auth/google/callback';
    }
}
