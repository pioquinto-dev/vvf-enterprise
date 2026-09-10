<?php

use App\Http\Controllers\Admin\BlogController;
use Illuminate\Support\Facades\Route;

Route::prefix('blogs')->as('blogs.')->group(function (): void {
    Route::get('/', [BlogController::class, 'index'])->name('index');
    Route::get('/create', [BlogController::class, 'create'])->name('create');
    Route::post('/', [BlogController::class, 'store'])->name('store');
    Route::post('/bulk', [BlogController::class, 'bulk'])->name('bulk');
    Route::post('/images', [BlogController::class, 'uploadImage'])->name('images.store');
    Route::get('/featured', [BlogController::class, 'featured'])->name('featured');
    Route::put('/featured', [BlogController::class, 'reorder'])->name('reorder');
    Route::get('/{kind}', [BlogController::class, 'taxonomy'])->where('kind', 'categories|tags')->name('taxonomy');
    Route::post('/{kind}', [BlogController::class, 'saveTaxonomy'])->where('kind', 'categories|tags')->name('taxonomy.store');
    Route::put('/{kind}/{id}', [BlogController::class, 'saveTaxonomy'])->where('kind', 'categories|tags')->whereNumber('id')->name('taxonomy.update');
    Route::delete('/{kind}/{id}', [BlogController::class, 'deleteTaxonomy'])->where('kind', 'categories|tags')->whereNumber('id')->name('taxonomy.destroy');
    Route::get('/{article}/edit', [BlogController::class, 'edit'])->whereNumber('article')->name('edit');
    Route::put('/{article}', [BlogController::class, 'update'])->whereNumber('article')->name('update');
    Route::delete('/{article}', [BlogController::class, 'destroy'])->whereNumber('article')->name('destroy');
    Route::post('/{article}/{action}', [BlogController::class, 'action'])->whereNumber('article')->where('action', 'publish|unpublish|duplicate|unfeature')->name('action');
});
