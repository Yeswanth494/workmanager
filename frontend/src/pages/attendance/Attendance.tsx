import { useEffect, useState } from 'react'
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    LogIn,
    LogOut,
    RefreshCw,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/utils/constants'
import { employeeService, type Employee } from '@/services/employeeService'
import {
    attendanceService,
    type Attendance as AttendanceRecord,
} from '@/services/attendanceService'

function todayIso() {
    return new Date().toISOString().slice(0, 10)
}

function formatDateTime(value?: string | null) {
    if (!value) return '—'
    return new Date(value).toLocaleString()
}

function statusTone(
    status: AttendanceRecord['status'],
): 'success' | 'warning' | 'danger' | 'neutral' {
    if (status === 'PRESENT') return 'success'
    if (status === 'LATE' || status === 'HALF_DAY') return 'warning'
    if (status === 'ABSENT') return 'danger'
    return 'neutral'
}

export function Attendance() {
    const { user } = useAuth()
    const role = String(user?.role ?? '').toUpperCase()
    const isManagement =
        role === ROLES.ADMIN ||
        role === ROLES.MANAGER

    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedEmployee, setSelectedEmployee] = useState('')
    const [selectedDate, setSelectedDate] = useState(todayIso())
    const [employeeHistory, setEmployeeHistory] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [working, setWorking] = useState(false)
    const [error, setError] = useState('')

    async function loadEmployeeAttendance() {
        try {
            setLoading(true)
            setError('')
            const data = await attendanceService.getMyAttendance()
            setRecords(data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load attendance.',
            )
        } finally {
            setLoading(false)
        }
    }

    async function loadManagementAttendance() {
        try {
            setLoading(true)
            setError('')
            const data = await attendanceService.getDailyAttendance(selectedDate)
            setRecords(data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load daily attendance.',
            )
        } finally {
            setLoading(false)
        }
    }

    async function loadEmployees() {
        if (!isManagement) return
        try {
            const data = await employeeService.getAll()
            setEmployees(data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        void loadEmployees()
    }, [isManagement])

    useEffect(() => {
        if (isManagement) {
            void loadManagementAttendance()
        } else {
            void loadEmployeeAttendance()
        }
    }, [isManagement, selectedDate])

    async function runAttendanceAction(
        action: 'check-in' | 'check-out',
    ) {
        try {
            setWorking(true)
            setError('')

            if (action === 'check-in') {
                await attendanceService.checkIn()
            } else {
                await attendanceService.checkOut()
            }

            await loadEmployeeAttendance()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : `Unable to ${action}.`,
            )
        } finally {
            setWorking(false)
        }
    }

    async function loadSelectedEmployeeHistory() {
        if (!selectedEmployee) {
            setEmployeeHistory([])
            return
        }

        try {
            setError('')
            const data = await attendanceService.getEmployeeAttendance(
                Number(selectedEmployee),
            )
            setEmployeeHistory(data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load employee attendance.',
            )
        }
    }

    const latest = records[0]

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Attendance"
                description={
                    isManagement
                        ? 'Review daily employee attendance.'
                        : 'Check in, check out, and view your attendance history.'
                }
            />

            {error && (
                <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {error}
                </div>
            )}

            {!isManagement ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card rail="accent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-text-muted">
                                        Today's status
                                    </p>
                                    <p className="mt-2 text-xl font-semibold">
                                        {latest?.attendanceDate === todayIso()
                                            ? latest.status
                                            : 'NOT MARKED'}
                                    </p>
                                </div>
                                <CalendarDays className="size-5 text-text-muted" />
                            </div>
                        </Card>

                        <Card rail="success">
                            <div>
                                <p className="text-sm text-text-muted">
                                    Latest check-in
                                </p>
                                <p className="mt-2 text-xl font-semibold">
                                    {latest?.checkIn
                                        ? formatDateTime(latest.checkIn)
                                        : '—'}
                                </p>
                            </div>
                        </Card>
                    </div>

                    <Card>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => void runAttendanceAction('check-in')}
                                disabled={working}
                                isLoading={working}
                            >
                                <LogIn className="size-4" />
                                Check in
                            </Button>

                            <Button
                                variant="secondary"
                                onClick={() => void runAttendanceAction('check-out')}
                                disabled={working}
                            >
                                <LogOut className="size-4" />
                                Check out
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => void loadEmployeeAttendance()}
                                disabled={loading}
                            >
                                <RefreshCw className="size-4" />
                                Refresh
                            </Button>
                        </div>
                    </Card>
                </>
            ) : (
                <>
                    <Card>
                        <div className="grid gap-4 md:grid-cols-[220px_1fr_auto] md:items-end">
                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="font-medium">Date</span>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(event) =>
                                        setSelectedDate(event.target.value)
                                    }
                                    className="h-10 rounded-lg border border-border-strong bg-surface px-3"
                                />
                            </label>

                            <div className="text-sm text-text-muted">
                                Showing attendance for {selectedDate}.
                            </div>

                            <Button
                                variant="secondary"
                                onClick={() => void loadManagementAttendance()}
                                disabled={loading}
                            >
                                <RefreshCw className="size-4" />
                                Refresh
                            </Button>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="font-display font-semibold">
                            Employee attendance
                        </h2>

                        <div className="mt-4 overflow-x-auto">
                            {records.length === 0 ? (
                                <p className="py-8 text-sm text-text-muted">
                                    No attendance records for this date.
                                </p>
                            ) : (
                                <table className="w-full min-w-[700px] text-left">
                                    <thead className="border-b border-border bg-bg">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Employee
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Check in
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Check out
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {records.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-4 py-3 text-sm font-medium">
                                                    {record.employeeName}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge tone={statusTone(record.status)}>
                                                        {record.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {formatDateTime(record.checkIn)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {formatDateTime(record.checkOut)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                            <label className="flex flex-col gap-1.5 text-sm">
                                <span className="font-medium">
                                    Employee history
                                </span>
                                <select
                                    value={selectedEmployee}
                                    onChange={(event) =>
                                        setSelectedEmployee(event.target.value)
                                    }
                                    className="h-10 rounded-lg border border-border-strong bg-surface px-3"
                                >
                                    <option value="">
                                        Select employee
                                    </option>
                                    {employees.map((employee) => (
                                        <option
                                            key={employee.id}
                                            value={employee.id}
                                        >
                                            {employee.name} — {employee.employeeCode}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <Button
                                variant="secondary"
                                onClick={() => void loadSelectedEmployeeHistory()}
                                disabled={!selectedEmployee}
                            >
                                <Clock3 className="size-4" />
                                Load history
                            </Button>
                        </div>

                        {employeeHistory.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full min-w-[650px] text-left">
                                    <thead className="border-b border-border bg-bg">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Check in
                                            </th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                                Check out
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {employeeHistory.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-4 py-3 text-sm">
                                                    {record.attendanceDate}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge tone={statusTone(record.status)}>
                                                        {record.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {formatDateTime(record.checkIn)}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {formatDateTime(record.checkOut)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </>
            )}

            {!isManagement && (
                <Card>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-text-muted" />
                        <h2 className="font-display font-semibold">
                            My attendance history
                        </h2>
                    </div>

                    {loading ? (
                        <p className="mt-4 text-sm text-text-muted">
                            Loading attendance...
                        </p>
                    ) : records.length === 0 ? (
                        <p className="mt-4 text-sm text-text-muted">
                            No attendance records yet.
                        </p>
                    ) : (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                                <thead className="border-b border-border bg-bg">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                            Check in
                                        </th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase text-text-muted">
                                            Check out
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {records.map((record) => (
                                        <tr key={record.id}>
                                            <td className="px-4 py-3 text-sm">
                                                {record.attendanceDate}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge tone={statusTone(record.status)}>
                                                    {record.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {formatDateTime(record.checkIn)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {formatDateTime(record.checkOut)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            )}
        </div>
    )
}
