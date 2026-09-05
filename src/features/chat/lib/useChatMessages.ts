import { useQuery } from '@tanstack/react-query';
import { getChatMessages, ChatChannelType } from '@/src/features/chat/api/chat';

export function useChatMessages(channelType: ChatChannelType, channelId: string) {
    return useQuery({
        queryKey: ['chat', 'messages', channelType, channelId],
        queryFn: () => getChatMessages(channelType, channelId),
        enabled: !!channelId,
    });
}
