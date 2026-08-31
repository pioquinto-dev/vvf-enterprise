<?php

use Illuminate\Support\Facades\Route;

Route::group([], base_path('routes/public.php'));
Route::group([], base_path('routes/frontend.php'));
Route::group([], base_path('routes/admin.php'));
Route::prefix('api/v1')->group(base_path('routes/v1.php'));
