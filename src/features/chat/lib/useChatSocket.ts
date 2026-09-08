import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { ChatChannelType, ChatMessageResponse } from '@/src/features/chat/api/chat';

// 1008(Policy Violation)은 관리자 강제 종료(정지 처리) 시 백엔드가 명시적으로 내려주는 코드.
// 이 경우엔 재연결을 계속 시도하면 안 되고, 사용자에게 사유를 알려야 함.
const POLICY_VIOLATION_CLOSE_CODE = 1008;

function resolveWsUrl(): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
    const httpBase = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const wsBase = httpBase.replace(/^http/, 'ws');
    return `${wsBase}/ws/chat`;
}

export function useChatSocket(channelType: ChatChannelType, channelId: string) {
    const [liveMessages, setLiveMessages] = useState<ChatMessageResponse[]>([]);
    const [connected, setConnected] = useState(false);
    const [disconnectReason, setDisconnectReason] = useState<string | null>(null);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!channelId) {
            return;
        }

        setLiveMessages([]);
        setDisconnectReason(null);

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
            onWebSocketClose: (event: CloseEvent) => {
                setConnected(false);

                if (event.code === POLICY_VIOLATION_CLOSE_CODE) {
                    // 정지 등 정책 위반으로 강제 종료된 경우: 재연결을 중단시키고 사용자에게 알림
                    client.deactivate();
                    setDisconnectReason(event.reason || '연결이 종료되었습니다.');
                }
                // 그 외(1000/1001 등 일반 종료)는 stompjs의 reconnectDelay가 알아서 재연결 시도함
            },
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
        (text: string, imageUrl?: string | null) => {
            const hasText = text.trim().length > 0;
            const hasImage = !!imageUrl;

            if (!clientRef.current?.connected || (!hasText && !hasImage)) {
                return;
            }

            clientRef.current.publish({
                destination: `/app/chat/${channelType}/${channelId}`,
                body: JSON.stringify({
                    message: hasText ? text : null,
                    imageUrl: hasImage ? imageUrl : null,
                }),
            });
        },
        [channelType, channelId],
    );

    return { liveMessages, connected, sendMessage, disconnectReason };
}
