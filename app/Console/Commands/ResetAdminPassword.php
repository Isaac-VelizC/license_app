<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

#[Signature('admin:reset-password')]
#[Description('Restablecer la contraseña del administrador')]
class ResetAdminPassword extends Command
{
    public function handle(): int
    {
        $email = 'aisakveliz@aisak.dev';

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error('No se encontró el usuario administrador.');

            return self::FAILURE;
        }

        $password = $this->secret('Nueva contraseña');

        if (!is_string($password) || strlen($password) < 12) {
            $this->error('La contraseña debe tener al menos 12 caracteres.');

            return self::FAILURE;
        }

        $confirmation = $this->secret('Confirmar nueva contraseña');

        if ($password !== $confirmation) {
            $this->error('Las contraseñas no coinciden.');

            return self::FAILURE;
        }


        if (!$this->confirm('¿Confirmas el cambio de contraseña?', false)) {
            $this->warn('Operación cancelada.');

            return self::SUCCESS;
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info('Contraseña actualizada correctamente.');

        return self::SUCCESS;
    }
}
