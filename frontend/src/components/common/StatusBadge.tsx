import { Badge } from '@/components/ui/Badge'

const toneMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  ACTIVE: 'success',
  APPROVED: 'success',
  COMPLETED: 'info',
  PENDING: 'warning',
  ON_HOLD: 'warning',
  REJECTED: 'danger',
  CANCELLED: 'danger',
  PLANNING: 'neutral',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={toneMap[status] ?? 'neutral'}>
      {status.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
    </Badge>
  )
}
