import api from '@/src/shared/lib/api';

export type PriceAlertDirection = 'ABOVE' | 'BELOW';

export interface PriceAlertResponse {
    alertId: number;
    stockCode: string;
    stockName: string;
    targetPrice: number;
    direction: PriceAlertDirection;
    triggered: boolean;
    createdAt: string;
}

export async function getPriceAlerts(): Promise<PriceAlertResponse[]> {
    const response = await api.get<PriceAlertResponse[]>('/price-alerts');
    return response.data;
}

export async function createPriceAlert(
    stockCode: string,
    targetPrice: number,
    direction: PriceAlertDirection,
): Promise<PriceAlertResponse> {
    const response = await api.post<PriceAlertResponse>('/price-alerts', {
        stockCode,
        targetPrice,
        direction,
    });
    return response.data;
}

export async function deletePriceAlert(alertId: number): Promise<void> {
    await api.delete(`/price-alerts/${alertId}`);
}