import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/src/features/community/api/posts"; // 실제 경로로 수정
import { Card, CardContent } from "@/src/shared/components/ui/Card";
import { Button } from "@/src/shared/components/ui/Button";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Input } from "@/src/shared/components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Flame,
  TrendingUp,
  ThumbsUp,
  Edit2,
  Eye,
  Search,
} from "lucide-react";
import { cn } from "@/src/shared/lib/utils";

// 수정 후
export function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("자유게시판");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedProfits, setLikedProfits] = useState<Record<number, boolean>>({});

  // 공지(NOTICE)와 일반 자유글(FREE)을 따로 조회해서 공지를 목록 상단에 얹는 구조 -
  // 두 응답이 한 세트로 같이 갱신돼야 해서 하나의 쿼리로 묶었다. 자유게시판 탭일 때만 조회.
  const { data: freeBoardData } = useQuery({
    queryKey: ["community", "free-board"],
    queryFn: async () => {
      const [noticeRes, freeRes] = await Promise.all([getPosts("NOTICE", 0, 5), getPosts("FREE", 0, 20)]);
      return { noticePosts: noticeRes.content, freePosts: freeRes.content };
    },
    enabled: activeTab === "자유게시판",
    retry: false,
  });
  const noticePosts = freeBoardData?.noticePosts ?? [];
  const freePosts = freeBoardData?.freePosts ?? [];

  // 백엔드가 내려주는 createdAt(ISO 문자열)을 "N분 전"/"N시간 전"/"N일 전"으로 변환
  const formatRelativeTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-border-color pb-2 gap-4">
        <div className="flex gap-6">
          {["자유게시판", "종목게시판", "수익률인증"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-lg font-bold pb-2 transition-colors border-b-2 relative top-[9px]",
                activeTab === tab
                  ? "border-brand text-brand"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Post List */}
        <div className="w-full lg:w-[70%] space-y-4">
          {activeTab === "자유게시판" && (
            <Card>
              <CardContent className="p-0">
                <div className="px-6 py-5 border-b border-border-color flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    자유게시판
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
                <div className="flex items-center gap-4 py-3 px-6 border-b border-border-color text-sm text-text-secondary font-medium bg-bg-main/30">
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
                // 수정 후
                {[
                  ...noticePosts.map((p) => ({
                    id: p.id,
                    title: p.title,
                    author: p.authorNickname,
                    level: "GM",
                    time: formatRelativeTime(p.createdAt),
                    views: p.viewCount,
                    likes: p.likeCount,
                    comments: p.commentCount,
                    isNotice: true,
                  })),
                  ...freePosts.map((p) => ({
                    id: p.id,
                    title: p.title,
                    author: p.authorNickname,
                    level: `Lv.${p.authorLevel}`,
                    time: formatRelativeTime(p.createdAt),
                    views: p.viewCount,
                    likes: p.likeCount,
                    comments: p.commentCount,
                    isNotice: false,
                  })),
                ]
                  .filter((post) =>
                    searchQuery.trim() === "" ? true : post.title.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((post, i) => (
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
                              {8421 - i}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 flex items-center min-w-0 gap-4">
                          <h3
                            className={cn(
                              "font-semibold truncate flex-1 text-sm",
                              post.isNotice
                                ? "text-brand"
                                : "text-text-primary",
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
                            <div className="flex items-center gap-3 ml-2">
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
                <div className="p-4 flex justify-center items-center gap-2 border-t border-border-color">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    disabled
                  >
                    <span className="text-xs">&lt;</span>
                  </Button>
                  <Button className="w-8 h-8 font-bold p-0 text-white">
                    1
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-8 h-8 font-bold p-0 hover:bg-bg-main"
                  >
                    2
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-8 h-8 font-bold p-0 hover:bg-bg-main"
                  >
                    3
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 text-xs"
                  >
                    <span className="text-xs">&gt;</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "종목게시판" && (
            <Card>
              <CardContent className="p-0">
                <div className="px-6 py-5 border-b border-border-color flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    종목게시판
                  </h3>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
                      <Input
                        placeholder="종목명 검색"
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
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: "삼성전자", code: "005930", change: 1.2 },
                      { name: "SK하이닉스", code: "000660", change: 3.4 },
                      { name: "LG에너지솔루션", code: "373220", change: -1.5 },
                      { name: "현대차", code: "005380", change: 0.8 },
                      { name: "기아", code: "000270", change: 2.1 },
                      { name: "NAVER", code: "035420", change: -0.5 },
                      { name: "카카오", code: "035720", change: -1.2 },
                      { name: "셀트리온", code: "068270", change: 4.5 },
                    ]
                      .filter((stock) =>
                        searchQuery.trim() === ""
                          ? true
                          : stock.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()),
                      )
                      .map((stock) => (
                        <Link
                          key={stock.code}
                          to={`/community/stock/${stock.code}`}
                        >
                          <div className="bg-bg-main p-4 rounded-[16px] hover:border-text-secondary/50 border border-border-color transition-colors flex justify-between items-center group">
                            <div>
                              <div className="font-bold flex items-center gap-2 text-sm">
                                {stock.name}
                                <span
                                  className={cn(
                                    "text-xs",
                                    stock.change > 0 ? "text-up" : "text-down",
                                  )}
                                >
                                  {stock.change > 0 ? "▲" : "▼"}{" "}
                                  {Math.abs(stock.change)}%
                                </span>
                              </div>
                              <div className="text-xs text-text-secondary mt-1">
                                실시간 토론방 참여하기
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-surface shrink-0 shadow-sm flex items-center justify-center text-text-secondary group-hover:bg-brand group-hover:text-white transition-colors">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                          </div>
                        </Link>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "수익률인증" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  수익률인증
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    id: 10,
                    title: "이번주 단타 수익입니다",
                    author: "테슬람",
                    level: "Lv.5",
                    time: "1시간 전",
                    profit: "+450,000원",
                    profitRate: "+12.5%",
                    views: 312,
                    likes: 45,
                  },
                  {
                    id: 11,
                    title: "엔비디아 2년 장투 결국 익절",
                    author: "존버는승리",
                    level: "Lv.8",
                    time: "3시간 전",
                    profit: "+12,450,000원",
                    profitRate: "+340.2%",
                    views: 1205,
                    likes: 312,
                  },
                  {
                    id: 12,
                    title: "하락장 숏으로 먹었습니다",
                    author: "하락장전문의",
                    level: "Lv.4",
                    time: "4시간 전",
                    profit: "+1,200,000원",
                    profitRate: "+8.4%",
                    views: 245,
                    likes: 12,
                  },
                  {
                    id: 13,
                    title: "첫 주식 한달 수익 인증",
                    author: "주린이",
                    level: "Lv.2",
                    time: "12시간 전",
                    profit: "+34,000원",
                    profitRate: "+3.2%",
                    views: 89,
                    likes: 5,
                  },
                  {
                    id: 14,
                    title: "단타로 치다가 물렸는데 본절 탈출",
                    author: "손실은안봐",
                    level: "Lv.3",
                    time: "1일 전",
                    profit: "+1,200원",
                    profitRate: "+0.1%",
                    views: 156,
                    likes: 2,
                  },
                  {
                    id: 15,
                    title: "애플 꼴도 보기 싫어서 팔았습니다",
                    author: "사과농장주인",
                    level: "Lv.6",
                    time: "2일 전",
                    profit: "+2,150,000원",
                    profitRate: "+45.8%",
                    views: 3410,
                    likes: 156,
                  },
                ].map((post) => (
                  <div
                    key={post.id}
                    className="group cursor-default flex flex-col"
                  >
                    {/* 수익 부분 (가운데 정렬) - 정사각형, radius 없음, 테두리 없음 */}
                    <div className="aspect-square flex flex-col justify-center items-center bg-bg-main mb-3 transition-colors">
                      <div className="text-lg sm:text-xl font-bold text-up mb-2 tracking-tight">
                        {post.profit}
                      </div>
                      <Badge className="bg-up/10 text-up border-transparent px-2 font-bold">
                        {post.profitRate}
                      </Badge>
                    </div>

                    {/* 텍스트 정보 부분 (하단) */}
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-sm line-clamp-1 text-text-primary">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Link
                          to={`/users/${encodeURIComponent(post.author)}`}
                          className="text-xs font-bold text-text-secondary hover:underline transition-colors cursor-pointer"
                        >
                          {post.author}
                        </Link>
                        <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 px-1 border-transparent font-bold">
                          {post.level}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                          <span>{post.time}</span>
                        </div>
                        <button
                          className={cn(
                            "flex items-center gap-1 transition-colors shrink-0",
                            likedProfits[post.id]
                              ? "text-up"
                              : "text-text-secondary",
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            setLikedProfits((prev) => ({
                              ...prev,
                              [post.id]: !prev[post.id],
                            }));
                          }}
                        >
                          <ThumbsUp
                            className={cn(
                              "w-5 h-5",
                              likedProfits[post.id] ? "fill-current" : "",
                            )}
                          />
                          <span className="text-[11px] font-medium min-w-[20px] text-center w-full flex justify-center">
                            {post.likes + (likedProfits[post.id] ? 1 : 0)}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Widgets */}
        <div className="w-full lg:w-[30%] space-y-6">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-up" /> 주간 인기글
              </h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <span className="font-bold text-brand w-4">{i}</span>
                    <p className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary truncate transition-colors">
                      이 시장에서 살아남는 법 공유합니다. 무조건 읽으세요.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-up" /> HOT 주목 종목 토론방
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { name: "삼성전자", code: "005930", change: 1.2 },
                  { name: "SK하이닉스", code: "000660", change: 3.4 },
                  { name: "LG에너지솔루션", code: "373220", change: -1.5 },
                  { name: "현대차", code: "005380", change: 0.8 },
                ].map((stock) => (
                  <Link key={stock.code} to={`/community/stock/${stock.code}`}>
                    <div className="bg-bg-main p-4 rounded-[16px] hover:border-text-secondary/50 border border-border-color transition-colors flex justify-between items-center group">
                      <div>
                        <div className="font-bold flex items-center gap-2 text-sm">
                          {stock.name}
                          <span
                            className={cn(
                              "text-xs",
                              stock.change > 0 ? "text-up" : "text-down",
                            )}
                          >
                            {stock.change > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(stock.change)}%
                          </span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          실시간 참여하기
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-surface shrink-0 shadow-sm flex items-center justify-center text-text-secondary group-hover:bg-brand group-hover:text-white transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
