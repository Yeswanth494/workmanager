import { useEffect, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import {
    leaveService,
    type LeaveResponse,
    type LeaveStatus,
} from '@/services/leaveService'

const statusTone: Record<
    LeaveStatus,
    'success' | 'warning' | 'danger' | 'neutral'
> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'neutral',
}

type StatusFilter = LeaveStatus | 'ALL'

export function LeaveApproval() {
    const [leaves, setLeaves] =
        useState<LeaveResponse[]>([])

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState('')

    const [success, setSuccess] =
        useState('')

    const [search, setSearch] =
        useState('')

    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>('PENDING')

    const [processingId, setProcessingId] =
        useState<number | null>(null)

    // ====================================================
    // LOAD LEAVES
    // ====================================================

    async function loadLeaves() {
        try {
            setLoading(true)
            setError('')

            const data =
                await leaveService.getAllLeaves()

            setLeaves(data)
        } catch (err: any) {
            console.error(err)

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Unable to load leave requests.',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLeaves()
    }, [])

    // ====================================================
    // APPROVE
    // ====================================================

    async function handleApprove(
        leave: LeaveResponse,
    ) {
        const confirmed =
            window.confirm(
                `Approve leave request for ${leave.employeeName}?`,
            )

        if (!confirmed) {
            return
        }

        try {
            setProcessingId(leave.id)
            setError('')
            setSuccess('')

            const updated =
                await leaveService.approveLeave(
                    leave.id,
                )

            setLeaves(
                (current) =>
                    current.map(
                        (item) =>
                            item.id === updated.id
                                ? updated
                                : item,
                    ),
            )

            setSuccess(
                `Leave request for ${leave.employeeName} approved.`,
            )
        } catch (err: any) {
            console.error(err)

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to approve leave request.',
            )
        } finally {
            setProcessingId(null)
        }
    }

    // ====================================================
    // REJECT
    // ====================================================

    async function handleReject(
        leave: LeaveResponse,
    ) {
        const confirmed =
            window.confirm(
                `Reject leave request for ${leave.employeeName}?`,
            )

        if (!confirmed) {
            return
        }

        try {
            setProcessingId(leave.id)
            setError('')
            setSuccess('')

            const updated =
                await leaveService.rejectLeave(
                    leave.id,
                )

            setLeaves(
                (current) =>
                    current.map(
                        (item) =>
                            item.id === updated.id
                                ? updated
                                : item,
                    ),
            )

            setSuccess(
                `Leave request for ${leave.employeeName} rejected.`,
            )
        } catch (err: any) {
            console.error(err)

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to reject leave request.',
            )
        } finally {
            setProcessingId(null)
        }
    }

    // ====================================================
    // FILTER
    // ====================================================

    const filteredLeaves =
        useMemo(() => {
            const query =
                search
                    .toLowerCase()
                    .trim()

            return leaves.filter(
                (leave) => {
                    const matchesStatus =
                        statusFilter ===
                        'ALL' ||
                        leave.status ===
                        statusFilter

                    const matchesSearch =
                        !query ||
                        [
                            leave.employeeName,
                            leave.leaveType,
                            leave.reason,
                            leave.startDate,
                            leave.endDate,
                            leave.status,
                        ]
                            .filter(Boolean)
                            .some(
                                (value) =>
                                    String(
                                        value,
                                    )
                                        .toLowerCase()
                                        .includes(
                                            query,
                                        ),
                            )

                    return (
                        matchesStatus &&
                        matchesSearch
                    )
                },
            )
        }, [
            leaves,
            search,
            statusFilter,
        ])

    // ====================================================
    // COUNTS
    // ====================================================

    const pendingCount =
        leaves.filter(
            (leave) =>
                leave.status ===
                'PENDING',
        ).length

    const approvedCount =
        leaves.filter(
            (leave) =>
                leave.status ===
                'APPROVED',
        ).length

    const rejectedCount =
        leaves.filter(
            (leave) =>
                leave.status ===
                'REJECTED',
        ).length

    // ====================================================
    // UI
    // ====================================================

    return (
        <div className="flex flex-col gap-6">

            {/* HEADER */}

            <div>

                <h1 className="font-display text-3xl font-semibold text-text">
                    Leave Approvals
                </h1>

                <p className="mt-1 text-sm text-text-muted">
                    Review and manage employee leave requests.
                </p>

            </div>

            {/* SUMMARY */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                <Card rail="warning">

                    <p className="text-sm text-text-muted">
                        Pending
                    </p>

                    <p className="mt-2 font-display text-3xl font-semibold text-text">
                        {pendingCount}
                    </p>

                </Card>

                <Card rail="success">

                    <p className="text-sm text-text-muted">
                        Approved
                    </p>

                    <p className="mt-2 font-display text-3xl font-semibold text-text">
                        {approvedCount}
                    </p>

                </Card>

                <Card rail="accent">

                    <p className="text-sm text-text-muted">
                        Rejected
                    </p>

                    <p className="mt-2 font-display text-3xl font-semibold text-text">
                        {rejectedCount}
                    </p>

                </Card>

            </div>

            {/* MESSAGES */}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            )}

            {/* FILTERS */}

            <Card>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                    {/* SEARCH */}

                    <div className="relative w-full max-w-md">

                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value,
                                )
                            }
                            placeholder="Search employee, leave type, reason..."
                            className="h-10 w-full rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-text outline-none focus:border-primary"
                        />

                    </div>

                    {/* STATUS */}

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(event) =>
                            setStatusFilter(
                                event.target.value as StatusFilter,
                            )
                        }
                        className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text outline-none focus:border-primary"
                    >

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="APPROVED">
                            Approved
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>

                        <option value="CANCELLED">
                            Cancelled
                        </option>

                        <option value="ALL">
                            All
                        </option>

                    </select>

                </div>

            </Card>

            {/* REQUESTS */}

            <Card>

                <div>

                    <h2 className="font-display text-lg font-semibold text-text">
                        Leave Requests
                    </h2>

                    <p className="mt-1 text-sm text-text-muted">
                        Review employee leave applications and take action.
                    </p>

                </div>

                {loading ? (
                    <div className="py-12 text-center text-sm text-text-muted">
                        Loading leave requests...
                    </div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="mt-5 rounded-lg border border-dashed border-border py-12 text-center">

                        <p className="text-sm font-medium text-text">
                            No leave requests found
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                            Try changing the search or status filter.
                        </p>

                    </div>
                ) : (
                    <div className="mt-5 overflow-x-auto">

                        <table className="w-full min-w-[950px] text-left">

                            <thead>

                            <tr className="border-b border-border text-xs text-text-muted">

                                <th className="px-3 py-3 font-medium">
                                    Employee
                                </th>

                                <th className="px-3 py-3 font-medium">
                                    Leave Type
                                </th>

                                <th className="px-3 py-3 font-medium">
                                    Start Date
                                </th>

                                <th className="px-3 py-3 font-medium">
                                    End Date
                                </th>

                                <th className="px-3 py-3 font-medium">
                                    Reason
                                </th>

                                <th className="px-3 py-3 font-medium">
                                    Status
                                </th>

                                <th className="px-3 py-3 text-right font-medium">
                                    Action
                                </th>

                            </tr>

                            </thead>

                            <tbody className="divide-y divide-border">

                            {filteredLeaves.map(
                                (leave) => (
                                    <tr
                                        key={
                                            leave.id
                                        }
                                        className="hover:bg-bg/30"
                                    >

                                        <td className="px-3 py-4">

                                            <p className="text-sm font-medium text-text">
                                                {
                                                    leave.employeeName
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-text-muted">
                                                Employee ID:{' '}
                                                {
                                                    leave.employeeId
                                                }
                                            </p>

                                        </td>

                                        <td className="px-3 py-4 text-sm text-text">

                                            {leave.leaveType
                                                    .charAt(
                                                        0,
                                                    )
                                                    .toUpperCase() +
                                                leave.leaveType
                                                    .slice(
                                                        1,
                                                    )
                                                    .toLowerCase()}

                                        </td>

                                        <td className="px-3 py-4 text-sm text-text-muted">
                                            {
                                                leave.startDate
                                            }
                                        </td>

                                        <td className="px-3 py-4 text-sm text-text-muted">
                                            {
                                                leave.endDate
                                            }
                                        </td>

                                        <td className="max-w-[260px] truncate px-3 py-4 text-sm text-text-muted">
                                            {
                                                leave.reason ||
                                                '—'
                                            }
                                        </td>

                                        <td className="px-3 py-4">

                                            <Badge
                                                tone={
                                                    statusTone[
                                                        leave.status
                                                        ]
                                                }
                                            >
                                                {
                                                    leave.status
                                                }
                                            </Badge>

                                        </td>

                                        <td className="px-3 py-4">

                                            {leave.status ===
                                            'PENDING' ? (
                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleApprove(
                                                                leave,
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            leave.id
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >

                                                        <Check className="size-3.5" />

                                                        {processingId ===
                                                        leave.id
                                                            ? 'Processing...'
                                                            : 'Approve'}

                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleReject(
                                                                leave,
                                                            )
                                                        }
                                                        disabled={
                                                            processingId ===
                                                            leave.id
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >

                                                        <X className="size-3.5" />

                                                        Reject

                                                    </button>

                                                </div>
                                            ) : (
                                                <div className="text-right text-xs text-text-faint">
                                                    —
                                                </div>
                                            )}

                                        </td>

                                    </tr>
                                ),
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </Card>

        </div>
    )
}