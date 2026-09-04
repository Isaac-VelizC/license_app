import React from 'react'
import InputError from '../input-error'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value: string
  error?: string
  className?: string
}

function Textarea({
  value,
  error,
  placeholder = 'Describe detalladamente el servicio, qué incluye, beneficios, etc.',
  maxLength = 500,
  rows = 5,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <>
      <textarea
        className={`
          w-full
          placeholder:text-sm
          resize-none
          rounded-md
          border
          bg-background
          px-3
          py-1
          shadow-xs
          outline-none
          transition-[color,box-shadow]
          focus-visible:border-ring
          focus-visible:ring-ring/50
          focus-visible:ring-[3px]
          selection:bg-primary
          selection:text-primary-foreground
          ${
            error
              ? 'border-destructive ring-destructive/20 aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
              : 'border-input placeholder:text-muted-foreground/60'
          }
          ${className}
        `}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={!!error}
        {...props}
      />
      {error && <InputError message={error} />}
    </>
  )
}

export { Textarea }
