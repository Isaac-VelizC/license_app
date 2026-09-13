<?php

namespace App\Console\Commands;

use App\Models\License;
use App\Services\RecoveryCodeService;
use Illuminate\Console\Attributes\{Description, Signature};
use Illuminate\Console\Command;

#[Signature(
    'license:recovery-code
    {license_key : La clave de licencia del cliente}
    {--hwid= : hwid de la PC específica (opcional, más seguro si lo tienes)}
    {--minutes=60 : Minutos de validez del código}'
)]
#[Description('Genera un código de recuperación de contraseña de administrador para un cliente.')]
class GenerateRecoveryCode extends Command
{
    public function handle(RecoveryCodeService $service): int
    {
        $licenseKey = $this->argument('license_key');

        $license = License::where('license_key', $licenseKey)->first();
        if (! $license) {
            $this->error("No se encontró ninguna licencia con la clave: {$licenseKey}");
            return self::FAILURE;
        }

        $code = $service->generate($licenseKey, $this->option('hwid'), (int) $this->option('minutes'));

        $this->info('Código de recuperación generado:');
        $this->line('');
        $this->line($code);
        $this->line('');
        $this->warn("Válido por {$this->option('minutes')} minutos. Envíaselo al cliente por un canal seguro.");

        return self::SUCCESS;
    }
}
