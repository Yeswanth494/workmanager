import type { ReactNode } from 'react'

interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: ReactNode
}

export function EmptyState({
                               icon,
                               title,
                               description,
                               action,
                           }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-16 text-center">
            {icon && <div className="text-text-faint">{icon}</div>}

            <div>
                <h3 className="font-display text-base font-semibold text-text">
                    {title}
                </h3>

                {description && (
                    <p className="mt-1 text-sm text-text-muted">
                        {description}
                    </p>
                )}
            </div>

            {action}
        </div>
    )
}