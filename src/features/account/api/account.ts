import api from '@/src/shared/lib/api';
import { getCompetitionDetail } from '@/src/features/competition/api/competition';

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

export interface AccountOption {
    accountId: number;
    name: string;
    balance: number;
}

// 계좌 선택 UI에 보여줄 이름을 붙인다 - 대회 계좌는 잔액만으론 구분이 안 돼서 대회명을 붙여준다.
export async function toAccountOption(account: AccountResponse): Promise<AccountOption> {
    if (account.accountType !== 'COMPETITION' || account.competitionId === null) {
        return { accountId: account.accountId, name: '기본 계좌', balance: account.balance };
    }

    try {
        const competition = await getCompetitionDetail(account.competitionId);
        return { accountId: account.accountId, name: competition.title, balance: account.balance };
    } catch {
        return { accountId: account.accountId, name: '대회 계좌', balance: account.balance };
    }
}