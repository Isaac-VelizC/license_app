<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

#[Fillable([
    'app_id',
    'product_version_id',
    
    'name',
    'qr_image_url',
    'price_cents',
    'currency',
    'duration_days',
    'max_devices',
    'updates_until_version',
    'is_trial',
    'stripe_price_id',
    'is_active'
])]
class Plan extends Model
{
    use HasFactory;

    protected $casts = [
        'price_cents'   => 'integer',
        'duration_days' => 'integer',
        'max_devices'   => 'integer',
        'is_trial'      => 'boolean',
        'is_active'     => 'boolean',
    ];

    /**
     * RELATIONSHIPS
     */
    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function productVersion(): BelongsTo
    {
        return $this->belongsTo(ProductVersion::class, 'product_version_id');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    /**
     * SCOPES
     */
    public function scopeTrial(Builder $query): Builder
    {
        return $query->where('is_trial', true);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForApp(Builder $query, int $appId): Builder
    {
        return $query->where('app_id', $appId);
    }

    /**
     * HELPERS
     */
    public function isLifetime(): bool
    {
        return is_null($this->duration_days);
    }

    public function isFree(): bool
    {
        return $this->price_cents === 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price_cents / 100, 2) . ' ' . $this->currency;
    }
}
