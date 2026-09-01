import { useEffect, useMemo, useState } from 'react'
import {
    Check,
    Clock,
    Loader2,
    X,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

import {
    timesheetService,
    type Timesheet,
} from '@/services/timesheetService'

type ActionId = number | null

const statusTone: Record<
    Timesheet['status'],
    'danger' | 'warning' | 'neutral' | 'success'
> = {
    DRAFT: 'neutral',
    SUBMITTED: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
}

export function TimesheetApprovals() {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [actionId, setActionId] =
        useState<ActionId>(null)

    const [actionType, setActionType] = useState<
        'approve' | 'reject' | null
    >(null)

    const loadTimesheets = async () => {
        try {
            setLoading(true)
            setError('')

            const data =
                await timesheetService.getAllTimesheets()

            setTimesheets(data)
        } catch (err: any) {
            console.error(
                'Failed to load timesheets:',
                err,
            )

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to load timesheets',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadTimesheets()
    }, [])

    const submittedTimesheets = useMemo(
        () =>
            timesheets.filter(
                (timesheet) =>
                    timesheet.status === 'SUBMITTED',
            ),
        [timesheets],
    )

    const handleApproval = async (
        id: number,
        approved: boolean,
    ) => {
        try {
            setActionId(id)
            setActionType(
                approved ? 'approve' : 'reject',
            )

            const updated =
                await timesheetService.approve(
                    id,
                    approved,
                )

            setTimesheets((current) =>
                current.map((timesheet) =>
                    timesheet.id === id
                        ? updated
                        : timesheet,
                ),
            )

            window.dispatchEvent(
                new Event('notifications:changed'),
            )
        } catch (err: any) {
            console.error(
                'Failed to update timesheet:',
                err,
            )

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to update timesheet',
            )
        } finally {
            setActionId(null)
            setActionType(null)
        }
    }

    return (
        <div className="flex flex-col gap-6">

            <PageHeader
                title="Timesheet Approvals"
                description="Review and approve employee timesheets."
            />

            {/* =====================================================
          SUMMARY
      ===================================================== */}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">

                <Card rail="warning">
                    <p className="text-sm text-text-muted">
                        Pending review
                    </p>

                    <p className="mt-2 font-display text-3xl font-semibold text-text">
                        {submittedTimesheets.length}
                    </p>

                    <p className="mt-1 text-xs text-text-faint">
                        Awaiting approval
                    </p>
                </Card>

                <Card rail="success">
                    <p className="text-sm text-text-muted">
                        Approved
                    </p>

                    <p className="mt-2 font-display text-3xl font-semibold text-text">
                        {
                            timesheets.filter(
                                (timesheet) =>
                                    timesheet.status === 'APPROVED',
                            ).length
                        }
                    </p>

                    <p className="mt-1 text-xs text-text-faint">
                        Approved timesheets
                    </p>
                </Card>

                <Card rail="danger">
                    <p className="text-sm text-text-muted">
                        Rejected
                    </p>

                    <p className="mt-2 font-display text-3xl font-semibold text-text">
                        {
                            timesheets.filter(
                                (timesheet) =>
                                    timesheet.status === 'REJECTED',
                            ).length
                        }
                    </p>

                    <p className="mt-1 text-xs text-text-faint">
                        Rejected timesheets
                    </p>
                </Card>

            </div>

            {/* =====================================================
          ERROR
      ===================================================== */}

            {error && (
                <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {error}
                </div>
            )}

            {/* =====================================================
          TIMESHEETS
      ===================================================== */}

            <Card className="overflow-hidden p-0">

                {loading ? (
                    <div className="flex min-h-48 items-center justify-center">
                        <div className="flex items-center gap-2 text-text-muted">
                            <Loader2 className="size-5 animate-spin" />
                            <span>
                Loading timesheets...
              </span>
                        </div>
                    </div>
                ) : timesheets.length === 0 ? (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-text-muted">
                        <Clock className="size-8" />

                        <p className="text-sm">
                            No timesheets found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px] text-left">

                            <thead className="border-b border-border bg-bg">
                            <tr>
                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Employee
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Project
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Task
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Date
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Hours
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                    Action
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-border">

                            {timesheets.map((timesheet) => {

                                const isProcessing =
                                    actionId === timesheet.id

                                return (
                                    <tr
                                        key={timesheet.id}
                                        className="hover:bg-bg/60"
                                    >

                                        {/* EMPLOYEE */}

                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-text">
                                                {timesheet.employeeName}
                                            </p>
                                        </td>

                                        {/* PROJECT */}

                                        <td className="px-5 py-4">
                                            <p className="text-sm text-text">
                                                {timesheet.projectName}
                                            </p>
                                        </td>

                                        {/* TASK */}

                                        <td className="px-5 py-4">
                                            <p className="text-sm text-text">
                                                {timesheet.taskTitle ||
                                                    'No task'}
                                            </p>
                                        </td>

                                        {/* DATE */}

                                        <td className="px-5 py-4">
                                            <p className="text-sm text-text">
                                                {timesheet.workDate}
                                            </p>
                                        </td>

                                        {/* HOURS */}

                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-text">
                                                {timesheet.hours}h
                                            </p>
                                        </td>

                                        {/* STATUS */}

                                        <td className="px-5 py-4">
                                            <Badge
                                                tone={
                                                    statusTone[
                                                        timesheet.status
                                                        ]
                                                }
                                            >
                                                {timesheet.status}
                                            </Badge>
                                        </td>

                                        {/* ACTION */}

                                        <td className="px-5 py-4">

                                            {timesheet.status ===
                                            'SUBMITTED' ? (
                                                <div className="flex items-center gap-2">

                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        isLoading={
                                                            isProcessing &&
                                                            actionType ===
                                                            'approve'
                                                        }
                                                        onClick={() =>
                                                            handleApproval(
                                                                timesheet.id,
                                                                true,
                                                            )
                                                        }
                                                    >
                                                        <Check className="size-4" />
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="danger"
                                                        disabled={
                                                            isProcessing
                                                        }
                                                        isLoading={
                                                            isProcessing &&
                                                            actionType ===
                                                            'reject'
                                                        }
                                                        onClick={() =>
                                                            handleApproval(
                                                                timesheet.id,
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        <X className="size-4" />
                                                        Reject
                                                    </Button>

                                                </div>
                                            ) : (
                                                <span className="text-xs text-text-faint">
                            No action
                          </span>
                                            )}

                                        </td>

                                    </tr>
                                )
                            })}

                            </tbody>

                        </table>

                    </div>
                )}

            </Card>

        </div>
    )
}