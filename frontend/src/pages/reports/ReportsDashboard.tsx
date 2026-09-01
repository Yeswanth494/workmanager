import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
    BarChart3,
    CheckCircle2,
    ClipboardList,
    FolderKanban,
    Users,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
    reportService,
    type DepartmentReport,
    type EmployeeReport,
    type ProjectReport,
    type ReportSummary,
} from '@/services/reportService'

function MetricCard({
    label,
    value,
    icon: Icon,
    rail = 'accent',
}: {
    label: string
    value: number
    icon: LucideIcon
    rail?: 'accent' | 'warning' | 'success' | 'danger'
}) {
    return (
        <Card rail={rail}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-text-muted">{label}</p>
                    <p className="mt-2 font-display text-3xl font-semibold text-text">
                        {value}
                    </p>
                </div>
                <Icon className="size-5 text-text-muted" />
            </div>
        </Card>
    )
}

export function ReportsDashboard() {
    const [summary, setSummary] = useState<ReportSummary | null>(null)
    const [departments, setDepartments] = useState<DepartmentReport[]>([])
    const [projects, setProjects] = useState<ProjectReport[]>([])
    const [employees, setEmployees] = useState<EmployeeReport[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function loadReports() {
        try {
            setLoading(true)
            setError('')

            const [summaryData, departmentData, projectData, employeeData] =
                await Promise.all([
                    reportService.getSummary(),
                    reportService.getDepartments(),
                    reportService.getProjects(),
                    reportService.getEmployees(),
                ])

            setSummary(summaryData)
            setDepartments(departmentData)
            setProjects(projectData)
            setEmployees(employeeData)
        } catch (err) {
            console.error(err)
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load reports.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void loadReports()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Reports"
                    description="Live workspace analytics from the Spring Boot reporting APIs."
                />
                <Card>
                    <p className="text-sm text-text-muted">
                        Loading reports...
                    </p>
                </Card>
            </div>
        )
    }

    if (error || !summary) {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Reports"
                    description="Live workspace analytics."
                />
                <Card>
                    <p className="text-sm text-danger-600">
                        {error || 'No report data available.'}
                    </p>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Reports"
                description="Live employee, project, task, leave, attendance, and timesheet analytics."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <MetricCard
                    label="Employees"
                    value={summary.totalEmployees}
                    icon={Users}
                />
                <MetricCard
                    label="Projects"
                    value={summary.totalProjects}
                    icon={FolderKanban}
                />
                <MetricCard
                    label="Total tasks"
                    value={summary.totalTasks}
                    icon={ClipboardList}
                />
                <MetricCard
                    label="Completed tasks"
                    value={summary.completedTasks}
                    icon={CheckCircle2}
                    rail="success"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <h2 className="font-display font-semibold text-text">
                        Task status
                    </h2>
                    <div className="mt-4 space-y-3">
                        {[
                            ['To do', summary.todoTasks],
                            ['In progress', summary.inProgressTasks],
                            ['Review', summary.reviewTasks],
                            ['Completed', summary.completedTasks],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="flex items-center justify-between rounded-lg bg-bg px-3 py-2"
                            >
                                <span className="text-sm text-text-muted">
                                    {label}
                                </span>
                                <span className="font-semibold text-text">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h2 className="font-display font-semibold text-text">
                        Leave status
                    </h2>
                    <div className="mt-4 space-y-3">
                        {[
                            ['Pending', summary.pendingLeaves],
                            ['Approved', summary.approvedLeaves],
                            ['Rejected', summary.rejectedLeaves],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="flex items-center justify-between rounded-lg bg-bg px-3 py-2"
                            >
                                <span className="text-sm text-text-muted">
                                    {label}
                                </span>
                                <span className="font-semibold text-text">
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h2 className="font-display font-semibold text-text">
                        Today & timesheets
                    </h2>
                    <div className="mt-4 space-y-3">
                        <div className="flex justify-between rounded-lg bg-bg px-3 py-2">
                            <span className="text-sm text-text-muted">
                                Present today
                            </span>
                            <span className="font-semibold">
                                {summary.todayPresent}
                            </span>
                        </div>
                        <div className="flex justify-between rounded-lg bg-bg px-3 py-2">
                            <span className="text-sm text-text-muted">
                                Absent today
                            </span>
                            <span className="font-semibold">
                                {summary.todayAbsent}
                            </span>
                        </div>
                        <div className="flex justify-between rounded-lg bg-bg px-3 py-2">
                            <span className="text-sm text-text-muted">
                                Submitted timesheets
                            </span>
                            <span className="font-semibold">
                                {summary.submittedTimesheets}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="border-b border-border px-5 py-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="size-5 text-text-muted" />
                        <h2 className="font-display font-semibold">
                            Department report
                        </h2>
                    </div>
                </div>

                {departments.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-text-muted">
                        No department data.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-border bg-bg">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Department
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Employees
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {departments.map((item) => (
                                    <tr key={item.departmentId}>
                                        <td className="px-5 py-3 text-sm font-medium">
                                            {item.departmentName}
                                        </td>
                                        <td className="px-5 py-3 text-sm">
                                            {item.employeeCount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="border-b border-border px-5 py-4">
                    <h2 className="font-display font-semibold">
                        Project report
                    </h2>
                </div>

                {projects.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-text-muted">
                        No project data.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left">
                            <thead className="border-b border-border bg-bg">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Project
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Department
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Progress
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Tasks
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {projects.map((item) => (
                                    <tr key={item.projectId}>
                                        <td className="px-5 py-3 text-sm font-medium">
                                            {item.projectName}
                                        </td>
                                        <td className="px-5 py-3 text-sm text-text-muted">
                                            {item.departmentName}
                                        </td>
                                        <td className="px-5 py-3">
                                            <Badge tone="neutral">
                                                {item.status}
                                            </Badge>
                                        </td>
                                        <td className="px-5 py-3 text-sm">
                                            {item.progress}%
                                        </td>
                                        <td className="px-5 py-3 text-sm">
                                            {item.completedTasks} / {item.totalTasks}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="border-b border-border px-5 py-4">
                    <h2 className="font-display font-semibold">
                        Employee report
                    </h2>
                </div>

                {employees.length === 0 ? (
                    <p className="px-5 py-8 text-sm text-text-muted">
                        No employee data.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left">
                            <thead className="border-b border-border bg-bg">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Employee
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Department
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Tasks
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Leaves
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Timesheet hours
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {employees.map((item) => (
                                    <tr key={item.employeeId}>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-medium">
                                                {item.employeeName}
                                            </p>
                                            <p className="text-xs text-text-faint">
                                                {item.employeeCode}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3 text-sm">
                                            {item.departmentName}
                                        </td>
                                        <td className="px-5 py-3 text-sm">
                                            {item.completedTasks} / {item.totalTasks}
                                        </td>
                                        <td className="px-5 py-3 text-sm">
                                            {item.approvedLeaves} / {item.totalLeaves}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-medium">
                                            {item.totalTimesheetHours}h
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}
