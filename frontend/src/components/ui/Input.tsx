import { forwardRef, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-text placeholder:text-text-faint',
              'transition-colors focus:border-accent-500',
              icon && 'pl-9',
              error ? 'border-danger-600' : 'border-border-strong',
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-xs text-danger-600">{error}</span>
        ) : hint ? (
          <span className="text-xs text-text-muted">{hint}</span>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'
