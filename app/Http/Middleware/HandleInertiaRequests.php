<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'app' => [
                'name' => config('app.name'),
                'env' => config('app.env'),
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            'services' => [
                'apifyConfigured' => filled(config('services.apify.token')),
                'googleConfigured' => filled(config('services.google.client_id')),
                'stripeConfigured' => filled(config('services.stripe.key')),
            ],
        ];
    }
}
