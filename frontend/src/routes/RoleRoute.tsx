import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/utils/constants'

export function RoleRoute({ allowed }: { allowed: Role[] }) {
  const { user } = useAuth()
  if (!user || !allowed.includes(user.role)) return <Navigate to="/app/dashboard" replace />
  return <Outlet />
}
