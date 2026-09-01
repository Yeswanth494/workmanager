import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  timesheetService,
  type Timesheet,
  type TimesheetRequest,
} from '@/services/timesheetService'
import { projectService, type Project } from '@/services/projectService'
import { taskService, type Task } from '@/services/taskService'

const statusTone: Record<
    Timesheet['status'],
    'neutral' | 'warning' | 'success' | 'danger'
> = {
  DRAFT: 'neutral',
  SUBMITTED: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}

const emptyForm: TimesheetRequest = {
  projectId: 0,
  taskId: null,
  workDate: new Date().toISOString().split('T')[0],
  hours: 8,
  description: '',
}

export function MyTimesheets() {
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const [form, setForm] = useState<TimesheetRequest>(emptyForm)

  const [editingId, setEditingId] = useState<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ---------------------------------------------------------
  // LOAD DATA
  // ---------------------------------------------------------

  const loadTimesheets = async () => {
    const data = await timesheetService.getMyTimesheets()
    setTimesheets(data)
  }

  const loadProjects = async () => {
    const data = await projectService.getAll()
    setProjects(data)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        await Promise.all([
          loadTimesheets(),
          loadProjects(),
        ])
      } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : 'Failed to load timesheets',
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  // ---------------------------------------------------------
  // LOAD TASKS WHEN PROJECT CHANGES
  // ---------------------------------------------------------

  useEffect(() => {
    if (!form.projectId) {
      setTasks([])
      return
    }

    const loadTasks = async () => {
      try {
        const data = await taskService.getByProject(form.projectId)
        setTasks(data)
      } catch {
        setTasks([])
      }
    }

    loadTasks()
  }, [form.projectId])

  // ---------------------------------------------------------
  // FORM
  // ---------------------------------------------------------

  const updateForm = (
      field: keyof TimesheetRequest,
      value: string | number | null,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm({
      ...emptyForm,
      workDate: new Date().toISOString().split('T')[0],
    })

    setEditingId(null)
    setTasks([])
  }

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (!form.projectId) {
        setError('Please select a project.')
        return
      }

      if (!form.workDate) {
        setError('Please select a work date.')
        return
      }

      if (!form.hours || form.hours <= 0 || form.hours > 24) {
        setError('Hours must be between 0 and 24.')
        return
      }

      if (editingId !== null) {
        await timesheetService.update(editingId, form)
        setSuccess('Timesheet updated successfully.')
      } else {
        await timesheetService.create(form)
        setSuccess('Timesheet saved as draft.')
      }

      await loadTimesheets()
      resetForm()
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Failed to save timesheet',
      )
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------
  // SAVE AND SUBMIT
  // ---------------------------------------------------------

  const handleSaveAndSubmit = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (!form.projectId) {
        setError('Please select a project.')
        return
      }

      if (!form.workDate) {
        setError('Please select a work date.')
        return
      }

      if (!form.hours || form.hours <= 0 || form.hours > 24) {
        setError('Hours must be between 0 and 24.')
        return
      }

      let timesheetId = editingId

      if (editingId !== null) {
        await timesheetService.update(editingId, form)
      } else {
        const created = await timesheetService.create(form)
        timesheetId = created.id
      }

      if (timesheetId !== null) {
        await timesheetService.submit(timesheetId)
      }

      await loadTimesheets()
      setSuccess('Timesheet submitted for approval.')
      resetForm()
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Failed to submit timesheet',
      )
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------
  // EDIT
  // ---------------------------------------------------------

  const handleEdit = async (timesheet: Timesheet) => {
    if (timesheet.status !== 'DRAFT') {
      return
    }

    setEditingId(timesheet.id)

    setForm({
      projectId: timesheet.projectId,
      taskId: timesheet.taskId ?? null,
      workDate: timesheet.workDate,
      hours: timesheet.hours,
      description: timesheet.description ?? '',
    })

    try {
      const data = await taskService.getByProject(timesheet.projectId)
      setTasks(data)
    } catch {
      setTasks([])
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = async (id: number) => {
    try {
      setSubmittingId(id)
      setError('')
      setSuccess('')

      await timesheetService.submit(id)

      await loadTimesheets()

      setSuccess('Timesheet submitted for approval.')
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Failed to submit timesheet',
      )
    } finally {
      setSubmittingId(null)
    }
  }

  // ---------------------------------------------------------
  // TOTAL HOURS
  // ---------------------------------------------------------

  const totalHours = useMemo(() => {
    return timesheets.reduce(
        (total, timesheet) => total + timesheet.hours,
        0,
    )
  }, [timesheets])

  const draftCount = timesheets.filter(
      (t) => t.status === 'DRAFT',
  ).length

  const submittedCount = timesheets.filter(
      (t) => t.status === 'SUBMITTED',
  ).length

  const approvedCount = timesheets.filter(
      (t) => t.status === 'APPROVED',
  ).length

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  if (loading) {
    return (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-display text-3xl font-semibold text-text">
              Timesheets
            </h1>

            <p className="mt-1 text-text-muted">
              Log hours and submit weekly timesheets for approval.
            </p>
          </div>

          <Card>
            <p className="text-sm text-text-muted">
              Loading timesheets...
            </p>
          </Card>
        </div>
    )
  }

  return (
      <div className="flex flex-col gap-6">

        {/* HEADER */}

        <div>
          <h1 className="font-display text-3xl font-semibold text-text">
            Timesheets
          </h1>

          <p className="mt-1 text-text-muted">
            Log hours and submit weekly timesheets for approval.
          </p>
        </div>

        {/* ERROR */}

        {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
        )}

        {/* SUCCESS */}

        {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
        )}

        {/* SUMMARY */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          <Card rail="accent">
            <p className="text-sm text-text-muted">
              Total hours
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {totalHours}h
            </p>
          </Card>

          <Card>
            <p className="text-sm text-text-muted">
              Draft
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {draftCount}
            </p>
          </Card>

          <Card rail="warning">
            <p className="text-sm text-text-muted">
              Submitted
            </p>

            <p className="mt-2 font-display text-3xl font-semibold text-text">
              {submittedCount}
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

        </div>

        {/* FORM */}

        <Card>

          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-text">
              {editingId !== null
                  ? 'Edit Timesheet'
                  : 'Log Hours'}
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Add your work hours for a project and task.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">

            {/* PROJECT */}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Project
              </label>

              <select
                  value={form.projectId || ''}
                  onChange={(event) => {
                    const projectId = Number(event.target.value)

                    updateForm(
                        'projectId',
                        projectId,
                    )

                    updateForm(
                        'taskId',
                        null,
                    )
                  }}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
              >
                <option value="">
                  Select project
                </option>

                {projects.map((project) => (
                    <option
                        key={project.id}
                        value={project.id}
                    >
                      {project.name}
                    </option>
                ))}
              </select>
            </div>

            {/* TASK */}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Task
              </label>

              <select
                  value={form.taskId ?? ''}
                  disabled={!form.projectId}
                  onChange={(event) =>
                      updateForm(
                          'taskId',
                          event.target.value
                              ? Number(event.target.value)
                              : null,
                      )
                  }
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none disabled:bg-gray-50 focus:border-accent"
              >
                <option value="">
                  {form.projectId
                      ? 'Select task (optional)'
                      : 'Select project first'}
                </option>

                {tasks.map((task) => (
                    <option
                        key={task.id}
                        value={task.id}
                    >
                      {task.title}
                    </option>
                ))}
              </select>
            </div>

            {/* DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Work Date
              </label>

              <input
                  type="date"
                  value={form.workDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(event) =>
                      updateForm(
                          'workDate',
                          event.target.value,
                      )
                  }
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

            {/* HOURS */}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Hours
              </label>

              <input
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={form.hours}
                  onChange={(event) =>
                      updateForm(
                          'hours',
                          Number(event.target.value),
                      )
                  }
                  className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text">
                Description
              </label>

              <textarea
                  value={form.description ?? ''}
                  onChange={(event) =>
                      updateForm(
                          'description',
                          event.target.value,
                      )
                  }
                  rows={4}
                  placeholder="Describe the work completed..."
                  className="w-full resize-none rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">

            {editingId !== null && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving}
                >
                  Cancel
                </Button>
            )}

            <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={saving}
            >
              Reset
            </Button>

            <Button
                type="button"
                variant="secondary"
                onClick={handleSave}
                isLoading={saving}
            >
              {editingId !== null ? 'Update Draft' : 'Save Draft'}
            </Button>

            <Button
                type="button"
                variant="primary"
                onClick={handleSaveAndSubmit}
                isLoading={saving}
            >
              Submit for Approval
            </Button>

          </div>

        </Card>

        {/* TIMESHEET LIST */}

        <Card>

          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-text">
              My Timesheets
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              View and manage your logged work hours.
            </p>
          </div>

          {timesheets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
                <p className="font-medium text-text">
                  No timesheets yet
                </p>

                <p className="mt-1 text-sm text-text-muted">
                  Start by logging your work hours above.
                </p>
              </div>
          ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px] text-left">

                  <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-3 text-xs font-semibold uppercase text-text-muted">
                      Date
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase text-text-muted">
                      Project
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase text-text-muted">
                      Task
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase text-text-muted">
                      Hours
                    </th>

                    <th className="px-3 py-3 text-xs font-semibold uppercase text-text-muted">
                      Status
                    </th>

                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase text-text-muted">
                      Action
                    </th>
                  </tr>
                  </thead>

                  <tbody className="divide-y divide-border">

                  {timesheets.map((timesheet) => (

                      <tr key={timesheet.id}>

                        <td className="px-3 py-4 text-sm text-text">
                          {timesheet.workDate}
                        </td>

                        <td className="px-3 py-4 text-sm font-medium text-text">
                          {timesheet.projectName}
                        </td>

                        <td className="px-3 py-4 text-sm text-text-muted">
                          {timesheet.taskTitle || 'No task'}
                        </td>

                        <td className="px-3 py-4 text-sm font-medium text-text">
                          {timesheet.hours}h
                        </td>

                        <td className="px-3 py-4">
                          <Badge tone={statusTone[timesheet.status]}>
                            {timesheet.status}
                          </Badge>
                        </td>

                        <td className="px-3 py-4">

                          <div className="flex justify-end gap-2">

                            {timesheet.status === 'DRAFT' && (
                                <>
                                  <button
                                      type="button"
                                      onClick={() =>
                                          handleEdit(timesheet)
                                      }
                                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-gray-50"
                                  >
                                    Edit
                                  </button>

                                  <button
                                      type="button"
                                      disabled={
                                          submittingId ===
                                          timesheet.id
                                      }
                                      onClick={() =>
                                          handleSubmit(
                                              timesheet.id,
                                          )
                                      }
                                      className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                                  >
                                    {submittingId ===
                                    timesheet.id
                                        ? 'Submitting...'
                                        : 'Submit'}
                                  </button>
                                </>
                            )}

                            {timesheet.status ===
                                'SUBMITTED' && (
                                    <span className="text-xs text-text-muted">
                            Waiting for approval
                          </span>
                                )}

                            {timesheet.status ===
                                'APPROVED' && (
                                    <span className="text-xs text-green-600">
                            Approved
                          </span>
                                )}

                            {timesheet.status ===
                                'REJECTED' && (
                                    <span className="text-xs text-red-600">
                            Rejected
                          </span>
                                )}

                          </div>

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