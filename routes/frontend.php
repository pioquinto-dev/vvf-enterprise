<?php

use App\Http\Controllers\SettingsController;
use App\Http\Controllers\VideoAnalysisPageController;
use App\Http\Controllers\BillingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SavedSearchController;

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [SavedSearchController::class, 'dashboard'])->name('dashboard');

    Route::redirect('/saved-searches', '/library', 301);
    Route::redirect('/bookmark', '/library', 301);
    Route::redirect('/bookmarks', '/library', 301);
    Route::get('/library', [SavedSearchController::class, 'index'])->name('library.index');
    Route::get('/brands', [SavedSearchController::class, 'brands'])->name('brands.index');
    Route::get('/products', [SavedSearchController::class, 'products'])->name('products.index');
    Route::get('/settings/account', [SettingsController::class, 'account'])->name('settings.account');
    Route::patch('/settings/account', [SettingsController::class, 'updateAccount'])->name('settings.account.update');
    Route::post('/settings/account/delete-request', [SettingsController::class, 'requestAccountDeletion'])->name('settings.account.delete-request');
    Route::delete('/settings/account/delete-request', [SettingsController::class, 'cancelAccountDeletion'])->name('settings.account.delete-request.cancel');
    Route::get('/settings/appearance', [SettingsController::class, 'appearance'])->name('settings.appearance');
    Route::patch('/settings/appearance', [SettingsController::class, 'updateAppearance'])->name('settings.appearance.update');
    Route::get('/settings/subscription', [SettingsController::class, 'subscription'])->name('settings.subscription');
    Route::post('/settings/subscription/payment-method/setup', [SettingsController::class, 'createPaymentMethodSetup'])->name('settings.subscription.payment-method.setup');
    Route::patch('/settings/subscription/payment-method', [SettingsController::class, 'updatePaymentMethod'])->name('settings.subscription.payment-method.update');
    Route::post('/settings/subscription/cancel', [SettingsController::class, 'cancelSubscription'])->name('settings.subscription.cancel');
    Route::post('/settings/subscription/reactivate', [SettingsController::class, 'reactivateSubscription'])->name('settings.subscription.reactivate');
    Route::get('/settings/subscription/receipt/{invoice}', [SettingsController::class, 'receipt'])->name('settings.subscription.receipt');
    Route::get('/settings/subscription/portal', [BillingController::class, 'portal'])->name('settings.subscription.portal');
    Route::get('/plans', [SettingsController::class, 'plans'])->name('plans');
    Route::get('/videos/{id}/analysis', [VideoAnalysisPageController::class, 'show'])->name('videos.analysis.show');
});

Route::get('/results/{search}', [SavedSearchController::class, 'show'])->name('results.show');

// Legacy numeric detail links redirect to the canonical /results/{public_id}.
Route::get('/library/{id}', [SavedSearchController::class, 'showLegacyRedirect'])
    ->whereNumber('id')
    ->name('library.show');

Route::get('/bookmarks/{id}', [SavedSearchController::class, 'showLegacyRedirect'])
    ->whereNumber('id')
    ->name('bookmark.show');

Route::get('/bookmark/{id}', [SavedSearchController::class, 'showLegacyRedirect'])
    ->whereNumber('id')
    ->name('bookmark.show');
