import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'
import { AdminDashboard } from './AdminDashboard'
import { ManagerDashboard } from './ManagerDashboard'
import { EmployeeDashboard } from './EmployeeDashboard'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text">
          {greeting()}, {user?.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-text-muted">Here's what's happening across your workspace today.</p>
      </div>

      {user?.role === ROLES.ADMIN && <AdminDashboard />}
      {user?.role === ROLES.MANAGER && <ManagerDashboard />}
      {user?.role === ROLES.EMPLOYEE && <EmployeeDashboard />}
    </div>
  )
}
