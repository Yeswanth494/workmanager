import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  leaveService,
  type LeaveRequestPayload,
  type LeaveResponse,
  type LeaveType,
} from '@/services/leaveService'

const leaveTypes: LeaveType[] = [
  'CASUAL',
  'SICK',
  'EARNED',
  'UNPAID',
]

const statusTone: Record<
    LeaveResponse['status'],
    'success' | 'warning' | 'danger' | 'neutral'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
}

export function MyLeave() {
  const [leaves, setLeaves] = useState<LeaveResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState<LeaveRequestPayload>({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: '',
  })

  const pendingCount = useMemo(
      () => leaves.filter((leave) => leave.status === 'PENDING').length,
      [leaves],
  )

  const approvedCount = useMemo(
      () => leaves.filter((leave) => leave.status === 'APPROVED').length,
      [leaves],
  )

  const loadLeaves = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await leaveService.getMyLeaves()
      setLeaves(data)
    } catch (err: any) {
      console.error(err)
      setError(
          err?.response?.data?.message ||
          `Request failed with status code ${err?.response?.status || ''}`,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
  }, [])

  const handleChange = (
      field: keyof LeaveRequestPayload,
      value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (
      event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!form.startDate || !form.endDate) {
      setError('Please select both start date and end date.')
      return
    }

    if (form.endDate < form.startDate) {
      setError('End date cannot be before start date.')
      return
    }

    try {
      setSubmitting(true)

      await leaveService.applyLeave(form)

      setSuccess('Leave request submitted successfully.')

      setForm({
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: '',
      })

      await loadLeaves()
    } catch (err: any) {
      console.error(err)

      setError(
          err?.response?.data?.message ||
          'Failed to submit leave request.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id: number) => {
    const confirmed = window.confirm(
        'Are you sure you want to cancel this leave request?',
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setSuccess('')

      await leaveService.cancelLeave(id)

      setSuccess('Leave request cancelled successfully.')

      await loadLeaves()
    } catch (err: any) {
      console.error(err)

      setError(
          err?.response?.data?.message ||
          'Failed to cancel leave request.',
      )
    }
  }

  return (
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">
            Leave
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Apply for leave and track approvals in one place.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <Card rail="accent">
            <p className="text-sm text-text-muted">
              Total requests
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {leaves.length}
            </p>
          </Card>

          <Card rail="warning">
            <p className="text-sm text-text-muted">
              Pending requests
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {pendingCount}
            </p>
          </Card>

          <Card rail="success">
            <p className="text-sm text-text-muted">
              Approved requests
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {approvedCount}
            </p>
          </Card>

        </div>

        {/* Messages */}
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

        {/* Apply Leave */}
        <Card>
          <div>
            <h2 className="font-display text-lg font-semibold text-text">
              Apply for Leave
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Submit a new leave request for approval.
            </p>
          </div>

          <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-5"
          >

            {/* Leave Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Leave Type
              </label>

              <select
                  value={form.leaveType}
                  onChange={(event) =>
                      handleChange(
                          'leaveType',
                          event.target.value,
                      )
                  }
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
              >
                {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) +
                          type.slice(1).toLowerCase()}
                    </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Start Date
                </label>

                <input
                    type="date"
                    value={form.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(event) =>
                        handleChange(
                            'startDate',
                            event.target.value,
                        )
                    }
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                    required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  End Date
                </label>

                <input
                    type="date"
                    value={form.endDate}
                    min={
                        form.startDate ||
                        new Date().toISOString().split('T')[0]
                    }
                    onChange={(event) =>
                        handleChange(
                            'endDate',
                            event.target.value,
                        )
                    }
                    className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
                    required
                />
              </div>

            </div>

            {/* Reason */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Reason
              </label>

              <textarea
                  value={form.reason}
                  onChange={(event) =>
                      handleChange(
                          'reason',
                          event.target.value,
                      )
                  }
                  placeholder="Enter reason for leave..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                    ? 'Submitting...'
                    : 'Apply for Leave'}
              </button>
            </div>

          </form>
        </Card>

        {/* My Requests */}
        <Card>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-text">
                My Leave Requests
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                View the status of your leave applications.
              </p>
            </div>
          </div>

          {loading ? (
              <div className="py-10 text-center text-sm text-text-muted">
                Loading leave requests...
              </div>
          ) : leaves.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-border py-10 text-center">
                <p className="text-sm font-medium text-text">
                  No leave requests yet
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Your submitted leave requests will appear here.
                </p>
              </div>
          ) : (
              <div className="mt-5 overflow-x-auto">

                <table className="w-full min-w-[700px] text-left">

                  <thead>
                  <tr className="border-b border-border text-xs text-text-muted">
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

                  {leaves.map((leave) => (
                      <tr key={leave.id}>

                        <td className="px-3 py-4 text-sm font-medium text-text">
                          {leave.leaveType.charAt(0) +
                              leave.leaveType
                                  .slice(1)
                                  .toLowerCase()}
                        </td>

                        <td className="px-3 py-4 text-sm text-text-muted">
                          {leave.startDate}
                        </td>

                        <td className="px-3 py-4 text-sm text-text-muted">
                          {leave.endDate}
                        </td>

                        <td className="max-w-[220px] truncate px-3 py-4 text-sm text-text-muted">
                          {leave.reason || '—'}
                        </td>

                        <td className="px-3 py-4">
                          <Badge tone={statusTone[leave.status]}>
                            {leave.status}
                          </Badge>
                        </td>

                        <td className="px-3 py-4 text-right">

                          {leave.status === 'PENDING' ? (
                              <button
                                  type="button"
                                  onClick={() =>
                                      handleCancel(leave.id)
                                  }
                                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Cancel
                              </button>
                          ) : (
                              <span className="text-xs text-text-faint">
                          —
                        </span>
                          )}

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