<?php

namespace App\Helper;

use App\Http\Resources\AppResource;
use App\Models\{Client, App, Plan};
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
        function () {
            $apps = App::query()
                ->where('is_active', true)
                ->with(['plans' => fn ($q) => $q->where('is_active', true)->latest()])
                ->orderBy('name')
                ->get();

            return $apps->map(fn (App $app) => [
                'id'          => $app->id,
                'name'        => $app->name,
                'slug'        => $app->slug,
                'is_active'   => $app->is_active,
                'plans'       => $app->plans->map(fn (Plan $plan) => [
                    'id'              => $plan->id,
                    'app_id'          => $plan->app_id,
                    'name'            => $plan->name,
                    'price_cents'     => $plan->price_cents,
                    'formatted_price' => $plan->formatted_price,
                    'currency'        => $plan->currency,
                    'duration_days'   => $plan->duration_days,
                    'is_lifetime'     => $plan->isLifetime(),
                    'is_trial'        => $plan->is_trial,
                    'is_free'         => $plan->isFree(),
                    'max_devices'     => $plan->max_devices,
                    'stripe_price_id' => $plan->stripe_price_id,
                    'is_active'       => $plan->is_active,
                ])->values()->all(),
            ])->values()->all();
        }
    );
}

    public static function clearAppsCache(): void
    {
        Cache::forget(self::APPS_CACHE_KEY);
    }
}
