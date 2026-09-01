export const APP_NAME = 'WorkSphere'

export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-success-600 bg-success-50',
  PENDING: 'text-warning-600 bg-warning-50',
  ON_HOLD: 'text-warning-600 bg-warning-50',
  APPROVED: 'text-success-600 bg-success-50',
  REJECTED: 'text-danger-600 bg-danger-50',
  CANCELLED: 'text-danger-600 bg-danger-50',
  COMPLETED: 'text-info-600 bg-info-50',
  PLANNING: 'text-text-muted bg-bg',
}
