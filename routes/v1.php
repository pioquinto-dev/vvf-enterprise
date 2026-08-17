<?php

use App\Http\Controllers\SavedSearchController;
use App\Http\Controllers\VideoAnalysisController;
use App\Http\Controllers\VideoBookmarkController;
use Illuminate\Support\Facades\Route;

Route::prefix('saved-searches')->group(function (): void {
    Route::post('/expand', [SavedSearchController::class, 'expand'])->name('api.v1.saved-searches.expand');
    Route::get('/notifications', [SavedSearchController::class, 'notifications'])->name('api.v1.saved-searches.notifications');
    Route::post('/', [SavedSearchController::class, 'store'])->name('api.v1.saved-searches.store');
    Route::get('/{id}/json', [SavedSearchController::class, 'showJson'])->whereNumber('id')->name('api.v1.saved-searches.json');
    Route::patch('/{id}/bookmark', [SavedSearchController::class, 'bookmark'])->whereNumber('id')->name('api.v1.saved-searches.bookmark');
    Route::patch('/{id}/pause', [SavedSearchController::class, 'pause'])->whereNumber('id')->middleware('paid')->name('api.v1.saved-searches.pause');
    Route::patch('/{id}/resume', [SavedSearchController::class, 'resume'])->whereNumber('id')->middleware('paid')->name('api.v1.saved-searches.resume');
    Route::patch('/{id}/frequency', [SavedSearchController::class, 'updateFrequency'])->whereNumber('id')->middleware('paid')->name('api.v1.saved-searches.frequency');
    Route::post('/{id}/refresh', [SavedSearchController::class, 'refresh'])->whereNumber('id')->middleware('paid')->name('api.v1.saved-searches.refresh');
    Route::delete('/{id}', [SavedSearchController::class, 'destroy'])->whereNumber('id')->middleware('paid')->name('api.v1.saved-searches.destroy');
});

Route::prefix('videos')->group(function (): void {
    Route::post('/{id}/bookmark', [VideoBookmarkController::class, 'store'])->name('api.v1.videos.bookmark');
    Route::delete('/{id}/bookmark', [VideoBookmarkController::class, 'destroy'])->name('api.v1.videos.unbookmark');
    Route::post('/{id}/analysis', [VideoAnalysisController::class, 'store'])->name('api.v1.videos.analysis.store');
    Route::get('/{id}/analysis', [VideoAnalysisController::class, 'show'])->name('api.v1.videos.analysis.show');
});
