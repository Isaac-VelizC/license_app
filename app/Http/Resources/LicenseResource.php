<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LicenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'license_key'    => $this->license_key,
            'status'         => $this->status->value,
            'status_label'   => $this->status_label,
            'status_color'   => $this->status_color,
            'is_valid'       => $this->isValid(),
            'starts_at'      => $this->starts_at?->toIso8601String(),
            'expires_at'     => $this->expires_at?->toIso8601String(),
            'is_lifetime'    => $this->isLifetime(),
            'is_trial'       => $this->isTrial(),
            'max_devices'    => $this->max_devices,
            'devices_used'   => $this->whenLoaded('activations', fn() => $this->activations->where('is_active', true)->count()),
            'activations'    => ActivationResource::collection($this->whenLoaded('activations')),
            'revoked_at'     => $this->revoked_at?->toIso8601String(),
            'revoked_reason' => $this->revoked_reason,
            'client'         => ClientResource::make($this->whenLoaded('client')),
            'app'            => AppResource::make($this->whenLoaded('app')),
            'plan'           => PlanResource::make($this->whenLoaded('plan')),
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}
