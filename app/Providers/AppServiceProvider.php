<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Billing\BillingService;
use App\Services\CustomKeywordSearch\GuestSearchQuota;
use App\Services\CustomKeywordSearch\SavedSearchManager;
use App\Services\Stripe\StripeClient;
use App\Support\GuestIdentity;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\Stripe\StripeClient::class, fn (): \Stripe\StripeClient => new \Stripe\StripeClient(
            (string) (config('services.stripe.secret') ?: 'sk_test_placeholder')
        ));

        $this->app->singleton(StripeClient::class, fn ($app): StripeClient => new StripeClient(
            $app->make(\Stripe\StripeClient::class)
        ));

        $this->app->singleton(BillingService::class);
    }

    public function boot(): void
    {
        /*
         * A visitor can run their free search before signing in. When they do
         * sign in, hand those searches over so the results they just waited for
         * are still there.
         *
         * Handing them over is not free. Claiming used only to reassign the
         * row, so signing out and searching again produced an endless supply of
         * scrapes that each got laundered into the account at no cost. Every
         * claimed search is now charged, the account is permanently marked as
         * having spent its free search, and the browser's guest allowance is
         * tied off so the same visitor cannot start over.
         */
        Event::listen(function (Login $event): void {
            $request = request();

            if (! $request->hasSession()) {
                return;
            }

            $user = $event->user;

            if ($user instanceof User) {
                app(GuestSearchQuota::class)->claimFor($request, $user);
            }

            $token = GuestIdentity::token($request);

            if ($token === null) {
                return;
            }

            $claimed = app(SavedSearchManager::class)
                ->claimGuestSearches($user->getAuthIdentifier(), $token);

            if ($user instanceof User) {
                app(BillingService::class)->absorbClaimedGuestSearches($user, $claimed);
            }

            GuestIdentity::forget($request);
        });
    }
}
