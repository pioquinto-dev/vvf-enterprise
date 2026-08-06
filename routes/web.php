<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/**
 * Pulls the search subject off the query string. Every step of the search flow
 * is its own page, so the subject travels in the URL rather than in session.
 */
$searchInput = static function (Request $request): array {
    $keywords = array_values(array_filter(
        array_map('trim', explode('|', (string) $request->query('kw', ''))),
        static fn (string $keyword): bool => $keyword !== '',
    ));

    return [
        'type' => in_array($request->query('type'), ['brand', 'competitor', 'product'], true)
            ? $request->query('type')
            : 'brand',
        'subject' => trim((string) $request->query('q', '')),
        'keywords' => $keywords,
    ];
};

Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

Route::prefix('search')->group(function () use ($searchInput): void {
    Route::get('/', function (Request $request) use ($searchInput) {
        return Inertia::render('Search/Keywords', $searchInput($request));
    })->name('search.keywords');

    Route::get('/running', function (Request $request) use ($searchInput) {
        return Inertia::render('Search/Running', $searchInput($request));
    })->name('search.running');

    Route::get('/results', function (Request $request) use ($searchInput) {
        return Inertia::render('Search/Results', $searchInput($request));
    })->name('search.results');
});

Route::get('/trial', function (Request $request) use ($searchInput) {
    return Inertia::render('Trial', [
        ...$searchInput($request),
        'fromResults' => $request->filled('q'),
    ]);
})->name('trial');

Route::get('/starter', function () {
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
