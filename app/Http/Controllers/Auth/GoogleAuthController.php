<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Services\Auth\PostAuthenticationRedirector;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Carbon\CarbonImmutable;
use Throwable;

class GoogleAuthController extends Controller
{
    public function __construct(private readonly PostAuthenticationRedirector $redirector) {}

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

        $user = User::query()->firstWhere('email', $email);

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
        } elseif (! $user->email_verified_at) {
            $user->forceFill([
                'email_verified_at' => now(),
            ])->save();
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->intended($this->redirector->destination($request));
    }

    private function redirectUrl(Request $request): string
    {
        return $request->getSchemeAndHttpHost().'/auth/google/callback';
    }
}
