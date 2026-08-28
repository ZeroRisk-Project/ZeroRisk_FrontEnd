import React, { useState } from "react";
import { Card, CardContent } from "@/src/shared/components/ui/Card";
import { Button } from "@/src/shared/components/ui/Button";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Input } from "@/src/shared/components/ui/Input";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Users,
  MessageCircle,
  Send,
  ThumbsUp,
  Eye,
  MessageSquare,
  Search,
} from "lucide-react";
import { cn, formatPrice, formatPercent } from "@/src/shared/lib/utils";

export function CommunityStock() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("게시글");
  const [searchQuery, setSearchQuery] = useState("");

  // mock data
  const stockInfo = {
    name: "삼성전자",
    code: code || "005930",
    price: 68400,
    change: -1.2,
    participants: 1205,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info + Posts (or Tabs depending on view) */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          {/* Stock Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{stockInfo.name}</h1>
                    <span className="text-text-secondary font-medium">
                      {stockInfo.code}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold tabular-nums">
                      {formatPrice(stockInfo.price)}원
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        stockInfo.change > 0 ? "text-up" : "text-down",
                      )}
                    >
                      {stockInfo.change > 0 ? "▲" : "▼"}{" "}
                      {formatPercent(stockInfo.change)}
                    </span>
                  </div>
                </div>
                <Link to={`/stocks/${stockInfo.code}`}>
                  <Button variant="outline">차트/주문 보기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:hidden">
            <div className="flex border-b border-border-color">
              <button
                onClick={() => setActiveTab("게시글")}
                className={cn(
                  "flex-1 py-3 font-bold border-b-2 text-center transition-colors",
                  activeTab === "게시글"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary",
                )}
              >
                게시글
              </button>
              <button
                onClick={() => setActiveTab("채팅")}
                className={cn(
                  "flex-1 py-3 font-bold border-b-2 text-center transition-colors",
                  activeTab === "채팅"
                    ? "border-brand text-brand"
                    : "border-transparent text-text-secondary",
                )}
              >
                실시간 채팅
              </button>
            </div>
          </Card>

          <Card
            className={cn(activeTab === "게시글" ? "block" : "hidden lg:block")}
          >
            <CardContent className="p-0">
              <div className="px-6 py-5 border-b border-border-color flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2">
                  종목 게시글
                </h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
                    <Input
                      placeholder="제목 또는 내용 검색"
                      className="w-full sm:w-[200px] h-9 text-sm pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Link to="/community/write">
                    <Button className="shrink-0 rounded-[16px] px-6 bg-brand text-white border-transparent hover:bg-brand/90 h-9 text-sm font-bold cursor-pointer">
                      글쓰기
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-4 py-3 px-6 border-b border-border-color text-sm text-text-secondary font-medium bg-bg-main/30 rounded-t-[12px]">
                  <div className="w-10 text-center shrink-0">번호</div>
                  <div className="flex-1 px-2">제목</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-[100px] text-center">작성자</div>
                    <span className="ml-1 w-12 text-center">작성일</span>
                    <div className="flex items-center gap-3 ml-2">
                      <span className="w-12 text-right">조회수</span>
                      <span className="w-12 text-right">추천</span>
                      <span className="w-12 text-right">댓글</span>
                    </div>
                  </div>
                </div>
                {[
                  {
                    id: 0,
                    title: "삼성전자 종목 토론방 클린 캠페인 안내",
                    content:
                      "건전한 투자 문화 조성을 위해 욕설 및 비방글은 통보 없이 삭제될 수 있습니다.",
                    author: "운영자",
                    level: "GM",
                    time: "1일 전",
                    views: 3102,
                    likes: 124,
                    comments: 41,
                    isNotice: true,
                  },
                  {
                    id: 1,
                    title: "삼성전자 진짜 이가격에 사는게 맞을까요?",
                    content:
                      "물려도 삼전이라고 배웠습니다. 지금 6.8만에 평단 맞춰놨는데 더 내려갈까요?",
                    author: "제로주린이",
                    level: "Lv.2",
                    time: "10분 전",
                    views: 245,
                    likes: 12,
                    comments: 24,
                  },
                  {
                    id: 2,
                    title: "오늘 외인 매도세 장난아니네요",
                    content: "다들 조심하세요. 당분간 현금 확보가 답인듯",
                    author: "투자의신",
                    level: "Lv.5",
                    time: "30분 전",
                    views: 89,
                    likes: 5,
                    comments: 8,
                  },
                  {
                    id: 3,
                    title: "장기투자자분들 멘탈 관리 어떻게 하시나요",
                    content:
                      "매일 창 보면서 일희일비하게 되네요. 노하우 좀 공유해주세요.",
                    author: "장투가미래다",
                    level: "Lv.3",
                    time: "1시간 전",
                    views: 412,
                    likes: 8,
                    comments: 13,
                  },
                  {
                    id: 4,
                    title: "실적 발표 언제인가요?",
                    content:
                      "이번 분기 기대된다던데 혹시 정확한 날짜 아시는 분 계신가요?",
                    author: "정보빌런",
                    level: "Lv.4",
                    time: "2시간 전",
                    views: 231,
                    likes: 3,
                    comments: 5,
                  },
                ].map((post, i) => (
                  <div
                    key={post.id}
                    onClick={() => navigate(`/community/${post.id}`)}
                    className={cn(
                      "block border-b border-border-color last:border-0 hover:bg-bg-main transition-colors first:rounded-t-[16px] last:rounded-b-[16px] cursor-pointer",
                      post.isNotice ? "bg-brand/5 border-b-brand/20" : "",
                    )}
                  >
                    <div className="py-4 px-6 flex items-center gap-4">
                      <div className="w-10 text-center shrink-0 flex justify-center">
                        {post.isNotice ? (
                          <span className="text-xs font-bold text-brand">
                            공지
                          </span>
                        ) : (
                          <span className="text-xs text-text-secondary text-opacity-80">
                            {4521 - i}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex items-center min-w-0 gap-4">
                        <h3
                          className={cn(
                            "font-semibold truncate flex-1 text-sm px-2",
                            post.isNotice ? "text-brand" : "text-text-primary",
                          )}
                        >
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-text-secondary shrink-0">
                          <div className="flex items-center justify-center gap-2 w-[100px]">
                            {post.isNotice ? (
                              <span className="font-bold text-brand truncate">
                                {post.author}
                              </span>
                            ) : (
                              <Link
                                to={`/users/${encodeURIComponent(post.author)}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="font-bold text-text-primary hover:underline truncate transition-colors cursor-pointer"
                              >
                                {post.author}
                              </Link>
                            )}
                            {!post.isNotice && (
                              <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 px-1 border-transparent font-bold">
                                {post.level}
                              </Badge>
                            )}
                            {post.isNotice && (
                              <span className="bg-brand/20 text-brand py-0 text-[10px] h-4 px-1 rounded font-bold flex items-center shrink-0">
                                {post.level}
                              </span>
                            )}
                          </div>
                          <span className="ml-1 w-12 text-center">
                            {post.time}
                          </span>
                          <div className="flex items-center gap-3 ml-2 text-xs font-mono">
                            <span className="flex items-center gap-1 font-bold w-12 justify-end">
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-up w-12 justify-end">
                              {post.likes}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-emerald-500 w-12 justify-end">
                              {post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Chat */}
        <div
          className={cn(
            "col-span-1",
            activeTab === "채팅" ? "block" : "hidden lg:block",
          )}
        >
          <Card className="flex flex-col h-[600px] border-border-color">
            <div className="p-4 border-b border-border-color flex items-center justify-between bg-surface shrink-0 rounded-t-[16px]">
              <h3 className="font-bold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand" /> 실시간 종목
                채팅
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bg-main/50">
              {[
                {
                  isMe: false,
                  name: "단타의신",
                  text: "외인들 싹다 던지네 ㅋㅋㅋ",
                  time: "14:30",
                },
                {
                  isMe: false,
                  name: "삼전가즈아",
                  text: "이거 오늘 6.5만 깨지면 진짜 답없습니다.",
                  time: "14:31",
                },
                {
                  isMe: true,
                  name: "나",
                  text: "저 방금 6.8만에 풀매수 때렸는데 ㅠㅠ",
                  time: "14:32",
                },
                {
                  isMe: false,
                  name: "워렌버핏",
                  text: "지금이 저점 추매 기회입니다. 다들 줍줍하세요~",
                  time: "14:33",
                },
              ].map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col",
                    msg.isMe ? "items-end" : "items-start",
                  )}
                >
                  {!msg.isMe && (
                    <Link
                      to={`/users/${encodeURIComponent(msg.name)}`}
                      className="text-xs text-text-secondary hover:underline font-semibold mb-1 ml-1 transition-colors cursor-pointer"
                    >
                      {msg.name}
                    </Link>
                  )}
                  <div className="flex items-end gap-1.5">
                    {msg.isMe && (
                      <span className="text-[10px] text-text-secondary">
                        {msg.time}
                      </span>
                    )}
                    <div
                      className={cn(
                        "px-4 py-2 rounded-[16px] text-sm max-w-[220px] break-words shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                        msg.isMe
                          ? "bg-brand text-white rounded-br-sm"
                          : "bg-surface border border-border-color rounded-bl-sm",
                      )}
                    >
                      {msg.text}
                    </div>
                    {!msg.isMe && (
                      <span className="text-[10px] text-text-secondary">
                        {msg.time}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border-color bg-surface shrink-0 rounded-b-[16px]">
              <div className="flex items-center relative">
                <Input
                  className="pr-12 bg-bg-main border-border-color focus-visible:ring-brand shadow-sm rounded-[16px] py-6"
                  placeholder="메시지 입력..."
                />
                <Button
                  size="icon"
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-9 h-9 rounded-[12px] bg-brand text-white border-transparent hover:bg-brand/90"
                >
                  <Send className="w-4 h-4 ml-[-2px]" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
