import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, ThumbsUp, ThumbsDown, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/src/shared/lib/utils';
import { getPost, updatePost, deletePost, votePost, PostResponse } from '@/src/features/community/api/posts';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  CommentResponse,
} from '@/src/features/community/api/comments';
import { createReport } from '@/src/features/report/api/reports';

// 백엔드가 내려주는 createdAt(ISO 문자열)을 "N분 전"/"N시간 전"/"N일 전"으로 변환
function formatRelativeTime(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
  return `${Math.floor(diffMinutes / 1440)}일 전`;
}

export function CommunityPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const postId = Number(id);

  const [post, setPost] = useState<PostResponse | null>(null);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const loadPost = async () => {
    const data = await getPost(postId);
    setPost(data);
    setEditTitle(data.title);
    setEditContent(data.content);
  };

  const loadComments = async () => {
    const data = await getComments(postId);
    setComments(data);
  };

  useEffect(() => {
    if (!postId) return;

    setLoading(true);
    Promise.all([loadPost(), loadComments()])
      .catch((error) => console.error('게시글/댓글 조회 실패', error))
      .finally(() => setLoading(false));
  }, [postId]);

  const [myVote, setMyVote] = useState<'LIKE' | 'DISLIKE' | null>(null);

  const handleVote = async (voteType: 'LIKE' | 'DISLIKE') => {
    try {
      await votePost(postId, voteType);

      setPost((prev) => {
        if (!prev) return prev;

        if (myVote === voteType) {
          return voteType === 'LIKE'
            ? { ...prev, likeCount: prev.likeCount - 1 }
            : { ...prev, dislikeCount: prev.dislikeCount - 1 };
        }
        if (myVote === null) {
          return voteType === 'LIKE'
            ? { ...prev, likeCount: prev.likeCount + 1 }
            : { ...prev, dislikeCount: prev.dislikeCount + 1 };
        }
        if (myVote === 'LIKE' && voteType === 'DISLIKE') {
          return { ...prev, likeCount: prev.likeCount - 1, dislikeCount: prev.dislikeCount + 1 };
        }
        if (myVote === 'DISLIKE' && voteType === 'LIKE') {
          return { ...prev, dislikeCount: prev.dislikeCount - 1, likeCount: prev.likeCount + 1 };
        }
        return prev;
      });

      setMyVote((prev) => (prev === voteType ? null : voteType));
    } catch (error) {
      console.error('추천/비추천 실패', error);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('게시글을 삭제하시겠습니까?')) return;

    try {
      await deletePost(postId);
      navigate('/community');
    } catch (error) {
      console.error('게시글 삭제 실패', error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updatePost(postId, { title: editTitle, content: editContent });
      setIsEditingPost(false);
      await loadPost();
    } catch (error) {
      console.error('게시글 수정 실패', error);
    }
  };

  const handleReportPost = async () => {
    const reason = window.prompt('신고 사유를 입력해주세요.');
    if (!reason) return;

    try {
      await createReport({ targetType: 'POST', targetId: postId, reason });
      alert('신고가 접수되었습니다.');
    } catch (error) {
      console.error('신고 접수 실패', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      await createComment(postId, { content: commentText });
      setCommentText('');
      await loadComments();
      await loadPost(); // commentCount 갱신 반영
    } catch (error) {
      console.error('댓글 작성 실패', error);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!replyText.trim()) return;

    try {
      await createComment(postId, { content: replyText, parentId });
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
      await loadPost();
    } catch (error) {
      console.error('답글 작성 실패', error);
    }
  };

  const handleSaveCommentEdit = async (commentId: number) => {
    if (!editingCommentText.trim()) return;

    try {
      await updateComment(commentId, { content: editingCommentText });
      setEditingCommentId(null);
      await loadComments();
    } catch (error) {
      console.error('댓글 수정 실패', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await deleteComment(commentId);
      await loadComments();
      await loadPost();
    } catch (error) {
      console.error('댓글 삭제 실패', error);
    }
  };

  if (loading || !post) {
    return (
      <div className="flex items-center justify-center py-40 text-text-secondary text-sm font-medium">
        불러오는 중...
      </div>
    );
  }

  // 댓글 하나(+ 대댓글)를 재귀적으로 렌더링. depth로 대댓글 들여쓰기 처리
  const renderComment = (comment: CommentResponse, depth = 0) => (
    <div key={comment.id} className={cn('flex gap-4', depth > 0 && 'mt-4 pl-0')}>
      <div
        className={cn(
          'rounded-full bg-bg-main flex items-center justify-center shrink-0 border border-border-color',
          depth > 0 ? 'w-8 h-8' : 'w-10 h-10',
        )}
      >
        <User className={cn(depth > 0 ? 'w-4 h-4' : 'w-5 h-5', 'text-text-secondary')} />
      </div>
      <div className={cn('flex-1', depth > 0 && 'bg-bg-main p-3 rounded-[12px]')}>
        <div className="flex items-center gap-2">
          <Link
            to={`/users/${encodeURIComponent(comment.authorNickname)}`}
            className="font-bold text-sm text-text-primary hover:underline transition-colors"
          >
            {comment.authorNickname}
          </Link>
          <span className="text-xs text-text-secondary ml-1">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {editingCommentId === comment.id ? (
          <div className="mt-1 flex gap-2">
            <textarea
              className="flex-1 border border-border-color rounded-[8px] p-2 text-sm outline-none resize-none"
              value={editingCommentText}
              onChange={(e) => setEditingCommentText(e.target.value)}
            />
            <Button size="sm" onClick={() => handleSaveCommentEdit(comment.id)}>
              저장
            </Button>
          </div>
        ) : (
          <p className="text-sm mt-1">{comment.content}</p>
        )}

        <div className="flex items-center gap-4 mt-2">
          {!comment.isDeleted && (
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-xs font-semibold text-text-secondary hover:text-brand transition-colors"
            >
              답글달기
            </button>
          )}
          {comment.isMine && !comment.isDeleted && (
            <>
              <button
                onClick={() => {
                  setEditingCommentId(comment.id);
                  setEditingCommentText(comment.content);
                }}
                className="text-xs font-semibold text-text-secondary hover:text-brand transition-colors"
              >
                수정
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-xs font-semibold text-text-secondary hover:text-down transition-colors"
              >
                삭제
              </button>
            </>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <textarea
              className="flex-1 border border-border-color rounded-[8px] p-2 text-sm outline-none resize-none"
              placeholder="답글을 입력하세요"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
              등록
            </Button>
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-2">{comment.replies.map((reply) => renderComment(reply, depth + 1))}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link
        to="/community"
        className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로
      </Link>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-border-color">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-brand/10 text-brand border-transparent">
                {post.boardType === 'FREE' ? '자유게시판' : post.boardType === 'NOTICE' ? '공지' : '종목게시판'}
              </Badge>
            </div>

            {isEditingPost ? (
              <input
                className="w-full text-2xl font-bold text-text-primary mb-4 border-b border-border-color outline-none pb-1"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            ) : (
              <h1 className="text-2xl font-bold text-text-primary mb-4">{post.title}</h1>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center shrink-0 border border-border-color">
                  <User className="w-5 h-5 text-text-secondary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/users/${encodeURIComponent(post.authorNickname)}`}
                      className="font-bold text-text-primary hover:underline transition-colors"
                    >
                      {post.authorNickname}
                    </Link>
                    <span className="text-[10px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded-[4px]">
                      Lv.{post.authorLevel}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {formatRelativeTime(post.createdAt)} · 조회 {post.viewCount}
                  </div>
                </div>
              </div>

              {post.isMine && (
                <div className="flex items-center gap-2">
                  {isEditingPost ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleSaveEdit}>
                        저장
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingPost(false)}>
                        취소
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="text-text-secondary" onClick={() => setIsEditingPost(true)}>
                        수정
                      </Button>
                      <Button variant="ghost" size="sm" className="text-text-secondary" onClick={handleDeletePost}>
                        삭제
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 min-h-[300px]">
            {isEditingPost ? (
              <textarea
                className="w-full min-h-[200px] border border-border-color rounded-[12px] p-3 text-sm outline-none resize-none"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
            )}

            <div className="mt-12 flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => handleVote('LIKE')}
                className={cn(
                  'h-12 px-6 rounded-full group gap-2 transition-colors',
                  myVote === 'LIKE'
                    ? 'bg-up text-white border-up hover:bg-up/90'
                    : 'border-up text-up hover:bg-up/10 hover:border-up',
                )}
              >
                <ThumbsUp className={cn('w-5 h-5 group-hover:-translate-y-1 transition-transform', myVote === 'LIKE' && 'fill-current')} />{' '}
                추천 {post.likeCount}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleVote('DISLIKE')}
                className={cn(
                  'h-12 px-6 rounded-full group gap-2 transition-colors',
                  myVote === 'DISLIKE'
                    ? 'bg-down text-white border-down hover:bg-down/90'
                    : 'border-down text-down hover:bg-down/10 hover:border-down',
                )}
              >
                <ThumbsDown className={cn('w-5 h-5 group-hover:translate-y-1 transition-transform', myVote === 'DISLIKE' && 'fill-current')} /> 비추천 {post.dislikeCount}
              </Button>
            </div>

            {!post.isMine && (
              <div className="mt-8 flex justify-end">
                <Button variant="ghost" size="sm" className="text-text-secondary gap-1" onClick={handleReportPost}>
                  <AlertCircle className="w-4 h-4" /> 신고
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-brand" /> 댓글 {post.commentCount}
          </h3>

          <div className="flex gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center shrink-0 border border-border-color">
              <User className="w-5 h-5 text-text-secondary" />
            </div>
            <div className="flex-1 border border-border-color rounded-[16px] overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:border-transparent transition-all">
              <textarea
                className="w-full bg-bg-main p-3 outline-none resize-none min-h-[80px] text-sm"
                placeholder="댓글을 입력해보세요"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <div className="bg-surface p-2 flex justify-end border-t border-border-color">
                <Button size="sm" className="rounded-[12px] px-4" onClick={handleSubmitComment}>
                  등록
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">{comments.map((comment) => renderComment(comment))}</div>
        </CardContent>
      </Card>
    </div>
  );
}
