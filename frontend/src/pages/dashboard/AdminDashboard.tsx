import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, FolderKanban, ListChecks, Clock3, UserCheck, UserX, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { dashboardService, type DashboardData } from '@/services/dashboardService'

function Stat({ label, value, caption, icon: Icon, rail, to }: { label: string; value: number; caption: string; icon: typeof Users; rail?: 'accent'|'success'|'warning'|'danger'; to: string }) {
  return (
    <Link to={to}>
      <Card rail={rail} interactive className="h-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-text">{value}</p>
            <p className="mt-1 text-xs text-text-faint">{caption}</p>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-bg text-text-muted">
            <Icon className="size-5" />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function ProgressRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-muted">{label}</span>
        <span className="font-medium text-text">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardService.getDashboard().then(setDashboard).catch((err) => setError(err instanceof Error ? err.message : 'Unable to load dashboard.')).finally(() => setLoading(false))
  }, [])

  if (loading) return <Card><p className="text-sm text-text-muted">Loading workspace dashboard...</p></Card>
  if (!dashboard) return <Card><p className="text-sm text-danger-600">{error || 'Unable to load dashboard.'}</p></Card>

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Stat label="Employees" value={dashboard.totalEmployees} caption="Active workforce" icon={Users} rail="accent" to="/app/employees" />
        <Stat label="Projects" value={dashboard.totalProjects} caption="Across the workspace" icon={FolderKanban} rail="success" to="/app/projects" />
        <Stat label="Tasks" value={dashboard.totalTasks} caption={`${dashboard.tasksCompleted} completed`} icon={ListChecks} to="/app/tasks" />
        <Stat label="Pending timesheets" value={dashboard.pendingTimesheets} caption="Awaiting review" icon={Clock3} rail="warning" to="/app/timesheets/approvals" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-semibold text-text">Task pipeline</h2>
              <p className="mt-1 text-xs text-text-muted">Live task distribution from the dashboard API.</p>
            </div>
            <Badge tone="neutral">{dashboard.totalTasks} total</Badge>
          </div>
          <div className="mt-6 space-y-5">
            <ProgressRow label="To do" value={dashboard.tasksTodo} total={dashboard.totalTasks} />
            <ProgressRow label="In progress" value={dashboard.tasksInProgress} total={dashboard.totalTasks} />
            <ProgressRow label="Review" value={dashboard.tasksInReview} total={dashboard.totalTasks} />
            <ProgressRow label="Completed" value={dashboard.tasksCompleted} total={dashboard.totalTasks} />
          </div>
          <div className="mt-6 flex justify-end">
            <Link to="/app/tasks"><Button variant="outline" size="sm">Open tasks <ArrowRight className="size-4" /></Button></Link>
          </div>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <Link to="/app/attendance"><Card rail="success" interactive className="h-full"><div className="flex items-center justify-between"><div><p className="text-sm text-text-muted">Present today</p><p className="mt-2 font-display text-3xl font-semibold">{dashboard.todayPresent}</p><p className="mt-1 text-xs text-text-faint">Team attendance</p></div><UserCheck className="size-5 text-success-600" /></div></Card></Link>
          <Link to="/app/leave/approvals"><Card rail="warning" interactive className="h-full"><div className="flex items-center justify-between"><div><p className="text-sm text-text-muted">Pending leave</p><p className="mt-2 font-display text-3xl font-semibold">{dashboard.pendingLeaves}</p><p className="mt-1 text-xs text-text-faint">Requests awaiting approval</p></div><UserX className="size-5 text-warning-600" /></div></Card></Link>
        </div>
      </div>
    </div>
  )
}
