import { useEffect, useState, type ReactNode } from 'react';

/**
 * Renderiza sus hijos solo después de montar en el cliente. Evita mismatches
 * de hidratación SSR en cualquier contenido que dependa del entorno del
 * navegador (locale de fechas, Date.now(), etc.) — el HTML inicial del
 * servidor muestra el fallback; el cliente reemplaza con el valor real
 * apenas hidrata, sin comparar contra un render del servidor que nunca
 * podía coincidir exactamente.
 */
export function ClientOnly({
    children,
    fallback = null,
}: {
    children: ReactNode;
    fallback?: ReactNode;
}): ReactNode {
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return fallback;

    return children;
}
