<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'company_name'  => $this->company_name,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'notes'         => $this->notes,
            'licenses_count' => $this->whenCounted('licenses'),
            'licenses'      => LicenseResource::collection($this->whenLoaded('licenses')),
            'created_at'    => $this->created_at?->toIso8601String(),
            'updated_at'    => $this->updated_at?->toIso8601String(),
        ];
    }
}
