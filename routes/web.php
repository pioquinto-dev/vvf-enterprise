<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home', [
        'stack' => [
            'frontend' => 'React',
            'backend' => 'Laravel',
            'database' => 'PostgreSQL',
            'cache' => 'Redis',
        ],
        'integrations' => [
            'Apify',
            'Google Login',
            'Stripe',
        ],
    ]);
})->name('home');

Route::prefix('auth/google')->group(function (): void {
    Route::get('/', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
});
