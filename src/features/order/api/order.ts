import api from '@/src/shared/lib/api';

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED';

export interface OrderCreateRequest {
    accountId: number;
    stockCode: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    limitPrice?: number;
}

export interface OrderResponse {
    orderId: number;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    limitPrice: number | null;
    status: OrderStatus;
    filledPrice: number | null;
}

export interface OrderSummaryResponse {
    orderId: number;
    stockCode: string;
    stockName: string;
    side: OrderSide;
    orderType: OrderType;
    quantity: number;
    limitPrice: number | null;
    filledPrice: number | null;
    status: OrderStatus;
    createdAt: string;
    filledAt: string | null;
}

export interface TradeResponse {
    tradeId: number;
    stockCode: string;
    stockName: string;
    side: OrderSide;
    quantity: number;
    price: number;
    tradedAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export async function createOrder(request: OrderCreateRequest): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>('/orders', request);
    return response.data;
}

export async function getOrders(
    accountId: number,
    status?: OrderStatus,
    page = 0,
    size = 20,
): Promise<PageResponse<OrderSummaryResponse>> {
    const response = await api.get<PageResponse<OrderSummaryResponse>>('/orders', {
        params: { accountId, status, page, size },
    });
    return response.data;
}

export async function cancelOrder(orderId: number): Promise<void> {
    await api.delete(`/orders/${orderId}`);
}

export async function getTrades(
    accountId: number,
    page = 0,
    size = 20,
): Promise<PageResponse<TradeResponse>> {
    const response = await api.get<PageResponse<TradeResponse>>('/trades', {
        params: { accountId, page, size },
    });
    return response.data;
}