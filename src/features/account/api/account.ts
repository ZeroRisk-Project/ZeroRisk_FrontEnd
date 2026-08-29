import api from '@/src/shared/lib/api';

export type AccountType = 'BASIC' | 'COMPETITION';

export interface AccountResponse {
    accountId: number;
    accountType: AccountType;
    balance: number;
    competitionId: number | null;
}

export async function getAccounts(): Promise<AccountResponse[]> {
    const response = await api.get<AccountResponse[]>('/accounts');
    return response.data;
}