import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts, getPopularPosts } from "@/src/features/community/api/posts"; // 실제 경로로 수정
import { getStockRankings } from "@/src/features/stock/api/stock";
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
  const [freePage, setFreePage] = useState(0);
  const FREE_BOARD_PAGE_SIZE = 6;

  // 공지(NOTICE)는 항상 최신 5개 고정 노출, 일반 자유글(FREE)만 페이지네이션 대상
  const { data: freeBoardData } = useQuery({
    queryKey: ["community", "free-board", freePage],
    queryFn: async () => {
      const [noticeRes, freeRes] = await Promise.all([
        getPosts("NOTICE", 0, 5, "createdAt,desc"),
        getPosts("FREE", freePage, FREE_BOARD_PAGE_SIZE, "createdAt,desc"),
      ]);
      return {
        noticePosts: noticeRes.content,
        freePosts: freeRes.content,
        freeTotalPages: freeRes.totalPages,
      };
    },
    enabled: activeTab === "자유게시판",
    retry: false,
  });
  const noticePosts = (freeBoardData?.noticePosts ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const freePosts = (freeBoardData?.freePosts ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const freeTotalPages = freeBoardData?.freeTotalPages ?? 1;

  // 종목게시판 탭: 토론방으로 진입할 종목 목록은 거래량 상위 종목 전체를 받아와서 10개씩 페이징
  // (KIS 거래량순위 API는 count 파라미터와 무관하게 매번 고정된 전체 목록을 반환하므로,
  // count는 "얼마나 잘라 받을지"만 결정함 - 넉넉하게 100으로 요청해 사실상 전량을 받는다)
  const [stockBoardPage, setStockBoardPage] = useState(0);
  const STOCK_BOARD_PAGE_SIZE = 10;
  const { data: stockBoardAll = [] } = useQuery({
    queryKey: ["stocks", "rankings", "VOLUME"],
    queryFn: () => getStockRankings("VOLUME", 100),
    enabled: activeTab === "종목게시판",
    retry: false,
  });
  const stockBoardTotalPages = Math.ceil(stockBoardAll.length / STOCK_BOARD_PAGE_SIZE);
  const stockBoardList = stockBoardAll.slice(
    stockBoardPage * STOCK_BOARD_PAGE_SIZE,
    (stockBoardPage + 1) * STOCK_BOARD_PAGE_SIZE,
  );

  // 우측 사이드바는 탭과 무관하게 항상 노출되므로 별도로 조회
  const { data: weeklyPopularPosts = [] } = useQuery({
    queryKey: ["community", "popular-posts", "weekly"],
    queryFn: async () => {
      const posts = await getPopularPosts(20);
      return posts.filter((p) => p.boardType !== "NOTICE").slice(0, 5);
    },
    retry: false,
  });

  const { data: hotStocks = [] } = useQuery({
    queryKey: ["stocks", "rankings", "RISE", 4],
    queryFn: () => getStockRankings("RISE", 4),
    retry: false,
  });

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
          {["자유게시판", "종목게시판"].map((tab) => (
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
                              {post.id}
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
                    onClick={() => setFreePage((p) => Math.max(0, p - 1))}
                    disabled={freePage === 0}
                  >
                    <span className="text-xs">&lt;</span>
                  </Button>
                  {Array.from({ length: freeTotalPages }, (_, i) => i).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === freePage ? "primary" : "ghost"}
                      className={cn(
                        "w-8 h-8 font-bold p-0",
                        pageNum === freePage ? "text-white" : "hover:bg-bg-main",
                      )}
                      onClick={() => setFreePage(pageNum)}
                    >
                      {pageNum + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8 text-xs"
                    onClick={() => setFreePage((p) => Math.min(freeTotalPages - 1, p + 1))}
                    disabled={freePage >= freeTotalPages - 1}
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
                    {stockBoardList
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
                                    stock.changeRate > 0 ? "text-up" : "text-down",
                                  )}
                                >
                                  {stock.changeRate > 0 ? "▲" : "▼"}{" "}
                                  {Math.abs(stock.changeRate)}%
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

                  {searchQuery.trim() === "" && stockBoardTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 py-4 mt-2 border-t border-border-color">
                      <button
                        type="button"
                        onClick={() => setStockBoardPage((p) => Math.max(0, p - 1))}
                        disabled={stockBoardPage === 0}
                        className="px-3 py-1.5 rounded-[8px] text-sm font-bold text-text-secondary hover:bg-bg-main transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        이전
                      </button>
                      <span className="text-sm text-text-secondary">
                        {stockBoardPage + 1} / {stockBoardTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setStockBoardPage((p) => Math.min(stockBoardTotalPages - 1, p + 1))
                        }
                        disabled={stockBoardPage >= stockBoardTotalPages - 1}
                        className="px-3 py-1.5 rounded-[8px] text-sm font-bold text-text-secondary hover:bg-bg-main transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        다음
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                {weeklyPopularPosts.length === 0 ? (
                  <p className="text-sm text-text-secondary">아직 등록된 게시글이 없습니다.</p>
                ) : (
                  weeklyPopularPosts.map((post, i) => (
                    <Link
                      key={post.id}
                      to={`/community/${post.id}`}
                      className="flex items-start gap-3 cursor-pointer group"
                    >
                      <span className="font-bold text-brand w-4">{i + 1}</span>
                      <p className="flex-1 text-sm font-medium text-text-secondary group-hover:text-text-primary truncate transition-colors">
                        {post.title}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-up" /> HOT 주목 종목 토론방
              </h3>
              <div className="flex flex-col gap-3">
                {hotStocks.map((stock) => (
                  <Link key={stock.code} to={`/community/stock/${stock.code}`}>
                    <div className="bg-bg-main p-4 rounded-[16px] hover:border-text-secondary/50 border border-border-color transition-colors flex justify-between items-center group">
                      <div>
                        <div className="font-bold flex items-center gap-2 text-sm">
                          {stock.name}
                          <span
                            className={cn(
                              "text-xs",
                              stock.changeRate > 0 ? "text-up" : "text-down",
                            )}
                          >
                            {stock.changeRate > 0 ? "▲" : "▼"}{" "}
                            {Math.abs(stock.changeRate)}%
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
