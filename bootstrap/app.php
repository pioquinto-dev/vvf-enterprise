<?php

use App\Http\Middleware\CaptureUtmParameters;
use App\Http\Middleware\EnsurePaidFeaturesAccess;
use App\Http\Middleware\ExpireAdminImpersonation;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\RedirectIfAdminAuthenticated;
use App\Http\Middleware\RememberTrialCheckoutIntent;
use App\Http\Middleware\RequireAdminAuthentication;
use App\Models\PricingPlan;
use App\Services\Billing\BillingService;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            ExpireAdminImpersonation::class,
            HandleInertiaRequests::class,
            CaptureUtmParameters::class,
        ]);

        // ExpireAdminImpersonation must run before the 'auth' middleware:
        // Laravel's global middleware priority list reorders Authenticate
        // ahead of any middleware not listed here, regardless of
        // registration order in the 'web' group above. Without this, an
        // expired impersonation session is only caught starting on the
        // customer's *next* request, not the one that expires it.
        $middleware->priority([
            \Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests::class,
            \Illuminate\Cookie\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            ExpireAdminImpersonation::class,
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests::class,
            \Illuminate\Routing\Middleware\ThrottleRequests::class,
            \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
            \Illuminate\Contracts\Session\Middleware\AuthenticatesSessions::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
            \Illuminate\Auth\Middleware\Authorize::class,
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

        $middleware->redirectGuestsTo(fn () => route('landing'));

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

        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $exception, Request $request) {
            if ($response->getStatusCode() !== 404 || $request->is('api/*')) {
                return $response;
            }

            return \Inertia\Inertia::render('Errors/NotFound')
                ->toResponse($request)
                ->setStatusCode(404);
        });
    })->create();
