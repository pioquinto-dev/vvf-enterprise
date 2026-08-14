<?php

use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SavedSearchController;

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [SavedSearchController::class, 'dashboard'])->name('dashboard');

    Route::redirect('/saved-searches', '/bookmark', 301);
    Route::get('/bookmark', [SavedSearchController::class, 'index'])->name('bookmark.index');
    Route::get('/brands', [SavedSearchController::class, 'brands'])->name('brands.index');
    Route::get('/products', [SavedSearchController::class, 'products'])->name('products.index');
    Route::get('/settings/account', [SettingsController::class, 'account'])->name('settings.account');
    Route::patch('/settings/account', [SettingsController::class, 'updateAccount'])->name('settings.account.update');
    Route::post('/settings/account/delete-request', [SettingsController::class, 'requestAccountDeletion'])->name('settings.account.delete-request');
    Route::delete('/settings/account/delete-request', [SettingsController::class, 'cancelAccountDeletion'])->name('settings.account.delete-request.cancel');
    Route::get('/settings/appearance', [SettingsController::class, 'appearance'])->name('settings.appearance');
    Route::patch('/settings/appearance', [SettingsController::class, 'updateAppearance'])->name('settings.appearance.update');
    Route::get('/settings/subscription', [SettingsController::class, 'subscription'])->name('settings.subscription');
    Route::get('/plans', [SettingsController::class, 'plans'])->name('plans');
});

Route::get('/results/{search}', [SavedSearchController::class, 'show'])->name('results.show');

// Legacy numeric detail links redirect to the canonical /results/{public_id}.
Route::get('/bookmark/{id}', [SavedSearchController::class, 'showLegacyRedirect'])
    ->whereNumber('id')
    ->name('bookmark.show');
