import api from '@/src/shared/lib/api';

// 백엔드 AdminPostResponse record와 필드명·타입을 그대로 맞춘 타입
export interface AdminPostResponse {
    id: number;
    title: string;
    content: string;
    author: string;
    date: string;
    views: number;
    likes: number;
    commentsCount: number;
    status: 'ACTIVE' | 'DELETED';
}

// 백엔드 AdminCommentResponse record와 필드명·타입을 그대로 맞춘 타입
export interface AdminCommentResponse {
    id: number;
    content: string;
    author: string;
    isDeleted: boolean;
    createdAt: string;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

// 관리자 게시글 목록 조회 (삭제 여부 무관 전체)
export async function getAdminPosts(page = 0, size = 50): Promise<PageResponse<AdminPostResponse>> {
    const response = await api.get<PageResponse<AdminPostResponse>>('/admin/moderation/posts', {
        params: { page, size },
    });

    return response.data;
}

// 관리자 게시글 상세의 댓글 목록 조회 (삭제된 댓글 포함)
export async function getAdminComments(postId: number): Promise<AdminCommentResponse[]> {
    const response = await api.get<AdminCommentResponse[]>(`/admin/moderation/posts/${postId}/comments`);

    return response.data;
}

// 게시글 강제 삭제
export async function forceDeletePost(postId: number): Promise<void> {
    await api.delete(`/admin/moderation/posts/${postId}`);
}

// 게시글 복구
export async function restorePost(postId: number): Promise<void> {
    await api.patch(`/admin/moderation/posts/${postId}/restore`);
}

// 댓글 강제 삭제
export async function forceDeleteComment(commentId: number): Promise<void> {
    await api.delete(`/admin/moderation/comments/${commentId}`);
}

// 댓글 복구
export async function restoreComment(commentId: number): Promise<void> {
    await api.patch(`/admin/moderation/comments/${commentId}/restore`);
}
