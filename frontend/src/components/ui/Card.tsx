import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type RailColor = 'accent' | 'success' | 'warning' | 'danger' | 'none'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  rail?: RailColor
  interactive?: boolean
}

const railClasses: Record<RailColor, string> = {
  accent: 'border-l-accent-500',
  success: 'border-l-success-600',
  warning: 'border-l-warning-600',
  danger: 'border-l-danger-600',
  none: '',
}

export function Card({
  className,
  rail = 'none',
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04)]',
        'p-5',
        rail !== 'none' && 'border-l-[3px]',
        railClasses[rail],
        interactive && 'transition-all hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
