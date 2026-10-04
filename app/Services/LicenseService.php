<?php

namespace App\services;

use App\Enum\LicenseStatusType;
use App\Exceptions\LicenseException;
use App\Models\{Activation, App, Client, Plan, License, LicenseLog};
use Illuminate\Support\Facades\DB;

class LicenseService
{
    public function createTrial(App $app, string $hwid, ?string $deviceId, ?string $deviceName): License
    {
        $trialPlan = $app->trialPlan();

        if (! $trialPlan) {
            throw new \RuntimeException("La app '{$app->slug}' no tiene un plan trial configurado.");
        }

        if (!$trialPlan->product_version_id) {
            throw new \RuntimeException("El plan trial '{$trialPlan->name}' no tiene una versión de producto asociada.");
        }

        return DB::transaction(function () use ($app, $trialPlan, $hwid, $deviceId, $deviceName) {
            $license = License::create([
                'app_id'      => $app->id,
                'plan_id'     => $trialPlan->id,
                'client_id'   => null,
                'product_version_id' => $trialPlan->product_version_id,
                'status'      => LicenseStatusType::ACTIVE,
                'starts_at'   => now(),
                'expires_at'  => now()->addDays($trialPlan->duration_days),
                'max_devices' => $trialPlan->max_devices,
                'updates_until_version' => $trialPlan->productVersion?->version_number,
            ]);

            $activation = $license->activations()->create([
                'hwid'         => $hwid,
                'device_id'    => $deviceId,
                'device_name'  => $deviceName,
                'activated_at' => now(),
                'last_seen_at' => now(),
                'is_active'    => true,
            ]);

            LicenseLog::record($license, 'trial_started', $activation, ['hwid' => $hwid]);

            return $license;
        });
    }

    /**
     * Busca un trial ya existente para este hwid — evita que reinstalar reinicie el trial.
     */
    public function findExistingTrial(App $app, string $hwid): ?License
    {
        return License::forApp($app->id)
            ->trials()
            ->whereHas('activations', fn($q) => $q->where('hwid', $hwid))
            ->first();
    }

    public function issue(Client $client, App $app, Plan $plan, ?int $orderId = null): License
    {
        if ($plan->app_id !== $app->id) {
            throw new \InvalidArgumentException(__('El plan no pertenece a la aplicación seleccionada.'));
        }

        if ($plan->is_trial) {
            throw new \InvalidArgumentException(__('No se puede emitir manualmente una licencia de prueba.'));
        }

        return DB::transaction(function () use ($client, $app, $plan, $orderId) {
            $startsAt = now();

            $license = License::create([
                'client_id'   => $client->id,
                'app_id'      => $app->id,
                'plan_id'     => $plan->id,
                'product_version_id' => $plan->product_version_id,
                'status'      => LicenseStatusType::ACTIVE,
                'starts_at'   => $startsAt,
                'expires_at'  => $plan->duration_days ? $startsAt->copy()->addDays($plan->duration_days) : null,
                'max_devices' => $plan->max_devices,
                'updates_until_version' => $plan->productVersion?->version_number,
            ]);

            LicenseLog::record($license, 'issued', meta: array_filter([
                'plan_id'   => $plan->id,
                'client_id' => $client->id,
                'order_id'  => $orderId,
            ]));

            return $license;
        });
    }

    public function renew(License $license): void
    {
        $license->loadMissing('plan');

        if (! $license->plan->duration_days) {
            throw new \InvalidArgumentException(__('La licencia es vitalicia y no requiere renovación.'));
        }

        $baseDate = ($license->expires_at && $license->expires_at->isFuture())
            ? $license->expires_at->copy()
            : now();

        $license->update([
            'expires_at' => $baseDate->addDays($license->plan->duration_days),
            'status'     => LicenseStatusType::ACTIVE,
        ]);

        LicenseLog::record($license, 'renewed', meta: ['duration_days' => $license->plan->duration_days]);
    }

    public function changePlan(License $license, Plan $plan): void
    {
        if ($plan->app_id !== $license->app_id) {
            throw new \InvalidArgumentException(__('El plan no pertenece a la misma aplicación.'));
        }
        if ($plan->is_trial) {
            throw new \InvalidArgumentException(__('No se puede asignar manualmente un plan de prueba.'));
        }

        $license->update([
            'plan_id'     => $plan->id,
            'max_devices' => $plan->max_devices,
            'expires_at'  => $plan->duration_days ? now()->addDays($plan->duration_days) : null,
        ]);

        LicenseLog::record($license, 'plan_changed', meta: ['plan_id' => $plan->id]);
    }

    public function suspend(License $license, string $reason): void
    {
        if ($license->status === LicenseStatusType::REVOKED) {
            throw new \InvalidArgumentException(__('Una licencia revocada no puede suspenderse.'));
        }
        if ($license->status === LicenseStatusType::SUSPENDED) {
            throw new \InvalidArgumentException(__('La licencia ya está suspendida.'));
        }

        $license->update(['status' => LicenseStatusType::SUSPENDED]);
        LicenseLog::record($license, 'suspended', meta: ['reason' => $reason]);
    }

    public function revoke(License $license, string $reason): void
    {
        if ($license->status === LicenseStatusType::REVOKED) {
            throw new \InvalidArgumentException(__('La licencia ya está revocada.'));
        }

        $license->update([
            'status'         => LicenseStatusType::REVOKED,
            'revoked_at'     => now(),
            'revoked_reason' => $reason,
        ]);

        LicenseLog::record($license, 'revoked', meta: ['reason' => $reason]);
    }

