import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type Tone =
    | 'neutral'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'

interface BadgeProps
    extends HTMLAttributes<HTMLSpanElement> {
    tone?: Tone
    dot?: boolean
}

const toneClasses: Record<Tone, string> = {
    neutral: 'bg-bg text-text-muted',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
    info: 'bg-info-50 text-info-600',
}

export function Badge({
                          className,
                          tone = 'neutral',
                          dot,
                          children,
                          ...props
                      }: BadgeProps) {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                toneClasses[tone],
                dot && 'pulse-dot',
                className,
            )}
            {...props}
        >
      {children}
    </span>
    )
}