<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderApiResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'order_number'  => $this->order_number,
            'status'        => $this->status->value,
            'amount'        => $this->formatted_amount,
            'currency'      => $this->currency,
            'plan'          => [
                'name'         => $this->plan->name,
                'max_devices'  => $this->plan->max_devices,
                'is_lifetime'  => $this->plan->isLifetime(),
            ],
            'whatsapp_link' => $this->whatsapp_link,
            'created_at'    => $this->created_at->toIso8601String(),
        ];
    }
}
