import api from '@/src/shared/lib/api';

export type AccountType = 'BASIC' | 'COMPETITION';

export interface AccountResponse {
    accountId: number;
    accountType: AccountType;
    balance: number;
    competitionId: number | null;
}

export interface HoldingResponse {
    holdingId: number;
    stockCode: string;
    stockName: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    evaluationAmount: number;
    profitLoss: number;
    profitRate: number;
}

export interface StockCompositionItem {
    stockCode: string;
    stockName: string;
    evaluationAmount: number;
    weight: number;
}

export interface PortfolioCompositionResponse {
    cash: number;
    stockValue: number;
    totalAsset: number;
    cashRatio: number;
    stockRatio: number;
    stocks: StockCompositionItem[];
}

export interface PortfolioSnapshotResponse {
    snapshotDate: string;
    cash: number;
    stockValue: number;
    totalAsset: number;
}

export async function getAccounts(): Promise<AccountResponse[]> {
    const response = await api.get<AccountResponse[]>('/accounts');
    return response.data;
}

export async function getHoldings(accountId: number): Promise<HoldingResponse[]> {
    const response = await api.get<HoldingResponse[]>('/portfolio/holdings', { params: { accountId } });
    return response.data;
}

export async function getComposition(accountId: number): Promise<PortfolioCompositionResponse> {
    const response = await api.get<PortfolioCompositionResponse>('/portfolio/composition', { params: { accountId } });
    return response.data;
}

export async function getSnapshots(
    accountId: number,
    from?: string,
    to?: string,
): Promise<PortfolioSnapshotResponse[]> {
    const response = await api.get<PortfolioSnapshotResponse[]>('/portfolio/snapshots', {
        params: { accountId, from, to },
    });
    return response.data;
}