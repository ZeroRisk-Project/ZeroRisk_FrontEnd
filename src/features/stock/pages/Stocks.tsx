import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/src/shared/components/ui/Card";
import { Button } from "@/src/shared/components/ui/Button";
import { Input } from "@/src/shared/components/ui/Input";
import { Badge } from "@/src/shared/components/ui/Badge";
import {
  Heart,
  Info,
  Search,
  Plus,
  Check,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import { formatPrice, formatPercent, cn } from "@/src/shared/lib/utils";
import { AdvancedStockChart } from "@/src/features/stock/components/AdvancedStockChart";
import { OrderBook } from "@/src/features/stock/components/OrderBook";
import {
  getStockChart,
  getStockDetail,
  getStockRankings,
  type RankingType,
  type StockDetailResponse,
  type StockRankingResponse,
} from "@/src/features/stock/api/stock";
import { toChartPoints, type ChartPoint } from "@/src/features/stock/lib/indicators";
import { getAccounts } from "@/src/features/account/api/account";
import { createOrder } from "@/src/features/order/api/order";
import {
  createPriceAlert,
  type PriceAlertDirection,
} from "@/src/features/pricealert/api/pricealert";
import { useWatchlist } from "@/src/features/watchlist/lib/useWatchlist";

export interface StockListItem {
  code: string;
  name: string;
  price: number;
  change: number;
  volume: string;
  isFav?: boolean;
}

const RANKING_TYPE_BY_TAB: Record<string, RankingType> = {
  거래량: "VOLUME",
  급상승: "RISE",
  급하락: "FALL",
};

const formatVolume = (volume: number): string => {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return String(volume);
};

const getTickSize = (price: number): number => {
  if (price < 2_000) return 1;
  if (price < 5_000) return 5;
  if (price < 20_000) return 10;
  if (price < 50_000) return 50;
  if (price < 200_000) return 100;
  if (price < 500_000) return 500;
  return 1_000;
};

const toStockListItem = (ranking: StockRankingResponse): StockListItem => ({
  code: ranking.code,
  name: ranking.name,
  price: ranking.currentPrice,
  change: ranking.changeRate,
  volume: formatVolume(ranking.volume),
});

export const STOCKS_DATA = [
  {
    code: "005930",
    name: "삼성전자",
    price: 68400,
    change: -1.2,
    volume: "12M",
    isFav: true,
  },
  {
    code: "000660",
    name: "SK하이닉스",
    price: 164500,
    change: 2.4,
    volume: "4.5M",
    isFav: false,
  },
  {
    code: "373220",
    name: "LG에너지솔루션",
    price: 395000,
    change: -0.5,
    volume: "800K",
    isFav: true,
  },
  {
    code: "207940",
    name: "삼성바이오로직스",
    price: 825000,
    change: 1.1,
    volume: "150K",
    isFav: false,
  },
  {
    code: "005380",
    name: "현대차",
    price: 234000,
    change: 0.8,
    volume: "1.2M",
    isFav: false,
  },
  {
    code: "000270",
    name: "기아",
    price: 114500,
    change: -0.3,
    volume: "2M",
    isFav: true,
  },
  {
    code: "035420",
    name: "NAVER",
    price: 189000,
    change: 3.5,
    volume: "3M",
    isFav: true,
  },
  {
    code: "035720",
    name: "카카오",
    price: 54300,
    change: -2.1,
    volume: "4M",
    isFav: false,
  },
];

export function Stocks() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("전체보기");
  const [activeFilter, setActiveFilter] = useState("전체");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [priceType, setPriceType] = useState("시장가");
  const [actionToast, setActionToast] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [compareStocks, setCompareStocks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("compare_stocks");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleCompare = (stockCode: string) => {
    setCompareStocks((prev) => {
      const next = prev.includes(stockCode)
        ? prev.filter((c) => c !== stockCode)
        : [...prev, stockCode];
      localStorage.setItem("compare_stocks", JSON.stringify(next));
      return next;
    });
  };

  const isCompared = (stockCode: string) => compareStocks.includes(stockCode);

  const { isFavorite, toggleFavorite } = useWatchlist();

  const toggleFav = (stockCode: string) => {
    void toggleFavorite(stockCode);
  };

  const isFav = (stockCode: string) => isFavorite(stockCode);

  const [basicAccountId, setBasicAccountId] = useState<number | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");

  const [alertDirection, setAlertDirection] = useState<PriceAlertDirection>("ABOVE");
  const [alertPrice, setAlertPrice] = useState("");
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);

  useEffect(() => {
    let ignore = false;
    getAccounts()
        .then((accounts) => {
          if (ignore) return;
          const basic = accounts.find((account) => account.accountType === "BASIC");
          setBasicAccountId(basic ? basic.accountId : null);
        })
        .catch(() => {
          if (!ignore) setBasicAccountId(null);
        });

    return () => {
      ignore = true;
    };
  }, []);

  const [rankingStocks, setRankingStocks] = useState<StockListItem[] | null>(null);

  useEffect(() => {
    const rankingType = RANKING_TYPE_BY_TAB[activeTab];
    if (!rankingType) {
      setRankingStocks(null);
      return;
    }

    let ignore = false;
    getStockRankings(rankingType)
        .then((rankings) => {
          if (!ignore) setRankingStocks(rankings.map(toStockListItem));
        })
        .catch(() => {
          if (!ignore) setRankingStocks(null);
        });

    return () => {
      ignore = true;
    };
  }, [activeTab]);

  const parseVolume = (vol: string): number => {
    const num = parseFloat(vol);
    if (vol.endsWith("M")) return num * 1000000;
    if (vol.endsWith("K")) return num * 1000;
    return num;
  };

  const getFilteredAndSortedStocks = () => {
    const isServerRanked = rankingStocks !== null;
    let list: StockListItem[] = isServerRanked ? [...rankingStocks] : [...STOCKS_DATA];

    // 1. Search Query filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(query) || s.code.includes(query));
    }

    // 2. Sub-filter (보통주 / 우선주)
    if (activeFilter === "보통주") {
      list = list.filter((s) => !s.name.endsWith("우"));
    } else if (activeFilter === "우선주") {
      list = list.filter((s) => s.name.endsWith("우"));
    }

    // 서버 랭킹 응답은 이미 서버가 정한 순서를 따르므로 탭 기준 정렬을 건너뛴다
    if (isServerRanked) {
      return list;
    }

    // 3. Tab-based sorting/filtering
    if (activeTab === "거래량") {
      list.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
    } else if (activeTab === "거래대금") {
      list.sort((a, b) => (b.price * parseVolume(b.volume)) - (a.price * parseVolume(a.volume)));
    } else if (activeTab === "급상승") {
      list.sort((a, b) => b.change - a.change);
    } else if (activeTab === "급하락") {
      list.sort((a, b) => a.change - b.change);
    } else if (activeTab === "인기") {
      list.sort((a, b) => {
        const aFav = isFav(a.code) ? 1 : 0;
        const bFav = isFav(b.code) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return parseVolume(b.volume) - parseVolume(a.volume);
      });
    }

    return list;
  };

  const [stockDetail, setStockDetail] = useState<StockDetailResponse | null>(null);

  useEffect(() => {
    if (!code) {
      setStockDetail(null);
      return;
    }

    let ignore = false;
    getStockDetail(code)
        .then((detail) => {
          if (!ignore) setStockDetail(detail);
        })
        .catch(() => {
          if (!ignore) setStockDetail(null);
        });

    return () => {
      ignore = true;
    };
  }, [code]);

  const [chartPoints, setChartPoints] = useState<ChartPoint[] | undefined>(undefined);

  useEffect(() => {
    if (!code) {
      setChartPoints(undefined);
      return;
    }

    let ignore = false;
    getStockChart(code, "DAY")
        .then((candles) => {
          if (!ignore) setChartPoints(toChartPoints(candles));
        })
        .catch(() => {
          if (!ignore) setChartPoints(undefined);
        });

    return () => {
      ignore = true;
    };
  }, [code]);

  // User might not select any stock initially
  const activeStockData = STOCKS_DATA.find((s) => s.code === code);

  const stock = stockDetail
    ? {
        code: stockDetail.code,
        name: stockDetail.name,
        price: stockDetail.currentPrice,
        change: stockDetail.changeAmount,
        changeRate: stockDetail.changeRate,
        volume: activeStockData?.volume ?? "-",
        isFav: isFav(stockDetail.code),
      }
      : activeStockData
          ? {
            code: activeStockData.code,
            name: activeStockData.name,
            price: activeStockData.price,
            change: activeStockData.price * (activeStockData.change / 100),
            changeRate: activeStockData.change,
            volume: activeStockData.volume,
            isFav: isFav(activeStockData.code),
          }
          : null;

  useEffect(() => {
    setLimitPrice(stock ? String(stock.price) : "");
  }, [stock?.code, stock?.price]);

  const stepLimitPrice = (direction: 1 | -1) => {
    const current = Number(limitPrice || 0);
    const tick = direction === 1 ? getTickSize(current) : getTickSize(Math.max(0, current - 1));
    setLimitPrice(String(Math.max(0, current + direction * tick)));
  };

  const showToast = (message: string) => {
    setActionToast(message);
    setTimeout(() => setActionToast(""), 3000);
  };

  const submitOrder = async (requestedOrderType: "MARKET" | "LIMIT") => {
    if (!stock) return;
    if (basicAccountId === null) {
      showToast("계좌 정보를 불러오지 못했습니다.");
      return;
    }

    const orderQuantity = Number(quantity || 0);
    if (orderQuantity <= 0) {
      showToast("주문 수량을 입력해 주세요.");
      return;
    }

    const orderLimitPrice = Number(limitPrice || 0);
    if (requestedOrderType === "LIMIT" && orderLimitPrice <= 0) {
      showToast("주문 가격을 입력해 주세요.");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      await createOrder({
        accountId: basicAccountId,
        stockCode: stock.code,
        side: orderType === "buy" ? "BUY" : "SELL",
        orderType: requestedOrderType,
        quantity: orderQuantity,
        limitPrice: requestedOrderType === "LIMIT" ? orderLimitPrice : undefined,
      });
      setQuantity("");
      showToast(
          requestedOrderType === "LIMIT" && priceType === "시장가"
              ? "성공적으로 예약 주문이 접수되었습니다."
              : `성공적으로 ${orderType === "buy" ? "매수" : "매도"} 주문이 접수되었습니다.`,
      );
    } catch (error: any) {
      showToast(error?.response?.data?.message ?? "주문 처리에 실패했습니다.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleOrder = () => submitOrder(priceType === "시장가" ? "MARKET" : "LIMIT");

  const handleBooking = () => submitOrder("LIMIT");

  const handleCreateAlert = async () => {
    if (!stock) return;

    const targetPrice = Number(alertPrice || stock.price);
    if (targetPrice <= 0) {
      showToast("목표가를 입력해 주세요.");
      return;
    }

    setIsSubmittingAlert(true);
    try {
      await createPriceAlert(stock.code, targetPrice, alertDirection);
      setAlertPrice("");
      showToast("목표가 알림이 등록되었습니다.");
    } catch (error: any) {
      showToast(error?.response?.data?.message ?? "목표가 알림 등록에 실패했습니다.");
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  return (
    <div className="flex gap-6 relative animate-in fade-in duration-500">
      {/* Left List Area */}
      <Card className="hidden lg:flex lg:w-[350px] xl:w-[400px] flex-col h-[calc(100vh-8rem)] sticky top-[80px] p-5 bg-white">
        {/* Top Filters */}
        <div className="space-y-4 mb-4">
          <div className="flex flex-col gap-2 border-b border-[#F2F4F6] -mx-5 px-5">
            <div className="flex justify-end">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as any)}
                className="text-[12px] font-semibold px-2.5 py-1 rounded-[6px] border border-border-color bg-white text-text-secondary hover:border-text-secondary hover:text-text-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer h-[28px] transition-all duration-200"
              >
                <option value="전체">전체</option>
                <option value="보통주">보통주</option>
                <option value="우선주">우선주</option>
              </select>
            </div>
            <div className="flex w-full justify-between gap-x-1">
              {["전체보기", "거래량", "거래대금", "급상승", "급하락", "인기"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "pb-2 text-[14px] font-semibold transition-colors flex-1 text-center whitespace-nowrap border-b-2 -mb-[1px] cursor-pointer",
                    activeTab === tab
                      ? "text-brand font-bold border-brand"
                      : "text-text-secondary hover:text-text-primary border-transparent hover:border-border-color/40",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 -mx-5 px-5">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
              <Input
                placeholder="종목명 또는 종목코드"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-12 bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              />
            </div>
            <Link to="/stocks/compare">
              <Button className="h-12 w-12 p-0 flex-shrink-0 bg-brand text-white border-transparent hover:bg-brand/90">
                <BarChart2 className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant={compareStocks.length > 0 ? "outline" : "secondary"}
              className={cn(
                "h-12 w-12 p-0 flex-shrink-0 transition-colors",
                compareStocks.length > 0 
                  ? "border-border-color" 
                  : "border-transparent bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-bg-main"
              )}
              onClick={() => {
                setCompareStocks([]);
                localStorage.removeItem("compare_stocks");
                setActionToast("비교 체크가 모두 초기화되었습니다.");
                setTimeout(() => setActionToast(""), 3000);
              }}
            >
              <RefreshCw className={cn("w-5 h-5", compareStocks.length > 0 ? "text-text-primary" : "text-text-secondary")} />
            </Button>
          </div>
        </div>

        {/* Stock List Scrollable */}
        <div className="flex-1 overflow-y-auto -mx-5 w-[calc(100%+2.5rem)] pr-1">
          <div className="rounded-none border-y border-[#F2F4F6] border-x-0 overflow-hidden divide-y divide-[#F2F4F6] flex flex-col bg-white">
            <div className="grid grid-cols-[10fr_6fr_5fr_3fr] text-[13px] font-semibold text-text-secondary bg-white border-b border-[#F2F4F6] items-center px-5 py-2.5">
              <div className="text-left pl-8">종목</div>
              <div className="text-right">현재가</div>
              <div className="text-right">등락률</div>
              <div className="text-center">비교</div>
            </div>
            {getFilteredAndSortedStocks().map((s, index) => (
              <div
                key={s.code}
                onClick={() => {
                  if (!stock || s.code !== stock.code) {
                    navigate(`/stocks/${s.code}`);
                  }
                }}
                className={cn(
                  "block cursor-pointer py-2 px-5 grid grid-cols-[10fr_6fr_5fr_3fr] items-center transition-colors",
                  stock?.code === s.code
                    ? "bg-brand/10"
                    : index % 2 === 0
                      ? "bg-surface"
                      : "bg-[#F9FAFB]", // 연한 회색 (light gray)
                  "hover:bg-[#F0F1F5]",
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    className="flex-shrink-0 p-1 rounded-full hover:bg-bg-main transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); /* toggle fav */
                      const currentlyFav = isFav(s.code);
                      toggleFav(s.code);
                      setActionToast(
                        currentlyFav
                          ? "관심종목에서 해제되었습니다."
                          : "관심종목에 추가되었습니다."
                      );
                      setTimeout(() => setActionToast(""), 3000);
                    }}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4 transition-all duration-300",
                        isFav(s.code) ? "fill-up text-up scale-110" : "text-text-secondary hover:scale-105",
                      )}
                    />
                  </button>
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className="font-semibold text-text-primary text-[13px] whitespace-nowrap truncate">
                      {s.name}
                    </span>
                  </div>
                </div>
                <div className="text-right min-w-0 pr-1">
                  <span className="font-semibold tabular-nums text-[13px]">
                    {formatPrice(s.price)}
                  </span>
                </div>
                <div className="text-right min-w-0 pr-1">
                  <span
                    className={cn(
                      "font-semibold tabular-nums text-[13px] flex items-center justify-end gap-0.5",
                      s.change > 0 ? "text-up" : "text-down",
                    )}
                  >
                    {formatPercent(s.change)}
                  </span>
                </div>
                <div className="text-center">
                  <button
                    className={cn(
                      "p-1 rounded-[6px] text-[10px] font-medium border mx-auto w-[28px] h-[24px] flex items-center justify-center transition-colors",
                      isCompared(s.code)
                        ? "border-brand bg-brand text-white"
                        : "border-border-color bg-white text-text-secondary hover:bg-black/5",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(s.code);
                    }}
                  >
                    {isCompared(s.code) ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {stock ? (
          <div className="flex flex-col xl:flex-row gap-6 h-full">
            {/* Left side: Chart and Info */}
            <div className="flex-1 flex flex-col gap-6 h-full">
              {/* Unified Stock Info & Chart Card */}
              <Card className="bg-white overflow-hidden divide-y divide-[#F2F4F6] flex flex-col shadow-sm border border-[#F2F4F6]">
                {/* Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-2xl font-bold flex items-center gap-2">
                        {stock.name}{" "}
                        <span className="text-sm font-medium text-text-secondary">
                          {stock.code}
                        </span>
                      </h1>
                      <div className="mt-2 flex items-baseline gap-3">
                        <span className="text-[32px] font-bold tabular-nums text-text-primary">
                          {formatPrice(stock.price)}원
                        </span>
                        <span
                          className={cn(
                            "text-lg font-semibold tabular-nums flex items-center gap-1",
                            stock.change > 0 ? "text-up" : "text-down",
                          )}
                        >
                          {stock.change > 0 ? "▲" : "▼"}{" "}
                          {formatPrice(Math.abs(stock.change))} (
                          {formatPercent(stock.changeRate)})
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        거래량 {stock.volume}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full"
                        onClick={() => {
                          const currentlyFav = isFav(stock.code);
                          toggleFav(stock.code);
                          setActionToast(
                            currentlyFav
                              ? "관심종목에서 해제되었습니다."
                              : "관심종목에 추가되었습니다."
                          );
                          setTimeout(() => setActionToast(""), 3000);
                        }}
                      >
                        <Heart
                          className={cn(
                            "w-5 h-5 transition-all duration-300",
                            isFav(stock.code) ? "fill-up text-up scale-110" : "text-text-secondary hover:scale-105",
                          )}
                        />
                      </Button>
                      <Link to="/stocks/compare">
                        <Button variant="outline">비교</Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div>
                  <AdvancedStockChart noCardStyle={true} candles={chartPoints} />
                </div>

                {/* Section F: 52-Week High/Low Bar */}
                <div className="p-6">
                  <div className="relative h-[48px] flex items-center w-full">
                    <span className="text-[11px] text-text-secondary mr-3 w-[100px]">
                      52주 최저 <span className="tabular-nums">155,200</span>
                    </span>

                    <div className="flex-1 h-[6px] bg-[#F2F2F7] rounded-[16px] relative flex shadow-inner">
                      <div
                        className="bg-[#1CBC9A] h-full rounded-[16px]"
                        style={{ width: "85%" }}
                      ></div>

                      {/* Current Price Dot */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2"
                        style={{ left: "85%" }}
                      >
                        <div className="w-[14px] h-[14px] rounded-full bg-[#1CBC9A] border-[3px] border-white shadow-[0_2px_6px_rgba(28,188,154,0.4)] -ml-[7px]"></div>
                        <div className="absolute top-[16px] left-1/2 -translate-x-1/2 text-[12px] font-bold text-[#1C1C1E] tabular-nums">
                          269,250
                        </div>
                        <div className="absolute bottom-[16px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1CBC9A]/10 text-[#1CBC9A] text-[10px] font-bold px-2 py-0.5 rounded-[16px]">
                          52주 최고 대비 93.5%
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-text-secondary ml-3 w-[100px] text-right">
                      52주 최고 <span className="tabular-nums">288,073</span>
                    </span>
                  </div>
                </div>
              </Card>

              {/* Technical Analysis Panel */}
              <Card>
                <CardContent className="p-0">
                  <div className="p-6 border-b border-border-color">
                    <h3 className="font-bold">기술적 분석 진단</h3>
                  </div>
                  <div className="p-6 flex flex-col gap-6">
                    <div className="flex justify-center">
                      <div className="bg-[#1CBC9A]/12 text-[#1CBC9A] font-bold text-[16px] px-6 py-2.5 rounded-[16px]">
                        관망 +1점
                      </div>
                    </div>
                    <div className="space-y-0">
                      {[
                        {
                          label: "RSI",
                          value: "과매수권 (75)",
                          score: "-2점",
                          scoreClass: "bg-[#FF3B30]/10 text-[#FF3B30]",
                        },
                        {
                          label: "MACD",
                          value: "0선 위 (중기 상승 구조)",
                          score: "+1점",
                          scoreClass: "bg-[#FF3B30]/10 text-[#FF3B30]",
                        },
                        {
                          label: "이평선",
                          value: "완전 정배열",
                          score: "+3점",
                          scoreClass: "bg-[#FF3B30]/10 text-[#FF3B30]",
                        },
                        {
                          label: "볼린저(%B)",
                          value: "%B 상단 이탈 (1.05)",
                          score: "-2점",
                          scoreClass: "bg-[#007AFF]/10 text-[#007AFF]",
                        },
                        {
                          label: "볼린저(추세)",
                          value: "중심선 위 지지",
                          score: "+1점",
                          scoreClass: "bg-[#FF3B30]/10 text-[#FF3B30]",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex grid grid-cols-[80px_1fr_60px] items-center py-4 border-b border-border-color last:border-0 last:pb-0"
                        >
                          <span className="text-sm font-medium text-text-secondary">
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold">
                            {item.value}
                          </span>
                          <div className="flex justify-end">
                            <span
                              className={cn(
                                "text-[12px] font-bold rounded-[16px] px-2 py-0.5",
                                item.scoreClass,
                              )}
                            >
                              {item.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right side: Order Panel */}
            <div className="w-full xl:w-[360px] 2xl:w-[400px] flex-shrink-0 flex flex-col gap-6">
              {/* Order Card */}
              <Card>
                <CardContent className="p-0">
                  <div className="flex w-full border-b border-border-color">
                    <button
                      onClick={() => setOrderType("buy")}
                      className={cn(
                        "flex-1 py-4 font-bold text-center border-b-2 transition-colors",
                        orderType === "buy"
                          ? "border-up text-up"
                          : "border-transparent text-text-secondary hover:text-text-primary",
                      )}
                    >
                      매수
                    </button>
                    <button
                      onClick={() => setOrderType("sell")}
                      className={cn(
                        "flex-1 py-4 font-bold text-center border-b-2 transition-colors",
                        orderType === "sell"
                          ? "border-down text-down"
                          : "border-transparent text-text-secondary hover:text-text-primary",
                      )}
                    >
                      매도
                    </button>
                  </div>

                  <div className="p-6 flex flex-col h-full space-y-6">
                    <div className="flex bg-bg-main p-1 rounded-[16px] border border-border-color">
                      {["시장가", "지정가"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setPriceType(t)}
                          className={cn(
                            "flex-1 py-2 text-sm font-semibold rounded-[12px] transition-colors",
                            priceType === t
                              ? "bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-[#636C7D] border border-border-color/50"
                              : "text-text-secondary hover:text-text-primary border border-transparent",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-sm font-bold text-text-secondary">
                          가격
                        </div>
                        <div className="flex-1 flex items-center bg-bg-main rounded-[16px] overflow-hidden border border-border-color focus-within:ring-2 focus-within:ring-brand">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-none hover:bg-black/5 flex-shrink-0 text-text-secondary"
                            onClick={() => stepLimitPrice(-1)}
                            disabled={priceType === "시장가"}
                          >
                            -
                          </Button>
                          <input
                            className="flex-1 h-12 bg-transparent text-center font-bold tabular-nums outline-none w-full"
                            value={
                              priceType === "시장가"
                                ? "시장가"
                                : Number(limitPrice || 0).toLocaleString()
                            }
                            onChange={(e) =>
                                setLimitPrice(e.target.value.replace(/[^0-9]/g, ""))
                            }
                            readOnly={priceType === "시장가"}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-none hover:bg-black/5 flex-shrink-0 text-text-secondary"
                            onClick={() => stepLimitPrice(1)}
                            disabled={priceType === "시장가"}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 text-sm font-bold text-text-secondary">
                          수량
                        </div>
                        <div className="flex-1 flex items-center bg-bg-main rounded-[16px] overflow-hidden border border-border-color focus-within:ring-2 focus-within:ring-brand">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-none hover:bg-black/5 flex-shrink-0 text-text-secondary"
                            onClick={() =>
                              setQuantity(
                                String(Math.max(0, Number(quantity || 0) - 1)),
                              )
                            }
                          >
                            -
                          </Button>
                          <input
                            className="flex-1 h-12 bg-transparent text-center font-bold tabular-nums outline-none w-full"
                            placeholder="0"
                            value={quantity}
                            onChange={(e) =>
                              setQuantity(e.target.value.replace(/[^0-9]/g, ""))
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-none hover:bg-black/5 flex-shrink-0 text-text-secondary"
                            onClick={() =>
                              setQuantity(String(Number(quantity || 0) + 1))
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2 pl-20 w-full">
                        {["10%", "25%", "50%", "최대"].map((pct) => (
                          <button
                            key={pct}
                            onClick={() =>
                              setQuantity(
                                pct === "10%"
                                  ? "10"
                                  : pct === "25%"
                                    ? "25"
                                    : pct === "50%"
                                      ? "50"
                                      : "100",
                              )
                            }
                            className="flex-1 bg-bg-main hover:bg-border-color transition-colors py-2 rounded-[16px] text-xs font-semibold text-text-secondary hover:text-text-primary"
                          >
                            {pct}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border-color space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-text-secondary font-medium">
                            주문 가능 금액
                          </span>
                          <span className="font-bold tabular-nums">
                            42,500,000원
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-bg-main p-4 rounded-[16px]">
                          <span className="font-bold">총 주문 금액</span>
                          <span
                            className={cn(
                              "text-xl font-bold tabular-nums",
                              orderType === "buy" ? "text-up" : "text-down",
                            )}
                          >
                            {formatPrice(
                              Number(quantity || 0) *
                                (priceType === "시장가"
                                  ? stock.price
                                  : Number(limitPrice || 0)),
                            )}
                            원
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 relative">
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex-1 shrink-1 min-w-0 border-border-color text-text-primary hover:bg-bg-main"
                          onClick={handleBooking}
                          disabled={isSubmittingOrder}
                        >
                          예약
                        </Button>
                        <Button
                          variant={orderType === "buy" ? "buy" : "sell"}
                          size="lg"
                          className="flex-[3] text-base"
                          onClick={handleOrder}
                          disabled={isSubmittingOrder}
                        >
                          {orderType === "buy" ? "매수하기" : "매도하기"}
                        </Button>
                        {actionToast && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1C1C1E] text-white px-4 py-2 rounded-[16px] text-sm whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-2 z-10">
                            {actionToast}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Alert Panel */}
              <Card>
                <CardContent className="p-0">
                  <div className="p-6 border-b border-border-color">
                    <h3 className="font-bold">목표가 알림</h3>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex bg-bg-main p-1 rounded-[16px]">
                      {(["ABOVE", "BELOW"] as const).map((direction) => (
                          <button
                              key={direction}
                              onClick={() => setAlertDirection(direction)}
                              className={cn(
                                  "flex-1 py-2 text-[13px] font-bold rounded-[12px] transition-colors",
                                  alertDirection === direction
                                      ? "bg-surface text-text-primary shadow-sm"
                                      : "text-text-secondary hover:text-text-primary",
                              )}
                          >
                            {direction === "ABOVE" ? "이상일 때" : "이하일 때"}
                          </button>
                      ))}
                    </div>
                    <div className="flex items-center bg-bg-main rounded-[16px] overflow-hidden border border-border-color focus-within:ring-2 focus-within:ring-brand">
                      <input
                          className="flex-1 h-12 px-4 bg-transparent text-right font-bold tabular-nums outline-none w-full"
                          placeholder={String(stock.price)}
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(e.target.value.replace(/[^0-9]/g, ""))}
                      />
                      <span className="pr-4 text-sm font-bold text-text-secondary">원</span>
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-border-color text-text-primary hover:bg-bg-main"
                        onClick={handleCreateAlert}
                        disabled={isSubmittingAlert}
                    >
                      알림 등록
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Order Book Panel */}
              <OrderBook />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border-dashed border-2 border-border-color rounded-[32px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand/10 mx-auto flex items-center justify-center text-brand">
                <BarChart2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">종목을 선택하세요</h3>
              <p className="text-text-secondary">
                좌측 리스트에서 종목을 선택하면 상세 정보가 표시됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
