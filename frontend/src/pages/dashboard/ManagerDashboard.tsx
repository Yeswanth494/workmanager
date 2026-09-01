import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    CheckCircle2,
    Clock,
    FolderKanban,
    Users,
    UserCheck,
    UserX,
} from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import {
    dashboardService,
    type DashboardData,
} from '@/services/dashboardService'

export function ManagerDashboard() {
    const [dashboard, setDashboard] =
        useState<DashboardData | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError('')

                const data =
                    await dashboardService.getDashboard()

                setDashboard(data)
            } catch (err: any) {
                console.error(
                    'Failed to load manager dashboard:',
                    err,
                )

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to load dashboard',
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

    return (
        <div className="flex flex-col gap-6">

            {/* =====================================================
          STAT CARDS
      ===================================================== */}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

                {/* =================================================
            TEAM MEMBERS
        ================================================= */}

                <Link
                    to="/app/employees"
                    className="block rounded-xl transition-transform hover:-translate-y-0.5"
                >
                    <Card
                        rail="accent"
                        className="h-full cursor-pointer hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm text-text-muted">
                                    Team members
                                </p>

                                <p className="mt-2 font-display text-3xl font-semibold text-text">
                                    {dashboard.totalEmployees}
                                </p>

                                <p className="mt-1 text-xs text-text-faint">
                                    Employees
                                </p>
                            </div>

                            <Users className="size-5 text-text-muted" />

                        </div>
                    </Card>
                </Link>

                {/* =================================================
            PROJECTS
        ================================================= */}

                <Link
                    to="/app/projects"
                    className="block rounded-xl transition-transform hover:-translate-y-0.5"
                >
                    <Card
                        rail="success"
                        className="h-full cursor-pointer hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm text-text-muted">
                                    Projects
                                </p>

                                <p className="mt-2 font-display text-3xl font-semibold text-text">
                                    {dashboard.totalProjects}
                                </p>

                                <p className="mt-1 text-xs text-text-faint">
                                    Total projects
                                </p>
                            </div>

                            <FolderKanban className="size-5 text-text-muted" />

                        </div>
                    </Card>
                </Link>

                {/* =================================================
            TOTAL TASKS
        ================================================= */}

                <Link
                    to="/app/tasks"
                    className="block rounded-xl transition-transform hover:-translate-y-0.5"
                >
                    <Card
                        className="h-full cursor-pointer hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm text-text-muted">
                                    Total tasks
                                </p>

                                <p className="mt-2 font-display text-3xl font-semibold text-text">
                                    {dashboard.totalTasks}
                                </p>

                                <p className="mt-1 text-xs text-text-faint">
                                    Assigned tasks
                                </p>
                            </div>

                            <CheckCircle2 className="size-5 text-text-muted" />

                        </div>
                    </Card>
                </Link>

                {/* =================================================
            PENDING TIMESHEETS
        ================================================= */}

                <Link
                    to="/app/timesheets/approvals"
                    className="block rounded-xl transition-transform hover:-translate-y-0.5"
                >
                    <Card
                        rail="warning"
                        className="h-full cursor-pointer hover:shadow-md"
                    >
                        <div className="flex items-start justify-between">

                            <div>
                                <p className="text-sm text-text-muted">
                                    Pending timesheets
                                </p>

                                <p className="mt-2 font-display text-3xl font-semibold text-text">
                                    {dashboard.pendingTimesheets}
                                </p>

                                <p className="mt-1 text-xs text-text-faint">
                                    Awaiting review
                                </p>
                            </div>

                            <Clock className="size-5 text-text-muted" />

                        </div>
                    </Card>
                </Link>

            </div>

            {/* =====================================================
          TASK SUMMARY
      ===================================================== */}

            <Card>

                <div className="flex items-center justify-between">

                    <div>
                        <h3 className="font-display text-base font-semibold text-text">
                            Team task summary
                        </h3>

                        <p className="mt-1 text-xs text-text-muted">
                            Current status of all tasks.
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
                            {dashboard.tasksTodo}
                        </p>

                        <Badge tone="neutral">
                            TODO
                        </Badge>
                    </div>

                    {/* IN PROGRESS */}

                    <div className="rounded-lg border border-border p-4">
                        <p className="text-xs text-text-muted">
                            In progress
                        </p>

                        <p className="mt-2 font-display text-2xl font-semibold text-text">
                            {dashboard.tasksInProgress}
                        </p>

                        <Badge tone="warning">
                            IN PROGRESS
                        </Badge>
                    </div>

                    {/* REVIEW */}

                    <div className="rounded-lg border border-border p-4">
                        <p className="text-xs text-text-muted">
                            Review
                        </p>

                        <p className="mt-2 font-display text-2xl font-semibold text-text">
                            {dashboard.tasksInReview}
                        </p>

                        <Badge tone="danger">
                            REVIEW
                        </Badge>
                    </div>

                    {/* COMPLETED */}

                    <div className="rounded-lg border border-border p-4">
                        <p className="text-xs text-text-muted">
                            Completed
                        </p>

                        <p className="mt-2 font-display text-2xl font-semibold text-text">
                            {dashboard.tasksCompleted}
                        </p>

                        <Badge tone="success">
                            DONE
                        </Badge>
                    </div>

                </div>

            </Card>

            {/* =====================================================
          ATTENDANCE + LEAVE
      ===================================================== */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* =================================================
            ATTENDANCE
        ================================================= */}

                <Card>

                    <div className="flex items-center justify-between">

                        <div>
                            <h3 className="font-display text-base font-semibold text-text">
                                Today's attendance
                            </h3>

                            <p className="mt-1 text-xs text-text-muted">
                                Current team attendance.
                            </p>
                        </div>

                        <UserCheck className="size-5 text-success-600" />

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">

                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs text-text-muted">
                                Present
                            </p>

                            <p className="mt-2 font-display text-2xl font-semibold text-text">
                                {dashboard.todayPresent}
                            </p>
                        </div>

                        <div className="rounded-lg border border-border p-4">
                            <p className="text-xs text-text-muted">
                                Absent
                            </p>

                            <p className="mt-2 font-display text-2xl font-semibold text-text">
                                {dashboard.todayAbsent}
                            </p>
                        </div>

                    </div>

                </Card>

                {/* =================================================
            PENDING LEAVE
        ================================================= */}

                <Link
                    to="/app/leave/approvals"
                    className="block rounded-xl transition-transform hover:-translate-y-0.5"
                >
                    <Card
                        rail="warning"
                        className="h-full cursor-pointer hover:shadow-md"
                    >

                        <div className="flex items-center justify-between">

                            <div>
                                <h3 className="font-display text-base font-semibold text-text">
                                    Pending leave
                                </h3>

                                <p className="mt-1 text-xs text-text-muted">
                                    Leave requests awaiting approval.
                                </p>
                            </div>

                            <UserX className="size-5 text-warning-600" />

                        </div>

                        <p className="mt-5 font-display text-4xl font-semibold text-text">
                            {dashboard.pendingLeaves}
                        </p>

                        <p className="mt-1 text-xs text-text-faint">
                            Requests pending review
                        </p>

                    </Card>
                </Link>

            </div>

            {/* =====================================================
          TIMESHEET APPROVAL
      ===================================================== */}

            <Link
                to="/app/timesheets/approvals"
                className="block rounded-xl transition-transform hover:-translate-y-0.5"
            >
                <Card className="cursor-pointer hover:shadow-md">

                    <div className="flex items-center justify-between">

                        <div>
                            <h3 className="font-display text-base font-semibold text-text">
                                Timesheet approvals
                            </h3>

                            <p className="mt-1 text-xs text-text-muted">
                                Timesheets waiting for manager review.
                            </p>
                        </div>

                        <Badge
                            tone={
                                dashboard.pendingTimesheets > 0
                                    ? 'warning'
                                    : 'success'
                            }
                            dot
                        >
                            {dashboard.pendingTimesheets > 0
                                ? `${dashboard.pendingTimesheets} pending`
                                : 'All reviewed'}
                        </Badge>

                    </div>

                    <div className="mt-5 rounded-lg border border-border bg-bg p-5">

                        {dashboard.pendingTimesheets > 0 ? (
                            <div className="flex items-center gap-3">

                                <Clock className="size-5 text-warning-600" />

                                <div>
                                    <p className="text-sm font-medium text-text">
                                        Timesheets require your attention
                                    </p>

                                    <p className="mt-1 text-xs text-text-muted">
                                        Open Timesheet Approvals to review
                                        submitted employee timesheets.
                                    </p>
                                </div>

                            </div>
                        ) : (
                            <div className="flex items-center gap-3">

                                <CheckCircle2 className="size-5 text-success-600" />

                                <div>
                                    <p className="text-sm font-medium text-text">
                                        No pending timesheets
                                    </p>

                                    <p className="mt-1 text-xs text-text-muted">
                                        All submitted timesheets have been
                                        reviewed.
                                    </p>
                                </div>

                            </div>
                        )}

                    </div>

                </Card>
            </Link>

        </div>
    )
}