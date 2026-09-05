import api from '@/src/shared/lib/api';

export type NotificationDlqStatus = 'PENDING' | 'RESOLVED' | 'IGNORED';

export interface NotificationDlqResponse {
    id: number;
    userId: number;
    type: string;
    title: string;
    message: string;
    failureReason: string | null;
    retryCount: number;
    status: NotificationDlqStatus;
    createdAt: string;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

export async function getPendingNotificationDlqItems(
    page = 0,
    size = 20,
): Promise<PageResponse<NotificationDlqResponse>> {
    const response = await api.get<PageResponse<NotificationDlqResponse>>('/admin/notifications/dlq', {
        params: { page, size },
    });

    return response.data;
}

export async function retryNotificationDlqItem(dlqId: number): Promise<void> {
    await api.patch(`/admin/notifications/dlq/${dlqId}/retry`);
}

export async function ignoreNotificationDlqItem(dlqId: number): Promise<void> {
    await api.patch(`/admin/notifications/dlq/${dlqId}/ignore`);
}
