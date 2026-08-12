<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminRecordController;
use App\Http\Controllers\Admin\AdminSessionController;
use App\Http\Controllers\Admin\Content\PlanController;
use App\Http\Controllers\Admin\Content\SearchController;
use App\Http\Controllers\Admin\Content\ViralVideoController;
use App\Http\Controllers\Admin\Support\InquiryController;
use App\Http\Controllers\Admin\Subscription\SubscriptionController;
use App\Http\Controllers\Admin\Users\AdminUserController;
use App\Http\Controllers\Admin\Users\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('x/admin')
    ->as('admin.')
    ->group(function (): void {
        Route::middleware('admin.guest')->group(function (): void {
            Route::get('/login', [AdminSessionController::class, 'create'])->name('login');
            Route::post('/login', [AdminSessionController::class, 'store'])->name('login.store');
        });

        Route::middleware('admin.auth')->group(function (): void {
            Route::post('/logout', [AdminSessionController::class, 'destroy'])->name('logout');

            Route::get('/', AdminDashboardController::class)->name('dashboard');
            Route::post('/dashboard/refresh', [AdminDashboardController::class, 'refresh'])->name('dashboard.refresh');

            /*
             * Row actions for every listing. Resource is constrained to the
             * known set so an unknown segment 404s at the router rather than
             * reaching the mutator.
             */
            Route::prefix('records/{resource}/{id}')
                ->where(['resource' => 'viral-videos|searches|plans|subscription|users'])
                ->group(function (): void {
                    Route::patch('/', [AdminRecordController::class, 'update'])->name('records.update');
                    Route::patch('/archive', [AdminRecordController::class, 'archive'])->name('records.archive');
                    Route::delete('/', [AdminRecordController::class, 'destroy'])->name('records.destroy');
                    Route::patch('/restore', [AdminRecordController::class, 'restore'])->name('records.restore');
                });

            Route::prefix('viral-videos')->group(function (): void {
                Route::get('/', [ViralVideoController::class, 'index'])->name('viral-videos.index');
            });

            Route::prefix('searches')->group(function (): void {
                Route::get('/', [SearchController::class, 'index'])->name('searches.index');
            });

            Route::prefix('inquiries')->group(function (): void {
                Route::get('/', [InquiryController::class, 'index'])->name('inquiries.index');
            });

            Route::prefix('plans')->group(function (): void {
                Route::get('/', [PlanController::class, 'index'])->name('plans.index');
            });

            Route::prefix('subscription')->group(function (): void {
                Route::get('/', [SubscriptionController::class, 'index'])->name('subscription.index');
            });

            Route::prefix('users')->group(function (): void {
                Route::get('/', [UserController::class, 'index'])->name('users.index');
                Route::get('/admin-users', [AdminUserController::class, 'index'])->name('admin-users.index');
            });
        });
    });
