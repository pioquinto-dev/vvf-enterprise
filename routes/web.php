<?php

use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\SavedSearchController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing');
})->name('landing');

/*
|--------------------------------------------------------------------------
| Custom keyword search
|--------------------------------------------------------------------------
|
| Each step of the create flow is a real page. The subject travels in the
| query string until the search exists; after that everything keys off the
| saved search id.
|
*/

Route::prefix('search')->group(function (): void {
    Route::get('/', function (Request $request) {
        return Inertia::render('Search/Keywords', [
            'phrase' => trim((string) $request->query('q', '')),
            'type' => in_array($request->query('type'), ['brand', 'competitor', 'product'], true)
                ? $request->query('type')
                : 'brand',
        ]);
    })->name('search.keywords');

    Route::get('/running', function (Request $request) {
        return Inertia::render('Search/Running', [
            'searchId' => (int) $request->query('id'),
        ]);
    })->name('search.running');
});

Route::prefix('saved-searches')->group(function (): void {
    Route::post('/expand', [SavedSearchController::class, 'expand'])->name('saved-searches.expand');
    Route::get('/notifications', [SavedSearchController::class, 'notifications'])->name('saved-searches.notifications');

    Route::get('/', [SavedSearchController::class, 'index'])->name('saved-searches.index');
    Route::post('/', [SavedSearchController::class, 'store'])->name('saved-searches.store');

    Route::get('/{id}', [SavedSearchController::class, 'show'])->whereNumber('id')->name('saved-searches.show');
    Route::get('/{id}/json', [SavedSearchController::class, 'showJson'])->whereNumber('id')->name('saved-searches.json');

    Route::patch('/{id}/pause', [SavedSearchController::class, 'pause'])->whereNumber('id')->name('saved-searches.pause');
    Route::patch('/{id}/resume', [SavedSearchController::class, 'resume'])->whereNumber('id')->name('saved-searches.resume');
    Route::patch('/{id}/frequency', [SavedSearchController::class, 'updateFrequency'])->whereNumber('id')->name('saved-searches.frequency');
    Route::post('/{id}/refresh', [SavedSearchController::class, 'refresh'])->whereNumber('id')->name('saved-searches.refresh');
    Route::delete('/{id}', [SavedSearchController::class, 'destroy'])->whereNumber('id')->name('saved-searches.destroy');
});

Route::get('/trial', function () {
    return Inertia::render('Trial');
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
