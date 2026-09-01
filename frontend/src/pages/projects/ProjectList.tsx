import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CalendarDays,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

import {
  projectService,
  type Project,
  type ProjectPriority,
  type ProjectRequest,
  type ProjectStatus,
} from '@/services/projectService'

import {
  departmentService,
  type Department,
} from '@/services/departmentService'

import {
  userService,
  type UserSummary,
} from '@/services/userService'

import { ROLES } from '@/utils/constants'

export function ProjectList() {
  const { user } = useAuth()

  const userRole = String(
      user?.role ?? '',
  ).toUpperCase()

  const canCreateOrEdit =
      userRole === ROLES.ADMIN ||
      userRole === 'ROLE_ADMIN' ||
      userRole === ROLES.MANAGER ||
      userRole === 'ROLE_MANAGER'

  const canDelete =
      userRole === ROLES.ADMIN ||
      userRole === 'ROLE_ADMIN'

  // ====================================================
  // PROJECTS
  // ====================================================

  const [projects, setProjects] =
      useState<Project[]>([])

  const [search, setSearch] =
      useState('')

  const [statusFilter, setStatusFilter] =
      useState<ProjectStatus | 'ALL'>('ALL')

  const [priorityFilter, setPriorityFilter] =
      useState<ProjectPriority | 'ALL'>('ALL')

  const [loading, setLoading] =
      useState(true)

  const [error, setError] =
      useState('')

  // ====================================================
  // FORM DATA
  // ====================================================

  const [departments, setDepartments] =
      useState<Department[]>([])

  const [managers, setManagers] =
      useState<UserSummary[]>([])

  const [loadingFormData, setLoadingFormData] =
      useState(false)

  // ====================================================
  // CREATE
  // ====================================================

  const [showCreateForm, setShowCreateForm] =
      useState(false)

  const [creatingProject, setCreatingProject] =
      useState(false)

  const [createError, setCreateError] =
      useState('')

  const [createForm, setCreateForm] =
      useState<ProjectRequest>({
        name: '',
        description: '',
        status: 'PLANNING',
        progress: 0,
        startDate: '',
        endDate: '',
        priority: 'MEDIUM',
        managerId: 0,
        departmentId: 0,
      })

  // ====================================================
  // EDIT
  // ====================================================

  const [editingProject, setEditingProject] =
      useState<Project | null>(null)

  const [updatingProject, setUpdatingProject] =
      useState(false)

  const [editError, setEditError] =
      useState('')

  const [editForm, setEditForm] =
      useState<ProjectRequest>({
        name: '',
        description: '',
        status: 'PLANNING',
        progress: 0,
        startDate: '',
        endDate: '',
        priority: 'MEDIUM',
        managerId: 0,
        departmentId: 0,
      })

  // ====================================================
  // DELETE
  // ====================================================

  const [deletingProjectId, setDeletingProjectId] =
      useState<number | null>(null)

  // ====================================================
  // STATUS / PROGRESS
  // ====================================================

  const [updatingStatusId, setUpdatingStatusId] =
      useState<number | null>(null)

  const [updatingProgressId, setUpdatingProgressId] =
      useState<number | null>(null)

  // ====================================================
  // LOAD PROJECTS
  // ====================================================

  async function loadProjects() {
    try {
      setLoading(true)
      setError('')

      const data =
          await projectService.getAll()

      setProjects(data)
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to load projects.',
      )
    } finally {
      setLoading(false)
    }
  }

  // ====================================================
  // LOAD FORM DATA
  // ====================================================

  async function loadFormData() {
    try {
      setLoadingFormData(true)

      const [
        departmentData,
        managerData,
      ] = await Promise.all([
        departmentService.getAll(),
        userService.getManagers(),
      ])

      setDepartments(
          departmentData,
      )

      setManagers(managerData)
    } catch (err) {
      console.error(err)

      const message =
          err instanceof Error
              ? err.message
              : 'Unable to load managers and departments.'

      setCreateError(message)
      setEditError(message)
    } finally {
      setLoadingFormData(false)
    }
  }

  // ====================================================
  // OPEN CREATE
  // ====================================================

  async function openCreateForm() {
    setCreateForm({
      name: '',
      description: '',
      status: 'PLANNING',
      progress: 0,
      startDate: '',
      endDate: '',
      priority: 'MEDIUM',
      managerId: 0,
      departmentId: 0,
    })

    setCreateError('')

    setShowCreateForm(true)

    if (
        departments.length === 0 ||
        managers.length === 0
    ) {
      await loadFormData()
    }
  }

  // ====================================================
  // CLOSE CREATE
  // ====================================================

  function closeCreateForm() {
    if (creatingProject) {
      return
    }

    setShowCreateForm(false)
    setCreateError('')
  }

  // ====================================================
  // CREATE PROJECT
  // ====================================================

  async function createProject() {
    try {
      setCreatingProject(true)
      setCreateError('')

      const name =
          createForm.name.trim()

      if (!name) {
        setCreateError(
            'Project name is required.',
        )
        return
      }

      if (!createForm.managerId) {
        setCreateError(
            'Please select a manager.',
        )
        return
      }

      if (!createForm.departmentId) {
        setCreateError(
            'Please select a department.',
        )
        return
      }

      if (
          createForm.progress < 0 ||
          createForm.progress > 100
      ) {
        setCreateError(
            'Progress must be between 0 and 100.',
        )
        return
      }

      const payload: ProjectRequest = {
        ...createForm,
        name,
        description:
            createForm.description?.trim() ||
            '',
        progress: Number(
            createForm.progress,
        ),
      }

      const createdProject =
          await projectService.create(
              payload,
          )

      setProjects(
          (currentProjects) => [
            ...currentProjects,
            createdProject,
          ],
      )

      setShowCreateForm(false)

      setCreateForm({
        name: '',
        description: '',
        status: 'PLANNING',
        progress: 0,
        startDate: '',
        endDate: '',
        priority: 'MEDIUM',
        managerId: 0,
        departmentId: 0,
      })
    } catch (err) {
      console.error(err)

      setCreateError(
          err instanceof Error
              ? err.message
              : 'Unable to create project.',
      )
    } finally {
      setCreatingProject(false)
    }
  }

  // ====================================================
  // OPEN EDIT
  // ====================================================

  async function openEditForm(
      project: Project,
  ) {
    setEditingProject(project)

    setEditError('')

    const manager =
        managers.find(
            (item) =>
                item.id ===
                project.managerId,
        )

    const department =
        departments.find(
            (item) =>
                item.id ===
                project.departmentId,
        )

    setEditForm({
      name: project.name,
      description:
          project.description ?? '',
      status: project.status,
      progress:
          project.progress ?? 0,
      startDate:
          project.startDate ?? '',
      endDate:
          project.endDate ?? '',
      priority:
      project.priority,
      managerId:
          manager?.id ??
          project.managerId ??
          0,
      departmentId:
          department?.id ??
          project.departmentId ??
          0,
    })

    if (
        departments.length === 0 ||
        managers.length === 0
    ) {
      await loadFormData()
    }
  }

  // ====================================================
  // CLOSE EDIT
  // ====================================================

  function closeEditForm() {
    if (updatingProject) {
      return
    }

    setEditingProject(null)

    setEditError('')
  }

  // ====================================================
  // UPDATE PROJECT
  // ====================================================

  async function updateProject() {
    if (!editingProject) {
      return
    }

    try {
      setUpdatingProject(true)
      setEditError('')

      const name =
          editForm.name.trim()

      if (!name) {
        setEditError(
            'Project name is required.',
        )
        return
      }

      if (!editForm.managerId) {
        setEditError(
            'Please select a manager.',
        )
        return
      }

      if (!editForm.departmentId) {
        setEditError(
            'Please select a department.',
        )
        return
      }

      if (
          editForm.progress < 0 ||
          editForm.progress > 100
      ) {
        setEditError(
            'Progress must be between 0 and 100.',
        )
        return
      }

      const payload: ProjectRequest = {
        ...editForm,
        name,
        description:
            editForm.description?.trim() ||
            '',
        progress: Number(
            editForm.progress,
        ),
      }

      const updatedProject =
          await projectService.update(
              editingProject.id,
              payload,
          )

      setProjects(
          (currentProjects) =>
              currentProjects.map(
                  (project) =>
                      project.id ===
                      updatedProject.id
                          ? updatedProject
                          : project,
              ),
      )

      closeEditForm()
    } catch (err) {
      console.error(err)

      setEditError(
          err instanceof Error
              ? err.message
              : 'Unable to update project.',
      )
    } finally {
      setUpdatingProject(false)
    }
  }

  // ====================================================
  // DELETE PROJECT
  // ====================================================

  async function deleteProject(
      project: Project,
  ) {
    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
        )

    if (!confirmed) {
      return
    }

    try {
      setDeletingProjectId(
          project.id,
      )

      setError('')

      await projectService.delete(
          project.id,
      )

      setProjects(
          (currentProjects) =>
              currentProjects.filter(
                  (item) =>
                      item.id !==
                      project.id,
              ),
      )
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to delete project.',
      )
    } finally {
      setDeletingProjectId(null)
    }
  }

  // ====================================================
  // UPDATE STATUS
  // ====================================================

  async function updateProjectStatus(
      project: Project,
      status: ProjectStatus,
  ) {
    try {
      setUpdatingStatusId(
          project.id,
      )

      setError('')

      const updatedProject =
          await projectService.updateStatus(
              project.id,
              status,
          )

      setProjects(
          (currentProjects) =>
              currentProjects.map(
                  (item) =>
                      item.id ===
                      updatedProject.id
                          ? updatedProject
                          : item,
              ),
      )
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to update project status.',
      )
    } finally {
      setUpdatingStatusId(null)
    }
  }

  // ====================================================
  // UPDATE PROGRESS
  // ====================================================

  async function updateProjectProgress(
      project: Project,
      progress: number,
  ) {
    const value = Math.min(
        Math.max(
            Number(progress),
            0,
        ),
        100,
    )

    try {
      setUpdatingProgressId(
          project.id,
      )

      setError('')

      const updatedProject =
          await projectService.updateProgress(
              project.id,
              value,
          )

      setProjects(
          (currentProjects) =>
              currentProjects.map(
                  (item) =>
                      item.id ===
                      updatedProject.id
                          ? updatedProject
                          : item,
              ),
      )
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to update project progress.',
      )
    } finally {
      setUpdatingProgressId(null)
    }
  }

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadProjects()
  }, [])

  // ====================================================
  // FILTERING
  // ====================================================

  const filteredProjects =
      useMemo(() => {
        const query =
            search
                .toLowerCase()
                .trim()

        return projects.filter(
            (project) => {
              const matchesSearch =
                  !query ||
                  [
                    project.name,
                    project.description,
                    project.status,
                    project.priority,
                    project.managerName,
                    project.departmentName,
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

              const matchesStatus =
                  statusFilter ===
                  'ALL' ||
                  project.status ===
                  statusFilter

              const matchesPriority =
                  priorityFilter ===
                  'ALL' ||
                  project.priority ===
                  priorityFilter

              return (
                  matchesSearch &&
                  matchesStatus &&
                  matchesPriority
              )
            },
        )
      }, [
        projects,
        search,
        statusFilter,
        priorityFilter,
      ])

  // ====================================================
  // BADGE HELPERS
  // ====================================================

  function statusTone(
      status: string,
  ) {
    switch (status) {
      case 'COMPLETED':
        return 'success'

      case 'ACTIVE':
        return 'info'

      case 'ON_HOLD':
        return 'warning'

      case 'CANCELLED':
        return 'danger'

      default:
        return 'neutral'
    }
  }

  function priorityTone(
      priority: string,
  ) {
    switch (priority) {
      case 'CRITICAL':
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

  // ====================================================
  // RENDER
  // ====================================================

  return (
      <div>

        {/* =========================================
                HEADER
            ========================================= */}

        <PageHeader
            title="Projects"
            description="Track progress, members, and deadlines across all projects."
        />

        {/* =========================================
                TOP ACTIONS
            ========================================= */}

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* SEARCH */}

            <div className="relative w-full max-w-md">

              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />

              <input
                  value={search}
                  onChange={(e) =>
                      setSearch(
                          e.target.value,
                      )
                  }
                  placeholder="Search projects..."
                  className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm outline-none transition focus:border-accent-500"
              />

            </div>

            {/* STATUS */}

            <select
                value={
                  statusFilter
                }
                onChange={(e) =>
                    setStatusFilter(
                        e.target.value as
                            | ProjectStatus
                            | 'ALL',
                    )
                }
                className="h-10 rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
            >
              <option value="ALL">
                All statuses
              </option>

              <option value="PLANNING">
                Planning
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="ON_HOLD">
                On Hold
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

            {/* PRIORITY */}

            <select
                value={
                  priorityFilter
                }
                onChange={(e) =>
                    setPriorityFilter(
                        e.target.value as
                            | ProjectPriority
                            | 'ALL',
                    )
                }
                className="h-10 rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
            >
              <option value="ALL">
                All priorities
              </option>

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>
            </select>

          </div>

          {canCreateOrEdit && (
              <Button
                  onClick={
                    openCreateForm
                  }
              >
                <Plus className="size-4" />

                New Project
              </Button>
          )}

        </div>

        {/* =========================================
                CREATE FORM
            ========================================= */}

        {showCreateForm &&
            canCreateOrEdit && (
                <Card className="mt-6">

                  <div className="flex items-center justify-between border-b border-border pb-4">

                    <div>

                      <h2 className="font-display text-lg font-semibold text-text">
                        New Project
                      </h2>

                      <p className="mt-1 text-sm text-text-muted">
                        Create a new project and assign its manager and department.
                      </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                          closeCreateForm
                        }
                        disabled={
                          creatingProject
                        }
                        className="rounded-lg p-2 text-text-muted hover:bg-bg hover:text-text disabled:opacity-50"
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

                  {loadingFormData ? (
                      <div className="mt-6 space-y-3">

                        <div className="h-10 animate-pulse rounded-lg bg-bg" />

                        <div className="h-10 animate-pulse rounded-lg bg-bg" />

                        <div className="h-10 animate-pulse rounded-lg bg-bg" />

                      </div>
                  ) : (
                      <>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">

                          {/* NAME */}

                          <div className="md:col-span-2">

                            <label className="text-sm font-medium text-text">
                              Project Name
                            </label>

                            <input
                                value={
                                  createForm.name
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          name: e
                                              .target
                                              .value,
                                        },
                                    )
                                }
                                placeholder="WorkSphere Platform"
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            />

                          </div>

                          {/* DESCRIPTION */}

                          <div className="md:col-span-2">

                            <label className="text-sm font-medium text-text">
                              Description
                            </label>

                            <textarea
                                value={
                                    createForm.description ??
                                    ''
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          description:
                                          e
                                              .target
                                              .value,
                                        },
                                    )
                                }
                                rows={3}
                                placeholder="Project description..."
                                className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-500"
                            />

                          </div>

                          {/* STATUS */}

                          <div>

                            <label className="text-sm font-medium text-text">
                              Status
                            </label>

                            <select
                                value={
                                  createForm.status
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          status:
                                              e
                                                  .target
                                                  .value as ProjectStatus,
                                        },
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            >
                              <option value="PLANNING">
                                Planning
                              </option>

                              <option value="ACTIVE">
                                Active
                              </option>

                              <option value="ON_HOLD">
                                On Hold
                              </option>

                              <option value="COMPLETED">
                                Completed
                              </option>

                              <option value="CANCELLED">
                                Cancelled
                              </option>
                            </select>

                          </div>

                          {/* PRIORITY */}

                          <div>

                            <label className="text-sm font-medium text-text">
                              Priority
                            </label>

                            <select
                                value={
                                  createForm.priority
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          priority:
                                              e
                                                  .target
                                                  .value as ProjectPriority,
                                        },
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            >
                              <option value="LOW">
                                Low
                              </option>

                              <option value="MEDIUM">
                                Medium
                              </option>

                              <option value="HIGH">
                                High
                              </option>

                              <option value="CRITICAL">
                                Critical
                              </option>
                            </select>

                          </div>

                          {/* PROGRESS */}

                          <div>

                            <label className="text-sm font-medium text-text">
                              Progress (%)
                            </label>

                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={
                                  createForm.progress
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          progress:
                                              Number(
                                                  e
                                                      .target
                                                      .value,
                                              ),
                                        },
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            />

                          </div>

                          {/* MANAGER */}

                          <div>

                            <label className="text-sm font-medium text-text">
                              Manager
                            </label>

                            <select
                                value={
                                    createForm.managerId ||
                                    ''
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          managerId:
                                              Number(
                                                  e
                                                      .target
                                                      .value,
                                              ),
                                        },
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            >
                              <option value="">
                                Select manager
                              </option>

                              {managers.map(
                                  (manager) => (
                                      <option
                                          key={
                                            manager.id
                                          }
                                          value={
                                            manager.id
                                          }
                                      >
                                        {
                                          manager.name
                                        }{' '}
                                        —{' '}
                                        {
                                          manager.email
                                        }
                                      </option>
                                  ),
                              )}

                            </select>

                          </div>

                          {/* DEPARTMENT */}

                          <div>

                            <label className="text-sm font-medium text-text">
                              Department
                            </label>

                            <select
                                value={
                                    createForm.departmentId ||
                                    ''
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          departmentId:
                                              Number(
                                                  e
                                                      .target
                                                      .value,
                                              ),
                                        },
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            >
                              <option value="">
                                Select department
                              </option>

                              {departments.map(
                                  (
                                      department,
                                  ) => (
                                      <option
                                          key={
                                            department.id
                                          }
                                          value={
                                            department.id
                                          }
                                      >
                                        {
                                          department.name
                                        }
                                      </option>
                                  ),
                              )}

                            </select>

                          </div>

                          {/* START DATE */}

                          <div>

                            <label className="text-sm font-medium text-text">
                              Start Date
                            </label>

                            <input
                                type="date"
                                value={
                                    createForm.startDate ??
                                    ''
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          startDate:
                                          e
                                              .target
                                              .value,
                                        },
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            />

                          </div>

                          {/* END DATE */}

                          <div>

                            <label className="text-sm font-medium text-text">
                              End Date
                            </label>

                            <input
                                type="date"
                                value={
                                    createForm.endDate ??
                                    ''
                                }
                                onChange={(e) =>
                                    setCreateForm(
                                        {
                                          ...createForm,
                                          endDate:
                                          e
                                              .target
                                              .value,
                                        },
                                    )
                                }
                                className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                            />

                          </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">

                          <Button
                              variant="outline"
                              onClick={
                                closeCreateForm
                              }
                              disabled={
                                creatingProject
                              }
                          >
                            Cancel
                          </Button>

                          <Button
                              onClick={
                                createProject
                              }
                              disabled={
                                creatingProject
                              }
                          >
                            {creatingProject
                                ? 'Creating...'
                                : 'Create Project'}
                          </Button>

                        </div>

                      </>
                  )}

                </Card>
            )}

        {/* =========================================
                EDIT FORM
            ========================================= */}

        {editingProject &&
            canCreateOrEdit && (
                <Card className="mt-6">

                  <div className="flex items-center justify-between border-b border-border pb-4">

                    <div>

                      <h2 className="font-display text-lg font-semibold text-text">
                        Edit Project
                      </h2>

                      <p className="mt-1 text-sm text-text-muted">
                        Update project information.
                      </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                          closeEditForm
                        }
                        disabled={
                          updatingProject
                        }
                        className="rounded-lg p-2 text-text-muted hover:bg-bg hover:text-text disabled:opacity-50"
                    >
                      <X className="size-5" />
                    </button>

                  </div>

                  {editError && (
                      <div className="mt-4 rounded-lg border border-danger-200 bg-danger-50 p-3">
                        <p className="text-sm text-danger-600">
                          {editError}
                        </p>
                      </div>
                  )}

                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    <div className="md:col-span-2">

                      <label className="text-sm font-medium text-text">
                        Project Name
                      </label>

                      <input
                          value={
                            editForm.name
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    name: e
                                        .target
                                        .value,
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      />

                    </div>

                    <div className="md:col-span-2">

                      <label className="text-sm font-medium text-text">
                        Description
                      </label>

                      <textarea
                          value={
                              editForm.description ??
                              ''
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    description:
                                    e
                                        .target
                                        .value,
                                  },
                              )
                          }
                          rows={3}
                          className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent-500"
                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-text">
                        Status
                      </label>

                      <select
                          value={
                            editForm.status
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    status:
                                        e
                                            .target
                                            .value as ProjectStatus,
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      >
                        <option value="PLANNING">
                          Planning
                        </option>

                        <option value="ACTIVE">
                          Active
                        </option>

                        <option value="ON_HOLD">
                          On Hold
                        </option>

                        <option value="COMPLETED">
                          Completed
                        </option>

                        <option value="CANCELLED">
                          Cancelled
                        </option>
                      </select>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-text">
                        Priority
                      </label>

                      <select
                          value={
                            editForm.priority
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    priority:
                                        e
                                            .target
                                            .value as ProjectPriority,
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      >
                        <option value="LOW">
                          Low
                        </option>

                        <option value="MEDIUM">
                          Medium
                        </option>

                        <option value="HIGH">
                          High
                        </option>

                        <option value="CRITICAL">
                          Critical
                        </option>
                      </select>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-text">
                        Progress (%)
                      </label>

                      <input
                          type="number"
                          min={0}
                          max={100}
                          value={
                            editForm.progress
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    progress:
                                        Number(
                                            e
                                                .target
                                                .value,
                                        ),
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-text">
                        Manager
                      </label>

                      <select
                          value={
                              editForm.managerId ||
                              ''
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    managerId:
                                        Number(
                                            e
                                                .target
                                                .value,
                                        ),
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      >
                        <option value="">
                          Select manager
                        </option>

                        {managers.map(
                            (manager) => (
                                <option
                                    key={
                                      manager.id
                                    }
                                    value={
                                      manager.id
                                    }
                                >
                                  {
                                    manager.name
                                  }{' '}
                                  —{' '}
                                  {
                                    manager.email
                                  }
                                </option>
                            ),
                        )}
                      </select>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-text">
                        Department
                      </label>

                      <select
                          value={
                              editForm.departmentId ||
                              ''
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    departmentId:
                                        Number(
                                            e
                                                .target
                                                .value,
                                        ),
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      >
                        <option value="">
                          Select department
                        </option>

                        {departments.map(
                            (
                                department,
                            ) => (
                                <option
                                    key={
                                      department.id
                                    }
                                    value={
                                      department.id
                                    }
                                >
                                  {
                                    department.name
                                  }
                                </option>
                            ),
                        )}
                      </select>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-text">
                        Start Date
                      </label>

                      <input
                          type="date"
                          value={
                              editForm.startDate ??
                              ''
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    startDate:
                                    e
                                        .target
                                        .value,
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      />

                    </div>

                    <div>

                      <label className="text-sm font-medium text-text">
                        End Date
                      </label>

                      <input
                          type="date"
                          value={
                              editForm.endDate ??
                              ''
                          }
                          onChange={(e) =>
                              setEditForm(
                                  {
                                    ...editForm,
                                    endDate:
                                    e
                                        .target
                                        .value,
                                  },
                              )
                          }
                          className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                      />

                    </div>

                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">

                    <Button
                        variant="outline"
                        onClick={
                          closeEditForm
                        }
                        disabled={
                          updatingProject
                        }
                    >
                      Cancel
                    </Button>

                    <Button
                        onClick={
                          updateProject
                        }
                        disabled={
                          updatingProject
                        }
                    >
                      {updatingProject
                          ? 'Saving...'
                          : 'Save Changes'}
                    </Button>

                  </div>

                </Card>
            )}

        {/* =========================================
                ERROR
            ========================================= */}

        {error && (
            <Card className="mt-6 border-danger-200">

              <p className="text-sm text-danger-600">
                {error}
              </p>

              <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={
                    loadProjects
                  }
              >
                Try again
              </Button>

            </Card>
        )}

        {/* =========================================
                LOADING
            ========================================= */}

        {loading && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {[1, 2, 3].map(
                  (item) => (
                      <Card key={item}>

                        <div className="h-5 w-2/3 animate-pulse rounded bg-bg" />

                        <div className="mt-3 h-4 w-full animate-pulse rounded bg-bg" />

                        <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-bg" />

                        <div className="mt-6 h-2 w-full animate-pulse rounded bg-bg" />

                      </Card>
                  ),
              )}

            </div>
        )}

        {/* =========================================
                EMPTY
            ========================================= */}

        {!loading &&
            !error &&
            filteredProjects.length ===
            0 && (
                <Card className="mt-6 flex flex-col items-center justify-center py-16 text-center">

                  <FolderKanban className="size-10 text-text-faint" />

                  <h3 className="mt-4 font-display text-base font-semibold text-text">
                    No projects found
                  </h3>

                  <p className="mt-1 text-sm text-text-muted">
                    {search ||
                    statusFilter !==
                    'ALL' ||
                    priorityFilter !==
                    'ALL'
                        ? 'Try changing your filters.'
                        : 'There are no projects available yet.'}
                  </p>

                </Card>
            )}

        {/* =========================================
                PROJECT CARDS
            ========================================= */}

        {!loading &&
            filteredProjects.length >
            0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {filteredProjects.map(
                      (project) => (
                          <Card
                              key={
                                project.id
                              }
                              className="transition-shadow hover:shadow-md"
                          >

                            {/* HEADER */}

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <h3 className="truncate font-display text-base font-semibold text-text">
                                  {
                                    project.name
                                  }
                                </h3>

                                <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                                  {
                                      project.description ||
                                      'No description provided.'
                                  }
                                </p>

                              </div>

                              <Badge
                                  tone={
                                    statusTone(
                                        project.status,
                                    ) as any
                                  }
                              >
                                {project.status.replace(
                                    '_',
                                    ' ',
                                )}
                              </Badge>

                            </div>

                            {/* PROGRESS */}

                            <div className="mt-5">

                              <div className="flex items-center justify-between text-xs">

                                            <span className="text-text-muted">
                                                Progress
                                            </span>

                                <span className="font-medium text-text">
                                                {
                                                    project.progress ??
                                                    0
                                                }
                                  %
                                            </span>

                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">

                                <div
                                    className="h-full rounded-full bg-accent-600 transition-all"
                                    style={{
                                      width: `${Math.min(
                                          Math.max(
                                              project.progress ??
                                              0,
                                              0,
                                          ),
                                          100,
                                      )}%`,
                                    }}
                                />

                              </div>

                            </div>

                            {/* PRIORITY / DEPARTMENT */}

                            <div className="mt-5 flex items-center justify-between gap-3">

                              <Badge
                                  tone={
                                    priorityTone(
                                        project.priority,
                                    ) as any
                                  }
                              >
                                {
                                  project.priority
                                }
                              </Badge>

                              {project.departmentName && (
                                  <span className="truncate text-xs text-text-muted">
                                                {
                                                  project.departmentName
                                                }
                                            </span>
                              )}

                            </div>

                            {/* DATE / MANAGER */}

                            <div className="mt-5 space-y-2 border-t border-border pt-4">

                              <div className="flex items-center gap-2 text-xs text-text-muted">

                                <CalendarDays className="size-4" />

                                <span>
                                                {
                                                    project.startDate ||
                                                    '—'
                                                }{' '}
                                  →{' '}
                                  {
                                      project.endDate ||
                                      '—'
                                  }
                                            </span>

                              </div>

                              {project.managerName && (
                                  <div className="flex items-center gap-2 text-xs text-text-muted">

                                    <Users className="size-4" />

                                    <span>
                                                    {
                                                      project.managerName
                                                    }
                                                </span>

                                  </div>
                              )}

                            </div>

                            {/* QUICK STATUS */}

                            {canCreateOrEdit && (
                                <div className="mt-4">

                                  <label className="text-xs font-medium text-text-muted">
                                    Status
                                  </label>

                                  <select
                                      value={
                                        project.status
                                      }
                                      disabled={
                                          updatingStatusId ===
                                          project.id
                                      }
                                      onChange={(
                                          e,
                                      ) =>
                                          updateProjectStatus(
                                              project,
                                              e
                                                  .target
                                                  .value as ProjectStatus,
                                          )
                                      }
                                      className="mt-1 h-9 w-full rounded-lg border border-border-strong bg-surface px-2 text-xs text-text outline-none focus:border-accent-500 disabled:opacity-50"
                                  >

                                    <option value="PLANNING">
                                      Planning
                                    </option>

                                    <option value="ACTIVE">
                                      Active
                                    </option>

                                    <option value="ON_HOLD">
                                      On Hold
                                    </option>

                                    <option value="COMPLETED">
                                      Completed
                                    </option>

                                    <option value="CANCELLED">
                                      Cancelled
                                    </option>

                                  </select>

                                </div>
                            )}

                            {/* QUICK PROGRESS */}

                            {canCreateOrEdit && (
                                <div className="mt-3">

                                  <label className="text-xs font-medium text-text-muted">
                                    Progress
                                  </label>

                                  <div className="mt-1 flex items-center gap-2">

                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        defaultValue={
                                            project.progress ??
                                            0
                                        }
                                        disabled={
                                            updatingProgressId ===
                                            project.id
                                        }
                                        onBlur={(
                                            e,
                                        ) => {
                                          const value =
                                              Number(
                                                  e
                                                      .target
                                                      .value,
                                              )

                                          if (
                                              value !==
                                              project.progress
                                          ) {
                                            updateProjectProgress(
                                                project,
                                                value,
                                            )
                                          }
                                        }}
                                        className="h-9 w-full rounded-lg border border-border-strong bg-surface px-2 text-xs text-text outline-none focus:border-accent-500 disabled:opacity-50"
                                    />

                                    <span className="text-xs text-text-muted">
                                                    %
                                                </span>

                                  </div>

                                </div>
                            )}

                            {/* ACTIONS */}

                            {canCreateOrEdit && (
                                <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">

                                  {/* EDIT */}

                                  <button
                                      type="button"
                                      onClick={() =>
                                          openEditForm(
                                              project,
                                          )
                                      }
                                      disabled={
                                          deletingProjectId ===
                                          project.id
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-text transition hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
                                  >

                                    <Pencil className="size-3.5" />

                                    Edit

                                  </button>

                                  {/* DELETE */}

                                  {canDelete && (
                                      <button
                                          type="button"
                                          onClick={() =>
                                              deleteProject(
                                                  project,
                                              )
                                          }
                                          disabled={
                                              deletingProjectId ===
                                              project.id
                                          }
                                          className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-medium text-danger-600 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      >

                                        <Trash2 className="size-3.5" />

                                        {deletingProjectId ===
                                        project.id
                                            ? 'Deleting...'
                                            : 'Delete'}

                                      </button>
                                  )}

                                </div>
                            )}

                          </Card>
                      ),
                  )}

                </div>
            )}

      </div>
  )
}