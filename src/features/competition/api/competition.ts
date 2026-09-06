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

export async function getCompetitionDetail(competitionId: number): Promise<CompetitionDetailResponse> {
    const response = await api.get<CompetitionDetailResponse>(`/competitions/${competitionId}`);
    return response.data;
}