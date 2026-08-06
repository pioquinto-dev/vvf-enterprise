<?php

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SavedSearchController;

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/saved-searches', [SavedSearchController::class, 'index'])->name('saved-searches.index');
    Route::get('/settings/account', [SettingsController::class, 'account'])->name('settings.account');
    Route::patch('/settings/account', [SettingsController::class, 'updateAccount'])->name('settings.account.update');
    Route::get('/settings/appearance', [SettingsController::class, 'appearance'])->name('settings.appearance');
    Route::get('/settings/subscription', [SettingsController::class, 'subscription'])->name('settings.subscription');
});

Route::get('/saved-searches/{id}', [SavedSearchController::class, 'show'])
    ->whereNumber('id')
    ->name('saved-searches.show');
