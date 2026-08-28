import api from '@/src/shared/lib/api';

// 백엔드 TargetType enum과 값이 그대로 일치해야 함 (대소문자 포함)
export type TargetType = 'POST' | 'COMMENT' | 'CHAT' | 'USER';

export interface ReportCreateRequest {
    targetType: TargetType;
    targetId: number;
    reason: string;
}

// 신고 접수. 대상(게시글/댓글/유저)이 실제 존재하지 않으면 서버가 404 반환
export async function createReport(request: ReportCreateRequest): Promise<void> {
    await api.post('/reports', request);
}
