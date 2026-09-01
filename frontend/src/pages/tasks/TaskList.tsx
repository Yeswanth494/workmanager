import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Plus,
  Search,
  X,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { taskService, type Task, type TaskRequest } from '@/services/taskService'
import { projectService, type Project } from '@/services/projectService'
import { employeeService, type Employee } from '@/services/employeeService'
import { ROLES } from '@/utils/constants'

const STATUS_ORDER = [
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'DONE',
]

export function TaskList() {
  const { user } = useAuth()
  const userRole = String(user?.role ?? '').toUpperCase()

  const canCreateTask =
      userRole === ROLES.ADMIN ||
      userRole === ROLES.MANAGER ||
      userRole === 'ROLE_ADMIN' ||
      userRole === 'ROLE_MANAGER'
  const canEditTask =
      userRole === ROLES.ADMIN ||
      userRole === ROLES.MANAGER ||
      userRole === 'ROLE_ADMIN' ||
      userRole === 'ROLE_MANAGER'

  const canDeleteTask =
      userRole === ROLES.ADMIN ||
      userRole === 'ROLE_ADMIN'
  const [tasks, setTasks] = useState<Task[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [creatingTask, setCreatingTask] = useState(false)
  const [createError, setCreateError] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)

  const [form, setForm] = useState<TaskRequest>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    projectId: 0,
    assigneeId: undefined,
  })

  async function loadTasks() {
    try {
      setLoading(true)
      setError('')

      const data = await taskService.getAll()

      setTasks(data)
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to load tasks.',
      )
    } finally {
      setLoading(false)
    }
  }
  async function loadCreateTaskData() {
    try {
      setCreateError('')

      const [projectData, employeeData] = await Promise.all([
        projectService.getAll(),
        employeeService.getAll(),
      ])

      setProjects(projectData)
      setEmployees(employeeData)
    } catch (err) {
      console.error(err)

      setCreateError(
          err instanceof Error
              ? err.message
              : 'Unable to load projects and employees.',
      )
    }
  }
  async function startEditTask(task: Task) {
    try {
      setCreateError('')
      setEditingTaskId(task.id)
      setShowCreateForm(true)

      await loadCreateTaskData()

      setForm({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? '',
        projectId: task.projectId,
        assigneeId: task.assigneeId,
      })
    } catch (err) {
      console.error(err)

      setCreateError(
          err instanceof Error
              ? err.message
              : 'Unable to load task for editing.',
      )
    }
  }

  async function updateTask() {
    if (editingTaskId === null) {
      return
    }

    try {
      setCreatingTask(true)
      setCreateError('')

      if (!form.title.trim()) {
        setCreateError('Task title is required.')
        return
      }

      if (!form.projectId) {
        setCreateError('Please select a project.')
        return
      }

      const payload: TaskRequest = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        dueDate: form.dueDate || undefined,
        assigneeId: form.assigneeId || undefined,
      }

      const updatedTask = await taskService.update(
          editingTaskId,
          payload,
      )

      setTasks((currentTasks) =>
          currentTasks.map((task) =>
              task.id === editingTaskId
                  ? updatedTask
                  : task,
          ),
      )

      setEditingTaskId(null)
      setShowCreateForm(false)

      setForm({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: 0,
        assigneeId: undefined,
      })
    } catch (err) {
      console.error(err)

      setCreateError(
          err instanceof Error
              ? err.message
              : 'Unable to update task.',
      )
    } finally {
      setCreatingTask(false)
    }
  }

  async function deleteTask(taskId: number) {
    const confirmed = window.confirm(
        'Are you sure you want to delete this task? This action cannot be undone.',
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingTaskId(taskId)
      setError('')

      await taskService.delete(taskId)

      setTasks((currentTasks) =>
          currentTasks.filter(
              (task) => task.id !== taskId,
          ),
      )
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to delete task.',
      )
    } finally {
      setDeletingTaskId(null)
    }
  }

  async function createTask() {
    try {
      setCreatingTask(true)
      setCreateError('')

      if (!form.title.trim()) {
        setCreateError('Task title is required.')
        return
      }

      if (!form.projectId) {
        setCreateError('Please select a project.')
        return
      }

      const payload: TaskRequest = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        dueDate: form.dueDate || undefined,
        assigneeId: form.assigneeId || undefined,
      }

      const createdTask = await taskService.create(payload)

      setTasks((currentTasks) => [
        ...currentTasks,
        createdTask,
      ])

      setForm({
        title: '',
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '',
        projectId: 0,
        assigneeId: undefined,
      })

      setShowCreateForm(false)
    } catch (err) {
      console.error(err)

      setCreateError(
          err instanceof Error
              ? err.message
              : 'Unable to create task.',
      )
    } finally {
      setCreatingTask(false)
    }
  }
  async function updateTaskStatus(
      taskId: number,
      status: string,
  ) {
    try {
      setUpdatingTaskId(taskId)
      setError('')

      const updatedTask = await taskService.updateStatus(
          taskId,
          status,
      )

      setTasks((currentTasks) =>
          currentTasks.map((task) =>
              task.id === taskId
                  ? updatedTask
                  : task,
          ),
      )
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to update task status.',
      )
    } finally {
      setUpdatingTaskId(null)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase().trim()

    return tasks.filter((task) => {
      const matchesSearch =
          !query ||
          [
            task.title,
            task.description,
            task.projectName,
            task.assigneeName,
            task.priority,
            task.status,
          ]
              .filter(Boolean)
              .some((value) =>
                  String(value)
                      .toLowerCase()
                      .includes(query),
              )

      const matchesStatus =
          statusFilter === 'ALL' ||
          task.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [tasks, search, statusFilter])

  const groupedTasks = STATUS_ORDER.reduce(
      (groups, status) => {
        groups[status] = filteredTasks.filter(
            (task) => task.status === status,
        )

        return groups
      },
      {} as Record<string, Task[]>,
  )

  function priorityTone(priority: string) {
    switch (priority) {
      case 'HIGH':
        return 'danger'
      case 'MEDIUM':
        return 'warning'
      case 'LOW':
        return 'success'
      default:
        return 'neutral'
    }
  }

  function statusLabel(status: string) {
    if (status === 'DONE') {
      return 'Completed'
    }

    return status
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        )
  }

  function statusIcon(status: string) {
    if (status === 'DONE') {
      return (
          <CheckCircle2 className="size-4 text-success-600" />
      )
    }

    if (status === 'IN_PROGRESS') {
      return (
          <Clock3 className="size-4 text-info-600" />
      )
    }

    if (status === 'REVIEW') {
      return (
          <ListTodo className="size-4 text-warning-600" />
      )
    }

    return (
        <Circle className="size-4 text-text-faint" />
    )
  }

  return (
      <div>
        <div className="flex items-start justify-between gap-4">
          <PageHeader
              title="Tasks"
              description="Track work, priorities, assignments, and deadlines."
          />

          {canCreateTask && (
              <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(true)
                    loadCreateTaskData()
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent-600 px-4 text-sm font-medium text-white transition hover:bg-accent-700"
              >
                <Plus className="size-4" />
                Create Task
              </button>
          )}
        </div>
        {showCreateForm && canCreateTask && (
            <Card className="mt-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-text">
                    {editingTaskId !== null
                        ? 'Edit Task'
                        : 'Create Task'}
                  </h2>

                  <p className="mt-1 text-sm text-text-muted">
                    {editingTaskId !== null
                        ? 'Update task details, assignment, and deadline.'
                        : 'Create and assign a task to an employee.'}
                  </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setEditingTaskId(null)
                      setCreateError('')
                    }}
                    className="rounded-lg p-2 text-text-muted transition hover:bg-bg hover:text-text"
                    aria-label="Close create task form"
                >
                  <X className="size-5" />
                </button>
              </div>

              {createError && (
                  <div className="mt-4 rounded-lg border border-danger-200 bg-danger-50 p-3">
                    <p className="text-sm text-danger-600">
                      {createError}
                    </p>
                  </div>
              )}

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {/* Title */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-text">
                    Title
                  </label>

                  <input
                      value={form.title}
                      onChange={(event) =>
                          setForm({
                            ...form,
                            title: event.target.value,
                          })
                      }
                      placeholder="Enter task title"
                      maxLength={150}
                      className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-text">
                    Description
                  </label>

                  <textarea
                      value={form.description ?? ''}
                      onChange={(event) =>
                          setForm({
                            ...form,
                            description: event.target.value,
                          })
                      }
                      placeholder="Describe the task..."
                      maxLength={2000}
                      rows={4}
                      className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-500"
                  />
                </div>

                {/* Project */}
                <div>
                  <label className="text-sm font-medium text-text">
                    Project
                  </label>

                  <select
                      value={form.projectId || ''}
                      onChange={(event) =>
                          setForm({
                            ...form,
                            projectId: Number(event.target.value),
                          })
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                  >
                    <option value="">Select project</option>

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

                {/* Assignee */}
                <div>
                  <label className="text-sm font-medium text-text">
                    Assign to
                  </label>

                  <select
                      value={form.assigneeId || ''}
                      onChange={(event) =>
                          setForm({
                            ...form,
                            assigneeId: event.target.value
                                ? Number(event.target.value)
                                : undefined,
                          })
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                  >
                    <option value="">Unassigned</option>

                    {employees.map((employee) => (
                        <option
                            key={employee.id}
                            value={employee.id}
                        >
                          {employee.name} — {employee.employeeCode}
                        </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-text">
                    Priority
                  </label>

                  <select
                      value={form.priority}
                      onChange={(event) =>
                          setForm({
                            ...form,
                            priority: event.target.value,
                          })
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-text">
                    Status
                  </label>

                  <select
                      value={form.status}
                      onChange={(event) =>
                          setForm({
                            ...form,
                            status: event.target.value,
                          })
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                  >
                    {STATUS_ORDER.map((status) => (
                        <option
                            key={status}
                            value={status}
                        >
                          {statusLabel(status)}
                        </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-sm font-medium text-text">
                    Due date
                  </label>

                  <input
                      type="date"
                      value={form.dueDate ?? ''}
                      onChange={(event) =>
                          setForm({
                            ...form,
                            dueDate: event.target.value,
                          })
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
                <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false)
                      setCreateError('')
                    }}
                    disabled={creatingTask}
                    className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text transition hover:bg-bg disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                    type="button"
                    onClick={
                      editingTaskId !== null
                          ? updateTask
                          : createTask
                    }
                    disabled={creatingTask}
                    className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingTask
                      ? editingTaskId !== null
                          ? 'Saving...'
                          : 'Creating...'
                      : editingTaskId !== null
                          ? 'Save Changes'
                          : 'Create Task'}
                </button>
              </div>
            </Card>
        )}

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />

            <input
                value={search}
                onChange={(event) =>
                    setSearch(event.target.value)
                }
                placeholder="Search tasks..."
                className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm outline-none focus:border-accent-500"
            />
          </div>

          <select
              value={statusFilter}
              onChange={(event) =>
                  setStatusFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none"
          >
            <option value="ALL">All statuses</option>

            {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
            <Card className="mt-6 border-danger-200">
              <p className="text-sm text-danger-600">
                {error}
              </p>

              <button
                  type="button"
                  onClick={loadTasks}
                  className="mt-3 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium"
              >
                Try again
              </button>
            </Card>
        )}

        {/* Loading */}
        {loading && (
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {STATUS_ORDER.map((status) => (
                  <Card key={status}>
                    <div className="h-5 w-32 animate-pulse rounded bg-bg" />

                    <div className="mt-4 space-y-3">
                      {[1, 2].map((item) => (
                          <div
                              key={item}
                              className="h-28 animate-pulse rounded-lg bg-bg"
                          />
                      ))}
                    </div>
                  </Card>
              ))}
            </div>
        )}

        {/* Kanban */}
        {!loading && !error && (
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
              {STATUS_ORDER.map((status) => {
                const statusTasks =
                    groupedTasks[status] ?? []

                return (
                    <div
                        key={status}
                        className="min-w-0 rounded-xl border border-border bg-bg/30 p-3"
                    >
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          {statusIcon(status)}

                          <h2 className="font-display text-sm font-semibold text-text">
                            {statusLabel(status)}
                          </h2>
                        </div>

                        <span className="rounded-full bg-bg px-2 py-0.5 text-xs font-medium text-text-muted">
                    {statusTasks.length}
                  </span>
                      </div>

                      <div className="mt-3 space-y-3">
                        {statusTasks.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border-strong p-6 text-center">
                              <p className="text-xs text-text-faint">
                                No tasks
                              </p>
                            </div>
                        )}

                        {statusTasks.map((task) => (
                            <Card
                                key={task.id}
                                className="cursor-pointer transition-shadow hover:shadow-md"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="line-clamp-2 text-sm font-semibold text-text">
                                  {task.title}
                                </h3>

                                <div className="flex shrink-0 items-center gap-1">
                                  <Badge
                                      tone={
                                        priorityTone(
                                            task.priority,
                                        ) as any
                                      }
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                              {(canEditTask || canDeleteTask) && (
                                  <div className="mt-2 flex items-center gap-2">
                                    {canEditTask && (
                                        <button
                                            type="button"
                                            onClick={() => startEditTask(task)}
                                            className="rounded-md border border-border-strong px-2 py-1 text-xs font-medium text-text-muted transition hover:bg-bg hover:text-text"
                                        >
                                          Edit
                                        </button>
                                    )}

                                    {canDeleteTask && (
                                        <button
                                            type="button"
                                            onClick={() => deleteTask(task.id)}
                                            disabled={deletingTaskId === task.id}
                                            className="rounded-md border border-danger-200 px-2 py-1 text-xs font-medium text-danger-600 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                          {deletingTaskId === task.id
                                              ? 'Deleting...'
                                              : 'Delete'}
                                        </button>
                                    )}
                                  </div>
                              )}

                              {task.description && (
                                  <p className="mt-2 line-clamp-2 text-xs text-text-muted">
                                    {task.description}
                                  </p>
                              )}

                              <div className="mt-4 border-t border-border pt-3">
                                <p className="text-xs font-medium text-text">
                                  {task.projectName}
                                </p>

                                {task.assigneeName && (
                                    <p className="mt-1 text-xs text-text-muted">
                                      Assigned to {task.assigneeName}
                                    </p>
                                )}
                              </div>

                              {task.dueDate && (
                                  <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                                    <CalendarDays className="size-3.5" />
                                    <span>{task.dueDate}</span>
                                  </div>
                              )}
                              <div className="mt-3 border-t border-border pt-3">
                                <select
                                    value={task.status}
                                    disabled={updatingTaskId === task.id}
                                    onChange={(event) =>
                                        updateTaskStatus(
                                            task.id,
                                            event.target.value,
                                        )
                                    }
                                    className="h-8 w-full rounded-md border border-border-strong bg-surface px-2 text-xs font-medium text-text outline-none focus:border-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {STATUS_ORDER.map((status) => (
                                      <option key={status} value={status}>
                                        {statusLabel(status)}
                                      </option>
                                  ))}
                                </select>

                                {updatingTaskId === task.id && (
                                    <p className="mt-1 text-[11px] text-text-muted">
                                      Updating status...
                                    </p>
                                )}
                              </div>
                            </Card>
                        ))}
                      </div>
                    </div>
                )
              })}
            </div>
        )}

        {/* No results */}
        {!loading &&
            !error &&
            filteredTasks.length === 0 && (
                <Card className="mt-6 text-center">
                  <ListTodo className="mx-auto size-10 text-text-faint" />

                  <h3 className="mt-3 font-display font-semibold text-text">
                    No tasks found
                  </h3>

                  <p className="mt-1 text-sm text-text-muted">
                    Try changing your search or status filter.
                  </p>
                </Card>
            )}
      </div>
  )
}