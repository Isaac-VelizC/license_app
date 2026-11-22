<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OrderApiRequest;
use App\Http\Resources\OrderApiResource;
use App\Http\Resources\PlanResource;
use App\Http\Resources\PublicPlanResource;
use App\Models\{App, Order, Plan, ProductVersion};
use App\Services\OrderService;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\{Response, StreamedResponse};

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
            ->with('productVersion')
            ->orderBy('price_cents')
            ->get();

        return PublicPlanResource::collection($plans);
    }

    public function store(OrderApiRequest $request)
    {
        $plan = Plan::findOrFail($request->validated('plan_id'));
        $result = $this->orderService->createFromPurchase($plan, $request->validated());

        return (new OrderApiResource($result['order']->load('plan')))
            ->additional(['already_exists' => $result['already_exists']])
            ->response()
            ->setStatusCode($result['already_exists'] ? 200 : 201);
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

    public function downloadTrial(App $app): StreamedResponse
    {
        $productVersion = ProductVersion::query()
            ->where('app_id', $app->id)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('released_at')
                    ->orWhere('released_at', '<=', now());
            })
            ->orderByDesc('released_at')
            ->first();

        if (! $productVersion || ! $productVersion->file_path) {
            abort(404, 'No hay una versión disponible para descargar.');
        }

        $disk = Storage::disk('local');

        if (! $disk->exists($productVersion->file_path)) {
            abort(404, 'El archivo instalador no está disponible.');
        }

        return $disk->download(
            $productVersion->file_path,
            $productVersion->file_name ?: "{$app->slug}-Setup.exe"
        );
    }
}
