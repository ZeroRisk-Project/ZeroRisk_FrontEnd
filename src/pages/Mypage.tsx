import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import {
  User,
  Medal,
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Heart,
  ThumbsUp,
  Settings,
} from "lucide-react";
import { formatPrice, cn } from "@/src/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { STOCKS_DATA } from "./Stocks";
import api from "@/src/lib/api";

const MOCK_CALENDAR_DATA: Record<
  number,
  { type: "buy" | "sell" | "profit" | "loss"; text: string }[]
> = {
  2: [{ type: "buy", text: "삼성전자 10주 매수" }],
  5: [{ type: "profit", text: "SK하이닉스 +150,000원" }],
  12: [
    { type: "buy", text: "카카오 20주 매수" },
    { type: "loss", text: "LG디스플레이 -40,000원" },
  ],
  18: [{ type: "profit", text: "삼성전자 +80,000원" }],
  24: [{ type: "sell", text: "카카오 20주 매도" }],
};

const COMPETITION_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "예정",
  ONGOING: "진행중",
  ENDED: "종료",
};

function formatCompetitionPeriod(startAt: string, endAt: string): string {
  return `${startAt.slice(0, 10).replaceAll("-", ".")} ~ ${endAt.slice(0, 10).replaceAll("-", ".")}`;
}

