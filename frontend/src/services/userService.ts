import api from './api'

export interface UserSummary {
    id: number
    name: string
    email: string
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
}

export const userService = {
    async getAll(): Promise<UserSummary[]> {
        const response =
            await api.get<UserSummary[]>('/users')

        return response.data
    },

    async getManagers(): Promise<UserSummary[]> {
        const response =
            await api.get<UserSummary[]>(
                '/users/managers',
            )

        return response.data
    },
}