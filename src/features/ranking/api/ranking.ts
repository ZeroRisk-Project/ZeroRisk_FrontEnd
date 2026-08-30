import api from '@/src/shared/lib/api';

// 백엔드 RankingResponse record와 필드명·타입을 그대로 맞춘 타입
// tradeCount는 아직 백엔드 응답에 없을 수 있어 optional로 선언 (별도 추가 요청 중)
export interface RankingResponse {
    rank: number;
    userId: number;
    nickname: string;
    userLevel: string;
    returnRate: number;
    tradeCount?: number;
    baseDate: string | null; // 수익률 비교 기준 시작일 (YYYY-MM-DD), ALL 기간은 null
}

// 백엔드 RankingPeriod enum과 값을 그대로 맞춘 타입
export type RankingPeriodParam = "DAILY" | "WEEKLY" | "MONTHLY" | "ALL";

export async function getRankings(
    period: RankingPeriodParam,
    page = 0,
    size = 20,
    signal?: AbortSignal
): Promise<RankingResponse[]> {
    const response = await api.get<RankingResponse[]>('/rankings', { params: { period, page, size }, signal });
    return response.data;
}

export async function getMyRanking(period: RankingPeriodParam, signal?: AbortSignal): Promise<RankingResponse> {
    const response = await api.get<RankingResponse>('/rankings/me', { params: { period }, signal });
    return response.data;
}
