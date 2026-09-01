import api from './api'

export interface Notification {
    id: number
    message: string
    read: boolean
    createdAt: string
}

export const notificationService = {
    async getMyNotifications(): Promise<Notification[]> {
        const response = await api.get<Notification[]>('/notifications')
        return response.data
    },

    async getUnreadNotifications(): Promise<Notification[]> {
        const response = await api.get<Notification[]>('/notifications/unread')
        return response.data
    },

    async getUnreadCount(): Promise<number> {
        const response = await api.get<number>('/notifications/unread/count')
        return response.data
    },

    async markAsRead(id: number): Promise<Notification> {
        const response = await api.patch<Notification>(
            `/notifications/${id}/read`,
        )

        return response.data
    },
}