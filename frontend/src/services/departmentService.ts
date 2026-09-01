import api from './api'

export interface Department {
    id: number
    name: string
}

export interface DepartmentRequest {
    name: string
}

export const departmentService = {
    async getAll(): Promise<Department[]> {
        const response =
            await api.get<Department[]>(
                '/departments',
            )

        return response.data
    },

    async getById(
        id: number,
    ): Promise<Department> {
        const response =
            await api.get<Department>(
                `/departments/${id}`,
            )

        return response.data
    },

    async create(
        payload: DepartmentRequest,
    ): Promise<Department> {
        const response =
            await api.post<Department>(
                '/departments',
                payload,
            )

        return response.data
    },

    async update(
        id: number,
        payload: DepartmentRequest,
    ): Promise<Department> {
        const response =
            await api.put<Department>(
                `/departments/${id}`,
                payload,
            )

        return response.data
    },

    async delete(
        id: number,
    ): Promise<void> {
        await api.delete(
            `/departments/${id}`,
        )
    },
}