export function Mypage() {
  const navigate = useNavigate();
  const [mainFilter, setMainFilter] = useState("거래내역");
  const [txTab, setTxTab] = useState("거래내역");
  const [postSubFilter, setPostSubFilter] = useState<"post" | "cert">("post");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const [mainAccountBalance, setMainAccountBalance] = useState(0);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get("/accounts");
        const basicAccount = response.data.find((acc: any) => acc.accountType === "BASIC");
        if (basicAccount) {
          setMainAccountBalance(basicAccount.balance);
        }
      } catch {
        setMainAccountBalance(0);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const checkLinkStatus = async () => {
      try {
        await api.get("/openbanking/auths");
        setIsLinked(true);
      } catch {
        setIsLinked(false);
      }
    };
    checkLinkStatus();
  }, []);

  const [prizeHistory, setPrizeHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrizeHistory = async () => {
      try {
        const response = await api.get("/prizes/me");
        setPrizeHistory(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPrizeHistory();
  }, []);

  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const meResponse = await api.get("/users/me");
        const profileResponse = await api.get(`/profiles/${meResponse.data.userId}`);
        setMyProfile(profileResponse.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMyProfile();
  }, []);

  const myCompetitions = myProfile?.competitionHistory ?? [];

  const [favStockCodes, setFavStockCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("fav_stocks");
      if (saved) return JSON.parse(saved);
      return STOCKS_DATA.filter((s) => s.isFav).map((s) => s.code);
    } catch {
      return STOCKS_DATA.filter((s) => s.isFav).map((s) => s.code);
    }
  });

  const handleToggleFavorite = (code: string) => {
    setFavStockCodes((prev) => {
      let nextList: string[];
      if (prev.includes(code)) {
        nextList = prev.filter((c) => c !== code);
      } else {
        nextList = [...prev, code];
      }
      try {
        localStorage.setItem("fav_stocks", JSON.stringify(nextList));
      } catch (e) {
        console.error(e);
      }
      return nextList;
    });
  };

  const favoriteStocks = STOCKS_DATA.filter((s) =>
    favStockCodes.includes(s.code),
  );

  const MY_HOLDINGS = [
    {
      stockCode: "005930",
      stockName: "삼성전자",
      avgPrice: 65000,
      currentPrice: 68400,
      qty: 110,
      ratio: 60,
      returnRate: 5.4,
      evalAmount: 7524000,
    },
    {
      stockCode: "000660",
      stockName: "SK하이닉스",
      avgPrice: 166500,
      currentPrice: 164500,
      qty: 30,
      ratio: 40,
      returnRate: -1.2,
      evalAmount: 4935000,
    },
  ];

  const TRANSACTIONS_DONE = [
    { type: "buy", stock: "삼성전자", date: "23.11.02 14:30", price: 68400, qty: 10 },
    { type: "sell", stock: "SK하이닉스", date: "23.11.01 09:12", price: 162000, qty: 5 },
    { type: "buy", stock: "LG에너지솔루션", date: "23.10.28 10:15", price: 395000, qty: 2 }
  ];

  const TRANSACTIONS_PENDING = [
    { type: "buy", stock: "LG에너지솔루션", date: "23.11.03 10:05", price: 390000, qty: 2 },
    { type: "sell", stock: "카카오", date: "23.11.03 10:10", price: 54900, qty: 10 }
  ];

  const POSTS_NORMAL = [
    { id: 1, title: "단타 꿀팁 방출합니다", date: "2023.11.01", boardName: "자유게시판", likes: 12, comments: 5 },
    { id: 3, title: "투자일지 남기기 좋은 시간이네요", date: "2023.10.28", boardName: "투자전략 게시판", likes: 3, comments: 1 }
  ];

  const POSTS_CERT = [
    { id: 2, title: "삼성전자 수익률 +5.4% 인증합니다!", stock: "삼성전자", returnRate: 5.4, profit: "+242,000원", date: "2023.11.02", boardName: "수익인증 게시판", likes: 8, comments: 3 },
    { id: 4, title: "SK하이닉스 깜짝 실적과 +15.6% 인증", stock: "SK하이닉스", returnRate: 15.6, profit: "+1,420,000원", date: "2023.10.25", boardName: "수익인증 게시판", likes: 19, comments: 8 }
  ];

  const COMMENTS = [
    { id: 1, content: "진짜 공감됩니다. 특히 마지막 부분...", postTitle: "단타 꿀팁 방출합니다", date: "2023.11.02", boardName: "자유게시판", likes: 5, replies: 1 },
    { id: 2, content: "성투하세요!", postTitle: "오늘 카카오 진입했습니다", date: "2023.10.29", boardName: "수익인증 게시판", likes: 12, replies: 3 }
  ];

  // November 2023 Calendar Grid (starts on Wednesday)
  const daysInMonth = 30;
  const firstDayOffset = 3; // 0=Sun, 1=Mon, 2=Tue, 3=Wed

  return (
    <>
      <div className={`flex flex-col lg:flex-row gap-6 w-full transition-all duration-300 animate-in fade-in duration-500 ${!isLinked ? "pb-40 md:pb-32" : ""}`}>
        
        {/* Left Column (Profile & Content Area) */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-[#F2F4F6] w-full relative">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
              <div className="w-20 h-20 rounded-full bg-[#F2F4F6] flex items-center justify-center shrink-0">
                <User className="w-10 h-10 text-[#8B95A1]" />
              </div>
              <div className="flex-1 text-center md:text-left mt-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-[#191F28]">제로주린이</h2>
                  <span className="inline-flex items-center justify-center text-center leading-none bg-[#F2F4F6] text-[#4E5968] py-1 px-2.5 rounded-lg text-xs font-bold">Lv.2</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-sm font-medium text-[#6B7684]">
                  <span>zerorisk@invest.com</span>
                  <span className="w-1 h-1 rounded-full bg-[#D1D6DB]"></span>
                  <span>가입일 2024.10.15</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0 absolute top-0 right-0 md:relative">
                <Link 
                  to="/mypage/settings"
                  className="p-2 text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] rounded-full transition-colors flex items-center justify-center"
                >
                  <Settings className="w-5 h-5" />
                </Link>
                <Button
                  onClick={() => navigate(isLinked ? "/account-link/recharge/confirm" : "/account-link/intro")}
                  className="bg-brand hover:bg-brand/90 text-white border-transparent px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  {isLinked ? "충전하기" : "연동하기"}
                </Button>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="mt-6 pt-6 border-t border-[#F2F4F6] grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F9FAFB] rounded-2xl p-5 cursor-pointer hover:bg-[#F2F4F6] transition-colors flex flex-col justify-between h-[120px]">
                <div>
                  <span className="inline-flex items-center justify-center text-center leading-none text-[10px] font-bold text-[#6B7684] bg-white border border-[#E5E8EB] px-2 py-1 rounded-md mb-2">메인 계좌</span>
                  <h4 className="font-semibold text-sm text-[#4E5968]">기본 모의투자 계좌</h4>
                </div>
                <p className="font-bold text-xl text-right text-[#191F28]">{formatPrice(mainAccountBalance)}원</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-2xl p-5 cursor-pointer hover:bg-[#F2F4F6] transition-colors flex flex-col justify-between h-[120px]">
                <div>
                  <span className="inline-flex items-center justify-center text-center leading-none text-[10px] font-bold text-[#6B7684] bg-white border border-[#E5E8EB] px-2 py-1 rounded-md mb-2">대회 전용</span>
                  <h4 className="font-semibold text-sm text-[#4E5968] truncate">제1회 제로리스크 대회</h4>
                </div>
                <p className="font-bold text-xl text-right text-[#191F28]">{formatPrice(12500000)}원</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-2xl p-5 cursor-pointer hover:bg-[#F2F4F6] transition-colors flex flex-col justify-between h-[120px]">
                <div>
                  <span className="inline-flex items-center justify-center text-center leading-none text-[10px] font-bold text-[#6B7684] bg-white border border-[#E5E8EB] px-2 py-1 rounded-md mb-2">대회 전용</span>
                  <h4 className="font-semibold text-sm text-[#4E5968] truncate">대학생 투자 챔피언십</h4>
                </div>
                <p className="font-bold text-xl text-right text-[#191F28]">{formatPrice(5200000)}원</p>
              </div>
            </div>

            {prizeHistory.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#F2F4F6]">
                <h4 className="font-semibold text-sm text-[#4E5968] mb-3">받은 상금 내역</h4>
                <div className="space-y-2">
                  {prizeHistory.map((prize, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#F9FAFB] rounded-xl p-4">
                      <div>
                        <span className="text-[11px] font-bold text-[#6B7684] bg-white border border-[#E5E8EB] px-2 py-0.5 rounded-md">
                          {prize.rankPosition}위
                        </span>
                        <p className="text-sm font-semibold text-[#191F28] mt-1">
                          {prize.competitionTitle}
                        </p>
                      </div>
                      <p className="font-bold text-[#191F28]">
                        +{formatPrice(prize.prizeAmount)}원
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Filters & Content Row */}
          <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
            {/* Left Nav Filters */}
            <div className="w-full lg:w-[140px] shrink-0 lg:sticky lg:top-6 z-10">
              <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {["거래내역", "관심종목", "보유종목", "대회", "게시글", "댓글"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setMainFilter(filter);
                      if (filter === "거래내역") setTxTab("거래내역");
                    }}
                    className={cn(
                      "whitespace-nowrap w-auto lg:w-full text-center lg:text-left px-5 py-3 text-[15px] font-bold transition-all rounded-2xl shrink-0 cursor-pointer",
                      mainFilter === filter
                        ? "bg-[#191F28] text-white shadow-md"
                        : "bg-transparent text-[#4E5968] hover:bg-[#F2F4F6] hover:text-[#191F28]"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#F2F4F6] flex-1 min-w-0 min-h-[600px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex px-6 border-b border-[#F2F4F6] shrink-0 justify-between items-center gap-4 h-[68px]">
                {mainFilter === "거래내역" && (
                  <>
                    <div className="flex items-center h-full gap-6">
                      <button
                        onClick={() => setTxTab("거래내역")}
                        className={cn(
                          "h-full flex items-center font-bold text-[15px] border-b-[3px] transition-colors -mb-[1px] cursor-pointer",
                          txTab === "거래내역"
                            ? "border-[#191F28] text-[#191F28]"
                            : "border-transparent text-[#8B95A1] hover:text-[#191F28]"
                        )}
                      >
                        거래내역
                      </button>
                      <button
                        onClick={() => setTxTab("미체결 내역")}
                        className={cn(
                          "h-full flex items-center font-bold text-[15px] border-b-[3px] transition-colors -mb-[1px] cursor-pointer",
                          txTab === "미체결 내역"
                            ? "border-[#191F28] text-[#191F28]"
                            : "border-transparent text-[#8B95A1] hover:text-[#191F28]"
                        )}
                      >
                        미체결 내역
                      </button>
                    </div>
                    <select className="bg-[#F2F4F6] border-none rounded-xl px-3 py-2 text-sm font-bold text-[#4E5968] outline-none cursor-pointer hover:bg-[#E5E8EB] transition-colors">
                      <option>1주일</option>
                      <option selected>1개월</option>
                      <option>3개월</option>
                    </select>
                  </>
                )}

                {["관심종목", "보유종목", "대회", "댓글"].includes(mainFilter) && (
                  <h3 className="font-bold text-lg text-[#191F28] flex items-center gap-2">
                    {mainFilter === "댓글"
                      ? "작성한 댓글"
                      : mainFilter === "대회"
                      ? "참여한 대회"
                      : mainFilter}
                    <span className="text-[15px] font-semibold text-[#3182F6] bg-blue-50 px-2 py-0.5 rounded-lg">
                      {mainFilter === "관심종목"
                        ? favoriteStocks.length
                        : mainFilter === "보유종목"
                        ? MY_HOLDINGS.length
                        : mainFilter === "대회"
                        ? myCompetitions.length
                        : COMMENTS.length}
                    </span>
                  </h3>
                )}

                {mainFilter === "게시글" && (
                  <>
                    <h3 className="font-bold text-lg text-[#191F28] flex items-center gap-2">작성한 게시글</h3>
                    <div className="flex bg-[#F2F4F6] p-1 rounded-xl">
                      <button
                        onClick={() => setPostSubFilter("post")}
                        className={cn(
                          "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors cursor-pointer",
                          postSubFilter === "post"
                            ? "bg-white text-[#191F28] shadow-sm"
                            : "text-[#6B7684] hover:text-[#191F28]"
                        )}
                      >
                        일반 게시글
                      </button>
                      <button
                        onClick={() => setPostSubFilter("cert")}
                        className={cn(
                          "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors cursor-pointer",
                          postSubFilter === "cert"
                            ? "bg-white text-[#191F28] shadow-sm"
                            : "text-[#6B7684] hover:text-[#191F28]"
                        )}
                      >
                        수익률 인증
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Body */}
              <div className="p-0 flex-1 overflow-x-auto overflow-y-auto">
                {mainFilter === "거래내역" && (
                  <div className="min-w-[600px] pb-6">
                    {txTab === "거래내역" ? (
                      <>
                        <div className="grid grid-cols-[120px_1fr_60px_100px_70px_120px] items-center py-3 px-6 border-b border-[#F2F4F6] text-sm text-[#6B7684] font-semibold bg-[#F9FAFB]">
                          <div>일시</div>
                          <div className="px-2">종목명</div>
                          <div>구분</div>
                          <div className="text-right pr-2">단가</div>
                          <div className="text-right pr-2">수량</div>
                          <div className="text-right">결제금액</div>
                        </div>
                        {TRANSACTIONS_DONE.map((log, idx) => {
                          const isBuy = log.type === "buy";
                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-[120px_1fr_60px_100px_70px_120px] items-center h-[52px] border-b border-[#F2F4F6] hover:bg-[#F9FAFB] px-6 transition-colors text-[14px]"
                            >
                              <div className="text-[13px] text-[#8B95A1] whitespace-nowrap pr-2">{log.date}</div>
                              <div className="font-bold text-[#191F28] px-2 truncate">{log.stock}</div>
                              <div>
                                <span className={cn(
                                  "text-[12px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap",
                                  isBuy ? "text-[#F04452] bg-[rgba(240,68,82,0.1)]" : "text-[#3182F6] bg-[rgba(49,130,246,0.1)]"
                                )}>
                                  {isBuy ? "매수" : "매도"}
                                </span>
                              </div>
                              <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{formatPrice(log.price)}원</div>
                              <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{log.qty}주</div>
                              <div className="text-right font-bold text-[#191F28] tabular-nums">{formatPrice(log.price * log.qty)}원</div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-[120px_1fr_60px_100px_70px_120px_40px] items-center py-3 px-6 border-b border-[#F2F4F6] text-sm text-[#6B7684] font-semibold bg-[#F9FAFB]">
                          <div>일시</div>
                          <div className="px-2">종목명</div>
                          <div>구분</div>
                          <div className="text-right pr-2">단가</div>
                          <div className="text-right pr-2">수량</div>
                          <div className="text-right">결제금액</div>
                          <div></div>
                        </div>
                        {TRANSACTIONS_PENDING.map((log, idx) => {
                          const isBuy = log.type === "buy";
                          return (
                            <div
                              key={idx}
                              className="grid grid-cols-[120px_1fr_60px_100px_70px_120px_40px] items-center h-[52px] border-b border-[#F2F4F6] hover:bg-[#F9FAFB] px-6 transition-colors text-[14px]"
                            >
                              <div className="text-[13px] text-[#8B95A1] whitespace-nowrap pr-2">{log.date}</div>
                              <div className="font-bold text-[#191F28] px-2 truncate">{log.stock}</div>
                              <div>
                                <span className={cn(
                                  "text-[12px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap",
                                  isBuy ? "text-[#F04452] bg-[rgba(240,68,82,0.1)]" : "text-[#3182F6] bg-[rgba(49,130,246,0.1)]"
                                )}>
                                  {isBuy ? "매수대기" : "매도대기"}
                                </span>
                              </div>
                              <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{formatPrice(log.price)}원</div>
                              <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{log.qty}주</div>
                              <div className="text-right font-bold text-[#191F28] tabular-nums">{formatPrice(log.price * log.qty)}원</div>
                              <div className="flex justify-end pl-2">
                                <button className="w-8 h-8 flex items-center justify-center text-[#8B95A1] hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors cursor-pointer">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}

                {mainFilter === "관심종목" && (
                  <div className="p-6 space-y-2">
                    {favoriteStocks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary">
                        <p>등록된 관심종목이 없습니다.</p>
                      </div>
                    ) : (
                      favoriteStocks.map((stock) => {
                        const isUp = stock.change >= 0;
                        return (
                          <div
                            key={stock.code}
                            className="flex items-center justify-between p-4 border border-[#F2F4F6] rounded-2xl bg-white hover:shadow-sm transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleFavorite(stock.code)}
                                className="text-[#F04452] hover:scale-110 transition-transform cursor-pointer"
                              >
                                <Heart className="w-5 h-5 fill-[#F04452]" />
                              </button>
                              <div className="w-10 h-10 rounded-full bg-[#F2F4F6] flex items-center justify-center font-bold text-xs text-[#4E5968] shrink-0">
                                {stock.name.substring(0, 2)}
                              </div>
                              <div>
                                <h4 className="font-bold text-[#191F28] text-[15px]">{stock.name}</h4>
                                <span className="text-[12px] text-[#8B95A1]">{stock.code}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-[#191F28] text-[15px]">{formatPrice(stock.price)}원</div>
                              <div className={cn("text-[13px] font-bold mt-0.5", isUp ? "text-[#F04452]" : "text-[#3182F6]")}>
                                {isUp ? "+" : ""}{stock.change}%
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {mainFilter === "보유종목" && (
                  <div className="p-6 space-y-3">
                    {MY_HOLDINGS.map((stock, idx) => {
                      const isUp = stock.returnRate >= 0;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border border-[#F2F4F6] rounded-2xl bg-white hover:shadow-sm transition-all cursor-pointer gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-[#F2F4F6] flex items-center justify-center font-bold text-[13px] text-[#4E5968] shrink-0">
                              {stock.stockName.substring(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-[#191F28] text-[16px]">{stock.stockName}</h4>
                                <span className="text-[12px] text-[#8B95A1]">{stock.stockCode}</span>
                              </div>
                              <p className="text-[13px] text-[#6B7684]">
                                <span className="font-bold text-[#4E5968]">{stock.qty}주</span> · 평단가 <span className="font-bold text-[#4E5968]">{formatPrice(stock.avgPrice)}원</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="flex flex-col items-end">
                              <div className="font-bold text-[#191F28] text-[16px]">{formatPrice(stock.evalAmount)}원</div>
                              <div className="text-[12px] text-[#8B95A1] mt-0.5">비중 {stock.ratio}%</div>
                            </div>
                            <div className="w-[1px] h-8 bg-[#E5E8EB] hidden sm:block"></div>
                            <div className={cn(
                              "px-3 py-1.5 rounded-lg min-w-[70px] text-center",
                              isUp ? "text-[#F04452] bg-[rgba(240,68,82,0.1)]" : "text-[#3182F6] bg-[rgba(49,130,246,0.1)]"
                            )}>
                              <span className="font-bold text-[14px]">{isUp ? "+" : ""}{stock.returnRate}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {mainFilter === "대회" && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-[#F9FAFB] text-[#6B7684] font-semibold border-b border-[#F2F4F6]">
                        <tr>
                          <th className="py-3 px-6 font-medium">대회 기간</th>
                          <th className="py-3 px-4 font-medium text-center">상태</th>
                          <th className="py-3 px-6 font-medium">참가 대회명</th>
                          <th className="py-3 px-4 font-medium text-right">시드머니</th>
                          <th className="py-3 px-6 font-medium text-center">순위</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2F4F6]">
                        {myCompetitions.map((item: any) => (
                          <tr key={item.competitionId} className="hover:bg-[#F9FAFB] cursor-pointer">
                            <td className="py-4 px-6 text-[#6B7684] text-[13px]">
                              {formatCompetitionPeriod(item.startAt, item.endAt)}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={cn(
                                "text-[12px] font-bold px-2 py-1 rounded-md",
                                item.status === "ONGOING"
                                  ? "bg-[#E8F3FF] text-[#3182F6]"
                                  : item.status === "SCHEDULED"
                                  ? "bg-[#F2F4F6] text-[#4E5968]"
                                  : "text-[#8B95A1] bg-[#F2F4F6]/50"
                              )}>
                                {COMPETITION_STATUS_LABELS[item.status]}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-[#191F28]">{item.title}</td>
                            <td className="py-4 px-4 text-right font-medium text-[#4E5968]">{formatPrice(item.seedMoney)}원</td>
                            <td className="py-4 px-6 text-center font-bold text-[#191F28]">
                              {item.status === "SCHEDULED"
                                ? "-"
                                : item.rankPosition
                                ? `${item.rankPosition}위`
                                : item.status === "ONGOING"
                                ? "집계중"
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {mainFilter === "게시글" && (
                  <div className="p-6">
                    {postSubFilter === "post" ? (
                      <div className="space-y-3">
                        {POSTS_NORMAL.map((post) => (
                          <div
                            key={post.id}
                            className="border border-[#F2F4F6] rounded-2xl p-5 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center text-center leading-none bg-[#F2F4F6] text-[#4E5968] px-2.5 py-1 rounded-md text-[11px] font-bold">{post.boardName}</span>
                                <span className="text-[13px] font-medium text-[#8B95A1]">{post.date}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[12px] font-bold text-[#6B7684]">
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3.5 h-3.5 text-[#F04452]" /> {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                                </span>
                              </div>
                            </div>
                            <h4 className="font-bold text-[16px] text-[#191F28]">{post.title}</h4>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Profit Certification Cards Grid (Board name badge chip completely EXCLUDED) */
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {POSTS_CERT.map((post) => (
                          <div
                            key={post.id}
                            className="border border-[#F2F4F6] rounded-2xl p-4 bg-white hover:shadow-md transition-all cursor-pointer flex flex-col group relative"
                          >
                            <div className="aspect-square bg-[rgba(240,68,82,0.06)] rounded-xl flex flex-col items-center justify-center mb-3 pt-4 px-2">
                              <span className="text-[12px] font-bold text-[#F04452] opacity-80 mb-1">{post.stock}</span>
                              <span className="text-xl font-extrabold text-[#F04452] tracking-tight">{post.profit}</span>
                            </div>
                            <h4 className="font-bold text-[14px] text-[#191F28] line-clamp-2 group-hover:text-[#3182F6] transition-colors leading-snug">{post.title}</h4>
                            <div className="flex items-center justify-between mt-auto pt-3">
                              <span className="text-[12px] text-[#8B95A1]">{post.date}</span>
                              <div className="flex items-center gap-2 text-[12px] font-bold text-[#8B95A1]">
                                <span className="flex items-center gap-0.5">
                                  <ThumbsUp className="w-3 h-3 text-[#F04452]" /> {post.likes}
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <MessageSquare className="w-3 h-3" /> {post.comments}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {mainFilter === "댓글" && (
                  <div className="p-6 space-y-3">
                    {COMMENTS.map((c) => (
                      <div
                        key={c.id}
                        className="border border-[#F2F4F6] rounded-2xl p-5 hover:bg-[#F9FAFB] cursor-pointer transition-colors text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center text-center leading-none bg-[#F2F4F6] text-[#4E5968] px-2 py-1 rounded-md text-[11px] font-bold">{c.boardName}</span>
                            <span className="text-[12px] font-medium text-[#8B95A1]">{c.date}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[12px] font-bold text-[#6B7684]">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5 text-[#F04452]" /> {c.likes}
                            </span>
                          </div>
                        </div>
                        <p className="font-medium text-[15px] text-[#191F28] leading-relaxed mb-2">{c.content}</p>
                        <div className="text-[12px] text-[#8B95A1] bg-[#F9FAFB] p-2.5 rounded-lg border border-[#F2F4F6] truncate">
                          원문: <span className="font-bold text-[#4E5968]">{c.postTitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Activity Summary & Calendar Widget in a Single Card) */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-6">
          {/* Unified Activity & Calendar Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F2F4F6] w-full flex flex-col gap-6">
            {/* Activity Summary Section */}
            <div>
              <h3 className="font-bold text-lg text-[#191F28] mb-4">활동 요약</h3>
              <div className="flex flex-col gap-3">
                <div className="flex gap-4 items-center bg-[#F9FAFB] p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Medal className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#191F28]">대회 수상 내역</h4>
                    <p className="text-xs font-medium text-[#6B7684] mt-0.5">금메달 1 · 은메달 0 · 동메달 0</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center bg-[#F9FAFB] p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#191F28]">커뮤니티 활동</h4>
                    <p className="text-xs font-medium text-[#6B7684] mt-0.5">게시글 3개 · 댓글 5개</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider (visible on desktop where the calendar is also shown) */}
            <div className="h-[1px] bg-[#F2F4F6] -mx-6 hidden lg:block" />

            {/* Investment Calendar Section */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-[#191F28]">투자 캘린더</h3>
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-[#F2F4F6] rounded-full transition-colors text-[#8B95A1] cursor-pointer">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-[15px] font-bold text-[#191F28]">2023년 11월</span>
                  <button className="p-1 hover:bg-[#F2F4F6] rounded-full transition-colors text-[#8B95A1] cursor-pointer">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[13px] font-bold text-[#8B95A1] mb-2">
                <div className="text-[#F04452]">일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div className="text-[#3182F6]">토</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* November 2023 offset */}
                {Array.from({ length: firstDayOffset }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = i + 1;
                  const hasData = MOCK_CALENDAR_DATA[date];
                  let dotHTML = null;

                  if (hasData) {
                    const hasBuyProf = hasData.some((d) => d.type === "buy" || d.type === "profit");
                    const hasSellLoss = hasData.some((d) => d.type === "sell" || d.type === "loss");
                    let dotColor = hasBuyProf && hasSellLoss ? "bg-purple-500" : hasBuyProf ? "bg-[#F04452]" : "bg-[#3182F6]";
                    dotHTML = <span className={cn("w-1.5 h-1.5 rounded-full absolute bottom-1.5", dotColor)}></span>;
                  }

                  const isSelected = selectedDate === date;
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(selectedDate === date ? null : date)}
                      className={cn(
                        "aspect-square rounded-full flex flex-col items-center justify-center text-[14px] font-medium relative transition-colors cursor-pointer",
                        isSelected ? "bg-[#191F28] text-white font-bold" : "hover:bg-[#F2F4F6] text-[#4E5968]"
                      )}
                    >
                      {date}
                      {dotHTML}
                    </button>
                  );
                })}
              </div>

              {selectedDate && MOCK_CALENDAR_DATA[selectedDate] && (
                <div className="mt-4 p-4 bg-[#F9FAFB] rounded-2xl space-y-3 animate-in fade-in duration-300">
                  <div className="text-[13px] font-bold text-[#6B7684]">11월 {selectedDate}일 내역</div>
                  {MOCK_CALENDAR_DATA[selectedDate].map((log, index) => {
                    const isUp = log.type === "buy" || log.type === "profit";
                    const label = log.type === "buy" ? "매수" : log.type === "sell" ? "매도" : log.type === "profit" ? "수익" : "손실";
                    return (
                      <div key={index} className="flex items-center justify-between text-[14px]">
                        <span className="font-bold text-[#191F28]">{log.text}</span>
                        <span className={cn(
                          "inline-flex items-center justify-center text-center leading-none font-bold text-[13px] px-2 py-1 rounded-md",
                          isUp ? "bg-red-50 text-[#F04452]" : "bg-blue-50 text-[#3182F6]"
                        )}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real Account Banner */}
      {!isLinked && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#E5E8EB] shadow-[0_-8px_32px_rgba(0,0,0,0.06)] z-50 py-5 px-4 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto w-full px-2 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex items-center gap-4 text-center md:text-left w-full md:w-auto justify-center md:justify-start">
              <div className="w-12 h-12 bg-[#F2F4F6] rounded-full flex items-center justify-center text-2xl shrink-0">🏦</div>
              <div>
                <h3 className="text-[16px] md:text-[18px] font-bold text-[#191F28]">실제 계좌로 시드머니를 받아보세요</h3>
                <p className="text-[13px] md:text-[14px] text-[#6B7684] font-medium mt-0.5">내 계좌 잔액만큼 모의투자 포인트가 지급됩니다.</p>
              </div>
            </div>
            <Link
              to="/account-link/intro"
              className="w-full md:w-auto bg-[#3182F6] hover:bg-[#1B64DA] text-white px-6 py-3.5 rounded-2xl font-bold text-[15px] transition-colors whitespace-nowrap text-center block cursor-pointer"
            >
              계좌 연동하기
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
