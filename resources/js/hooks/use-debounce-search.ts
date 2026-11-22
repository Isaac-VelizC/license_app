import { router } from '@inertiajs/react';
import { useCallback, useRef, useState, useEffect } from 'react';

interface UseDebounceSearchOptions {
    /** Tiempo de debounce en milisegundos (default: 500) */
    delay?: number;
    /** Props que se deben recargar al buscar (default: ['data']) */
    only?: string[];
    /** Callback adicional antes de la búsqueda */
    onBeforeSearch?: (value: string) => void;
    /** Callback después de la búsqueda */
    onAfterSearch?: (value: string) => void;
    /** Mínimo de caracteres para buscar (default: 2) */
    minChars?: number;
}

interface UseDebounceSearchReturn {
    /** Valor actual del input */
    searchValue: string;
    /** Setter para el valor del input */
    setSearchValue: (value: string) => void;
    /** Función de búsqueda con debounce */
    debouncedSearch: (value: string) => void;
    /** Limpiar búsqueda */
    clearSearch: () => void;
    /** Si está buscando (loading) */
    isSearching: boolean;
}

/**
 * Hook personalizado para búsqueda con debounce y gestión de URL params
 */
export function useDebounceSearch(
    initialValue: string = '',
    options: UseDebounceSearchOptions = {},
): UseDebounceSearchReturn {
    const {
        delay = 500,
        only = ['data'],
        onBeforeSearch,
        onAfterSearch,
        minChars = 2,
    } = options;

    const [searchValue, setSearchValue] = useState(initialValue);
    const [isSearching, setIsSearching] = useState(false);
    const timeoutRef = useRef<number>(200);
    const searchRef = useRef<string>('');

    // Función de búsqueda con debounce optimizada
    const debouncedSearch = useCallback(
        (value: string) => {
            // No buscar si es muy corto
            if (value.length < minChars && value !== '') {
                return;
            }

            // Evitar búsquedas duplicadas
            if (searchRef.current === value) {
                return;
            }

            // Limpiar timeout anterior
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Configurar nuevo timeout
            timeoutRef.current = window.setTimeout(() => {
                searchRef.current = value;
                onBeforeSearch?.(value);

                // Actualizar URL params
                const params = new URLSearchParams(window.location.search);

                if (value.trim()) {
                    params.set('search', value.trim());
                } else {
                    params.delete('search');
                }

                const currentPath = window.location.pathname;
                const newUrl = `${currentPath}?${params.toString()}`;
                window.history.pushState({}, '', newUrl);

                // Búsqueda asíncrona para no bloquear UI
                setIsSearching(true);

                router.reload({
                    only,
                    onFinish: () => {
                        setIsSearching(false);
                        onAfterSearch?.(value);
                    },
                });
            }, delay);
        },
        [delay, only, minChars, onBeforeSearch, onAfterSearch],
    );

    // Handler para cambios en el input
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchValue(value);
            debouncedSearch(value);
        },
        [debouncedSearch],
    );

    // Limpiar búsqueda
    const clearSearch = useCallback(() => {
        setSearchValue('');
        debouncedSearch('');
    }, [debouncedSearch]);

    // Sincronizar con URL params al montar - optimizado
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlSearch = params.get('search') || '';

        // Solo actualizar si es diferente al valor inicial
        if (urlSearch !== initialValue) {
            // Usar requestAnimationFrame para evitar bloqueo
            requestAnimationFrame(() => {
                setSearchValue(urlSearch);
            });
        }
    }, [initialValue]);

    // Cleanup al desmontar
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        searchValue,
        setSearchValue: handleSearchChange,
        debouncedSearch,
        clearSearch,
        isSearching,
    };
}
