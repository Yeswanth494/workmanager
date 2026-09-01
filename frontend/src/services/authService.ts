import type {
    LoginPayload,
    RegisterPayload,
    User,
} from '@/types/auth'
import api from './api'

interface LoginResponse {
    token: string
    user: User
}

export const authService = {
    async login(
        payload: LoginPayload,
    ): Promise<{ user: User; token: string }> {
        const response = await api.post<LoginResponse>(
            '/auth/login',
            payload,
        )

        return {
            user: response.data.user,
            token: response.data.token,
        }
    },

    /**
     * The backend registration endpoint returns only UserResponse.
     * It does NOT issue a JWT token.
     */
    async register(
        payload: RegisterPayload,
    ): Promise<User> {
        const response = await api.post<User>(
            '/auth/register',
            payload,
        )

        return response.data
    },

    /**
     * The current backend has no /forgot-password endpoint.
     * Keep this as a local placeholder rather than calling a
     * non-existent API.
     */
    async requestPasswordReset(
        _email: string,
    ): Promise<void> {
        return Promise.resolve()
    },
}
