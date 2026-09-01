import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  dashboardService,
  type EmployeeDashboard as EmployeeDashboardData,
} from '@/services/dashboardService'

const taskStatusTone: Record<
    string,
    'danger' | 'warning' | 'neutral' | 'success'
> = {
  TODO: 'neutral',
  IN_PROGRESS: 'warning',
  REVIEW: 'danger',
  DONE: 'success',
}

export function EmployeeDashboard() {
  const [dashboard, setDashboard] =
      useState<EmployeeDashboardData | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError('')

        const data =
            await dashboardService.getMyDashboard()

        setDashboard(data)
      } catch (err) {
        console.error(
            'Failed to load employee dashboard:',
            err,
        )

        setError(
            err instanceof Error
                ? err.message
                : 'Failed to load dashboard',
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
        <div className="flex flex-col gap-6">
          <Card>
            <p className="text-sm text-text-muted">
              Loading dashboard...
            </p>
          </Card>
        </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !dashboard) {
    return (
        <div className="flex flex-col gap-6">
          <Card>
            <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              {error || 'Unable to load dashboard'}
            </div>
          </Card>
        </div>
    )
  }

  // =========================================================
  // OPEN TASKS
  // =========================================================

  const openTasks =
      dashboard.todoTasks +
      dashboard.inProgressTasks +
      dashboard.reviewTasks

  // =========================================================
  // TIMESHEET STATUS LABEL
  // =========================================================

  const timesheetStatusLabel =
      dashboard.timesheetStatus === 'NOT_SUBMITTED'
          ? 'Not submitted'
          : dashboard.timesheetStatus === 'PENDING_REVIEW'
              ? 'Pending review'
              : dashboard.timesheetStatus === 'DRAFT'
                  ? 'Draft'
                  : dashboard.timesheetStatus === 'APPROVED'
                      ? 'Approved'
                      : 'Rejected'

  return (
      <div className="flex flex-col gap-6">

        {/* =====================================================
          STAT CARDS
      ===================================================== */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* -----------------------------------------------------
            OPEN TASKS
        ----------------------------------------------------- */}

          <Card rail="accent">
            <p className="text-sm text-text-muted">
              My open tasks
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {openTasks}
            </p>

            <p className="mt-1 text-xs text-text-faint">
              {dashboard.completedTasks} completed
            </p>
          </Card>

          {/* -----------------------------------------------------
            LEAVE REQUESTS
        ----------------------------------------------------- */}

          <Card rail="success">
            <p className="text-sm text-text-muted">
              Leave requests
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {dashboard.totalLeaves}
            </p>

            <p className="mt-1 text-xs text-text-faint">
              {dashboard.approvedLeaves} approved
            </p>
          </Card>

          {/* -----------------------------------------------------
            THIS WEEK LOGGED
        ----------------------------------------------------- */}

          <Card>
            <p className="text-sm text-text-muted">
              This week logged
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {dashboard.thisWeekLoggedHours}h
            </p>

            <p className="mt-1 text-xs text-text-faint">
              Monday to today
            </p>
          </Card>

          {/* -----------------------------------------------------
            TIMESHEET STATUS
        ----------------------------------------------------- */}

          <Card rail="warning">
            <p className="text-sm text-text-muted">
              Timesheet status
            </p>

            <p className="mt-2 font-display text-lg font-semibold text-text">
              {timesheetStatusLabel}
            </p>

            <p className="mt-1 text-xs text-text-faint">
              Current timesheet
            </p>
          </Card>

        </div>

        {/* =====================================================
          TASK SUMMARY
      ===================================================== */}

        <Card>

          <div className="flex items-center justify-between">

            <div>
              <h3 className="font-display text-base font-semibold text-text">
                My task summary
              </h3>

              <p className="mt-1 text-xs text-text-muted">
                Current status of your assigned tasks.
              </p>
            </div>

            <span className="text-sm text-text-muted">
            {dashboard.totalTasks} total
          </span>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">

            {/* TODO */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                To do
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.todoTasks}
              </p>

              <Badge tone={taskStatusTone.TODO}>
                TODO
              </Badge>

            </div>

            {/* IN PROGRESS */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                In progress
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.inProgressTasks}
              </p>

              <Badge tone={taskStatusTone.IN_PROGRESS}>
                IN PROGRESS
              </Badge>

            </div>

            {/* REVIEW */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                Review
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.reviewTasks}
              </p>

              <Badge tone={taskStatusTone.REVIEW}>
                REVIEW
              </Badge>

            </div>

            {/* COMPLETED */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                Completed
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.completedTasks}
              </p>

              <Badge tone={taskStatusTone.DONE}>
                DONE
              </Badge>

            </div>

          </div>

        </Card>

        {/* =====================================================
          LEAVE SUMMARY
      ===================================================== */}

        <Card>

          <div>

            <h3 className="font-display text-base font-semibold text-text">
              Leave summary
            </h3>

            <p className="mt-1 text-xs text-text-muted">
              Overview of your leave requests.
            </p>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                Total
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.totalLeaves}
              </p>

            </div>

            {/* PENDING */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                Pending
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.pendingLeaves}
              </p>

            </div>

            {/* APPROVED */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                Approved
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.approvedLeaves}
              </p>

            </div>

            {/* REJECTED */}

            <div className="rounded-lg border border-border p-4">

              <p className="text-xs text-text-muted">
                Rejected
              </p>

              <p className="mt-2 font-display text-2xl font-semibold text-text">
                {dashboard.rejectedLeaves}
              </p>

            </div>

          </div>

        </Card>

      </div>
  )
}