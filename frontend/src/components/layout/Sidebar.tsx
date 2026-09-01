import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  Users,
  Building2,
  FolderKanban,
  ListChecks,
  CalendarDays,
  Clock3,
  ClipboardCheck,
  BarChart3,
  Bell,
  Waypoints,
  UserCheck,
} from 'lucide-react'
import { clsx } from 'clsx'

import { useAuth } from '@/hooks/useAuth'
import { NAV_BY_ROLE } from '@/utils/permissions'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', to: '/app/dashboard', icon: LayoutGrid },
  { key: 'employees', label: 'Employees', to: '/app/employees', icon: Users },
  { key: 'departments', label: 'Departments', to: '/app/departments', icon: Building2 },
  { key: 'projects', label: 'Projects', to: '/app/projects', icon: FolderKanban },
  { key: 'tasks', label: 'Tasks', to: '/app/tasks', icon: ListChecks },
  { key: 'attendance', label: 'Attendance', to: '/app/attendance', icon: UserCheck },
  { key: 'leave', label: 'Leave', to: '/app/leave', icon: CalendarDays },
  { key: 'leaveApprovals', label: 'Leave Approvals', to: '/app/leave/approvals', icon: ClipboardCheck },
  { key: 'timesheets', label: 'Timesheets', to: '/app/timesheets', icon: Clock3 },
  { key: 'timesheetApprovals', label: 'Timesheet Approvals', to: '/app/timesheets/approvals', icon: ClipboardCheck },
  { key: 'reports', label: 'Reports', to: '/app/reports', icon: BarChart3 },
  { key: 'notifications', label: 'Notifications', to: '/app/notifications', icon: Bell },
]

export function Sidebar({ className }: { className?: string }) {
  const { user } = useAuth()
  const allowed = user ? NAV_BY_ROLE[user.role] : []
  const roleLabel = user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'MANAGER' ? 'Manager' : 'Employee'

  return (
    <aside className={clsx('flex h-full w-[240px] shrink-0 flex-col bg-ink-900 text-white', className)}>
      <div className="flex h-[72px] items-center gap-3 border-b border-white/8 px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent-500 text-ink-950 shadow-sm">
          <Waypoints className="size-[19px]" strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[17px] font-semibold tracking-tight">WorkSphere</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Work management</p>
        </div>
      </div>

      <div className="px-4 pt-5">
        <div className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Signed in as</p>
          <p className="mt-1 truncate text-sm font-medium text-white/90">{user?.name ?? 'User'}</p>
          <p className="text-xs text-accent-300/80">{roleLabel}</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Workspace</p>
        <div className="space-y-1">
          {NAV_ITEMS.filter((item) => allowed.includes(item.key)).map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) => clsx(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-ink-700 text-white shadow-sm'
                  : 'text-white/58 hover:bg-white/[0.055] hover:text-white',
              )}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-2.5 h-5 w-0.5 rounded-full bg-accent-400" />}
                  <item.icon className={clsx('size-[18px] shrink-0', isActive ? 'text-accent-300' : 'text-white/45 group-hover:text-white/75')} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/8 px-5 py-4">
        <p className="text-[11px] text-white/35">WorkSphere v1.0</p>
        <p className="mt-0.5 text-[10px] text-white/25">React + Spring Boot</p>
      </div>
    </aside>
  )
}
