<?php

use App\Http\Controllers\ComingSoonInterestController;
use App\Http\Controllers\ContactInquiryController;
use App\Http\Controllers\FreeSearchFunnelController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    if ($request->user()) {
        return Inertia::render('Dashboard');
    }

    return Inertia::render(config('features.show_coming_soon') ? 'ComingSoon' : 'Landing');
})->name('landing');

Route::post('/coming-soon-interest', ComingSoonInterestController::class)->name('coming-soon-interest.store');
Route::get('/contact', [ContactInquiryController::class, 'create'])->name('contact.create');
Route::post('/contact', [ContactInquiryController::class, 'store'])->name('contact.store');

Route::prefix('search')->group(function (): void {
    Route::get('/', function (Request $request) {
        return Inertia::render('Search/Free', [
            'phrase' => trim((string) $request->query('q', '')),
            'type' => match ((string) $request->query('type')) {
                'product' => 'product',
                'competitor' => 'brand',
                default => 'brand',
            },
            'error' => $request->session()->pull('free_search_error'),
        ]);
    })->name('search.keywords');

    Route::post('/pending', [FreeSearchFunnelController::class, 'store'])->name('search.pending');

    Route::get('/running', function (Request $request) {
        return Inertia::render('Search/Running', [
            'searchId' => (int) $request->query('id'),
        ]);
    })->name('search.running');
});

Route::get('/trial', function () {
    return Inertia::render('Trial');
})->middleware('remember.trial.checkout')->name('trial');

Route::prefix('auth/google')->group(function (): void {
    Route::get('/', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');
});

Route::middleware('guest')->group(function (): void {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);

    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});

Route::get('/verify-email/{id}/{hash}', EmailVerificationController::class)
    ->middleware('signed')
    ->name('verification.verify');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::prefix('billing')->group(function (): void {
    Route::get('/checkout/{slug}', [BillingController::class, 'checkout'])->name('billing.checkout');
    Route::get('/success', [BillingController::class, 'success'])->name('billing.success');
});

Route::post('/stripe/webhook', StripeWebhookController::class)->name('stripe.webhook');
