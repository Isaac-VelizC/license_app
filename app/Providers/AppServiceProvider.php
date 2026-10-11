<?php

namespace App\Providers;

use App\Events\OrderPaid;
use App\Listeners\SendLicenseIssuedEmail;
use App\services\LicenseSignatureService;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\{Date, DB, Event, Log};
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LicenseSignatureService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        DB::listen(function (QueryExecuted $query) {
            if ($query->time > 500) {
                Log::warning('Consulta SQL lenta detectada', [
                    'time_ms' => $query->time,
                    'sql' => $query->sql,
                ]);
            }
        });
        $this->configureDefaults();
        $this->configureRateLimit();
        JsonResource::withoutWrapping();
        Event::listen(OrderPaid::class, SendLicenseIssuedEmail::class);
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null,
        );
    }

    protected function configureRateLimit(): void
    {
        RateLimiter::for('licenses', function (Request $request) {
            $ip = $request->ip();

            $licenseKey = Str::upper(
                trim((string) $request->input('license_key', ''))
            );

            $key = $licenseKey !== ''
                ? hash('sha256', $licenseKey)
                : 'unknown';

            return [
                Limit::perMinute(20)->by("license-ip:{$ip}"),
                Limit::perMinute(10)->by("license-key:{$key}"),
            ];
        });

        RateLimiter::for('orders', function (Request $request) {
            return [
                Limit::perMinute(5)->by("orders-minute:{$request->ip()}"),
                Limit::perHour(20)->by("orders-hour:{$request->ip()}"),
            ];
        });

        RateLimiter::for('downloads', function (Request $request) {
            return [
                Limit::perMinute(5)->by("downloads-minute:{$request->ip()}"),
                Limit::perHour(30)->by("downloads-hour:{$request->ip()}"),
            ];
        });
    }
}
