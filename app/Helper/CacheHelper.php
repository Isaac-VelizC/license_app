<?php

namespace App\Helper;

use App\Http\Resources\AppResource;
use App\Models\{Client, App};
use Illuminate\Support\Facades\Cache;

class CacheHelper
{
    private const CACHE_TTL_HOURS = 2;
    private const CLIENTS_CACHE_KEY = 'clients_active';
    private const APPS_CACHE_KEY = 'apps_active';

    public static function clients(): array
    {
        return Cache::remember(
            self::CLIENTS_CACHE_KEY,
            now()->addHours(self::CACHE_TTL_HOURS),
            fn() => Client::query()
                ->select('id', 'name', 'company_name')
                ->orderBy('name')
                ->get()
                ->toArray()
        );
    }

    public static function clearClientsCache(): void
    {
        Cache::forget(self::CLIENTS_CACHE_KEY);
    }

    public static function apps(): array
    {
        return Cache::remember(
            self::APPS_CACHE_KEY,
            now()->addHours(self::CACHE_TTL_HOURS),
            fn() => AppResource::collection(
                App::query()
                    ->where('is_active', true)
                    ->with(['plans' => fn($q) => $q->where('is_active', true)->latest()])
                    ->orderBy('name')
                    ->get()
            )->resolve()
        );
    }

    public static function clearAppsCache(): void
    {
        Cache::forget(self::APPS_CACHE_KEY);
    }
}
