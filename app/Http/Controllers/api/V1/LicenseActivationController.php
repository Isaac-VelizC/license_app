<?php

namespace App\Http\Controllers\api\V1;

use App\Exceptions\LicenseException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\{TrialRequest, ActivateLicenseRequest, ValidateLicenseRequest, DeactivateLicenseRequest};
use App\Models\{Activation, App, License};
use App\services\{LicenseSignatureService, LicenseService};
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class LicenseActivationController extends Controller
{
    public function __construct(
        private readonly LicenseSignatureService $signatureService,
        private readonly LicenseService $licenses,
    ) {}

    public function activate(ActivateLicenseRequest $request): JsonResponse
    {
        $app = $this->resolveApp($request->app_slug);
        if (! $app) {
            return $this->invalid('Aplicación no encontrada o inactiva.', 'APP_NOT_FOUND');
        }

        $license = $this->findLicense($request->license_key, $app->id);
        if (! $license) {
            return $this->invalid('Clave de licencia no válida para esta aplicación.', 'LICENSE_NOT_FOUND');
        }

        try {
            $activation = $this->licenses->activateDevice(
                $license,
                $request->hwid,
                $request->device_id,
                $request->device_name,
                $request->ip(),
                $request->app_version,
            );
        } catch (LicenseException $e) {
            return $this->invalid($e->getMessage(), $e->errorCode);
        }

        return $this->success($license, $activation, 'Licencia activada correctamente.');
    }

    public function validateLicense(ValidateLicenseRequest $request): JsonResponse
    {
        $app = $this->resolveApp($request->app_slug);
        if (! $app) {
            return $this->invalid('Aplicación no encontrada o inactiva.', 'APP_NOT_FOUND');
        }

        $license = $this->findLicense($request->license_key, $app->id);
        if (! $license) {
            return $this->invalid('Licencia no encontrada.', 'LICENSE_NOT_FOUND');
        }

        try {
            $this->licenses->validateDevice($license, $request->hwid, $request->ip());
        } catch (LicenseException $e) {
            return $this->invalid($e->getMessage(), $e->errorCode);
        }

        return $this->success($license, null, 'Licencia válida.');
    }

    public function deactivate(DeactivateLicenseRequest  $request): JsonResponse
    {
        $app = $this->resolveApp($request->app_slug);
        if (! $app) {
            return response()->json(['success' => false, 'message' => 'Aplicación no encontrada o inactiva.'], 404);
        }

        $license = $this->findLicense($request->license_key, $app->id);
        if (! $license) {
            return response()->json(['success' => false, 'message' => 'Licencia no encontrada.'], 404);
        }

        try {
            $this->licenses->deactivateDevice($license, $request->hwid);
        } catch (LicenseException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 404);
        }

        return response()->json(['success' => true, 'message' => 'Dispositivo desactivado correctamente.']);
    }

    public function trial(TrialRequest $request): JsonResponse
    {
        $app = $this->resolveApp($request->app_slug);
        if (! $app) {
            return $this->invalid('Aplicación no encontrada o inactiva.', 'APP_NOT_FOUND');
        }

        try {
            [$license, $activation, $alreadyUsed] = $this->licenses->startTrial(
                $app,
                $request->hwid,
                $request->device_id,
                $request->device_name,
                $request->ip(),
            );
        } catch (LicenseException $e) {
            return $this->invalid($e->getMessage(), $e->errorCode);
        } catch (\RuntimeException $e) {
            // App sin plan trial configurado — ver Plan::isFree()/App::trialPlan()
            return $this->invalid($e->getMessage(), 'UNKNOWN');
        }

        $signed = $this->signatureService->sign($license, $request->hwid);

        return response()->json([
            'valid' => true,
            'license_key' => $license->license_key, // Electron lo guarda: de acá en más se usa como una licencia normal
            'status' => $license->status->value,
            'trial_ends_at' => $license->expires_at?->toIso8601String(),
            'already_used' => $alreadyUsed,
            'signature' => $signed['signature'],
            'signed_at' => $signed['signed_at'],
            'message' => $alreadyUsed
                ? 'Este dispositivo ya tenía un trial registrado.'
                : 'Prueba de 7 días iniciada.',
        ]);
    }

    private function resolveApp(string $appSlug): ?App
    {
        return Cache::remember(
            "app:by-slug:{$appSlug}",
            now()->addHours(2),
            fn() =>
            App::query()->where('slug', $appSlug)->where('is_active', true)->first()
        );
    }

    private function findLicense(string $licenseKey, int $appId): ?License
    {
        return License::query()
            ->where('license_key', $licenseKey)
            ->where('app_id', $appId)
            ->first();
    }

    private function success(License $license, ?Activation $activation, string $message): JsonResponse
    {
        $hwid = $activation?->hwid;
        $signed = $this->signatureService->sign($license, $hwid ?? '');

        return response()->json([
            'valid' => true,
            'status' => $license->status->value,
            'max_devices' => $license->max_devices,
            'signature' => $signed['signature'],
            'signed_at' => $signed['signed_at'],
            'message' => $message,
        ]);
    }

    private function invalid(string $message, ?string $code = null): JsonResponse
    {
        return response()->json(['valid' => false, 'error_code' => $code, 'message' => $message]);
    }
}
