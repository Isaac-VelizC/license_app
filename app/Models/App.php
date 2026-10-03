<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\{Builder, Model};
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\{BelongsToMany, HasMany};

#[Fillable(['name', 'slug', 'description', 'is_active'])]
class App extends Model
{
    use HasFactory;

    protected $casts = ['is_active' => 'boolean'];

    /**
     * RELATIONSHIPS
     */
    public function productVersions(): HasMany
    {
        return $this->hasMany(ProductVersion::class);
    }

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    public function clients(): BelongsToMany
    {
        return $this->belongsToMany(Client::class, 'licenses')->distinct();
    }

    /**
     * SCOPES
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * HELPERS
     */
    public function trialPlan(): ?Plan
    {
        return $this->plans()->where('is_trial', true)->first();
    }

    public function lifetimePlan(): ?Plan
    {
        return $this->plans()->where('is_trial', false)->whereNull('duration_days')->first();
    }
}
