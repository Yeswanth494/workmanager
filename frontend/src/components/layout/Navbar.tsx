import { useEffect, useState } from 'react'
import { Menu, Search, Bell, ChevronDown, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { Breadcrumbs } from './Breadcrumbs'
import { notificationService } from '@/services/notificationService'

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  async function loadUnreadCount() {
    try {
      setUnreadCount(await notificationService.getUnreadCount())
    } catch {
      // Notification count should never block the shell.
    }
  }

  useEffect(() => {
    void loadUnreadCount()
    const handler = () => void loadUnreadCount()
    window.addEventListener('notifications:changed', handler)
    return () => window.removeEventListener('notifications:changed', handler)
  }, [])

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const q = search.trim().toLowerCase()
    if (!q) return
    if (q.includes('employee')) navigate('/app/employees')
    else if (q.includes('project')) navigate('/app/projects')
    else if (q.includes('task')) navigate('/app/tasks')
    else if (q.includes('leave')) navigate(user?.role === 'EMPLOYEE' ? '/app/leave' : '/app/leave/approvals')
    else if (q.includes('time')) navigate(user?.role === 'EMPLOYEE' ? '/app/timesheets' : '/app/timesheets/approvals')
    else if (q.includes('report')) navigate('/app/reports')
  }

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenuClick} className="rounded-xl p-2 text-text-muted hover:bg-bg lg:hidden" aria-label="Open menu">
        <Menu className="size-5" />
      </button>

      <div className="hidden lg:block">
        <Breadcrumbs />
      </div>

      <form onSubmit={submitSearch} className="relative ml-auto hidden w-full max-w-[360px] md:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search employees, projects, tasks..."
          className="h-10 w-full rounded-xl border border-border-strong bg-bg pl-9 pr-3 text-sm text-text outline-none transition focus:border-accent-500 focus:bg-surface"
        />
      </form>

      <button
        type="button"
        onClick={() => navigate('/app/notifications')}
        className="relative rounded-xl p-2.5 text-text-muted hover:bg-bg"
        aria-label="Notifications"
      >
        <Bell className="size-[19px]" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[9px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <Dropdown
        trigger={
          <button className="flex items-center gap-2 rounded-xl p-1.5 pr-1 hover:bg-bg">
            <Avatar name={user?.name ?? '?'} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="max-w-[120px] truncate text-sm font-medium text-text">{user?.name}</p>
              <p className="text-[11px] text-text-muted">{user?.role}</p>
            </div>
            <ChevronDown className="size-4 text-text-faint" />
          </button>
        }
      >
        <DropdownItem onClick={() => navigate('/app/profile')}><UserIcon className="size-4" />Profile</DropdownItem>
        <DropdownItem onClick={() => navigate('/app/profile/preferences')}><Settings className="size-4" />Preferences</DropdownItem>
        <div className="my-1 border-t border-border" />
        <DropdownItem onClick={logout} className="text-danger-600"><LogOut className="size-4" />Log out</DropdownItem>
      </Dropdown>
    </header>
  )
}
