<?php

use App\Http\Controllers\Admin\{AppController, ClientController, LicenseController, LicenseLogController, PlanController};
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Apps
    Route::resource('apps', AppController::class)->except(['create', 'edit']);
    Route::patch('apps/{app}/toggle', [AppController::class, 'toggleStatus'])->name('apps.toggle');

    // Plans (anidados bajo app solo para crear; update/destroy son directos sobre el plan)
    Route::post('plans/{app}', [PlanController::class, 'store'])->name('plans.store');
    Route::put('plans/{plan}', [PlanController::class, 'update'])->name('plans.update');
    Route::delete('plans/{plan}', [PlanController::class, 'destroy'])->name('plans.destroy');

    // Clients
    Route::resource('clients', ClientController::class)->except(['create', 'edit']);

    // Licenses
    Route::get('licenses', [LicenseController::class, 'index'])->name('licenses.index');
    Route::post('licenses', [LicenseController::class, 'store'])->name('licenses.store');

    Route::prefix('licenses/{license}')->name('licenses.')->group(function () {
        Route::get('/', [LicenseController::class, 'show'])->name('show');
        Route::patch('renew', [LicenseController::class, 'renew'])->name('renew');
        Route::patch('change-plan', [LicenseController::class, 'changePlan'])->name('change-plan');
        Route::patch('suspend', [LicenseController::class, 'suspend'])->name('suspend');
        Route::patch('revoke', [LicenseController::class, 'revoke'])->name('revoke');
        Route::patch('reactivate', [LicenseController::class, 'reactivate'])->name('reactivate');
    });
    
    Route::get('license-logs', [LicenseLogController::class, 'index'])->name('license-logs.index');
});

require __DIR__ . '/settings.php';
