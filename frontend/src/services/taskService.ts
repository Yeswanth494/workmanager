import api from './api'

export interface Task {
    id: number
    title: string
    description?: string
    status: string
    priority: string
    dueDate?: string
    projectId: number
    projectName: string
    assigneeId?: number
    assigneeName?: string
}

export interface TaskRequest {
    title: string
    description?: string
    status: string
    priority: string
    dueDate?: string
    projectId: number
    assigneeId?: number
}

export const taskService = {
    async getAll(): Promise<Task[]> {
        const response = await api.get<Task[]>('/tasks')
        return response.data
    },

    async getById(id: number): Promise<Task> {
        const response = await api.get<Task>(`/tasks/${id}`)
        return response.data
    },

    async getByProject(projectId: number): Promise<Task[]> {
        const response = await api.get<Task[]>(
            `/tasks/project/${projectId}`,
        )
        return response.data
    },

    async getByEmployee(employeeId: number): Promise<Task[]> {
        const response = await api.get<Task[]>(
            `/tasks/employee/${employeeId}`,
        )
        return response.data
    },

    async create(payload: TaskRequest): Promise<Task> {
        const response = await api.post<Task>('/tasks', payload)
        return response.data
    },

    async update(
        id: number,
        payload: TaskRequest,
    ): Promise<Task> {
        const response = await api.put<Task>(
            `/tasks/${id}`,
            payload,
        )
        return response.data
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/tasks/${id}`)
    },

    async updateStatus(
        id: number,
        status: string,
    ): Promise<Task> {
        const response = await api.patch<Task>(
            `/tasks/${id}/status`,
            null,
            {
                params: {
                    status,
                },
            },
        )

        return response.data
    },
}