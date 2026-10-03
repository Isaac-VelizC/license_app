<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\{Builder, Model};
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

#[Fillable([
    'app_id',
    'version',
    'file_name',
    'file_path',
    'release_notes',
    'is_active',
    'released_at',
])]
class ProductVersion extends Model
{
    use HasFactory;

    protected $casts = [
        'is_active' => 'boolean',
        'released_at' => 'datetime',
    ];

    /**
     * RELATIONSHIPS
     */
    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }
    
    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * SCOPES
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeReleased(Builder $query): Builder
    {
        return $query->whereNotNull('released_at');
    }

    /**
     * HELPERS
     */

    public function isReleased(): bool
    {
        return $this->released_at !== null && $this->released_at->isPast();
    }

    public function isAvailable(): bool
    {
        return $this->is_active && $this->isReleased();
    }
}
