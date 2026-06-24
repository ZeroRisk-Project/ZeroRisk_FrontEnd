import React, { useState } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, User, ThumbsUp, ThumbsDown, MessageSquare, AlertCircle } from 'lucide-react';
import { formatPrice, cn } from '@/src/lib/utils';

export function CommunityPost() {
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link to="/community" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로
      </Link>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-border-color">
            <div className="flex items-center gap-2 mb-3">
               <Badge className="bg-brand/10 text-brand border-transparent">자유게시판</Badge>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-4">삼성전자 오늘 진짜 가냐..?</h1>
            <div className="flex items-center justify-between text-sm">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center shrink-0 border border-border-color">
                     <User className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <Link
                         to={`/users/${encodeURIComponent("수익만보고감")}`}
                         className="font-bold text-text-primary hover:underline transition-colors"
                       >
                         수익만보고감
                       </Link>
                       <span className="text-[10px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded-[4px]">Lv.4</span>
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">2023.11.05 14:30 · 조회 1,204</div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-text-secondary">수정</Button>
                  <Button variant="ghost" size="sm" className="text-text-secondary">삭제</Button>
               </div>
            </div>
          </div>

          <div className="p-6 min-h-[300px]">
             <p className="whitespace-pre-wrap leading-relaxed">
               어제 풀매수 때렸는데 오늘 떨어지는거 실화냐<br/>
               손절해야되나 말아야되나<br/>
               다들 어케 생각함?
             </p>

             <div className="mt-12 flex justify-center gap-4">
                <Button variant="outline" className="h-12 px-6 rounded-full border-up text-up hover:bg-up/10 hover:border-up group gap-2">
                   <ThumbsUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> 추천 12
                </Button>
                <Button variant="outline" className="h-12 px-6 rounded-full border-down text-down hover:bg-down/10 hover:border-down group gap-2">
                   <ThumbsDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" /> 비추천 1
                </Button>
             </div>
             
             <div className="mt-8 flex justify-end">
                <Button variant="ghost" size="sm" className="text-text-secondary gap-1">
                   <AlertCircle className="w-4 h-4" /> 신고
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold flex items-center gap-2 mb-6"><MessageSquare className="w-5 h-5 text-brand" /> 댓글 24</h3>
          
          <div className="flex gap-4 mb-8">
             <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center shrink-0 border border-border-color">
                <User className="w-5 h-5 text-text-secondary" />
             </div>
             <div className="flex-1 border border-border-color rounded-[16px] overflow-hidden focus-within:ring-2 focus-within:ring-brand focus-within:border-transparent transition-all">
                <textarea 
                  className="w-full bg-bg-main p-3 outline-none resize-none min-h-[80px] text-sm"
                  placeholder="댓글을 남겨보세요."
                />
                <div className="bg-surface p-2 flex justify-end border-t border-border-color">
                  <Button size="sm" className="rounded-[12px] px-4">등록</Button>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             {[1, 2].map(i => (
               <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center shrink-0 border border-border-color">
                     <User className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-2">
                        <Link
                          to={`/users/${encodeURIComponent("코인장인")}`}
                          className="font-bold text-sm text-text-primary hover:underline transition-colors"
                        >
                          코인장인
                        </Link>
                        <span className="text-[10px] font-bold bg-brand/10 text-brand px-1.5 py-[1px] rounded-[4px]">Lv.7</span>
                        <span className="text-xs text-text-secondary ml-1">10분 전</span>
                     </div>
                     <p className="text-sm mt-1">존버가 답이다. 무조건 버텨라.</p>
                     <div className="flex items-center gap-4 mt-2">
                        <button className="text-xs font-semibold text-text-secondary hover:text-brand transition-colors">답글달기</button>
                        <button className="text-xs font-semibold text-text-secondary hover:text-up transition-colors flex items-center gap-1">
                           <ThumbsUp className="w-3 h-3" /> 2
                        </button>
                     </div>
                     {i === 1 && (
                        <div className="mt-4 flex gap-4 pl-0">
                           <div className="w-8 h-8 rounded-full bg-bg-main flex items-center justify-center shrink-0 border border-border-color">
                              <User className="w-4 h-4 text-text-secondary" />
                           </div>
                           <div className="flex-1 bg-bg-main p-3 rounded-[12px]">
                              <div className="flex items-center gap-2">
                                 <Link to={`/users/${encodeURIComponent("수익만보고감")}`} className="font-bold text-sm hover:underline transition-colors">수익만보고감(글쓴이)</Link>
                                 <span className="text-xs text-text-secondary ml-1">5분 전</span>
                              </div>
                              <p className="text-sm mt-1 text-text-secondary">넵 감사합니다ㅠㅠ</p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
