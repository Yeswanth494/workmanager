import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'

import type {
    AuthState,
    LoginPayload,
    RegisterPayload,
    User,
} from '@/types/auth'

import { authService } from '@/services/authService'
import { storage } from '@/utils/storage'

interface AuthContextValue extends AuthState {
    login: (
        payload: LoginPayload,
    ) => Promise<void>

    register: (
        payload: RegisterPayload,
    ) => Promise<User>

    logout: () => void
}

export const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined,
    )

export function AuthProvider({
    children,
}: {
    children: ReactNode
}) {
    const [user, setUser] =
        useState<User | null>(null)

    const [token, setToken] =
        useState<string | null>(null)

    const [isLoading, setIsLoading] =
        useState(true)

    useEffect(() => {
        const storedToken =
            storage.getToken()

        const storedUser =
            storage.getUser<User>()

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(storedUser)
        }

        setIsLoading(false)
    }, [])

    const login = useCallback(
        async (payload: LoginPayload) => {
            const {
                user: loggedInUser,
                token: jwt,
            } = await authService.login(payload)

            storage.setToken(jwt)
            storage.setUser(loggedInUser)

            setUser(loggedInUser)
            setToken(jwt)
        },
        [],
    )

    /**
     * Registration does not authenticate the user because the
     * backend /api/auth/register response has no JWT token.
     */
    const register = useCallback(
        async (
            payload: RegisterPayload,
        ): Promise<User> => {
            return authService.register(payload)
        },
        [],
    )

    const logout = useCallback(() => {
        storage.clearToken()
        storage.clearUser()

        setUser(null)
        setToken(null)
    }, [])

    const value = useMemo(
        () => ({
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            register,
            logout,
        }),
        [
            user,
            token,
            isLoading,
            login,
            register,
            logout,
        ],
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
