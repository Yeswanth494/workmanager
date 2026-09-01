import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleRoute } from './RoleRoute'

import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ForgotPassword } from '@/pages/auth/ForgotPassword'
import { ResetPassword } from '@/pages/auth/ResetPassword'

import { Dashboard } from '@/pages/dashboard/Dashboard'
import { Attendance } from '@/pages/attendance/Attendance'
import { MyLeave } from '@/pages/leave/MyLeave'
import { LeaveApproval } from '@/pages/leave/LeaveApproval'
import { MyTimesheets } from '@/pages/timesheets/MyTimesheets'
import { TimesheetApprovals } from '@/pages/timesheets/TimesheetApprovals'
import { Notifications } from '@/pages/notifications/Notifications'
import { Profile } from '@/pages/profile/Profile'

import { EmployeeList } from '@/pages/employees/EmployeeList'
import { DepartmentList } from '@/pages/departments/DepartmentList'
import { ProjectList } from '@/pages/projects/ProjectList'
import { TaskList } from '@/pages/tasks/TaskList'
import { ReportsDashboard } from '@/pages/reports/ReportsDashboard'

import { Unauthorized } from '@/pages/errors/Unauthorized'
import { NotFound } from '@/pages/errors/NotFound'

export function AppRoutes() {
    return (
        <Routes>
            {/* =====================================================
                PUBLIC AUTH ROUTES
            ===================================================== */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />
                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />
            </Route>

            {/* =====================================================
                AUTHENTICATED APPLICATION
            ===================================================== */}
            <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppLayout />}>
                    <Route
                        index
                        element={
                            <Navigate
                                to="dashboard"
                                replace
                            />
                        }
                    />

                    {/* =================================================
                        ALL AUTHENTICATED ROLES
                    ================================================= */}
                    <Route
                        path="dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="attendance"
                        element={<Attendance />}
                    />

                    <Route
                        path="projects"
                        element={<ProjectList />}
                    />

                    <Route
                        path="tasks"
                        element={<TaskList />}
                    />

                    <Route
                        path="notifications"
                        element={<Notifications />}
                    />

                    <Route
                        path="profile"
                        element={<Profile />}
                    />

                    <Route
                        path="profile/preferences"
                        element={<Profile />}
                    />

                    {/* =================================================
                        EMPLOYEE SELF-SERVICE

                        These pages call employee-only /me APIs.
                    ================================================= */}
                    <Route
                        element={
                            <RoleRoute allowed={['EMPLOYEE']} />
                        }
                    >
                        <Route
                            path="leave"
                            element={<MyLeave />}
                        />

                        <Route
                            path="timesheets"
                            element={<MyTimesheets />}
                        />
                    </Route>

                    {/* =================================================
                        ADMIN / MANAGER
                    ================================================= */}
                    <Route
                        element={
                            <RoleRoute
                                allowed={[
                                    'ADMIN',
                                    'MANAGER',
                                ]}
                            />
                        }
                    >
                        <Route
                            path="employees"
                            element={<EmployeeList />}
                        />

                        <Route
                            path="departments"
                            element={<DepartmentList />}
                        />

                        <Route
                            path="leave/approvals"
                            element={<LeaveApproval />}
                        />

                        <Route
                            path="timesheets/approvals"
                            element={<TimesheetApprovals />}
                        />

                        <Route
                            path="reports"
                            element={<ReportsDashboard />}
                        />
                    </Route>

                    <Route
                        path="unauthorized"
                        element={<Unauthorized />}
                    />
                </Route>
            </Route>

            {/* =====================================================
                ROOT / 404
            ===================================================== */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/app/dashboard"
                        replace
                    />
                }
            />

            <Route
                path="*"
                element={<NotFound />}
            />
        </Routes>
    )
}
