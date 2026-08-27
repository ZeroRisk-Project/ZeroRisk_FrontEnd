import api from '../lib/api';

// 백엔드 RankingResponse record와 필드명·타입을 그대로 맞춘 타입
// tradeCount는 아직 백엔드 응답에 없을 수 있어 optional로 선언 (별도 추가 요청 중)
export interface RankingResponse {
    rank: number;
    userId: number;
    nickname: string;
    userLevel: string;
    returnRate: number;
    tradeCount?: number;
}

export async function getRankings(page = 0, size = 20): Promise<RankingResponse[]> {
    const response = await api.get<RankingResponse[]>('/rankings', { params: { page, size } });
    return response.data;
}

export async function getMyRanking(): Promise<RankingResponse> {
    const response = await api.get<RankingResponse>('/rankings/me');
    return response.data;
}
