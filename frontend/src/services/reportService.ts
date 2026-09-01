import api from './api'

export interface ReportSummary {
    totalEmployees: number
    totalProjects: number
    totalTasks: number
    todoTasks: number
    inProgressTasks: number
    reviewTasks: number
    completedTasks: number
    pendingLeaves: number
    approvedLeaves: number
    rejectedLeaves: number
    todayPresent: number
    todayAbsent: number
    draftTimesheets: number
    submittedTimesheets: number
    approvedTimesheets: number
    rejectedTimesheets: number
}

export interface DepartmentReport {
    departmentId: number
    departmentName: string
    employeeCount: number
}

export interface ProjectReport {
    projectId: number
    projectName: string
    status: string
    progress: number
    priority: string
    startDate?: string
    endDate?: string
    departmentName: string
    totalTasks: number
    completedTasks: number
}

export interface EmployeeReport {
    employeeId: number
    employeeCode: string
    employeeName: string
    departmentName: string
    title: string
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    totalLeaves: number
    approvedLeaves: number
    totalTimesheetHours: number
}

export const reportService = {
    async getSummary(): Promise<ReportSummary> {
        const response = await api.get<ReportSummary>('/reports/summary')
        return response.data
    },

    async getDepartments(): Promise<DepartmentReport[]> {
        const response = await api.get<DepartmentReport[]>('/reports/departments')
        return response.data
    },

    async getProjects(): Promise<ProjectReport[]> {
        const response = await api.get<ProjectReport[]>('/reports/projects')
        return response.data
    },

    async getEmployees(): Promise<EmployeeReport[]> {
        const response = await api.get<EmployeeReport[]>('/reports/employees')
        return response.data
    },
}
