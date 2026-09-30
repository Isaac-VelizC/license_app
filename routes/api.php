<?php

use App\Http\Controllers\api\V1\LicenseActivationController;
use App\Http\Controllers\Api\V1\OrderApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {
    Route::prefix('licenses')->middleware(['throttle:license-per-ip', 'throttle:license-per-key'])->group(function () {
        Route::post('activate', [LicenseActivationController::class, 'activate']);
        Route::post('validate', [LicenseActivationController::class, 'validateLicense']);
        Route::post('deactivate', [LicenseActivationController::class, 'deactivate']);
        Route::post('trial', [LicenseActivationController::class, 'trial']);
    });

    Route::prefix('orders')->middleware('throttle:orders')->group(function () {
        Route::post('/', [OrderApiController::class, 'store']);
        Route::get('{order_number}', [OrderApiController::class, 'show']);
    });

    Route::prefix('apps/{app:slug}')->group(function () {
        Route::get('plans', [OrderApiController::class, 'index']);
    });
    
    Route::get('plans/{plan}', [OrderApiController::class, 'getPlan']);
});
