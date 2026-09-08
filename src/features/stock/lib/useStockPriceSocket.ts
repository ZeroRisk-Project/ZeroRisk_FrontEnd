import { useEffect, useState } from 'react';

export interface StockPriceMessage {
    code: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
}

type SubscribeAction = 'SUBSCRIBE' | 'UNSUBSCRIBE';

const RECONNECT_DELAY_MS = 3000;

function resolveWsUrl(): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
    const httpBase = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const absoluteBase = /^https?:\/\//.test(httpBase) ? httpBase : window.location.origin;
    return `${absoluteBase.replace(/^http/, 'ws')}/ws/stocks`;
}

export function useStockPriceSocket(code: string | undefined): StockPriceMessage | null {
    const [price, setPrice] = useState<StockPriceMessage | null>(null);

    useEffect(() => {
        if (!code) {
            setPrice(null);
            return;
        }

        setPrice(null);

        let socket: WebSocket | null = null;
        let reconnectTimer: number | null = null;
        let closedByCleanup = false;

        const send = (action: SubscribeAction) => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ action, code }));
            }
        };

        const connect = () => {
            socket = new WebSocket(resolveWsUrl());

            socket.onopen = () => send('SUBSCRIBE');

            socket.onmessage = (event: MessageEvent<string>) => {
                try {
                    const received: StockPriceMessage = JSON.parse(event.data);
                    if (received.code === code) {
                        setPrice(received);
                    }
                } catch {
                    console.warn('실시간 시세 메시지 파싱 실패');
                }
            };

            socket.onclose = () => {
                if (!closedByCleanup) {
                    reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
                }
            };
        };

        connect();

        return () => {
            closedByCleanup = true;
            if (reconnectTimer !== null) {
                window.clearTimeout(reconnectTimer);
            }
            send('UNSUBSCRIBE');
            socket?.close();
        };
    }, [code]);

    return price;
}