<?php

use App\Http\Controllers\api\V1\LicenseActivationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('v1/licenses')->middleware(['throttle:license-per-ip', 'throttle:license-per-key'])->group(function () {
    Route::post('activate', [LicenseActivationController::class, 'activate']);
    Route::post('validate', [LicenseActivationController::class, 'validateLicense']);
    Route::post('deactivate', [LicenseActivationController::class, 'deactivate']);
    Route::post('trial', [LicenseActivationController::class, 'trial']);
});