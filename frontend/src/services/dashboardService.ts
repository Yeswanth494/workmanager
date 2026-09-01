import api from './api'

export interface DashboardData {
    totalEmployees: number
    totalProjects: number
    totalTasks: number
    pendingLeaves: number
    todayPresent: number
    todayAbsent: number
    tasksTodo: number
    tasksInProgress: number
    tasksInReview: number
    tasksCompleted: number
    pendingTimesheets: number
}

export interface EmployeeDashboard {
    totalTasks: number
    todoTasks: number
    inProgressTasks: number
    reviewTasks: number
    completedTasks: number

    totalLeaves: number
    pendingLeaves: number
    approvedLeaves: number
    rejectedLeaves: number

    attendanceDays: number

    thisWeekLoggedHours: number
    timesheetStatus:
        | 'NOT_SUBMITTED'
        | 'DRAFT'
        | 'PENDING_REVIEW'
        | 'APPROVED'
        | 'REJECTED'
}

export const dashboardService = {

    // =========================================================
    // ADMIN / MANAGER DASHBOARD
    // =========================================================

    async getDashboard(): Promise<DashboardData> {
        const response =
            await api.get<DashboardData>(
                '/dashboard',
            )

        return response.data
    },

    // =========================================================
    // EMPLOYEE DASHBOARD
    // =========================================================

    async getMyDashboard(): Promise<EmployeeDashboard> {
        const response =
            await api.get<EmployeeDashboard>(
                '/dashboard/me',
            )

        return response.data
    },

}