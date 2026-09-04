import { cn } from "@/lib/utils"
import * as React from "react"

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
type InputVariant = "outline" | "filled"
type InputState   = "default" | "error" | "success"

type InputProps = React.ComponentProps<"input"> & {
  /** Estilo visual del input */
  variant?: InputVariant
  /** Estado semántico — sobreescribe aria-invalid */
  inputState?: InputState
  /** Ícono a la izquierda — cualquier componente SVG (ej: Lucide) */
  leftIcon?: React.ElementType
  /** Ícono a la derecha — útil para botones de mostrar/ocultar contraseña, etc. */
  rightIcon?: React.ElementType
  /** Callback al hacer click en el ícono derecho */
  onRightIconClick?: () => void
}

// ─────────────────────────────────────────────────────────────
// ESTILOS BASE — compartidos por ambas variantes
// ─────────────────────────────────────────────────────────────
const baseInput = [
  // Layout y tipografía
  "flex h-9 w-full min-w-0 text-sm",
  "placeholder:text-muted-foreground/60",
  "selection:bg-primary/15 selection:text-foreground",

  // Comportamiento
  "outline-none transition-colors duration-150",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

  // Archivo
  "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
]

// ─────────────────────────────────────────────────────────────
// VARIANTES VISUALES
// ─────────────────────────────────────────────────────────────
const variantStyles: Record<InputVariant, string> = {
  outline: [
    "rounded-md border border-input bg-background",
    "shadow-[0_1px_2px_0_rgb(0,0,0,0.04)]",                    // sombra muy sutil
    "hover:border-input/80",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
  ].join(" "),

  filled: [
    "rounded-md border border-transparent bg-background",
    "hover:bg-muted/40",
    "focus-visible:bg-background focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20",
  ].join(" "),
}

// ─────────────────────────────────────────────────────────────
// ESTADOS SEMÁNTICOS
// ─────────────────────────────────────────────────────────────
const stateStyles: Record<InputState, string> = {
  default: "",
  error: [
    "border-destructive/70 focus-visible:border-destructive",
    "focus-visible:ring-destructive/20",
    "dark:focus-visible:ring-destructive/30",
  ].join(" "),
  success: [
    "border-emerald-500/70 focus-visible:border-emerald-500",
    "focus-visible:ring-emerald-500/20",
    "dark:focus-visible:ring-emerald-500/30",
  ].join(" "),
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant = "outline",
      inputState = "default",
      leftIcon:  LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
      ...props
    },
    ref
  ) => {
    // Padding horizontal dinámico según íconos presentes
    const paddingLeft  = LeftIcon  ? "pl-9"  : "px-3"
    const paddingRight = RightIcon ? "pr-9"  : "pr-3"

    return (
      <div className="relative w-full">

        {/* Ícono izquierdo */}
        {LeftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <LeftIcon className="size-4 text-muted-foreground/70 shrink-0" />
          </span>
        )}

        <input
          ref={ref}
          type={type}
          data-slot="input"
          data-variant={variant}
          data-state={inputState}
          className={cn(
            baseInput,
            variantStyles[variant],
            stateStyles[inputState],
            // aria-invalid heredado del padre (ej: react-hook-form)
            "aria-invalid:border-destructive/70 aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive/20",
            paddingLeft,
            paddingRight,
            "py-1",
            className
          )}
          {...props}
        />

        {/* Ícono derecho — clickeable si tiene handler, decorativo si no */}
        {RightIcon && (
          <span
            className={cn(
              "absolute inset-y-0 right-0 flex items-center pr-3",
              onRightIconClick
                ? "cursor-pointer text-muted-foreground/70 hover:text-foreground" // transition-colors
                : "pointer-events-none text-muted-foreground/70"
            )}
            onClick={onRightIconClick}
            role={onRightIconClick ? "button" : undefined}
            aria-label={onRightIconClick ? "Acción del campo" : undefined}
          >
            <RightIcon className="size-4 shrink-0" />
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
export type { InputProps, InputVariant, InputState }
