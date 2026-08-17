<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Models\PricingPlan;
use App\Services\Billing\BillingService;
use App\Http\Middleware\CaptureUtmParameters;
use App\Http\Middleware\RedirectIfAdminAuthenticated;
use App\Http\Middleware\RequireAdminAuthentication;
use App\Http\Middleware\EnsurePaidFeaturesAccess;
use Illuminate\Http\Request;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RememberTrialCheckoutIntent;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
            CaptureUtmParameters::class,
        ]);

        RedirectIfAuthenticated::redirectUsing(function (Request $request): string {
            if ($request->query('redirect') === 'trial_checkout') {
                $plan = (string) $request->query('plan', 'basic');

                if (in_array($plan, ['basic', 'premium'], true)) {
                    $user = $request->user();
                    $pricingPlan = PricingPlan::query()->where('slug', $plan)->first();

                    if ($user !== null && $pricingPlan !== null) {
                        return app(BillingService::class)->checkout($user, $pricingPlan, $request->boolean('trial'));
                    }

                    return route('billing.checkout', [
                        'slug' => $plan,
                        'trial' => $request->boolean('trial') ? '1' : null,
                    ]);
                }
            }

            return '/dashboard';
        });

        $middleware->validateCsrfTokens(except: [
            'stripe/webhook',
        ]);

        $middleware->alias([
            'paid' => EnsurePaidFeaturesAccess::class,
            'remember.trial.checkout' => RememberTrialCheckoutIntent::class,
            'admin.auth' => RequireAdminAuthentication::class,
            'admin.guest' => RedirectIfAdminAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
