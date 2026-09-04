import { Loader2, Search, X } from 'lucide-react'
import { Input } from './input'
import React from 'react'

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
type InputSearchProps = {
    search:           string
    onSearchChange:   (value: string) => void
    onClear?:         () => void
    placeholder?:     string
    // Variante visual del input
    variant?:         'outline' | 'filled'
    // Muestra spinner — útil cuando la búsqueda hace request al servidor
    loading?:         boolean
    // Ancho máximo personalizable
    className?:       string
    // Altura del input
    classNameInput?:  string
    // KeyDown para el lector
    onKeyDown?:       (e: React.KeyboardEvent<HTMLInputElement>) => void
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────
const InputSearch = ({
    search,
    onSearchChange,
    onClear,
    placeholder = 'Buscar...',
    variant     = 'filled',
    loading     = false,
    className,
    classNameInput,
    onKeyDown
}: InputSearchProps) => {

    const handleClear = () => {
        if (onClear) {
            onClear()
        } else {
            onSearchChange('')
        }
    }

    // Ícono derecho: spinner si cargando, X si hay texto, nada si vacío
    const RightIcon = loading ? undefined : search ? X : undefined

    return (
        <div className={className + ' relative border rounded-md overflow-hidden'}>
            <Input
                type="text"
                value={search}
                variant={variant}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                leftIcon={Search}
                rightIcon={RightIcon}
                onRightIconClick={search ? handleClear : undefined}
                autoComplete="off"
                spellCheck={false}
                className={classNameInput}
            />
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="size-4 animate-spin" />
                </div>
            )}

        </div>
    )
}

export { InputSearch }