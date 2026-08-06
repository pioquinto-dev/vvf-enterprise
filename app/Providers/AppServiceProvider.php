<?php

namespace App\Providers;

use App\Services\Billing\BillingService;
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
         */
        Event::listen(function (Login $event): void {
            $request = request();

            if (! $request->hasSession()) {
                return;
            }

            $token = GuestIdentity::token($request);

            if ($token === null) {
                return;
            }

            app(SavedSearchManager::class)->claimGuestSearches($event->user->getAuthIdentifier(), $token);

            GuestIdentity::forget($request);
        });
    }
}
