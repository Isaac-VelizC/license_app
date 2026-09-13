<?php

namespace App\Services;

use App\services\LicenseSignatureService;

use RuntimeException;

class RecoveryCodeService
{
    public function __construct(private readonly LicenseSignatureService $signatureService) {}

    public function generate(string $licenseKey, ?string $hwid, int $ttlMinutes = 60): string
    {
        $issuedAt = now();
        $expiresAt = $issuedAt->copy()->addMinutes($ttlMinutes);

        $payload = [
            'license_key' => $licenseKey,
            'hwid'        => $hwid,
            'issued_at'   => $issuedAt->toIso8601String(),
            'expires_at'  => $expiresAt->toIso8601String(),
        ];

        $signature = $this->signatureService->signRaw($this->canonicalize($payload));

        $payloadPart   = $this->base64UrlEncode(json_encode($payload));
        $signaturePart = $this->base64UrlEncode($signature);

        return "{$payloadPart}.{$signaturePart}";
    }

    private function canonicalize(array $payload): string
    {
        return implode('|', [
            $payload['license_key'],
            $payload['hwid'] ?? '',
            $payload['issued_at'],
            $payload['expires_at'],
        ]);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
