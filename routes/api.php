<?php

use App\Http\Controllers\Api\V1\{LegalAcceptanceController, LegalDocumentApiController, OrderApiController, LicenseActivationController};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1')->group(function () {

    Route::prefix('licenses')
        ->middleware('throttle:licenses')
        ->group(function () {
            Route::post('activate', [LicenseActivationController::class, 'activate']);
            Route::post('validate', [LicenseActivationController::class, 'validateLicense']);
            Route::post('trial', [LicenseActivationController::class, 'trial']);
        });

    Route::prefix('orders')
        ->middleware('throttle:orders')
        ->group(function () {
            Route::post('/', [OrderApiController::class, 'store']);
            Route::get('{order_number}', [OrderApiController::class, 'show']);
        });

    Route::prefix('apps/{app:slug}')->group(function () {
        Route::get('plans', [OrderApiController::class, 'index']);

        Route::get('download/trial', [OrderApiController::class, 'downloadTrial'])
            ->middleware('throttle:downloads');
    });

    Route::get('plans/{plan}', [OrderApiController::class, 'getPlan']);

    Route::prefix('legal')
        ->middleware('throttle:10,1')
        ->group(function () {
            Route::post('acceptances', [LegalAcceptanceController::class, 'store']);
        });

    Route::get(
        '/legal/documents/{appSlug}',
        [LegalDocumentApiController::class, 'index']
    )->middleware('throttle:60,1');
});
