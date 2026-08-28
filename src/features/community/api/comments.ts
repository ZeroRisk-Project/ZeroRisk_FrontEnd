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
