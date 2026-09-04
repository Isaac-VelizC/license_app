<?php

namespace App\Enum;

enum LicenseStatusType: string
{
    case ACTIVE = 'active';
    case EXPIRED = 'expired';
    case SUSPENDED = 'suspended';
    case REVOKED = 'revoked';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Activo',
            self::EXPIRED => 'Expirado',
            self::SUSPENDED => 'Suspendido',
            self::REVOKED => 'Revocado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::ACTIVE => 'success',
            self::EXPIRED => 'warning',
            self::SUSPENDED, self::REVOKED => 'danger',
        };
    }

    public static function getOptions(bool $includeAll = false): array
    {
        $options = collect(self::cases())->map(fn($rol) => [
            'value' => $rol->value,
            'label' => $rol->label(),
            'color' => $rol->color(),
        ])->toArray();

        if ($includeAll) {
            array_unshift($options, ['value' => 'all', 'label' => 'Todas los estados']);
        }

        return $options;
    }
}
