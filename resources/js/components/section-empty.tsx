import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
type SectionEmptyProps = {
    // Texto de búsqueda activo (muestra estado "sin resultados")
    isFilter: boolean;

    // Personalización opcional
    title?: string;
    description?: string;
    className?: string;

    // Acción primaria personalizada (ej: "Crear primer ítem")
    action?: {
        label: string;
        onClick: () => void;
    };
};

// ─────────────────────────────────────────────────────────────
// ÍCONOS
// ─────────────────────────────────────────────────────────────

// Ícono bandeja vacía — estado sin datos aún
const EmptyIcon = () => (
    <svg
        className="size-10 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
    </svg>
);

// Ícono lupa — estado sin resultados de búsqueda
const SearchEmptyIcon = () => (
    <svg
        className="size-10 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9l2 2 4-4"
            opacity="0"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.5 11.5l1 1 2-2"
            strokeWidth={1.5}
            opacity="0.5"
        />
    </svg>
);

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────
const SectionEmpty = ({
    isFilter,
    title,
    description,
    className,
    action,
}: SectionEmptyProps) => {
    // Textos por defecto según el modo
    const defaultTitle = isFilter ? 'Sin resultados' : 'Sin datos aún';

    const defaultDescription = isFilter
        ? 'No se encontraron resultados para el filtro aplicado'
        : 'Comienza agregando tu primer elemento.';

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center',
                'gap-3 px-6 py-16 text-center',
                className,
            )}
        >
            {/* Ícono con fondo suave */}
            <div
                className={cn(
                    'mb-1 flex items-center justify-center rounded-full p-5',
                    isFilter ? 'bg-sky-50 dark:bg-sky-950' : 'bg-muted/60',
                )}
            >
                {isFilter ? <SearchEmptyIcon /> : <EmptyIcon />}
            </div>

            {/* Título */}
            <h3 className="text-base font-semibold tracking-tight text-foreground">
                {title ?? defaultTitle}
            </h3>

            {/* Descripción */}
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {description ?? defaultDescription}
            </p>

            {/* Acciones */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {/* Acción primaria personalizada */}
                {action && (
                    <Button
                        variant={isFilter ? 'outline' : 'default'}
                        size="sm"
                        onClick={action.onClick}
                    >
                        {action.label}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SectionEmpty;
