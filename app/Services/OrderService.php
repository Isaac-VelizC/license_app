<?php

namespace App\Services;

use App\Enum\OrderStatusType;
use App\Models\{Client, Order, Plan, User};
use App\services\LicenseService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    private const PENDING_EXPIRATION_HOURS = 48;

    public function __construct(
        private readonly LicenseService $licenseService
    ) {}

    public function createFromPurchase(Plan $plan, array $customer): Order
    {
        return DB::transaction(function () use ($plan, $customer) {
            $client = $this->resolveClient($customer);

            $order = Order::create([
                'order_number' => $this->temporaryOrderNumber(),
                'client_id'    => $client->id,
                'plan_id'      => $plan->id,
                'amount_cents' => $plan->price_cents,
                'currency'     => $plan->currency,
                'status'       => OrderStatusType::PENDING,
                'expires_at'   => now()->addHours(self::PENDING_EXPIRATION_HOURS)
            ]);

            $order->update(['order_number' => $this->generateOrderNumber($order)]);

            return $order->fresh();
        });
    }

    public function markAsPaid(Order $order, User $verifier, ?string $paymentReference = null): Order
    {
        $order = DB::transaction(function () use ($order, $verifier, $paymentReference) {
            $order = Order::whereKey($order->id)->lockForUpdate()->with('plan.app', 'client')->firstOrFail();

            if ($order->status === OrderStatusType::PAID) {
                return $order->fresh(['client', 'plan', 'license']);
            }

            $license = $order->license ?? $this->licenseService->issue($order->client, $order->plan->app, $order->plan);

            $order->update([
                'status'            => OrderStatusType::PAID,
                'paid_at'           => now(),
                'verified_by'       => $verifier->id,
                'payment_reference' => $paymentReference ?? $order->payment_reference,
                'license_id'        => $license->id,
            ]);

            return $order->fresh(['client', 'plan', 'license']);
        });

        // OrderPaid::dispatch($order);

        return $order;
    }

    private function resolveClient(array $customer): Client
    {
        return Client::firstOrCreate(
            ['email' => $customer['email']],
            [
                'name'         => $customer['name'],
                'phone'        => $customer['phone'],
                'company_name' => $customer['business_name'] ?? null,
            ],
        );
    }

    private function temporaryOrderNumber(): string
    {
        return 'TMP-' . Str::uuid();
    }

    private function generateOrderNumber(Order $order): string
    {
        return 'AC-' . str_pad((string) $order->id, 5, '0', STR_PAD_LEFT);
    }
}
