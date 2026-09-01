import { Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={clsx('size-5 animate-spin text-accent-600', className)} />
}
