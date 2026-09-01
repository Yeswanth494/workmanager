import api from './api'

export type LeaveType =
    | 'CASUAL'
    | 'SICK'
    | 'EARNED'
    | 'UNPAID'

export type LeaveStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED'

export interface LeaveRequestPayload {
    leaveType: LeaveType
    startDate: string
    endDate: string
    reason: string
}

export interface LeaveResponse {
    id: number
    employeeId: number
    employeeName: string
    leaveType: LeaveType
    startDate: string
    endDate: string
    reason: string
    status: LeaveStatus
}

export const leaveService = {

    // ============================================
    // EMPLOYEE
    // ============================================

    async getMyLeaves(): Promise<LeaveResponse[]> {
        const response =
            await api.get<LeaveResponse[]>(
                '/leaves/me',
            )

        return response.data
    },

    async applyLeave(
        payload: LeaveRequestPayload,
    ): Promise<LeaveResponse> {
        const response =
            await api.post<LeaveResponse>(
                '/leaves',
                payload,
            )

        return response.data
    },

    async cancelLeave(
        id: number,
    ): Promise<LeaveResponse> {
        const response =
            await api.patch<LeaveResponse>(
                `/leaves/${id}/cancel`,
            )

        return response.data
    },

    // ============================================
    // ADMIN / MANAGER
    // ============================================

    async getAllLeaves(): Promise<LeaveResponse[]> {
        const response =
            await api.get<LeaveResponse[]>(
                '/leaves',
            )

        return response.data
    },

    async getPendingLeaves(): Promise<LeaveResponse[]> {
        const response =
            await api.get<LeaveResponse[]>(
                '/leaves/pending',
            )

        return response.data
    },

    async getLeaveById(
        id: number,
    ): Promise<LeaveResponse> {
        const response =
            await api.get<LeaveResponse>(
                `/leaves/${id}`,
            )

        return response.data
    },

    async getEmployeeLeaves(
        employeeId: number,
    ): Promise<LeaveResponse[]> {
        const response =
            await api.get<LeaveResponse[]>(
                `/leaves/employee/${employeeId}`,
            )

        return response.data
    },

    async approveLeave(
        id: number,
    ): Promise<LeaveResponse> {
        const response =
            await api.patch<LeaveResponse>(
                `/leaves/${id}/approve`,
            )

        return response.data
    },

    async rejectLeave(
        id: number,
    ): Promise<LeaveResponse> {
        const response =
            await api.patch<LeaveResponse>(
                `/leaves/${id}/reject`,
            )

        return response.data
    },
}