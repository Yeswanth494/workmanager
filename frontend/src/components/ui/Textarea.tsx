import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={clsx(
            'min-h-24 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-faint',
            'transition-colors focus:border-accent-500',
            error ? 'border-danger-600' : 'border-border-strong',
            className,
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger-600">{error}</span>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