    public function reactivate(License $license): void
    {
        if ($license->status === LicenseStatusType::REVOKED) {
            throw new \InvalidArgumentException(__('Una licencia revocada no puede reactivarse.'));
        }
        if ($license->status === LicenseStatusType::ACTIVE) {
            throw new \InvalidArgumentException(__('La licencia ya está activa.'));
        }

        $license->update(['status' => LicenseStatusType::ACTIVE, 'revoked_at' => null, 'revoked_reason' => null]);
        LicenseLog::record($license, 'reactivated');
    }

    /**
     * Valida que la licencia pueda usarse AHORA: no revocada, no suspendida,
     * no vencida por tiempo. No muta nada — status administrativo y vigencia
     * por tiempo son conceptos separados (isValid() ya resuelve el segundo).
     */
    public function ensureUsable(License $license): void
    {
        if ($license->status === LicenseStatusType::REVOKED) {
            throw new LicenseException('Esta licencia fue revocada.', 'REVOKED');
        }

        if ($license->status === LicenseStatusType::SUSPENDED) {
            throw new LicenseException('Esta licencia está suspendida.', 'SUSPENDED');
        }

        if (! $license->isValid()) {
            throw new LicenseException('Esta licencia expiró.', 'EXPIRED');
        }
    }

    /**
     * Activa (o reactiva) un dispositivo. Lock + transacción evita que dos
     * activaciones simultáneas superen max_devices; valida el límite tanto
     * al crear un hwid nuevo como al reactivar uno que había liberado su cupo.
     */
    public function activateDevice(
        License $license,
        string $hwid,
        ?string $deviceId,
        ?string $deviceName,
        ?string $ip,
        ?string $appVersion,
    ): Activation {
        return DB::transaction(function () use ($license, $hwid, $deviceId, $deviceName, $ip, $appVersion) {
            $license = License::whereKey($license->id)->lockForUpdate()->first();
            $this->ensureUsable($license);

            $activation = Activation::where('license_id', $license->id)
                ->where('hwid', $hwid)
                ->lockForUpdate()
                ->first();

            if ($activation?->is_active) {
                $activation->update([
                    'device_id' => $deviceId,
                    'device_name' => $deviceName,
                    'ip_address' => $ip,
                    'app_version' => $appVersion,
                    'last_seen_at' => now(),
                ]);
                return $activation;
            }

            // hwid nuevo O hwid viejo reactivándose: en ambos casos hay que
            // validar el cupo — antes este bloque se saltaba para el segundo caso.
            if (! $license->hasAvailableDevice()) {
                throw new LicenseException(
                    'Se alcanzó el límite de dispositivos permitidos para esta licencia.',
                    'DEVICE_LIMIT_REACHED',
                );
            }

            if ($activation) {
                $activation->update([
                    'device_id' => $deviceId,
                    'device_name' => $deviceName,
                    'ip_address' => $ip,
                    'app_version' => $appVersion,
                    'activated_at' => now(),
                    'last_seen_at' => now(),
                    'is_active' => true,
                    'deactivated_at' => null,
                ]);
            } else {
                $activation = $license->activations()->create([
                    'hwid' => $hwid,
                    'device_id' => $deviceId,
                    'device_name' => $deviceName,
                    'ip_address' => $ip,
                    'app_version' => $appVersion,
                    'activated_at' => now(),
                    'last_seen_at' => now(),
                    'is_active' => true,
                ]);
            }

            LicenseLog::record($license, 'activated', $activation, ['hwid' => $hwid]);

            return $activation;
        });
    }

    public function validateDevice(License $license, string $hwid, ?string $ip): Activation
    {
        $this->ensureUsable($license);

        $activation = Activation::where('license_id', $license->id)
            ->where('hwid', $hwid)
            ->where('is_active', true)
            ->first();

        if (! $activation) {
            throw new LicenseException(
                'Este dispositivo no tiene una activación válida. Vuelve a activar la licencia.',
                'DEVICE_NOT_ACTIVATED',
            );
        }

        $activation->update(['last_seen_at' => now(), 'ip_address' => $ip]);
        return $activation;
    }

    public function deactivateDevice(License $license, string $hwid): void
    {
        $activation = Activation::where('license_id', $license->id)
            ->where('hwid', $hwid)
            ->first();

        if (! $activation) {
            throw new LicenseException(
                'No hay una activación registrada para este dispositivo.',
                'DEVICE_NOT_ACTIVATED',
            );
        }

        if ($activation->is_active) {
            $activation->update(['is_active' => false, 'deactivated_at' => now()]);
            LicenseLog::record($license, 'deactivated', $activation, ['hwid' => $hwid]);
        }
    }

    /**
     * Trial: reusa el existente por hwid (evita resetear reinstalando) o crea uno.
     * En ambos casos activa el dispositivo, así el flujo queda idéntico al de
     * una licencia comprada — Electron guarda el mismo license_key para siempre.
     */
    public function startTrial(App $app, string $hwid, ?string $deviceId, ?string $deviceName, ?string $ip): array
    {
        $license = $this->findExistingTrial($app, $hwid);
        $alreadyUsed = (bool) $license;

        if (!$license) {
            $license = $this->createTrial($app, $hwid, $deviceId, $deviceName);
        }

        $this->ensureUsable($license); // si el trial ya venció, esto lanza EXPIRED

        $activation = $this->activateDevice($license, $hwid, $deviceId, $deviceName, $ip, null);

        return [$license, $activation, $alreadyUsed];
    }
}
