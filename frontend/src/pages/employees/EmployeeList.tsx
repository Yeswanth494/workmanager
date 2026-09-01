import { useEffect, useMemo, useState } from 'react'
import {
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
import { useAuth } from '@/hooks/useAuth'

import {
    employeeService,
    type Employee,
    type EmployeeCreateRequest,
    type EmployeeUpdateRequest,
} from '@/services/employeeService'

import {
    departmentService,
    type Department,
} from '@/services/departmentService'

import {
    userService,
    type UserSummary,
} from '@/services/userService'

import { ROLES } from '@/utils/constants'

export function EmployeeList() {
    const { user } = useAuth()

    const userRole = String(user?.role ?? '').toUpperCase()

    const canManageEmployees =
        userRole === ROLES.ADMIN ||
        userRole === 'ROLE_ADMIN'

    // ----------------------------------------------------
    // Employee list
    // ----------------------------------------------------

    const [employees, setEmployees] = useState<Employee[]>([])

    const [search, setSearch] = useState('')

    const [departmentFilter, setDepartmentFilter] =
        useState('ALL')

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState('')

    // ----------------------------------------------------
    // Create employee
    // ----------------------------------------------------

    const [showCreateForm, setShowCreateForm] =
        useState(false)

    const [departments, setDepartments] =
        useState<Department[]>([])

    const [users, setUsers] =
        useState<UserSummary[]>([])

    const [loadingFormData, setLoadingFormData] =
        useState(false)

    const [creatingEmployee, setCreatingEmployee] =
        useState(false)

    const [formError, setFormError] = useState('')

    const [form, setForm] =
        useState<EmployeeCreateRequest>({
            employeeCode: '',
            phone: '',
            departmentId: 0,
            title: '',
            joiningDate: '',
            userId: 0,
        })

    // ----------------------------------------------------
    // Edit employee
    // ----------------------------------------------------

    const [editingEmployee, setEditingEmployee] =
        useState<Employee | null>(null)

    const [updatingEmployee, setUpdatingEmployee] =
        useState(false)

    const [editForm, setEditForm] =
        useState<EmployeeUpdateRequest>({
            phone: '',
            departmentId: 0,
            title: '',
            joiningDate: '',
        })

    // ----------------------------------------------------
    // Delete employee
    // ----------------------------------------------------

    const [deletingEmployeeId, setDeletingEmployeeId] =
        useState<number | null>(null)

    // ====================================================
    // LOAD EMPLOYEES
    // ====================================================

    async function loadEmployees() {
        try {
            setLoading(true)
            setError('')

            const data =
                await employeeService.getAll()

            setEmployees(data)
        } catch (err) {
            console.error(err)

            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load employees.',
            )
        } finally {
            setLoading(false)
        }
    }

    // ====================================================
    // LOAD CREATE FORM DATA
    // ====================================================

    async function loadCreateFormData() {
        try {
            setLoadingFormData(true)
            setFormError('')

            const [
                departmentData,
                userData,
            ] = await Promise.all([
                departmentService.getAll(),
                userService.getAll(),
            ])

            setDepartments(departmentData)

            setUsers(
                userData.filter(
                    (item) =>
                        item.role === 'EMPLOYEE',
                ),
            )
        } catch (err) {
            console.error(err)

            setFormError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load users and departments.',
            )
        } finally {
            setLoadingFormData(false)
        }
    }

    // ====================================================
    // OPEN CREATE FORM
    // ====================================================

    async function openCreateForm() {
        setForm({
            employeeCode: '',
            phone: '',
            departmentId: 0,
            title: '',
            joiningDate: '',
            userId: 0,
        })

        setFormError('')
        setShowCreateForm(true)

        await loadCreateFormData()
    }

    // ====================================================
    // CREATE EMPLOYEE
    // ====================================================

    async function createEmployee() {
        try {
            setCreatingEmployee(true)
            setFormError('')

            if (!form.employeeCode.trim()) {
                setFormError(
                    'Employee code is required.',
                )
                return
            }

            if (!form.userId) {
                setFormError(
                    'Please select a user.',
                )
                return
            }

            if (!form.departmentId) {
                setFormError(
                    'Please select a department.',
                )
                return
            }

            if (!form.joiningDate) {
                setFormError(
                    'Joining date is required.',
                )
                return
            }

            const payload: EmployeeCreateRequest = {
                ...form,
                employeeCode:
                    form.employeeCode.trim(),
                phone:
                    form.phone?.trim() ||
                    undefined,
                title:
                    form.title?.trim() ||
                    undefined,
            }

            const createdEmployee =
                await employeeService.create(
                    payload,
                )

            setEmployees(
                (currentEmployees) => [
                    ...currentEmployees,
                    createdEmployee,
                ],
            )

            setShowCreateForm(false)

            setForm({
                employeeCode: '',
                phone: '',
                departmentId: 0,
                title: '',
                joiningDate: '',
                userId: 0,
            })
        } catch (err) {
            console.error(err)

            setFormError(
                err instanceof Error
                    ? err.message
                    : 'Unable to create employee.',
            )
        } finally {
            setCreatingEmployee(false)
        }
    }

    // ====================================================
    // OPEN EDIT FORM
    // ====================================================

    function openEditForm(
        employee: Employee,
    ) {
        const department =
            departments.find(
                (item) =>
                    item.name ===
                    employee.department,
            )

        setEditingEmployee(employee)

        setEditForm({
            phone:
                employee.phone ?? '',
            departmentId:
                department?.id ?? 0,
            title:
                employee.title ?? '',
            joiningDate:
                employee.joiningDate ?? '',
        })

        setFormError('')

        if (departments.length === 0) {
            loadCreateFormData()
        }
    }

    // ====================================================
    // CLOSE EDIT FORM
    // ====================================================

    function closeEditForm() {
        if (updatingEmployee) {
            return
        }

        setEditingEmployee(null)

        setEditForm({
            phone: '',
            departmentId: 0,
            title: '',
            joiningDate: '',
        })

        setFormError('')
    }

    // ====================================================
    // UPDATE EMPLOYEE
    // ====================================================

    async function updateEmployee() {
        if (!editingEmployee) {
            return
        }

        try {
            setUpdatingEmployee(true)
            setFormError('')

            if (!editForm.departmentId) {
                setFormError(
                    'Please select a department.',
                )
                return
            }

            if (!editForm.joiningDate) {
                setFormError(
                    'Joining date is required.',
                )
                return
            }

            const updatedEmployee =
                await employeeService.update(
                    editingEmployee.id,
                    {
                        phone:
                            editForm.phone?.trim() ||
                            '',
                        departmentId:
                        editForm.departmentId,
                        title:
                            editForm.title?.trim() ||
                            '',
                        joiningDate:
                        editForm.joiningDate,
                    },
                )

            setEmployees(
                (currentEmployees) =>
                    currentEmployees.map(
                        (employee) =>
                            employee.id ===
                            updatedEmployee.id
                                ? updatedEmployee
                                : employee,
                    ),
            )

            closeEditForm()
        } catch (err) {
            console.error(err)

            setFormError(
                err instanceof Error
                    ? err.message
                    : 'Unable to update employee.',
            )
        } finally {
            setUpdatingEmployee(false)
        }
    }

    // ====================================================
    // DELETE EMPLOYEE
    // ====================================================

    async function deleteEmployee(
        employee: Employee,
    ) {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${employee.name} (${employee.employeeCode})? This action cannot be undone.`,
            )

        if (!confirmed) {
            return
        }

        try {
            setDeletingEmployeeId(
                employee.id,
            )

            setError('')

            await employeeService.delete(
                employee.id,
            )

            setEmployees(
                (currentEmployees) =>
                    currentEmployees.filter(
                        (item) =>
                            item.id !==
                            employee.id,
                    ),
            )
        } catch (err) {
            console.error(err)

            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to delete employee.',
            )
        } finally {
            setDeletingEmployeeId(null)
        }
    }

    // ====================================================
    // INITIAL LOAD
    // ====================================================

    useEffect(() => {
        loadEmployees()
    }, [])

    // ====================================================
    // DEPARTMENT FILTER OPTIONS
    // ====================================================

    const departmentsForFilter =
        useMemo(() => {
            return Array.from(
                new Set(
                    employees
                        .map(
                            (employee) =>
                                employee.department,
                        )
                        .filter(Boolean),
                ),
            ).sort()
        }, [employees])

    // ====================================================
    // SEARCH + FILTER
    // ====================================================

    const filteredEmployees =
        useMemo(() => {
            const query =
                search
                    .toLowerCase()
                    .trim()

            return employees.filter(
                (employee) => {
                    const matchesSearch =
                        !query ||
                        [
                            employee.employeeCode,
                            employee.name,
                            employee.email,
                            employee.phone,
                            employee.department,
                            employee.title,
                            employee.role,
                        ]
                            .filter(Boolean)
                            .some(
                                (value) =>
                                    String(value)
                                        .toLowerCase()
                                        .includes(
                                            query,
                                        ),
                            )

                    const matchesDepartment =
                        departmentFilter ===
                        'ALL' ||
                        employee.department ===
                        departmentFilter

                    return (
                        matchesSearch &&
                        matchesDepartment
                    )
                },
            )
        }, [
            employees,
            search,
            departmentFilter,
        ])

    // ====================================================
    // ROLE BADGE
    // ====================================================

    function roleTone(
        role: string,
    ) {
        switch (role) {
            case 'ADMIN':
                return 'danger'

            case 'MANAGER':
                return 'warning'

            default:
                return 'neutral'
        }
    }

    // ====================================================
    // UI
    // ====================================================

    return (
        <div>

            {/* =========================================
                PAGE HEADER
            ========================================= */}

            <div className="flex items-start justify-between gap-4">

                <PageHeader
                    title="Employees"
                    description="Directory, search, filters, and profiles for every employee."
                />

                {canManageEmployees && (
                    <button
                        type="button"
                        onClick={
                            openCreateForm
                        }
                        className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent-600 px-4 text-sm font-medium text-white transition hover:bg-accent-700"
                    >
                        <Plus className="size-4" />

                        Add Employee
                    </button>
                )}

            </div>

            {/* =========================================
                CREATE EMPLOYEE
            ========================================= */}

            {showCreateForm &&
                canManageEmployees && (
                    <Card className="mt-6">

                        <div className="flex items-center justify-between border-b border-border pb-4">

                            <div>

                                <h2 className="font-display text-lg font-semibold text-text">
                                    Add Employee
                                </h2>

                                <p className="mt-1 text-sm text-text-muted">
                                    Create an employee profile for an existing user.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(
                                        false,
                                    )

                                    setFormError(
                                        '',
                                    )
                                }}
                                className="rounded-lg p-2 text-text-muted transition hover:bg-bg hover:text-text"
                                aria-label="Close add employee form"
                            >
                                <X className="size-5" />
                            </button>

                        </div>

                        {formError && (
                            <div className="mt-4 rounded-lg border border-danger-200 bg-danger-50 p-3">
                                <p className="text-sm text-danger-600">
                                    {formError}
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

                                    {/* USER */}

                                    <div className="md:col-span-2">

                                        <label className="text-sm font-medium text-text">
                                            User
                                        </label>

                                        <select
                                            value={
                                                form.userId ||
                                                ''
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        userId:
                                                            Number(
                                                                event
                                                                    .target
                                                                    .value,
                                                            ),
                                                    },
                                                )
                                            }
                                            className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                                        >
                                            <option value="">
                                                Select user
                                            </option>

                                            {users.map(
                                                (
                                                    item,
                                                ) => (
                                                    <option
                                                        key={
                                                            item.id
                                                        }
                                                        value={
                                                            item.id
                                                        }
                                                    >
                                                        {
                                                            item.name
                                                        }{' '}
                                                        —{' '}
                                                        {
                                                            item.email
                                                        }
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                    </div>

                                    {/* EMPLOYEE CODE */}

                                    <div>

                                        <label className="text-sm font-medium text-text">
                                            Employee Code
                                        </label>

                                        <input
                                            value={
                                                form.employeeCode
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        employeeCode:
                                                        event
                                                            .target
                                                            .value,
                                                    },
                                                )
                                            }
                                            placeholder="EMP006"
                                            className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                                        />

                                    </div>

                                    {/* PHONE */}

                                    <div>

                                        <label className="text-sm font-medium text-text">
                                            Phone
                                        </label>

                                        <input
                                            value={
                                                form.phone ??
                                                ''
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        phone: event
                                                            .target
                                                            .value,
                                                    },
                                                )
                                            }
                                            placeholder="9876543210"
                                            className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                                        />

                                    </div>

                                    {/* DEPARTMENT */}

                                    <div>

                                        <label className="text-sm font-medium text-text">
                                            Department
                                        </label>

                                        <select
                                            value={
                                                form.departmentId ||
                                                ''
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        departmentId:
                                                            Number(
                                                                event
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

                                    {/* TITLE */}

                                    <div>

                                        <label className="text-sm font-medium text-text">
                                            Title
                                        </label>

                                        <input
                                            value={
                                                form.title ??
                                                ''
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        title: event
                                                            .target
                                                            .value,
                                                    },
                                                )
                                            }
                                            placeholder="Software Engineer"
                                            className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                                        />

                                    </div>

                                    {/* JOINING DATE */}

                                    <div>

                                        <label className="text-sm font-medium text-text">
                                            Joining Date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                form.joiningDate
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setForm(
                                                    {
                                                        ...form,
                                                        joiningDate:
                                                        event
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

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateForm(
                                                false,
                                            )

                                            setFormError(
                                                '',
                                            )
                                        }}
                                        disabled={
                                            creatingEmployee
                                        }
                                        className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text transition hover:bg-bg disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            createEmployee
                                        }
                                        disabled={
                                            creatingEmployee
                                        }
                                        className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {creatingEmployee
                                            ? 'Creating...'
                                            : 'Create Employee'}
                                    </button>

                                </div>

                            </>
                        )}

                    </Card>
                )}

            {/* =========================================
                EDIT EMPLOYEE
            ========================================= */}

            {editingEmployee &&
                canManageEmployees && (
                    <Card className="mt-6">

                        <div className="flex items-center justify-between border-b border-border pb-4">

                            <div>

                                <h2 className="font-display text-lg font-semibold text-text">
                                    Edit Employee
                                </h2>

                                <p className="mt-1 text-sm text-text-muted">
                                    Update employee profile details.
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeEditForm
                                }
                                disabled={
                                    updatingEmployee
                                }
                                className="rounded-lg p-2 text-text-muted transition hover:bg-bg hover:text-text disabled:opacity-50"
                                aria-label="Close edit employee form"
                            >
                                <X className="size-5" />
                            </button>

                        </div>

                        {formError && (
                            <div className="mt-4 rounded-lg border border-danger-200 bg-danger-50 p-3">
                                <p className="text-sm text-danger-600">
                                    {formError}
                                </p>
                            </div>
                        )}

                        <div className="mt-5 grid gap-4 md:grid-cols-2">

                            {/* EMPLOYEE READ ONLY */}

                            <div>

                                <label className="text-sm font-medium text-text">
                                    Employee
                                </label>

                                <input
                                    value={`${editingEmployee.name} — ${editingEmployee.employeeCode}`}
                                    disabled
                                    className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-bg px-3 text-sm text-text-muted"
                                />

                            </div>

                            {/* EMAIL READ ONLY */}

                            <div>

                                <label className="text-sm font-medium text-text">
                                    Email
                                </label>

                                <input
                                    value={
                                        editingEmployee.email
                                    }
                                    disabled
                                    className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-bg px-3 text-sm text-text-muted"
                                />

                            </div>

                            {/* PHONE */}

                            <div>

                                <label className="text-sm font-medium text-text">
                                    Phone
                                </label>

                                <input
                                    value={
                                        editForm.phone ??
                                        ''
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setEditForm(
                                            {
                                                ...editForm,
                                                phone: event
                                                    .target
                                                    .value,
                                            },
                                        )
                                    }
                                    placeholder="9876543210"
                                    className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                                />

                            </div>

                            {/* DEPARTMENT */}

                            <div>

                                <label className="text-sm font-medium text-text">
                                    Department
                                </label>

                                <select
                                    value={
                                        editForm.departmentId ||
                                        ''
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setEditForm(
                                            {
                                                ...editForm,
                                                departmentId:
                                                    Number(
                                                        event
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

                            {/* TITLE */}

                            <div>

                                <label className="text-sm font-medium text-text">
                                    Title
                                </label>

                                <input
                                    value={
                                        editForm.title ??
                                        ''
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setEditForm(
                                            {
                                                ...editForm,
                                                title: event
                                                    .target
                                                    .value,
                                            },
                                        )
                                    }
                                    placeholder="Software Engineer"
                                    className="mt-1 h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                                />

                            </div>

                            {/* JOINING DATE */}

                            <div>

                                <label className="text-sm font-medium text-text">
                                    Joining Date
                                </label>

                                <input
                                    type="date"
                                    value={
                                        editForm.joiningDate ??
                                        ''
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        setEditForm(
                                            {
                                                ...editForm,
                                                joiningDate:
                                                event
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

                            <button
                                type="button"
                                onClick={
                                    closeEditForm
                                }
                                disabled={
                                    updatingEmployee
                                }
                                className="rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-text transition hover:bg-bg disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    updateEmployee
                                }
                                disabled={
                                    updatingEmployee
                                }
                                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updatingEmployee
                                    ? 'Saving...'
                                    : 'Save Changes'}
                            </button>

                        </div>

                    </Card>
                )}

            {/* =========================================
                FILTERS
            ========================================= */}

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                <div className="relative w-full max-w-md">

                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-faint" />

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value,
                            )
                        }
                        placeholder="Search employees..."
                        className="h-10 w-full rounded-lg border border-border-strong bg-surface pl-9 pr-3 text-sm text-text outline-none focus:border-accent-500"
                    />

                </div>

                <select
                    value={
                        departmentFilter
                    }
                    onChange={(event) =>
                        setDepartmentFilter(
                            event.target.value,
                        )
                    }
                    className="h-10 rounded-lg border border-border-strong bg-surface px-3 text-sm text-text outline-none focus:border-accent-500"
                >
                    <option value="ALL">
                        All departments
                    </option>

                    {departmentsForFilter.map(
                        (department) => (
                            <option
                                key={department}
                                value={department}
                            >
                                {department}
                            </option>
                        ),
                    )}
                </select>

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
                            loadEmployees
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
                                    className="h-16 animate-pulse rounded-lg bg-bg"
                                />
                            ),
                        )}

                    </div>

                </Card>
            )}

            {/* =========================================
                EMPLOYEE TABLE
            ========================================= */}

            {!loading &&
                !error && (
                    <Card className="mt-6 overflow-hidden p-0">

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1050px]">

                                <thead>

                                <tr className="border-b border-border bg-bg/50 text-left">

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Employee
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Contact
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Department
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Title
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Role
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Joined
                                    </th>

                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                        Actions
                                    </th>

                                </tr>

                                </thead>

                                <tbody>

                                {filteredEmployees.map(
                                    (
                                        employee,
                                    ) => (
                                        <tr
                                            key={
                                                employee.id
                                            }
                                            className="border-b border-border last:border-b-0 hover:bg-bg/30"
                                        >

                                            {/* EMPLOYEE */}

                                            <td className="px-5 py-4">

                                                <div>

                                                    <p className="text-sm font-semibold text-text">
                                                        {
                                                            employee.name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-text-muted">
                                                        {
                                                            employee.employeeCode
                                                        }
                                                    </p>

                                                </div>

                                            </td>

                                            {/* CONTACT */}

                                            <td className="px-5 py-4">

                                                <p className="text-sm text-text">
                                                    {
                                                        employee.email
                                                    }
                                                </p>

                                                {employee.phone && (
                                                    <p className="mt-1 text-xs text-text-muted">
                                                        {
                                                            employee.phone
                                                        }
                                                    </p>
                                                )}

                                            </td>

                                            {/* DEPARTMENT */}

                                            <td className="px-5 py-4 text-sm text-text">
                                                {
                                                    employee.department ??
                                                    '—'
                                                }
                                            </td>

                                            {/* TITLE */}

                                            <td className="px-5 py-4 text-sm text-text">
                                                {
                                                    employee.title ??
                                                    '—'
                                                }
                                            </td>

                                            {/* ROLE */}

                                            <td className="px-5 py-4">

                                                <Badge
                                                    tone={
                                                        roleTone(
                                                            employee.role,
                                                        ) as any
                                                    }
                                                >
                                                    {
                                                        employee.role
                                                    }
                                                </Badge>

                                            </td>

                                            {/* JOINING DATE */}

                                            <td className="px-5 py-4 text-sm text-text-muted">
                                                {
                                                    employee.joiningDate ??
                                                    '—'
                                                }
                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-4">

                                                {canManageEmployees && (
                                                    <div className="flex items-center gap-2">

                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditForm(
                                                                    employee,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingEmployeeId ===
                                                                employee.id
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
                                                                deleteEmployee(
                                                                    employee,
                                                                )
                                                            }
                                                            disabled={
                                                                deletingEmployeeId ===
                                                                employee.id
                                                            }
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-medium text-danger-600 transition hover:bg-danger-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >

                                                            <Trash2 className="size-3.5" />

                                                            {deletingEmployeeId ===
                                                            employee.id
                                                                ? 'Deleting...'
                                                                : 'Delete'}

                                                        </button>

                                                    </div>
                                                )}

                                            </td>

                                        </tr>
                                    ),
                                )}

                                </tbody>

                            </table>

                        </div>

                        {/* EMPTY STATE */}

                        {filteredEmployees.length ===
                            0 && (
                                <div className="px-6 py-12 text-center">

                                    <Users className="mx-auto size-10 text-text-faint" />

                                    <h3 className="mt-3 font-display font-semibold text-text">
                                        No employees found
                                    </h3>

                                    <p className="mt-1 text-sm text-text-muted">
                                        Try changing your search or department filter.
                                    </p>

                                </div>
                            )}

                    </Card>
                )}

        </div>
    )
}