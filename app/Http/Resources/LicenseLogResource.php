<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LicenseLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'event'      => $this->event,
            'ip_address' => $this->ip_address,
            'meta'       => $this->meta,
            'license'    => [
                'id'          => $this->license->id,
                'license_key' => $this->license->license_key,
                'client_name' => $this->license->client?->name,
                'app_name'    => $this->license->app?->name,
            ],
            'created_at' => $this->created_at
        ];
    }
}
