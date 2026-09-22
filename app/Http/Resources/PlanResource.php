<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'app_id'          => $this->app_id,
            'name'            => $this->name,
            'qr_image_url'    => $this->qr_image_url,
            'price_cents'     => $this->price_cents,
            'formatted_price' => $this->formatted_price, // accessor del modelo, ej. "499.00 USD"
            'currency'        => $this->currency,
            'duration_days'   => $this->duration_days,
            'is_lifetime'     => $this->isLifetime(),
            'is_trial'        => $this->is_trial,
            'is_free'         => $this->isFree(),
            'max_devices'     => $this->max_devices,
            'stripe_price_id' => $this->stripe_price_id,
            'is_active'       => $this->is_active,
            'created_at'      => $this->created_at?->toIso8601String(),
            'updated_at'      => $this->updated_at?->toIso8601String(),
        ];
    }
}
