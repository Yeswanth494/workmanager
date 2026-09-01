import api from './api'

export interface Employee {
    id: number
    employeeCode: string
    name: string
    email: string
    phone?: string
    department?: string
    title?: string
    joiningDate?: string
    role: string
}

export interface EmployeeUpdateRequest {
    phone: string
    departmentId: number
    title: string
    joiningDate?: string
}

export interface EmployeeCreateRequest {
    employeeCode: string
    phone?: string
    departmentId: number
    title?: string
    joiningDate: string
    userId: number
}

export const employeeService = {
    async getAll(): Promise<Employee[]> {
        const response = await api.get<Employee[]>('/employees')
        return response.data
    },

    async getById(id: number): Promise<Employee> {
        const response = await api.get<Employee>(`/employees/${id}`)
        return response.data
    },

    async getMyProfile(): Promise<Employee> {
        const response = await api.get<Employee>('/employees/me')
        return response.data
    },

    async create(
        payload: EmployeeCreateRequest,
    ): Promise<Employee> {
        const response = await api.post<Employee>(
            '/employees',
            payload,
        )

        return response.data
    },

    async update(
        id: number,
        payload: EmployeeUpdateRequest,
    ): Promise<Employee> {
        const response = await api.put<Employee>(
            `/employees/${id}`,
            payload,
        )

        return response.data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/employees/${id}`)
    },
}