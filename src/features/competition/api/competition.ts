import api from '@/src/shared/lib/api';

export type CompetitionStatus = 'SCHEDULED' | 'ONGOING' | 'CALCULATING' | 'ENDED';

export interface CompetitionDetailResponse {
    id: number;
    title: string;
    description: string;
    recruitStartAt: string;
    recruitEndAt: string;
    startAt: string;
    endAt: string;
    status: CompetitionStatus;
    seedMoney: number;
    joinable: boolean;
    maxParticipants: number | null;
}

export interface CompetitionRankingResponse {
    rank: number | null;
    userId: number;
    nickname: string;
    returnRate: number;
    totalAsset: number;
}

export async function getCompetitionDetail(competitionId: number): Promise<CompetitionDetailResponse> {
    const response = await api.get<CompetitionDetailResponse>(`/competitions/${competitionId}`);
    return response.data;
}

export async function getMyJoinedCompetitionIds(): Promise<number[]> {
    const response = await api.get<{ competitionIds: number[] }>('/competitions/my');
    return response.data.competitionIds;
}

export async function getCompetitionRankings(competitionId: number): Promise<CompetitionRankingResponse[]> {
    const response = await api.get<CompetitionRankingResponse[]>(`/competitions/${competitionId}/rankings`);
    return response.data;
}