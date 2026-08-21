import api from '../lib/api';

// 백엔드 BoardType enum과 값이 그대로 일치해야 함 (대소문자 포함)
export type BoardType = 'FREE' | 'STOCK' | 'NOTICE';

// 백엔드 PostResponse record와 필드명·타입을 그대로 맞춘 타입
export interface PostResponse {
    id: number;
    boardType: BoardType;
    authorId: number;
    authorNickname: string;
    authorLevel: number;
    stockId: number | null;
    title: string;
    content: string;
    isProfitCert: boolean;
    certImageUrl: string | null;
    viewCount: number;
    likeCount: number;
    dislikeCount: number;
    commentCount: number;
    isMine: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PostCreateRequest {
    boardType: BoardType;
    stockId?: number | null;
    title: string;
    content: string;
}

export interface PostUpdateRequest {
    title: string;
    content: string;
}

export type VoteType = 'LIKE' | 'DISLIKE';

// Spring Data의 Page<T> 응답 형태를 그대로 받는 타입
interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // 현재 페이지 (0부터 시작)
}

// 게시판 목록 조회. boardType으로 자유/종목/공지 구분
export async function getPosts(boardType: BoardType, page = 0, size = 20): Promise<PageResponse<PostResponse>> {
    const response = await api.get<PageResponse<PostResponse>>('/posts', {
        params: { boardType, page, size },
    });

    return response.data;
}

// 게시글 작성
export async function createPost(request: PostCreateRequest): Promise<PostResponse> {
    const response = await api.post<PostResponse>('/posts', request);

    return response.data;
}

// 게시글 상세 조회
export async function getPost(postId: number): Promise<PostResponse> {
    const response = await api.get<PostResponse>(`/posts/${postId}`);

    return response.data;
}

// 게시글 수정 (본인만 가능, 실패 시 서버가 403 반환)
export async function updatePost(postId: number, request: PostUpdateRequest): Promise<PostResponse> {
    const response = await api.patch<PostResponse>(`/posts/${postId}`, request);

    return response.data;
}

// 게시글 삭제 (본인만 가능)
export async function deletePost(postId: number): Promise<void> {
    await api.delete(`/posts/${postId}`);
}

// 추천/비추천. 같은 타입 다시 누르면 서버에서 취소 처리됨
export async function votePost(postId: number, voteType: VoteType): Promise<void> {
    await api.post(`/posts/${postId}/votes`, { voteType });
}