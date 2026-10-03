<?php

use App\Http\Controllers\Admin\{AppController, ClientController, LicenseController, LicenseLogController, OrderController, PlanController, ProductVersionController};
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // Apps
    Route::resource('apps', AppController::class)->except(['create', 'edit']);
    Route::patch('apps/{app}/toggle', [AppController::class, 'toggleStatus'])->name('apps.toggle');

    // Plans (anidados bajo app solo para crear; update/destroy son directos sobre el plan)
    Route::get('plans/{app}/create', [PlanController::class, 'create'])->name('plans.create');
    Route::post('plans/{app}', [PlanController::class, 'store'])->name('plans.store');
    Route::get('plans/{app}/{plan}/edit', [PlanController::class, 'edit'])->name('plans.edit');
    Route::post('plans/{plan}/update', [PlanController::class, 'update'])->name('plans.update');
    Route::delete('plans/{plan}', [PlanController::class, 'destroy'])->name('plans.destroy');

    // Product Version
    Route::get('products', [ProductVersionController::class, 'index'])->name('product.index');
    Route::post('product', [ProductVersionController::class, 'store'])->name('product.store');
    Route::post('product/{product}/update', [ProductVersionController::class, 'update'])->name('product.update');
    Route::delete('product/{product}', [ProductVersionController::class, 'destroy'])->name('product.destroy');

    // Clients
    Route::resource('clients', ClientController::class)->except(['create', 'edit']);

    // Pedidos
    Route::get('orders', [OrderController::class, 'index'])->name('order.index');
    Route::get('orders/{order}', [OrderController::class, 'show'])->name('order.show');
    Route::post('orders/{order}/mark-as-paid', [OrderController::class, 'markAsPaid'])->name('order.mark-as-paid');

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
