import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { ChatChannelType, ChatMessageResponse } from '@/src/features/chat/api/chat';

function resolveWsUrl(): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
    const httpBase = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const wsBase = httpBase.replace(/^http/, 'ws');
    return `${wsBase}/ws/chat`;
}

export function useChatSocket(channelType: ChatChannelType, channelId: string) {
    const [liveMessages, setLiveMessages] = useState<ChatMessageResponse[]>([]);
    const [connected, setConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!channelId) {
            return;
        }

        setLiveMessages([]);

        const client = new Client({
            webSocketFactory: () => new WebSocket(resolveWsUrl()),
            reconnectDelay: 3000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/chat/${channelType}/${channelId}`, (frame: IMessage) => {
                    const received: ChatMessageResponse = JSON.parse(frame.body);
                    setLiveMessages((prev) => [...prev, received]);
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: (frame) => {
                console.error('STOMP 에러', frame.headers['message'], frame.body);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [channelType, channelId]);

    const sendMessage = useCallback(
        (text: string) => {
            if (!clientRef.current?.connected || !text.trim()) {
                return;
            }

            clientRef.current.publish({
                destination: `/app/chat/${channelType}/${channelId}`,
                body: JSON.stringify({ message: text }),
            });
        },
        [channelType, channelId],
    );

    return { liveMessages, connected, sendMessage };
}
