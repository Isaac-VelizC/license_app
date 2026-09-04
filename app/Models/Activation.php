<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'license_id',
    'hwid',
    'device_id',
    'device_name',
    'ip_address',
    'app_version',
    'last_seen_at',
    'activated_at',
    'deactivated_at',
    'is_active',
])]
class Activation extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $casts = [
        'last_seen_at'   => 'datetime',
        'activated_at'   => 'datetime',
        'deactivated_at' => 'datetime',
        'is_active'      => 'boolean',
    ];

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }

    public function touchLastSeen(): void
    {
        $this->update(['last_seen_at' => now()]);
    }

    public function deactivate(): void
    {
        $this->update(['is_active' => false, 'deactivated_at' => now()]);
        LicenseLog::record($this->license, 'deactivated', $this);
    }
}
