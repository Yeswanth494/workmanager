import api from './api'

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Project {
  id: number
  name: string
  description?: string
  status: ProjectStatus
  progress: number
  startDate?: string
  endDate?: string
  priority: ProjectPriority
  managerId: number
  departmentId: number
  managerName?: string
  departmentName?: string
}

export interface ProjectRequest {
  name: string
  description?: string
  status: ProjectStatus
  progress: number
  startDate?: string
  endDate?: string
  priority: ProjectPriority
  managerId: number
  departmentId: number
}

export const projectService = {
  async getAll(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects')
    return response.data
  },

  async getById(id: number): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`)
    return response.data
  },

  async create(payload: ProjectRequest): Promise<Project> {
    const response = await api.post<Project>('/projects', payload)
    return response.data
  },

  async update(id: number, payload: ProjectRequest): Promise<Project> {
    const response = await api.put<Project>(`/projects/${id}`, payload)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/projects/${id}`)
  },

  async updateStatus(id: number, status: ProjectStatus): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}/status`, null, { params: { status } })
    return response.data
  },

  async updateProgress(id: number, progress: number): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${id}/progress`, null, { params: { progress } })
    return response.data
  },
}
