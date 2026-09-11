import api from '@/src/shared/lib/api';

export type Market = 'KOSPI' | 'KOSDAQ';

export type RankingType = 'VOLUME' | 'RISE' | 'FALL' | 'TRADING_VALUE' | 'POPULAR';

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

export interface StockQuoteResponse {
    code: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
}

export interface StockRankingResponse {
    code: string;
    name: string;
    currentPrice: number;
    changeAmount: number;
    changeRate: number;
    volume: number;
    preferred: boolean;
}

export interface MarketIndexResponse {
    market: Market;
    value: number;
    changeAmount: number;
    changeRate: number;
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
    preferred: boolean;
}

export interface OrderBookLevel {
    price: number;
    quantity: number;
}

export interface OrderBookResponse {
    sellLevels: OrderBookLevel[];
    buyLevels: OrderBookLevel[];
    totalSellQuantity: number;
    totalBuyQuantity: number;
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

export async function getStockQuotes(codes: string[]): Promise<StockQuoteResponse[]> {
    if (codes.length === 0) return [];
    const response = await api.get<StockQuoteResponse[]>('/stocks/quotes', { params: { codes: codes.join(',') } });
    return response.data;
}

export async function getMarketIndices(): Promise<MarketIndexResponse[]> {
    const response = await api.get<MarketIndexResponse[]>('/stocks/indices');
    return response.data;
}

export async function getStockChart(code: string, interval: ChartInterval): Promise<ChartCandleResponse[]> {
    const response = await api.get<ChartCandleResponse[]>(`/stocks/${code}/chart`, { params: { interval } });
    return response.data;
}

export async function getOrderBook(code: string): Promise<OrderBookResponse> {
    const response = await api.get<OrderBookResponse>(`/stocks/${code}/orderbook`);
    return response.data;
}