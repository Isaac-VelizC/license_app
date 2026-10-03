<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OrderApiRequest;
use App\Http\Resources\OrderApiResource;
use App\Http\Resources\PlanResource;
use App\Http\Resources\PublicPlanResource;
use App\Models\{App, Order, Plan};
use App\Services\OrderService;
use Symfony\Component\HttpFoundation\{Response};

class OrderApiController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService
    ) {}

    public function index(App $app)
    {
        abort_unless($app->is_active, Response::HTTP_NOT_FOUND);

        $plans = $app->plans()
            ->active()
            ->where('is_trial', false)
            ->whereNotNull('product_version_id')
            ->whereNotNull('qr_image_url')
            ->whereHas('productVersion', function ($query) {
                $query
                    ->where('is_active', true)
                    ->whereNotNull('released_at')
                    ->where('released_at', '<=', now());
            })
            ->with('productVersion')
            ->orderBy('price_cents')
            ->get();

        return PublicPlanResource::collection($plans);
    }

    public function store(OrderApiRequest $request)
    {
        $plan = Plan::findOrFail($request->validated('plan_id'));
        $order = $this->orderService->createFromPurchase($plan, $request->validated());
        return new OrderApiResource($order->load('plan'));
    }

    public function show(string $orderNumber)
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('plan')
            ->firstOrFail();

        return new OrderApiResource($order);
    }

    public function getPlan(Plan $plan)
    {
        return new PlanResource($plan);
    }
}
