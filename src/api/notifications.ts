import api from '../lib/api';

// 백엔드 NotificationType enum과 값이 그대로 일치해야 함
export type NotificationType =
    | 'ORDER_FILLED'
    | 'COMMENT_ADDED'
    | 'COMPETITION'
    | 'PRICE_ALERT'
    | 'INQUIRY_ANSWERED';

// 백엔드 NotificationResponse record와 필드명·타입을 그대로 맞춘 타입
export interface NotificationResponse {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    targetUrl: string | null;
    createdAt: string;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

// 알림 목록 조회 (최신순)
export async function getNotifications(page = 0, size = 20): Promise<PageResponse<NotificationResponse>> {
    const response = await api.get<PageResponse<NotificationResponse>>('/notifications', {
        params: { page, size },
    });

    return response.data;
}

// 알림 단건 읽음 처리
export async function markNotificationAsRead(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
}

// 전체 읽음 처리
export async function markAllNotificationsAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
}
