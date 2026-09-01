import type { Role } from '@/utils/constants'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string
  department?: string
  title?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}