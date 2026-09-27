<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'order_number'      => $this->order_number,
            'status'            => $this->status->value,
            'status_label'      => $this->status->label(),
            'status_color' => $this->status->color(),
            'amount'            => $this->formatted_amount,
            'payment_reference' => $this->payment_reference,
            'paid_at'           => $this->paid_at?->toISOString(),
            'created_at'        => $this->created_at->toISOString(),
            'expires_at'        => $this->expires_at->toISOString(),

            'client' => $this->whenLoaded('client', function () {
                return [
                    'id' => $this->client->id,
                    'name'         => $this->client->name,
                    'email'        => $this->client->email,
                    'phone'        => $this->client->phone,
                    'company_name' => $this->client->company_name,
                ];
            }),

            'plan' => $this->whenLoaded('plan', function () {
                return [
                    'id'          => $this->plan->id,
                    'name'        => $this->plan->name,
                    'max_devices' => $this->plan->max_devices,
                    'is_lifetime' => $this->plan->isLifetime(),
                ];
            }),

            'license' => $this->whenLoaded('license', function () {
                return $this->license ? [
                    'id'          => $this->license->id,
                    'license_key' => $this->license->license_key,
                    'status'      => $this->license->status->value,
                    'expires_at'  => $this->license->expires_at?->toISOString(),
                ] : null;
            })
        ];
    }
}
