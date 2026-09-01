import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

export function Profile() {
  const { user } = useAuth()
  const location = useLocation()
  const [tab, setTab] = useState(
    location.pathname.endsWith('/preferences') ? 'preferences' : 'overview',
  )

  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal and professional information." />
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={user?.name ?? '?'} size="lg" />
          <div>
            <h2 className="font-display text-lg font-semibold text-text">{user?.name}</h2>
            <p className="text-sm text-text-muted">{user?.title}</p>
          </div>
        </div>

        <div className="mt-6">
          <Tabs
            tabs={[
              { key: 'overview', label: 'Overview' },
              { key: 'security', label: 'Security' },
              { key: 'preferences', label: 'Preferences' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-text-muted">Email</p>
            <p className="text-sm text-text">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Department</p>
            <p className="text-sm text-text">{user?.department ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Role</p>
            <p className="text-sm capitalize text-text">{user?.role.toLowerCase()}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
