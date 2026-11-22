import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function truncateValue(
    value: string | null | undefined,
    length: number,
) {
    if (!value) {
        return '—';
    }

    return value.length > length ? `${value.slice(0, length)}...` : value;
}

/**
 * Formatea una fecha ISO a "DD mmm YYYY" (ej. "15 mar 2026").
 * Fallback genérico para null/inválida — NO conoce reglas de negocio
 * (ej. "Vitalicio" para licencias). Esa interpretación le corresponde
 * al componente que llama, usando el campo de dominio correcto
 * (ej. license.is_lifetime), no a esta función.
 */
export function formatDate(
    dateString: string | null | undefined,
    locale: string = 'es-BO',
): string {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Variante con hora — útil para vistas de auditoría/logs donde el
 * momento exacto importa (ej. "15 mar 2026, 14:32").
 */
export function formatDateTime(
    dateString: string | null | undefined,
    locale: string = 'es-BO',
): string {
    if (!dateString) return '—';

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
