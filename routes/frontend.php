<?php

use App\Models\CustomKeywordSearchRun;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\SavedSearchController;
use Illuminate\Http\Request;

Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', function (Request $request) {
        $runId = $request->integer('run');

        if ($runId > 0) {
            $ownedRun = CustomKeywordSearchRun::query()
                ->whereKey($runId)
                ->whereHas('search', fn ($query) => $query->where('user_id', $request->user()->id))
                ->exists();

            if (! $ownedRun) {
                return redirect('/dashboard');
            }
        }

        return Inertia::render('Dashboard');
    })->name('dashboard');

Route::redirect('/saved-searches', '/bookmark', 301);
Route::get('/bookmark', [SavedSearchController::class, 'index'])->name('bookmark.index');
    Route::get('/settings/account', [SettingsController::class, 'account'])->name('settings.account');
    Route::patch('/settings/account', [SettingsController::class, 'updateAccount'])->name('settings.account.update');
    Route::get('/settings/appearance', [SettingsController::class, 'appearance'])->name('settings.appearance');
    Route::get('/settings/subscription', [SettingsController::class, 'subscription'])->name('settings.subscription');
    Route::get('/plans', [SettingsController::class, 'plans'])->name('plans');
});

Route::get('/bookmark/{id}', [SavedSearchController::class, 'show'])
    ->whereNumber('id')
    ->name('bookmark.show');
