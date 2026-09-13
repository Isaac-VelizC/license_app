<?php

namespace App\services;

use App\Models\License;
use OpenSSLAsymmetricKey;
use RuntimeException;

class LicenseSignatureService
{
    private OpenSSLAsymmetricKey $privateKey;

    public function __construct()
    {
        $path = base_path(config('licensing.signing_private_key_path'));

        if (! file_exists($path)) {
            throw new RuntimeException("No se encontró la clave privada de firma en: {$path}");
        }

        $pem = file_get_contents($path);
        $privateKey = openssl_pkey_get_private($pem);

        if ($privateKey === false) {
            throw new RuntimeException('No se pudo cargar la clave privada de firma: formato inválido o corrupto.');
        }

        // Se parsea UNA sola vez acá, no en cada sign() — la clave no cambia
        // durante la vida del servicio.
        $this->privateKey = $privateKey;
    }

    public function sign(License $license, string $hwid): array
    {
        $signedAt = now()->toIso8601String();

        $payload = $this->buildPayload(
            licenseKey: $license->license_key,
            appSlug: $license->app->slug,
            hwid: $hwid,
            status: $license->status->value,
            expiresAt: $license->expires_at?->toIso8601String(),
            signedAt: $signedAt,
        );

        $signature = '';
        $signed = openssl_sign($payload, $signature, $this->privateKey, OPENSSL_ALGO_SHA256);

        if ($signed === false) {
            // No se devuelve una firma vacía como si fuera válida — se detecta
            // el fallo acá, en vez de que Electron reciba una firma que nunca
            // va a verificar correctamente contra la clave pública.
            throw new RuntimeException('Error al generar la firma de la licencia: ' . openssl_error_string());
        }

        return [
            'signature' => base64_encode($signature),
            'signed_at' => $signedAt,
        ];
    }

    public function signRaw(string $payload): string
    {
        $signature = '';
        $signed = openssl_sign($payload, $signature, $this->privateKey, OPENSSL_ALGO_SHA256);

        if ($signed === false) {
            throw new \RuntimeException('Error al firmar: ' . openssl_error_string());
        }

        return $signature;
    }

    private function buildPayload(
        string $licenseKey,
        string $appSlug,
        string $hwid,
        string $status,
        ?string $expiresAt,
        string $signedAt,
    ): string {
        return implode('|', [
            $licenseKey,
            $appSlug,
            $hwid,
            $status,
            $expiresAt ?? '',
            $signedAt,
        ]);
    }
}
