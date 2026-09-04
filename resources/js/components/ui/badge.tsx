import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// BASE + TAMAÑOS + VARIANTES BASE
// ─────────────────────────────────────────────────────────────
const badgeVariants = cva(
  // Base compartida por todos
  [
    "inline-flex items-center justify-center font-medium w-fit whitespace-nowrap shrink-0",
    "gap-1 [&>svg]:pointer-events-none", // transition-colors
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "aria-invalid:border-destructive overflow-hidden",
  ],
  {
    variants: {
      // ── Tamaños ───────────────────────────────────────────
      size: {
        xs: "h-4 px-1.5 text-[10px] rounded [&>svg]:size-2.5",
        sm: "h-5 px-2   text-xs   rounded-md [&>svg]:size-3",
        md: "h-6 px-2.5 text-xs   rounded-md [&>svg]:size-3",
        lg: "h-7 px-3   text-sm   rounded-lg [&>svg]:size-3.5",
      },

      // ── Estilo de variante ────────────────────────────────
      variant: {
        solid:   "",   // fondo sólido, texto blanco/oscuro
        outline: "",   // borde sólido, fondo transparente
        dash:    "",   // borde dashed, fondo transparente
        soft:    "",   // fondo muy suave (10-15% opacidad)
        ghost:   "",   // sin borde visible, fondo casi nulo
      },

      // ── Color semántico ───────────────────────────────────
      color: {
        neutral:   "",
        primary:   "",
        secondary: "",
        accent:    "",
        info:      "",
        success:   "",
        warning:   "",
        danger:    "",
      },
    },

    // ─────────────────────────────────────────────────────────
    // COMPOUND VARIANTS — variant × color
    // ─────────────────────────────────────────────────────────
    compoundVariants: [

      // ══════════════ SOLID ══════════════
      { variant: "solid", color: "neutral",   class: "bg-zinc-700   text-white  border-transparent dark:bg-zinc-600" },
      { variant: "solid", color: "primary",   class: "bg-violet-600   text-white  border-transparent dark:bg-violet-500" },
      { variant: "solid", color: "secondary", class: "bg-slate-500  text-white  border-transparent dark:bg-slate-400" },
      { variant: "solid", color: "accent",    class: "bg-pink-500   text-white  border-transparent dark:bg-pink-400" },
      { variant: "solid", color: "info",      class: "bg-sky-500    text-white  border-transparent dark:bg-sky-400" },
      { variant: "solid", color: "success",   class: "bg-emerald-600 text-white border-transparent dark:bg-emerald-500" },
      { variant: "solid", color: "warning",   class: "bg-amber-500  text-white  border-transparent dark:bg-amber-400" },
      { variant: "solid", color: "danger",    class: "bg-red-600    text-white  border-transparent dark:bg-red-500" },
      // { variant: "solid", color: "purple",    class: "bg-violet-600 text-white  border-transparent dark:bg-violet-500" },

      // ══════════════ OUTLINE ══════════════
      { variant: "outline", color: "neutral",   class: "border border-zinc-500   text-zinc-700   dark:text-zinc-300 bg-transparent" },
      { variant: "outline", color: "primary",   class: "border border-violet-600   text-violet-600   dark:text-violet-400 bg-transparent" },
      { variant: "outline", color: "secondary", class: "border border-slate-500  text-slate-600  dark:text-slate-400 bg-transparent" },
      { variant: "outline", color: "accent",    class: "border border-pink-500   text-pink-600   dark:text-pink-400 bg-transparent" },
      { variant: "outline", color: "info",      class: "border border-sky-500    text-sky-600    dark:text-sky-400 bg-transparent" },
      { variant: "outline", color: "success",   class: "border border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-transparent" },
      { variant: "outline", color: "warning",   class: "border border-amber-500  text-amber-600  dark:text-amber-400 bg-transparent" },
      { variant: "outline", color: "danger",    class: "border border-red-600    text-red-600    dark:text-red-400 bg-transparent" },
      // { variant: "outline", color: "purple",    class: "border border-violet-600 text-violet-600 dark:text-violet-400 bg-transparent" },

      // ══════════════ DASH ══════════════
      { variant: "dash", color: "neutral",   class: "border border-dashed border-zinc-500   text-zinc-700   dark:text-zinc-300 bg-transparent" },
      { variant: "dash", color: "primary",   class: "border border-dashed border-violet-600   text-violet-600   dark:text-violet-400 bg-transparent" },
      { variant: "dash", color: "secondary", class: "border border-dashed border-slate-500  text-slate-600  dark:text-slate-400 bg-transparent" },
      { variant: "dash", color: "accent",    class: "border border-dashed border-pink-500   text-pink-600   dark:text-pink-400 bg-transparent" },
      { variant: "dash", color: "info",      class: "border border-dashed border-sky-500    text-sky-600    dark:text-sky-400 bg-transparent" },
      { variant: "dash", color: "success",   class: "border border-dashed border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-transparent" },
      { variant: "dash", color: "warning",   class: "border border-dashed border-amber-500  text-amber-600  dark:text-amber-400 bg-transparent" },
      { variant: "dash", color: "danger",    class: "border border-dashed border-red-600    text-red-600    dark:text-red-400 bg-transparent" },
      // { variant: "dash", color: "purple",    class: "border border-dashed border-violet-600 text-violet-600 dark:text-violet-400 bg-transparent" },

      // ══════════════ SOFT ══════════════
      { variant: "soft", color: "neutral",   class: "border-transparent bg-zinc-200   text-zinc-800   dark:bg-zinc-800   dark:text-zinc-200" },
      { variant: "soft", color: "primary",   class: "border-transparent bg-violet-100   text-violet-800   dark:bg-violet-950   dark:text-violet-300" },
      { variant: "soft", color: "secondary", class: "border-transparent bg-slate-200  text-slate-700  dark:bg-slate-800  dark:text-slate-300" },
      { variant: "soft", color: "accent",    class: "border-transparent bg-pink-100   text-pink-800   dark:bg-pink-950   dark:text-pink-300" },
      { variant: "soft", color: "info",      class: "border-transparent bg-sky-100    text-sky-800    dark:bg-sky-950    dark:text-sky-300" },
      { variant: "soft", color: "success",   class: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
      { variant: "soft", color: "warning",   class: "border-transparent bg-amber-100  text-amber-800  dark:bg-amber-950  dark:text-amber-300" },
      { variant: "soft", color: "danger",    class: "border-transparent bg-red-100    text-red-800    dark:bg-red-950    dark:text-red-300" },
      // { variant: "soft", color: "purple",    class: "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300" },

      // ══════════════ GHOST ══════════════
      { variant: "ghost", color: "neutral",   class: "border-transparent bg-transparent text-zinc-700   hover:bg-zinc-100   dark:text-zinc-300 dark:hover:bg-zinc-800" },
      { variant: "ghost", color: "primary",   class: "border-transparent bg-transparent text-violet-600   hover:bg-violet-50    dark:text-violet-400 dark:hover:bg-violet-950" },
      { variant: "ghost", color: "secondary", class: "border-transparent bg-transparent text-slate-600  hover:bg-slate-100  dark:text-slate-400 dark:hover:bg-slate-800" },
      { variant: "ghost", color: "accent",    class: "border-transparent bg-transparent text-pink-600   hover:bg-pink-50    dark:text-pink-400 dark:hover:bg-pink-950" },
      { variant: "ghost", color: "info",      class: "border-transparent bg-transparent text-sky-600    hover:bg-sky-50     dark:text-sky-400 dark:hover:bg-sky-950" },
      { variant: "ghost", color: "success",   class: "border-transparent bg-transparent text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950" },
      { variant: "ghost", color: "warning",   class: "border-transparent bg-transparent text-amber-600  hover:bg-amber-50   dark:text-amber-400 dark:hover:bg-amber-950" },
      { variant: "ghost", color: "danger",    class: "border-transparent bg-transparent text-red-600    hover:bg-red-50     dark:text-red-400 dark:hover:bg-red-950" },
      // { variant: "ghost", color: "purple",    class: "border-transparent bg-transparent text-violet-600 hover:bg-violet-50  dark:text-violet-400 dark:hover:bg-violet-950" },
    ],

    // ─────────────────────────────────────────────────────────
    // DEFAULTS
    // ─────────────────────────────────────────────────────────
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
    },
  }
)

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
export type BadgeVariant = "solid" | "outline" | "dash" | "soft" | "ghost"
export type BadgeColor = "neutral" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "danger"
export type BadgeSize = "xs" | "sm" | "md" | "lg"

export interface BadgeProps
  extends Omit<React.ComponentProps<"span">, "color">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────
function Badge({
  className,
  variant,
  color,
  size,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, color, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }