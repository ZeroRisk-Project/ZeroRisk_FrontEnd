import api from '@/src/shared/lib/api';

// 백엔드 FollowUserResponse record와 필드명·타입을 그대로 맞춘 타입
export interface FollowUserResponse {
    userId: number;
    nickname: string;
    profileImageUrl: string | null;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

// 팔로워 목록 조회 (나를 팔로우하는 사람들)
export async function getFollowers(userId: number, page = 0, size = 20): Promise<PageResponse<FollowUserResponse>> {
    const response = await api.get<PageResponse<FollowUserResponse>>(`/follows/${userId}/followers`, {
        params: { page, size },
    });

    return response.data;
}

// 팔로잉 목록 조회 (내가 팔로우하는 사람들)
export async function getFollowings(userId: number, page = 0, size = 20): Promise<PageResponse<FollowUserResponse>> {
    const response = await api.get<PageResponse<FollowUserResponse>>(`/follows/${userId}/followings`, {
        params: { page, size },
    });

    return response.data;
}
