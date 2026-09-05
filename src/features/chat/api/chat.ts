import api from '@/src/shared/lib/api';

export type ChatChannelType = 'STOCK' | 'COMPETITION';

// 백엔드 ChatMessageResponse record와 필드명·타입을 그대로 맞춘 타입
export interface ChatMessageResponse {
    id: number;
    channelType: ChatChannelType;
    channelId: string;
    authorId: number;
    authorNickname: string;
    message: string;
    createdAt: string;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

// 채팅 히스토리 조회 (과거 메시지, 최신순)
export async function getChatMessages(
    channelType: ChatChannelType,
    channelId: string,
    page = 0,
    size = 30,
): Promise<PageResponse<ChatMessageResponse>> {
    const response = await api.get<PageResponse<ChatMessageResponse>>('/chat/messages', {
        params: { channelType, channelId, page, size },
    });

    return response.data;
}
