import api from '@/src/shared/lib/api';

export type Market = 'KOSPI' | 'KOSDAQ';

export type RankingType = 'VOLUME' | 'RISE' | 'FALL';

export type ChartInterval = 'DAY' | 'WEEK' | 'MONTH' | 'MINUTE';

export interface StockDetailResponse {
    code: string;
    name: string;
    market: Market;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    week52High: number;
    week52Low: number;
}

export interface StockRankingResponse {
    code: string;
    name: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    volume: number;
}

export interface ChartCandleResponse {
    dateTime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface StockSummaryResponse {
    id: number;
    code: string;
    name: string;
    market: Market;
}

export async function searchStocks(keyword: string, size = 10): Promise<StockSummaryResponse[]> {
    const response = await api.get<{ content: StockSummaryResponse[] }>('/stocks/search', {
        params: { keyword, size },
    });
    return response.data.content;
}

export async function getStockDetail(code: string): Promise<StockDetailResponse> {
    const response = await api.get<StockDetailResponse>(`/stocks/${code}`);
    return response.data;
}

export async function getStockRankings(type: RankingType, count = 20): Promise<StockRankingResponse[]> {
    const response = await api.get<StockRankingResponse[]>('/stocks/rankings', { params: { type, count } });
    return response.data;
}

export async function getStockChart(code: string, interval: ChartInterval): Promise<ChartCandleResponse[]> {
    const response = await api.get<ChartCandleResponse[]>(`/stocks/${code}/chart`, { params: { interval } });
    return response.data;
}