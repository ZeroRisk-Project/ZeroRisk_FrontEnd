import api from '@/src/shared/lib/api';

export type InquiryStatus = 'PENDING' | 'ANSWERED';

export interface InquiryResponse {
    id: number;
    category: string;
    title: string;
    content: string;
    answer: string | null;
    status: InquiryStatus;
    createdAt: string;
    answeredAt: string | null;
}

export interface InquiryCreateRequest {
    category: string;
    title: string;
    content: string;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

// 문의 등록
export async function createInquiry(request: InquiryCreateRequest): Promise<InquiryResponse> {
    const response = await api.post<InquiryResponse>('/inquiries', request);

    return response.data;
}

// 내 문의 목록 조회
export async function getMyInquiries(page = 0, size = 20): Promise<PageResponse<InquiryResponse>> {
    const response = await api.get<PageResponse<InquiryResponse>>('/inquiries', {
        params: { page, size },
    });

    return response.data;
}

// 문의 상세 조회 (본인 것만)
export async function getInquiry(inquiryId: number): Promise<InquiryResponse> {
    const response = await api.get<InquiryResponse>(`/inquiries/${inquiryId}`);

    return response.data;
}
