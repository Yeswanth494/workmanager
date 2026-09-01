import { useEffect, useState } from 'react'
import {
    Bell,
    CheckCircle2,
    Clock,
    FolderKanban,
    Loader2,
    CheckCheck,
} from 'lucide-react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import {
    notificationService,
    type Notification,
} from '@/services/notificationService'

function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()

    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`

    return date.toLocaleDateString()
}

function getNotificationIcon(message: string) {
    const text = message.toLowerCase()

    if (
        text.includes('leave') ||
        text.includes('approved') ||
        text.includes('rejected')
    ) {
        return CheckCircle2
    }

    if (
        text.includes('task') ||
        text.includes('assigned')
    ) {
        return FolderKanban
    }

    if (
        text.includes('deadline') ||
        text.includes('due')
    ) {
        return Clock
    }

    return Bell
}

function getNotificationTone(message: string) {
    const text = message.toLowerCase()

    if (
        text.includes('approved') ||
        text.includes('completed')
    ) {
        return 'text-success-600'
    }

    if (
        text.includes('deadline') ||
        text.includes('due')
    ) {
        return 'text-warning-600'
    }

    if (
        text.includes('rejected') ||
        text.includes('failed')
    ) {
        return 'text-danger-600'
    }

    return 'text-accent-600'
}

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const loadNotifications = async () => {
        try {
            setLoading(true)
            setError('')

            const data = await notificationService.getMyNotifications()

            setNotifications(data)
        } catch (err: any) {
            console.error('Failed to load notifications:', err)

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Failed to load notifications',
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadNotifications()
    }, [])

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id)

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? { ...notification, read: true }
                        : notification,
                ),
            )

            /*
             * Tell the Navbar that notification state changed.
             * The Navbar will reload the unread count.
             */
            window.dispatchEvent(
                new Event('notifications:changed'),
            )
        } catch (err) {
            console.error(
                'Failed to mark notification as read:',
                err,
            )
        }
    }

    return (
        <div>
            <PageHeader
                title="Notifications"
                description="Stay on top of approvals, assignments, and deadlines."
            />

            {error && (
                <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    {error}
                </div>
            )}

            <Card className="p-0">
                {loading ? (
                    <div className="flex min-h-48 items-center justify-center">
                        <div className="flex items-center gap-2 text-text-muted">
                            <Loader2 className="size-5 animate-spin" />
                            <span>Loading notifications...</span>
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-text-muted">
                        <Bell className="size-8" />
                        <p className="text-sm">No notifications yet.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-border">
                        {notifications.map((notification) => {
                            const Icon = getNotificationIcon(notification.message)
                            const tone = getNotificationTone(notification.message)

                            return (
                                <li
                                    key={notification.id}
                                    className={`flex items-start gap-4 p-5 transition-colors ${
                                        notification.read
                                            ? 'bg-surface'
                                            : 'bg-accent-50/40'
                                    }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        <Icon className={`size-5 ${tone}`} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`text-sm ${
                                                notification.read
                                                    ? 'font-normal text-text'
                                                    : 'font-semibold text-text'
                                            }`}
                                        >
                                            {notification.message}
                                        </p>

                                        <p className="mt-1 text-xs text-text-faint">
                                            {formatTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {!notification.read && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleMarkAsRead(notification.id)
                                            }
                                            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-bg"
                                        >
                                            <CheckCheck className="size-3.5" />
                                            Mark as read
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </Card>
        </div>
    )
}