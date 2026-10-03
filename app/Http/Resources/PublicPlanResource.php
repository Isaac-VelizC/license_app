<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicPlanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'price_cents'    => $this->price_cents,
            'formatted_price' => $this->formatted_price,
            'currency'       => $this->currency,
            'duration_days'  => $this->duration_days,
            'is_lifetime'    => $this->isLifetime(),
            'max_devices'    => $this->max_devices,

            // Información necesaria para mostrar
            // qué versión incluye el plan.
            'product_version' => $this->productVersion?->version,

            // Límite de actualizaciones.
            'updates_until_version' => $this->updates_until_version,

            // Necesario para iniciar el proceso de compra.
            'qr_image_url' => $this->qr_image_url,
        ];
    }
}
