<?php

namespace App\Enum;

enum OrderStatusType: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case EXPIRED = 'expired';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pendiente',
            self::PAID => 'Pagado',
            self::EXPIRED => 'Expirado',
            self::REFUNDED => 'Reembolsado',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::PENDING => 'success',
            self::PAID => 'warning',
            self::EXPIRED, self::REFUNDED => 'danger',
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
