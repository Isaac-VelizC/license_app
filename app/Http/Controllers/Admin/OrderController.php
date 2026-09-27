<?php

namespace App\Http\Controllers\Admin;

use App\Enum\OrderStatusType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MarkOrderAsPaidRequest;
use App\Http\Resources\OrderDetailResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\{Inertia, Response};

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->value() ?: null;

        $orders = Order::query()
            ->with(['client', 'plan'])
            ->when($status, fn($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/orders/orders-page', [
            'orders'        => OrderResource::collection($orders),
            'filters'       => ['status' => $status],
            'statuses'      => fn() => OrderStatusType::getOptions()
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/order-detail', [
            'order' => new OrderDetailResource(
                $order->load(['client', 'plan', 'license', 'verifiedBy'])
            )
        ]);
    }

    public function markAsPaid(MarkOrderAsPaidRequest $request, Order $order, OrderService $orderService): RedirectResponse
    {
        try {
            $orderService->markAsPaid(
                $order,
                $request->user(),
                $request->validated('payment_reference'),
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['order' => $e->getMessage()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Orden marcada como pagada y licencia generada.')]);

        return back();
    }
}
