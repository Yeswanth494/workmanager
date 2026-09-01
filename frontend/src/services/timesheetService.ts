import api from './api'

export type TimesheetStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'REJECTED'

export interface TimesheetRequest {
    projectId: number
    taskId?: number | null
    workDate: string
    hours: number
    description?: string
}

export interface Timesheet {
    id: number
    employeeId: number
    employeeName: string
    projectId: number
    projectName: string
    taskId?: number | null
    taskTitle?: string | null
    workDate: string
    hours: number
    description?: string | null
    status: TimesheetStatus
}

export const timesheetService = {
    // Get logged-in employee's timesheets
    async getMyTimesheets(): Promise<Timesheet[]> {
        const response = await api.get<Timesheet[]>('/timesheets/me')
        return response.data
    },

    // Create a draft timesheet
    async create(
        payload: TimesheetRequest,
    ): Promise<Timesheet> {
        const response = await api.post<Timesheet>(
            '/timesheets',
            payload,
        )

        return response.data
    },

    // Update a draft timesheet
    async update(
        id: number,
        payload: TimesheetRequest,
    ): Promise<Timesheet> {
        const response = await api.put<Timesheet>(
            `/timesheets/${id}`,
            payload,
        )

        return response.data
    },

    // Submit a draft
    async submit(id: number): Promise<Timesheet> {
        const response = await api.post<Timesheet>(
            `/timesheets/${id}/submit`,
        )

        return response.data
    },

    async getAllTimesheets(): Promise<Timesheet[]> {
        const response = await api.get<Timesheet[]>('/timesheets')
        return response.data
    },

    async approve(
        id: number,
        approved: boolean,
    ): Promise<Timesheet> {
        const response = await api.patch<Timesheet>(
            `/timesheets/${id}/approve`,
            null,
            {
                params: {
                    approved,
                },
            },
        )

        return response.data
    },
}