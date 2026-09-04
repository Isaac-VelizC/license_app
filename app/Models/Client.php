<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\{Builder, Model};
use Illuminate\Database\Eloquent\Relations\{BelongsToMany, HasMany};

#[Fillable(['name', 'company_name', 'email', 'phone', 'stripe_customer_id', 'notes'])]
class Client extends Model
{
    use HasFactory;

    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    public function apps(): BelongsToMany
    {
        return $this->belongsToMany(App::class, 'licenses')->distinct();
    }

    public function scopeSearch(Builder $query, string $search): Builder
    {
        $pattern = "%{$search}%";

        return $query->where('name', 'like', $pattern)
            ->orWhere('company_name', 'like', $pattern)
            ->orWhere('email', 'like', $pattern);
    }
}
