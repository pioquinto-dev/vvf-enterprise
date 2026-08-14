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
    Route::get('/settings/appearance', [SettingsController::class, 'appearance'])->name('settings.appearance');
    Route::get('/settings/subscription', [SettingsController::class, 'subscription'])->name('settings.subscription');
    Route::get('/plans', [SettingsController::class, 'plans'])->name('plans');
});

Route::get('/bookmark/{id}', [SavedSearchController::class, 'show'])
    ->whereNumber('id')
    ->name('bookmark.show');
