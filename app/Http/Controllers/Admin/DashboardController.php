<?php

namespace App\Http\Controllers\Admin;

use App\Enum\LicenseStatusType;
use App\Enum\OrderStatusType;
use App\Http\Controllers\Controller;
use App\Models\{App, License, Order};
use Inertia\{Inertia, Response};

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'apps' => App::count(),

                'activeLicenses' => License::query()
                    ->where('status', LicenseStatusType::ACTIVE)
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    })
                    ->whereHas(
                        'plan',
                        fn($query) =>
                        $query->where('is_trial', false)
                    )
                    ->count(),

                'pendingOrders' => Order::query()
                    ->where('status', OrderStatusType::PENDING)
                    ->where('expires_at', '>', now())
                    ->count(),

                'activeTrials' => License::query()
                    ->where('status', LicenseStatusType::ACTIVE)
                    ->where('expires_at', '>', now())
                    ->whereHas(
                        'plan',
                        fn($query) =>
                        $query->where('is_trial', true)
                    )
                    ->count(),
            ],

            'recentOrders' => Order::query()
                ->with(['client:id,name', 'plan:id,name'])
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn(Order $order) => [
                    'id' => $order->id,
                    'number' => $order->order_number,
                    'client' => $order->client?->name ?? 'Sin cliente',
                    'plan' => $order->plan?->name ?? 'Sin plan',
                    'amount' => $order->formatted_amount,
                    'currency' => $order->currency,
                    'status' => $order->status->value,
                    'created_at' => $order->created_at->toIso8601String(),
                ]),
        ]);
    }
}
