<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'hwid'           => $this->hwid,
            'device_id'      => $this->device_id,
            'device_name'    => $this->device_name,
            'ip_address'     => $this->ip_address,
            'app_version'    => $this->app_version,
            'activated_at'   => $this->activated_at?->toIso8601String(),
            'last_seen_at'   => $this->last_seen_at?->toIso8601String(),
            'deactivated_at' => $this->deactivated_at?->toIso8601String(),
            'is_active'      => $this->is_active,
        ];
    }
}
