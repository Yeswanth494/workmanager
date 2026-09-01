import { clsx } from 'clsx'
import { initials } from '@/utils/formatters'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-12 text-base',
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full bg-ink-800 font-semibold text-white',
        sizeClasses[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  )
}
