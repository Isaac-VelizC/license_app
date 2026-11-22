import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface UseConfirmActionOptions<T> {
    /** Construye la URL a partir del item que se está confirmando */
    action: (item: T) => string;
    method?: 'delete' | 'patch' | 'put' | 'post';
    onSuccess?: () => void;
}

/**
 * Centraliza el patrón "item pendiente de confirmar + processing + ejecutar"
 * que se repite en cada tabla/página con acciones destructivas o de estado
 * (desactivar app, eliminar plan/cliente, suspender/revocar licencia, etc.).
 */
export function useConfirmAction<T>({
    action,
    method = 'patch',
    onSuccess,
}: UseConfirmActionOptions<T>) {
    const [pendingItem, setPendingItem] = useState<T | null>(null);
    const [processing, setProcessing] = useState(false);

    const request = useCallback(
        (url: string) => {
            const options = {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setPendingItem(null);
                },
                onSuccess,
            };

            if (method === 'delete') router.delete(url, options);
            else if (method === 'put') router.put(url, {}, options);
            else if (method === 'post') router.post(url, {}, options);
            else router.patch(url, {}, options);
        },
        [method, onSuccess],
    );

    const confirm = useCallback(() => {
        if (!pendingItem) return;
        request(action(pendingItem));
    }, [pendingItem, action, request]);

    return {
        /** Pasar al onClick que abre la confirmación: onDelete={ask} */
        ask: setPendingItem,
        /** El item actualmente pendiente — úsalo para el texto del modal */
        pendingItem,
        /** Cierra sin confirmar */
        cancel: () => setPendingItem(null),
        /** Ejecuta la acción sobre pendingItem */
        confirm,
        processing,
    };
}
