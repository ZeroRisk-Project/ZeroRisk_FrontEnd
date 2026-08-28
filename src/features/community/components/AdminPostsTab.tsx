import React from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import {
  getAdminComments, forceDeletePost, restorePost, forceDeleteComment, restoreComment,
  AdminCommentResponse,
} from '@/src/features/moderation/api/moderation';

interface PostItem {
  id: number;
  author: string;
  title: string;
  content: string;
  date: string;
  views: number;
  likes: number;
  commentsCount: number;
  status: "ACTIVE" | "DELETED";
}

interface AdminPostsTabProps {
  posts: PostItem[];
  setPosts: React.Dispatch<React.SetStateAction<PostItem[]>>;
  postSearchQuery: string;
  setPostSearchQuery: (v: string) => void;
  postFilterTab: "ALL" | "ACTIVE" | "DELETED";
  setPostFilterTab: (v: any) => void;
  selectedPostDetail: PostItem | null;
  setSelectedPostDetail: React.Dispatch<React.SetStateAction<PostItem | null>>;
  postComments: AdminCommentResponse[];
  setPostComments: React.Dispatch<React.SetStateAction<AdminCommentResponse[]>>;
  triggerToast: (msg: string) => void;
}

export function AdminPostsTab({
  posts, setPosts, postSearchQuery, setPostSearchQuery, postFilterTab, setPostFilterTab,
  selectedPostDetail, setSelectedPostDetail, postComments, setPostComments, triggerToast,
}: AdminPostsTabProps) {
  return (
    <>
              <div id="admin-posts-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">게시글 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">커뮤니티 광장에 업로드된 게시물의 상태 모니터링 및 노출 제한 관리를 수행합니다</p>
                  </div>
                </div>

                {/* Filter and Table Card */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="p-4 border-b border-[#E5E5EA] flex flex-wrap gap-4 items-center justify-between bg-white">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636C7D] w-4.5 h-4.5" />
                        <input
                          type="text"
                          placeholder="작성자 닉네임 또는 게시글 제목 검색"
                          value={postSearchQuery}
                          onChange={(e) => setPostSearchQuery(e.target.value)}
                          className="w-full bg-[#F2F2F7] border border-transparent rounded-[16px] pl-10 pr-4 py-2 text-[14px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                        />
                      </div>

                      <div className="relative">
                        <select
                          value={postFilterTab}
                          onChange={(e) => setPostFilterTab(e.target.value as any)}
                          className="appearance-none bg-[#F2F2F7] rounded-[12px] border border-transparent text-[#1C1C1E] text-[13px] font-bold pl-3.5 pr-9 py-2 outline-none hover:bg-[#E5E5EA] transition cursor-pointer"
                        >
                          <option value="ALL">전체 게시글</option>
                          <option value="ACTIVE">활성 상태 (ACTIVE)</option>
                          <option value="DELETED">삭제됨 (DELETED)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>
                    </div>

                    <div className="text-[13px] text-[#8E8E93] font-bold">
                      검색 결과: {posts.filter(p => {
                        const query = postSearchQuery.toLowerCase();
                        const matchSearch = p.author.toLowerCase().includes(query) || p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query);
                        const matchStat = postFilterTab === "ALL" || p.status === postFilterTab;
                        return matchSearch && matchStat;
                      }).length}개
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">제목</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">작성자</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">작성 일자</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">조회수</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">추천수</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">댓글수</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">상태</th>
                          <th className="py-3.5 px-4 text-center w-[200px] whitespace-nowrap">관리 작업</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {posts
                          .filter((p) => {
                            const query = postSearchQuery.toLowerCase();
                            const matchSearch = p.author.toLowerCase().includes(query) || p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query);
                            const matchStat = postFilterTab === "ALL" || p.status === postFilterTab;
                            return matchSearch && matchStat;
                          })
                          .map((post, idx) => {
                            const handlePostStatus = async (nextStat: "ACTIVE" | "DELETED") => {
                              try {
                                if (nextStat === "DELETED") {
                                  await forceDeletePost(post.id);
                                } else {
                                  await restorePost(post.id);
                                }
                                setPosts(prev => prev.map(item => item.id === post.id ? { ...item, status: nextStat } : item));
                                triggerToast(`게시글 [${post.title}]이(가) [${nextStat === "ACTIVE" ? "활성" : "삭제"}] 처리되었습니다.`);
                              } catch (error) {
                                console.error("게시글 상태 변경 실패", error);
                                triggerToast("⚠️ 처리에 실패했습니다.");
                              }
                            };

                            return (
                              <tr key={post.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                                <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                                <td className="py-2 px-4 font-bold text-[#1C1C1E] max-w-xs truncate whitespace-nowrap" title={post.title}>
                                  {post.title}
                                </td>
                                <td className="py-2 px-4 font-semibold text-[#1C1C1E] whitespace-nowrap">{post.author}</td>
                                <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">{post.date}</td>
                                <td className="py-2 px-4 text-center font-medium text-[#1C1C1E] tabular-nums whitespace-nowrap">{post.views}</td>
                                <td className="py-2 px-4 text-center font-medium text-brand tabular-nums whitespace-nowrap">{post.likes}</td>
                                <td className="py-2 px-4 text-center font-medium text-[#FF9500] tabular-nums whitespace-nowrap">{post.commentsCount}</td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-[16px] text-xs font-black inline-block",
                                    post.status === "ACTIVE" ? "bg-[#34C759]/11 text-[#34C759]" : "bg-[#FF3B30]/11 text-[#FF3B30]"
                                  )}>
                                    {post.status === "ACTIVE" ? "활성" : "삭제됨"}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => setSelectedPostDetail(post)}
                                      className="px-2.5 py-1.5 bg-[#4A5DF9]/10 text-[#4A5DF9] hover:bg-[#4A5DF9]/20 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                    >
                                      상세
                                    </button>
                                    {post.status === "ACTIVE" ? (
                                      <button
                                        onClick={() => handlePostStatus("DELETED")}
                                        className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        삭제
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handlePostStatus("ACTIVE")}
                                        className="px-2.5 py-1.5 bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        복구
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      {/* Post Detail Viewer Modal */}
      {selectedPostDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#E5E5EA] flex flex-col gap-5 text-[#1C1C1E]">
            <div className="flex justify-between items-start">
              <div>
                <span className={cn(
                  "text-[11px] font-extrabold px-2.5 py-1 rounded-[12px] uppercase",
                  selectedPostDetail.status === "ACTIVE" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF3B30]/10 text-[#FF3B30]"
                )}>
                  {selectedPostDetail.status === "ACTIVE" ? "활성 게시물" : "삭제 처리된 게시물"}
                </span>
                <h3 className="text-[18px] font-bold text-[#1C1C1E] mt-2 leading-snug">{selectedPostDetail.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] flex items-center justify-center transition cursor-pointer text-[#8E8E93] hover:text-[#1C1C1E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F2F2F7]/50 p-3.5 rounded-[12px] border border-[#E5E5EA]/40 text-[#555] font-semibold">
                <div>작성자: <span className="font-bold text-[#1C1C1E]">{selectedPostDetail.author}</span></div>
                <div>작성 시각: <span className="font-bold text-[#1C1C1E]">{selectedPostDetail.date}</span></div>
                <div>조회수: <span className="font-bold text-[#1C1C1E]">{selectedPostDetail.views}</span></div>
                <div>추천수: <span className="font-bold text-[#1C1C1E] text-[#4A5DF9]">{selectedPostDetail.likes}</span></div>
              </div>

              <div className="flex flex-col gap-2 min-h-[140px] bg-[#F2F2F7]/20 border border-[#E5E5EA]/60 p-4 rounded-[12px]">
                <span className="text-[12px] text-[#8E8E93] font-bold">본문 내용</span>
                <p className="text-[#1C1C1E] leading-relaxed text-[13.5px] font-medium whitespace-pre-wrap">
                  {selectedPostDetail.content}
                </p>
              </div>

              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto bg-[#F2F2F7]/20 border border-[#E5E5EA]/60 p-4 rounded-[12px]">
                <span className="text-[12px] text-[#8E8E93] font-bold">댓글 {postComments.length}개</span>
                {postComments.length === 0 ? (
                  <p className="text-[12px] text-[#8E8E93] text-center py-3">댓글이 없습니다.</p>
                ) : (
                  postComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start justify-between gap-2 py-2 border-b border-[#E5E5EA]/60 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-bold text-[#1C1C1E]">{comment.author}</span>
                          <span className="text-[10px] text-[#8E8E93]">{comment.createdAt}</span>
                          {comment.isDeleted && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] bg-[#FF3B30]/10 text-[#FF3B30]">
                              삭제됨
                            </span>
                          )}
                        </div>
                        <p className="text-[12.5px] text-[#1C1C1E] mt-0.5 truncate">{comment.content}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            if (comment.isDeleted) {
                              await restoreComment(comment.id);
                            } else {
                              await forceDeleteComment(comment.id);
                            }
                            const updated = await getAdminComments(selectedPostDetail.id);
                            setPostComments(updated);
                            triggerToast(`댓글이 ${comment.isDeleted ? '복구' : '삭제'}되었습니다.`);
                          } catch (error) {
                            console.error('댓글 상태 변경 실패', error);
                            triggerToast('⚠️ 처리에 실패했습니다.');
                          }
                        }}
                        className={cn(
                          'shrink-0 px-2 py-1 text-[11px] font-bold rounded-[8px] transition cursor-pointer',
                          comment.isDeleted
                            ? 'bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20'
                            : 'border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5',
                        )}
                      >
                        {comment.isDeleted ? '복구' : '삭제'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-2.5 mt-1 shrink-0">
              {selectedPostDetail.status === "ACTIVE" ? (
                <button
                  onClick={async () => {
                    try {
                      await forceDeletePost(selectedPostDetail.id);
                      setPosts(prev => prev.map(item => item.id === selectedPostDetail.id ? { ...item, status: "DELETED" } : item));
                      setSelectedPostDetail(prev => prev ? { ...prev, status: "DELETED" } : null);
                      triggerToast(`게시글이 비공개(삭제) 처리되었습니다.`);
                    } catch (error) {
                      console.error('게시글 삭제 실패', error);
                      triggerToast('⚠️ 처리에 실패했습니다.');
                    }
                  }}
                  className="flex-1 py-3 bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 transition text-[13px] font-bold rounded-[12px] shadow-sm cursor-pointer"
                >
                  게시글 블라인드 삭제
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await restorePost(selectedPostDetail.id);
                      setPosts(prev => prev.map(item => item.id === selectedPostDetail.id ? { ...item, status: "ACTIVE" } : item));
                      setSelectedPostDetail(prev => prev ? { ...prev, status: "ACTIVE" } : null);
                      triggerToast(`게시글이 성공적으로 복구되었습니다.`);
                    } catch (error) {
                      console.error('게시글 복구 실패', error);
                      triggerToast('⚠️ 처리에 실패했습니다.');
                    }
                  }}
                  className="flex-1 py-3 bg-[#34C759] text-white hover:bg-[#34C759]/90 transition text-[13px] font-bold rounded-[12px] shadow-sm cursor-pointer"
                >
                  게시글 복구 활성화
                </button>
              )}
              <button
                onClick={() => setSelectedPostDetail(null)}
                className="py-3 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] text-[13px] font-bold rounded-[12px] px-5 transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
