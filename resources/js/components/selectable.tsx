import type { LucideIcon } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
interface Option {
    value: string | number;
    label: string;
    /** Opción deshabilitada individualmente */
    disabled?: boolean;
}

interface SelectableProps {
    value: string | null | undefined;
    onValueChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    /** Texto del ítem "todos" — ej: "Todos los almacenes" */
    labelAll?: string;
    /** Muestra el ítem "todos/all" — true por defecto (filtros), false para formularios */
    showAll?: boolean;
    /** Valor por defecto para el select */
    defaultValue?: string;
    /** Ícono a la izquierda del trigger */
    icon?: LucideIcon;
    /** Deshabilita todo el select */
    disabled?: boolean;
    /** Marca el campo como requerido (borde rojo si está vacío y aria-invalid) */
    required?: boolean;
    /** Mensaje de error externo (ej: de Inertia useForm errors) */
    error?: string;
    className?: string;
    /** Tamaño del trigger */
    size?: 'xs' | 'sm' | 'default' | 'lg';
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────
export const Selectable = ({
    value,
    onValueChange,
    options,
    placeholder = 'Seleccionar...',
    labelAll = 'Todos',
    showAll = true, // true → modo filtro | false → modo formulario
    defaultValue = 'all',
    icon: Icon,
    disabled = false,
    required = false,
    error,
    className,
    // size        = "default",
}: SelectableProps) => {
    // Valor interno — cuando showAll=true, un value vacío/null = "all"
    const internalValue = showAll ? value || defaultValue : value || '';

    // Si hay error o el campo es requerido y está vacío → aria-invalid
    const isInvalid = !!error || (required && !value);

    const handleChange = (val: string) => {
        // Si showAll=true y el usuario elige "all", devolvemos "" al padre
        onValueChange(val === defaultValue ? '' : val);
    };

    return (
        <div className="w-full space-y-1">
            <Select
                defaultValue={defaultValue}
                value={internalValue}
                onValueChange={handleChange}
                disabled={disabled}
            >
                <SelectTrigger
                    // size={size}
                    aria-invalid={isInvalid || undefined}
                    aria-required={required || undefined}
                    className={cn(
                        'w-full',
                        // Si hay error → borde rojo (lo maneja aria-invalid en el SelectTrigger)
                        isInvalid &&
                            'border-destructive/70 focus-visible:ring-destructive/20',
                        className,
                    )}
                >
                    {/* Ícono opcional */}
                    {Icon && (
                        <Icon className="size-4 shrink-0 text-muted-foreground/60" />
                    )}
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent position="item-aligned">
                    {/* Ítem "todos" — solo en modo filtro */}
                    {showAll && (
                        <>
                            <SelectItem value={defaultValue}>
                                {labelAll}
                            </SelectItem>
                            {options.length > 0 && <SelectSeparator />}
                        </>
                    )}

                    {/* Opciones */}
                    {options.map((opt) => (
                        <SelectItem
                            key={opt.value}
                            value={opt.value.toString()}
                            disabled={opt.disabled}
                        >
                            {opt.label}
                        </SelectItem>
                    ))}

                    {/* Estado vacío */}
                    {options.length === 0 && (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            Sin opciones disponibles
                        </div>
                    )}
                </SelectContent>
            </Select>

            {/* Mensaje de error */}
            {error && (
                <p className="text-xs font-medium text-destructive">{error}</p>
            )}
        </div>
    );
};
