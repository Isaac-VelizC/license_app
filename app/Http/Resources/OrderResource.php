<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'order_number' => $this->order_number,
            'status'       => $this->status->value,
            'status_label' => $this->status->label(),
            'status_color' => $this->status->color(),

            'client'       => $this->whenLoaded('client', function () {
                return [
                    'id'    => $this->client->id,
                    'name'  => $this->client->name,
                    'email' => $this->client->email,
                ];
            }),

            'plan' => $this->whenLoaded('plan', function () {
                return [
                    'id' => $this->plan->id,
                    'name' => $this->plan->name,
                ];
            }),

            'amount'       => $this->formatted_amount,
            'created_at'   => $this->created_at->toISOString(),
            'paid_at'      => $this->paid_at?->toISOString(),
        ];
    }
}
