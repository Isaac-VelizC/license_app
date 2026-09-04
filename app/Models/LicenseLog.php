<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['license_id', 'activation_id', 'event', 'ip_address', 'meta'])]
class LicenseLog extends Model
{
    public $timestamps = false;
    const UPDATED_AT = null;

    protected $casts = ['meta' => 'array'];

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }

    public function activation(): BelongsTo
    {
        return $this->belongsTo(Activation::class);
    }

    public static function record(License $license, string $event, ?Activation $activation = null, array $meta = []): self
    {
        return static::create([
            'license_id'     => $license->id,
            'activation_id'  => $activation?->id,
            'event'          => $event,
            'ip_address'     => request()->ip(),
            'meta'           => $meta,
        ]);
    }
}