<?php

namespace App\Models;

use App\Enum\LicenseStatusType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Override;

#[Fillable([
    'client_id', 'app_id', 'plan_id', 'license_key', 'status',
    'starts_at', 'expires_at', 'max_devices', 'revoked_at', 'revoked_reason', 'notes',
])]
class License extends Model
{
    use HasFactory;

    protected $casts = [
        'status'      => LicenseStatusType::class,
        'starts_at'   => 'datetime',
        'expires_at'  => 'datetime',
        'revoked_at'  => 'datetime',
        'max_devices' => 'integer',
    ];

    protected $appends = ['status_label', 'status_color'];

    #[Override]
    protected static function booted(): void
    {
        static::creating(function (License $license) {
            if (empty($license->license_key)) {
                $license->license_key = static::generateLicenseKey();
            }
        });
    }

    protected static function generateLicenseKey(): string
    {
        do {
            $key = static::randomLicenseKey();
        } while (static::where('license_key', $key)->exists());

        return $key;
    }

    protected static function randomLicenseKey(): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        $groups = collect(range(1, 3))
            ->map(fn () => collect(range(1, 4))
                ->map(fn () => $characters[random_int(0, strlen($characters) - 1)])
                ->implode(''))
            ->implode('-');

        return "LIC-{$groups}";
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function activations(): HasMany
    {
        return $this->hasMany(Activation::class);
    }
    
    public function logs(): HasMany
    {
        return $this->hasMany(LicenseLog::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status->label();
    }

    public function getStatusColorAttribute(): string
    {
        return $this->status->color();
    }

    public function scopeForApp(Builder $query, int $appId): Builder
    {
        return $query->where('app_id', $appId);
    }

    public function scopeForClient(Builder $query, int $clientId): Builder
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeForStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeTrials(Builder $query): Builder
    {
        return $query->whereHas('plan', fn ($q) => $q->where('is_trial', true));
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        $pattern = "%{$search}%";

        return $query->where('license_key', 'like', $pattern)
            ->orWhereHas('client', fn ($q) => $q->where('name', 'like', $pattern)
                ->orWhere('company_name', 'like', $pattern)
                ->orWhere('email', 'like', $pattern));
    }

    public function isValid(): bool
    {
        if ($this->status !== LicenseStatusType::ACTIVE) {
            return false;
        }
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        return true;
    }

    public function isLifetime(): bool
    {
        return is_null($this->expires_at);
    }

    public function isTrial(): bool
    {
        return $this->plan?->is_trial === true;
    }

    public function hasAvailableDevice(): bool
    {
        return $this->activations()->where('is_active', true)->count() < $this->max_devices;
    }

    public function revoke(string $reason): void
    {
        $this->update([
            'status'         => LicenseStatusType::REVOKED,
            'revoked_at'     => now(),
            'revoked_reason' => $reason,
        ]);

        LicenseLog::record($this, 'revoked', meta: ['reason' => $reason]);
    }

    public function suspend(string $reason): void
    {
        $this->update(['status' => LicenseStatusType::SUSPENDED]);
        LicenseLog::record($this, 'suspended', meta: ['reason' => $reason]);
    }

    public function reactivate(): void
    {
        $this->update(['status' => LicenseStatusType::ACTIVE, 'revoked_at' => null, 'revoked_reason' => null]);
        LicenseLog::record($this, 'reactivated');
    }
}
