import { useEffect, useMemo, useState } from 'react'
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'

import {
  departmentService,
  type Department,
  type DepartmentRequest,
} from '@/services/departmentService'

import { ROLES } from '@/utils/constants'

export function DepartmentList() {
  const { user } = useAuth()

  const userRole = String(
      user?.role ?? '',
  ).toUpperCase()

  const canManageDepartments =
      userRole === ROLES.ADMIN ||
      userRole === 'ROLE_ADMIN'

  // ====================================================
  // DEPARTMENTS
  // ====================================================

  const [departments, setDepartments] =
      useState<Department[]>([])

  const [search, setSearch] = useState('')

  const [loading, setLoading] =
      useState(true)

  const [error, setError] =
      useState('')

  // ====================================================
  // CREATE
  // ====================================================

  const [showCreateForm, setShowCreateForm] =
      useState(false)

  const [creatingDepartment, setCreatingDepartment] =
      useState(false)

  const [createError, setCreateError] =
      useState('')

  const [createForm, setCreateForm] =
      useState<DepartmentRequest>({
        name: '',
      })

  // ====================================================
  // EDIT
  // ====================================================

  const [editingDepartment, setEditingDepartment] =
      useState<Department | null>(null)

  const [updatingDepartment, setUpdatingDepartment] =
      useState(false)

  const [editError, setEditError] =
      useState('')

  const [editForm, setEditForm] =
      useState<DepartmentRequest>({
        name: '',
      })

  // ====================================================
  // DELETE
  // ====================================================

  const [deletingDepartmentId, setDeletingDepartmentId] =
      useState<number | null>(null)

  // ====================================================
  // LOAD DEPARTMENTS
  // ====================================================

  async function loadDepartments() {
    try {
      setLoading(true)
      setError('')

      const data =
          await departmentService.getAll()

      setDepartments(data)
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to load departments.',
      )
    } finally {
      setLoading(false)
    }
  }

  // ====================================================
  // CREATE
  // ====================================================

  function openCreateForm() {
    setCreateForm({
      name: '',
    })

    setCreateError('')

    setShowCreateForm(true)
  }

  function closeCreateForm() {
    if (creatingDepartment) {
      return
    }

    setShowCreateForm(false)

    setCreateError('')
  }

  async function createDepartment() {
    try {
      setCreatingDepartment(true)
      setCreateError('')

      const name =
          createForm.name.trim()

      if (!name) {
        setCreateError(
            'Department name is required.',
        )
        return
      }

      const createdDepartment =
          await departmentService.create({
            name,
          })

      setDepartments(
          (currentDepartments) => [
            ...currentDepartments,
            createdDepartment,
          ],
      )

      setShowCreateForm(false)

      setCreateForm({
        name: '',
      })
    } catch (err) {
      console.error(err)

      setCreateError(
          err instanceof Error
              ? err.message
              : 'Unable to create department.',
      )
    } finally {
      setCreatingDepartment(false)
    }
  }

  // ====================================================
  // EDIT
  // ====================================================

  function openEditForm(
      department: Department,
  ) {
    setEditingDepartment(department)

    setEditForm({
      name: department.name,
    })

    setEditError('')
  }

  function closeEditForm() {
    if (updatingDepartment) {
      return
    }

    setEditingDepartment(null)

    setEditForm({
      name: '',
    })

    setEditError('')
  }

  async function updateDepartment() {
    if (!editingDepartment) {
      return
    }

    try {
      setUpdatingDepartment(true)
      setEditError('')

      const name =
          editForm.name.trim()

      if (!name) {
        setEditError(
            'Department name is required.',
        )
        return
      }

      const updatedDepartment =
          await departmentService.update(
              editingDepartment.id,
              {
                name,
              },
          )

      setDepartments(
          (currentDepartments) =>
              currentDepartments.map(
                  (department) =>
                      department.id ===
                      updatedDepartment.id
                          ? updatedDepartment
                          : department,
              ),
      )

      closeEditForm()
    } catch (err) {
      console.error(err)

      setEditError(
          err instanceof Error
              ? err.message
              : 'Unable to update department.',
      )
    } finally {
      setUpdatingDepartment(false)
    }
  }

  // ====================================================
  // DELETE
  // ====================================================

  async function deleteDepartment(
      department: Department,
  ) {
    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${department.name}"? This action cannot be undone.`,
        )

    if (!confirmed) {
      return
    }

    try {
      setDeletingDepartmentId(
          department.id,
      )

      setError('')

      await departmentService.delete(
          department.id,
      )

      setDepartments(
          (currentDepartments) =>
              currentDepartments.filter(
                  (item) =>
                      item.id !==
                      department.id,
              ),
      )
    } catch (err) {
      console.error(err)

      setError(
          err instanceof Error
              ? err.message
              : 'Unable to delete department.',
      )
    } finally {
      setDeletingDepartmentId(null)
    }
  }

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadDepartments()
  }, [])

  // ====================================================
  // SEARCH
  // ====================================================

  const filteredDepartments =
      useMemo(() => {
        const query =
            search
                .toLowerCase()
                .trim()

        if (!query) {
          return departments
        }

        return departments.filter(
            (department) =>
                department.name
                    .toLowerCase()
                    .includes(query),
        )
      }, [
        departments,
        search,
      ])

  // ====================================================
  // UI
  // ====================================================

  return (
      <div>

        {/* =========================================
                HEADER
            ========================================= */}

        <div className="flex items-start justify-between gap-4">

          <PageHeader
              title="Departments"
              description="Organize employees and projects by department."
          />

          {canManageDepartments && (
              <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent-600 px-4 text-sm font-medium text-white transition hover:bg-accent-700"
              >
                <Plus className="size-4" />

                Add Department
              </button>
          )}

        </div>

        {/* =========================================
                CREATE FORM
            ========================================= */}

        {showCreateForm &&
            canManageDepartments && (
                <Card className="mt-6">

                  <div className="flex items-center justify-between border-b border-border pb-4">

                    <div>

                      <h2 className="font-display text-lg font-semibold text-text">
                        Add Department
                      </h2>

                      <p className="mt-1 text-sm text-text-muted">
                        Create a new organizational department.
                      </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                          closeCreateForm
                        }
                        disabled={
                          creatingDepartment
                        }
                        className="rounded-lg p-2 text-text-muted transition hover:bg-bg hover:text-text disabled:opacity-50"
                        aria-label="Close add department form"
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

                  <div className="mt-5">

                    <label className="text-sm font-medium text-text">
                      Department Name
                    </label>

                    <input
                        value={
                          createForm.name
                        }
                        onChange={(
                            event,
                        ) =>
                            setCreateForm(
                                {
                                  name: event
                                      .target
                                      .value,
                                },
                            )
                        }
                        placeholder="Engineering"
                        className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                    />

                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">

                    <button
                        type="button"
                        onClick={
                          closeCreateForm
                        }
                        disabled={
                          creatingDepartment
                        }
                        className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text transition hover:bg-bg disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                        type="button"
                        onClick={
                          createDepartment
                        }
                        disabled={
                          creatingDepartment
                        }
                        className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {creatingDepartment
                          ? 'Creating...'
                          : 'Create Department'}
                    </button>

                  </div>

                </Card>
            )}

        {/* =========================================
                EDIT FORM
            ========================================= */}

        {editingDepartment &&
            canManageDepartments && (
                <Card className="mt-6">

                  <div className="flex items-center justify-between border-b border-border pb-4">

                    <div>

                      <h2 className="font-display text-lg font-semibold text-text">
                        Edit Department
                      </h2>

                      <p className="mt-1 text-sm text-text-muted">
                        Update the department name.
                      </p>

                    </div>

                    <button
                        type="button"
                        onClick={
                          closeEditForm
                        }
                        disabled={
                          updatingDepartment
                        }
                        className="rounded-lg p-2 text-text-muted transition hover:bg-bg hover:text-text disabled:opacity-50"
                        aria-label="Close edit department form"
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

                  <div className="mt-5">

                    <label className="text-sm font-medium text-text">
                      Department Name
                    </label>

                    <input
                        value={
                          editForm.name
                        }
                        onChange={(
                            event,
                        ) =>
                            setEditForm(
                                {
                                  name: event
                                      .target
                                      .value,
                                },
                            )
                        }
                        placeholder="Engineering"
                        className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                    />

                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">

                    <button
                        type="button"
                        onClick={
                          closeEditForm
                        }
                        disabled={
                          updatingDepartment
                        }
                        className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text transition hover:bg-bg disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                        type="button"
                        onClick={
                          updateDepartment
                        }
                        disabled={
                          updatingDepartment
                        }
                        className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingDepartment
                          ? 'Saving...'
                          : 'Save Changes'}
                    </button>

                  </div>

                </Card>
            )}

        {/* =========================================
                SEARCH
            ========================================= */}

        <div className="mt-6">

          <div className="relative w-full max-w-md">

            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />

            <input
                value={search}
                onChange={(event) =>
                    setSearch(
                        event.target.value,
                    )
                }
                placeholder="Search departments..."
                className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm text-text outline-none focus:border-accent-500"
            />

          </div>

        </div>

        {/* =========================================
                ERROR
            ========================================= */}

        {error && (
            <Card className="mt-6 border-danger-200">

              <p className="text-sm text-danger-600">
                {error}
              </p>

              <button
                  type="button"
                  onClick={
                    loadDepartments
                  }
                  className="mt-3 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-text"
              >
                Try again
              </button>

            </Card>
        )}

        {/* =========================================
                LOADING
            ========================================= */}

        {loading && (
            <Card className="mt-6">

              <div className="space-y-4">

                {[1, 2, 3, 4].map(
                    (item) => (
                        <div
                            key={item}
                            className="h-14 animate-pulse rounded-lg bg-bg"
                        />
                    ),
                )}

              </div>

            </Card>
        )}

        {/* =========================================
                TABLE
            ========================================= */}

        {!loading &&
            !error && (
                <Card className="mt-6 overflow-hidden p-0">

                  <div className="overflow-x-auto">

                    <table className="w-full">

                      <thead>

                      <tr className="border-b border-border bg-bg/50 text-left">

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                          ID
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                          Department
                        </th>

                        {canManageDepartments && (
                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                              Actions
                            </th>
                        )}

                      </tr>

                      </thead>

                      <tbody>

                      {filteredDepartments.map(
                          (
                              department,
                          ) => (
                              <tr
                                  key={
                                    department.id
                                  }
                                  className="border-b border-border last:border-b-0 hover:bg-bg/30"
                              >

                                <td className="px-5 py-4 text-sm text-text-muted">
                                  {
                                    department.id
                                  }
                                </td>

                                <td className="px-5 py-4">

                                  <p className="text-sm font-semibold text-text">
                                    {
                                      department.name
                                    }
                                  </p>

                                </td>

                                {canManageDepartments && (
                                    <td className="px-5 py-4">

                                      <div className="flex items-center gap-2">

                                        {/* EDIT */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditForm(
                                                    department,
                                                )
                                            }
                                            disabled={
                                                deletingDepartmentId ===
                                                department.id
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-text transition hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                          <Pencil className="size-3.5" />

                                          Edit

                                        </button>

                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteDepartment(
                                                    department,
                                                )
                                            }
                                            disabled={
                                                deletingDepartmentId ===
                                                department.id
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-medium text-danger-600 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
                                        >

                                          <Trash2 className="size-3.5" />

                                          {deletingDepartmentId ===
                                          department.id
                                              ? 'Deleting...'
                                              : 'Delete'}

                                        </button>

                                      </div>

                                    </td>
                                )}

                              </tr>
                          ),
                      )}

                      </tbody>

                    </table>

                  </div>

                  {/* EMPTY STATE */}

                  {filteredDepartments.length ===
                      0 && (
                          <div className="px-6 py-12 text-center">

                            <h3 className="font-display font-semibold text-text">
                              No departments found
                            </h3>

                            <p className="mt-1 text-sm text-text-muted">
                              Try changing your search.
                            </p>

                          </div>
                      )}

                </Card>
            )}

      </div>
  )
}