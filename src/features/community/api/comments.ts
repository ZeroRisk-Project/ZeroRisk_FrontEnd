import api from '@/src/shared/lib/api';

// 백엔드 CommentResponse record와 필드명·타입을 그대로 맞춘 타입 (대댓글은 replies에 재귀적으로 중첩됨)
export interface CommentResponse {
    id: number;
    authorId: number;
    authorNickname: string;
    parentId: number | null;
    content: string;
    isDeleted: boolean;
    isMine: boolean;
    likeCount: number;
    createdAt: string;
    replies: CommentResponse[];
}

export interface CommentCreateRequest {
    content: string;
    parentId?: number | null;
}

export interface CommentUpdateRequest {
    content: string;
}

// 댓글 목록 조회 (계층형 트리 구조 그대로 응답)
export async function getComments(postId: number): Promise<CommentResponse[]> {
    const response = await api.get<CommentResponse[]>(`/posts/${postId}/comments`);

    return response.data;
}

// 댓글/대댓글 작성. parentId가 있으면 대댓글
export async function createComment(postId: number, request: CommentCreateRequest): Promise<CommentResponse> {
    const response = await api.post<CommentResponse>(`/posts/${postId}/comments`, request);

    return response.data;
}

// 댓글 수정 (본인만 가능)
export async function updateComment(commentId: number, request: CommentUpdateRequest): Promise<CommentResponse> {
    const response = await api.patch<CommentResponse>(`/comments/${commentId}`, request);

    return response.data;
}

// 댓글 삭제 (본인만 가능, 소프트 삭제)
export async function deleteComment(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}`);
}

// 댓글 추천. 이미 추천한 상태에서 다시 누르면 서버에서 취소 처리됨
export async function likeComment(commentId: number): Promise<void> {
    await api.post(`/comments/${commentId}/likes`);
}

// 백엔드 MyCommentResponse record와 필드명·타입을 그대로 맞춘 타입
export interface MyCommentResponse {
    id: number;
    postId: number;
    postTitle: string;
    boardType: 'FREE' | 'STOCK' | 'NOTICE';
    content: string;
    likeCount: number;
    createdAt: string;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

// 내 댓글 목록 조회 (마이페이지)
export async function getMyComments(page = 0, size = 20): Promise<PageResponse<MyCommentResponse>> {
    const response = await api.get<PageResponse<MyCommentResponse>>('/comments/me', {
        params: { page, size },
    });

    return response.data;
}
