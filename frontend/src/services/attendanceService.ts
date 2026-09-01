import api from './api'

export type AttendanceStatus =
    | 'PRESENT'
    | 'ABSENT'
    | 'LATE'
    | 'HALF_DAY'

export interface Attendance {
    id: number
    employeeId: number
    employeeName: string
    attendanceDate: string
    checkIn?: string | null
    checkOut?: string | null
    status: AttendanceStatus
}

export const attendanceService = {
    async checkIn(): Promise<Attendance> {
        const response = await api.post<Attendance>('/attendance/check-in')
        return response.data
    },

    async checkOut(): Promise<Attendance> {
        const response = await api.post<Attendance>('/attendance/check-out')
        return response.data
    },

    async getMyAttendance(): Promise<Attendance[]> {
        const response = await api.get<Attendance[]>('/attendance/me')
        return response.data
    },

    async getEmployeeAttendance(employeeId: number): Promise<Attendance[]> {
        const response = await api.get<Attendance[]>(
            `/attendance/employee/${employeeId}`,
        )
        return response.data
    },

    async getDailyAttendance(date: string): Promise<Attendance[]> {
        const response = await api.get<Attendance[]>(
            `/attendance/date/${date}`,
        )
        return response.data
    },
}
