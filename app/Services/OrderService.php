<?php

namespace App\Services;

use App\Enum\LicenseStatusType;
use App\Enum\OrderStatusType;
use App\Events\OrderPaid;
use App\Models\{Client, License, LicenseLog, Order, Plan, User};
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    private const PENDING_EXPIRATION_HOURS = 48;

    public function createFromPurchase(Plan $plan, array $customer): Order
    {
        return DB::transaction(function () use ($plan, $customer) {
            $client = $this->resolveClient($customer);

            $order = Order::create([
                'order_number' => $this->temporaryOrderNumber(),
                'client_id'    => $client->id,
                'plan_id'      => $plan->id,
                'product_version_id' => $plan->product_version_id,
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
            $order = Order::whereKey($order->id)
                ->lockForUpdate()
                ->with('plan.app', 'client', 'license')
                ->firstOrFail();

            if ($order->status === OrderStatusType::PAID) {
                return $order->fresh(['client', 'plan', 'license']);
            }

            $license = $order->license ?? $this->issueFromOrder($order);

            $order->update([
                'status'            => OrderStatusType::PAID,
                'paid_at'           => now(),
                'verified_by'       => $verifier->id,
                'payment_reference' => $paymentReference ?? $order->payment_reference,
                'license_id'        => $license->id,
            ]);

            return $order->fresh(['client', 'plan', 'license']);
        });

        OrderPaid::dispatch($order);

        return $order;
    }

    private function issueFromOrder(Order $order): License
    {
        if (! $order->product_version_id) {
            throw new \InvalidArgumentException(
                __('La orden no tiene una versión de producto asociada.')
            );
        }

        return DB::transaction(function () use ($order) {
            $startsAt = now();

            $license = License::create([
                'client_id'             => $order->client_id,
                'app_id'                => $order->plan->app_id,
                'plan_id'               => $order->plan_id,
                'order_id'              => $order->id,
                'product_version_id'    => $order->product_version_id,
                'status'                => LicenseStatusType::ACTIVE,
                'starts_at'             => $startsAt,
                'expires_at'            => $order->plan->duration_days
                    ? $startsAt->copy()->addDays($order->plan->duration_days)
                    : null,
                'max_devices'           => $order->plan->max_devices,
                'updates_until_version' => $order->plan->updates_until_version,
            ]);

            LicenseLog::record(
                $license,
                'issued',
                meta: [
                    'plan_id'            => $order->plan_id,
                    'client_id'          => $order->client_id,
                    'order_id'           => $order->id,
                    'product_version_id' => $order->product_version_id,
                ]
            );

            return $license;
        });
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
