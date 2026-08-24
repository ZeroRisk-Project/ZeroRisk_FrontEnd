import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Trophy,
  Users,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { formatPrice, formatPercent } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/Badge";
import api from "@/src/lib/api";

const POPULAR_STOCKS = [
  { code: "005930", name: "삼성전자", price: 68400, change: -1.2 },
  { code: "000660", name: "SK하이닉스", price: 164500, change: 2.4 },
  { code: "373220", name: "LG에너지솔루션", price: 395000, change: -0.5 },
  { code: "207940", name: "삼성바이오로직스", price: 825000, change: 1.1 },
];

const SURGING_STOCKS = [
  { code: "005380", name: "현대차", price: 245000, change: 4.5 },
  { code: "035420", name: "NAVER", price: 184500, change: 3.2 },
  { code: "068270", name: "셀트리온", price: 178900, change: -1.8 },
  { code: "035720", name: "카카오", price: 48900, change: 2.1 },
];

export function Home() {
  const [kospi, setKospi] = useState({ value: 2682.43, diff: 31.55, percent: 1.19 });
  const [kosdaq, setKosdaq] = useState({ value: 858.75, diff: -4.12, percent: -0.48 });

  useEffect(() => {
    const interval = setInterval(() => {
      setKospi((prev) => {
        const change = (Math.random() - 0.5) * 0.4;
        const newValue = prev.value + change;
        const newDiff = prev.diff + change;
        const newPercent = (newDiff / (2682.43 - 31.55)) * 100;
        return {
          value: Number(newValue.toFixed(2)),
          diff: Number(newDiff.toFixed(2)),
          percent: Number(newPercent.toFixed(2)),
        };
      });
      setKosdaq((prev) => {
        const change = (Math.random() - 0.5) * 0.15;
        const newValue = prev.value + change;
        const newDiff = prev.diff + change;
        const newPercent = (newDiff / (858.75 - (-4.12))) * 100;
        return {
          value: Number(newValue.toFixed(2)),
          diff: Number(newDiff.toFixed(2)),
          percent: Number(newPercent.toFixed(2)),
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [upcomingCompetitions, setUpcomingCompetitions] = useState<any[]>([]);

  useEffect(() => {
    const fetchUpcomingCompetitions = async () => {
      try {
        const response = await api.get("/competitions", { params: { page: 0, size: 100 } });
        const scheduled = response.data.content
          .filter((c: any) => c.status === "SCHEDULED")
          .slice(0, 2)
          .map((c: any) => ({
            id: c.id,
            title: c.title,
            period: `${c.startAt?.slice(0, 10)} ~ ${c.endAt?.slice(0, 10)}`,
            initialAmount: c.seedMoney,
            participants: c.participantCount,
          }));
        setUpcomingCompetitions(scheduled);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUpcomingCompetitions();
  }, []);

  return (
    <div className="animate-in fade-in duration-500 relative bg-bg-main min-h-screen">
      {/* Top Banner Area - fully filled blue banner left-to-right */} 
      <div className="w-full bg-brand py-6 md:py-9 mb-6">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-10 text-white">
          
          <div className="w-full lg:w-1/2">
            <h1 className="text-[38px] md:text-[44px] font-black text-white leading-[1.3] tracking-tight mb-3 animate-in fade-in duration-600">
              리스크 없이 시작하는<br />실전 주식 투자
            </h1>
            
            <p className="text-[17px] text-white/80 leading-relaxed mb-6 font-semibold animate-in fade-in duration-700">
              실제 계좌 잔액만큼 시드머니를 받고<br />진짜처럼 투자해보세요
            </p>
            
            <div className="flex items-center gap-3 mb-4 animate-in fade-in duration-800">
              <Link to="/register">
                <button className="bg-white hover:bg-white/90 text-brand px-7 py-3.5 rounded-full font-extrabold text-[16px] transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98]">
                  지금 시작하기
                </button>
              </Link>
              <Link to="/stocks">
                <button className="bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 px-7 py-3.5 rounded-full font-extrabold text-[16px] hover:scale-[1.02] active:scale-[0.98]">
                  둘러보기
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 relative h-[280px] lg:h-[320px] mt-6 lg:mt-0 flex items-center justify-center animate-in fade-in duration-1000">
            
            {/* KOSDAQ Card */}
            <div className="absolute top-2 right-2 sm:right-6 lg:right-4 xl:right-12 w-72 bg-white rounded-[24px] p-7 shadow-[0_16px_36px_rgba(0,0,0,0.15)] border border-slate-100/50 z-20 transform translate-x-4 rotate-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[14px] font-bold text-slate-500">KOSDAQ 코스닥</span>
              </div>
              <div className="text-[34px] font-extrabold text-slate-900 mb-1 tabular-nums tracking-tight">
                {kosdaq.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-[15px] font-bold tracking-tight ${kosdaq.diff >= 0 ? 'text-up' : 'text-down'}`}>
                {kosdaq.diff >= 0 ? "▲" : "▼"} {kosdaq.diff >= 0 ? "+" : ""}{kosdaq.diff.toFixed(2)} ({kosdaq.percent >= 0 ? "+" : ""}{kosdaq.percent.toFixed(2)}%)
              </div>
            </div>

            {/* KOSPI Card */}
            <div className="absolute top-12 left-6 sm:left-14 lg:left-8 xl:left-16 w-72 bg-white rounded-[24px] p-7 shadow-[0_16px_36px_rgba(0,0,0,0.15)] border border-slate-100/50 z-10 transform -rotate-2">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[14px] font-bold text-slate-500">KOSPI 코스피</span>
              </div>
              <div className="text-[34px] font-extrabold text-slate-900 mb-1 tabular-nums tracking-tight">
                {kospi.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-[15px] font-bold tracking-tight ${kospi.diff >= 0 ? 'text-up' : 'text-down'}`}>
                {kospi.diff >= 0 ? "▲" : "▼"} {kospi.diff >= 0 ? "+" : ""}{kospi.diff.toFixed(2)} ({kospi.percent >= 0 ? "+" : ""}{kospi.percent.toFixed(2)}%)
              </div>
            </div>

          </div>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto px-6 pb-20 space-y-8">


        {/* Popular Stocks Preview */}
        <section>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                실시간 인기 종목
              </h2>
              <Link to="/stocks">
                <Button variant="ghost" size="sm" className="h-8">
                  전체보기
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {POPULAR_STOCKS.map((stock) => (
                <Link
                  key={stock.code}
                  to={`/stocks/${stock.code}`}
                  className="block"
                >
                  <Card className="h-full hover:border-brand/50 transition-colors cursor-pointer">
                    <div className="p-5 flex justify-between items-center h-full">
                      <div>
                        <h4 className="font-semibold text-lg">{stock.name}</h4>
                        <p className="text-sm text-text-secondary">
                          {stock.code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums text-lg">
                          {formatPrice(stock.price)}원
                        </p>
                        <p
                          className={`text-sm tabular-nums font-bold ${stock.change > 0 ? "text-up" : "text-down"}`}
                        >
                          {formatPercent(stock.change)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>
        </section>

        {/* Surging Stocks Theme Preview */}
        <section>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">
                🔥 급등 종목 테마
              </h2>
              <Link to="/stocks">
                <Button variant="ghost" size="sm" className="h-8">
                  전체보기
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {SURGING_STOCKS.map((stock) => (
                <Link
                  key={stock.code}
                  to={`/stocks/${stock.code}`}
                  className="block"
                >
                  <Card className="h-full hover:border-brand/50 transition-colors cursor-pointer">
                    <div className="p-5 flex justify-between items-center h-full">
                      <div>
                        <h4 className="font-semibold text-lg">{stock.name}</h4>
                        <p className="text-sm text-text-secondary">
                          {stock.code}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums text-lg">
                          {formatPrice(stock.price)}원
                        </p>
                        <p
                          className={`text-sm tabular-nums font-bold ${stock.change > 0 ? "text-up" : "text-down"}`}
                        >
                          {formatPercent(stock.change)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Community Posts */}
          <section>
            <Card className="h-full flex flex-col">
              <div className="flex items-center justify-between p-6 pb-4 border-b border-border-color">
                <h2 className="text-xl font-bold tracking-tight">
                  인기 커뮤니티
                </h2>
                <Link to="/community">
                  <Button variant="ghost" size="sm" className="h-8">
                    전체보기
                  </Button>
                </Link>
              </div>
              <CardContent className="p-0 flex flex-col divide-y divide-border-color flex-1">
                {[
                  {
                    id: 1,
                    title: "삼성전자 오늘 진짜 가냐..?",
                    author: "수익만보고감",
                    level: "Lv.4",
                    time: "10분 전",
                    likes: 12,
                    comments: 24,
                    board: "국내주식",
                  },
                  {
                    id: 3,
                    title: "SK하이닉스 수익 인증합니다",
                    author: "고수등장",
                    level: "Lv.8",
                    time: "1시간 전",
                    likes: 58,
                    comments: 13,
                    board: "수익률 인증",
                  },
                  {
                    id: 4,
                    title: "테슬라 주주분들 지금 물타기 타이밍인가요",
                    author: "일론이형믿어",
                    level: "Lv.3",
                    time: "2시간 전",
                    likes: 34,
                    comments: 45,
                    board: "해외주식",
                  },
                  {
                    id: 5,
                    title: "초보자도 쉽게 따라하는 시드머니 관리법",
                    author: "현금부자",
                    level: "Lv.6",
                    time: "3시간 전",
                    likes: 102,
                    comments: 18,
                    board: "꿀팁",
                  },
                ].map((post, i) => (
                  <Link
                    key={post.id}
                    to={`/community/${post.id}`}
                    className="hover:bg-bg-main transition-colors block"
                  >
                    <div className="p-4 flex h-full items-center">
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary truncate">
                            {post.title}
                          </h3>
                          <span className="text-[10px] font-bold text-text-secondary shrink-0 bg-surface px-1.5 py-0.5 rounded-[4px] border border-border-color">
                            {post.board}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <span className="font-medium text-text-primary">
                            {post.author}
                          </span>
                          <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 px-1 border-transparent font-bold">
                            {post.level}
                          </Badge>
                          <span className="w-1 h-1 rounded-full bg-border-color ml-1" />
                          <span className="ml-1">{post.time}</span>
                          <div className="flex items-center gap-3 ml-auto">
                            <span className="flex items-center gap-1 font-bold text-up">
                              <ThumbsUp className="w-3.5 h-3.5" /> {post.likes}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-emerald-500">
                              <MessageSquare className="w-3.5 h-3.5" />{" "}
                              {post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Upcoming Competitions */}
          <section>
            <Card className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight">
                  신청 가능한 대회
                </h2>
                <Link to="/competitions">
                  <Button variant="ghost" size="sm" className="h-8">
                    전체보기
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                {upcomingCompetitions.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-10 text-sm text-text-secondary">
                    현재 신청 가능한 대회가 없습니다.
                  </div>
                ) : (
                upcomingCompetitions.map((comp, i) => (
                  <Card
                    key={comp.id}
                    className="hover:border-brand/50 transition-colors h-full"
                  >
                    <div className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between h-full">
                      <div>
                        <h3 className="font-bold text-lg mb-1.5">
                          {comp.title}
                        </h3>
                        <p className="text-sm text-text-secondary mb-3">
                          {comp.period}
                        </p>
                        <div className="flex gap-4 text-sm font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-secondary font-medium">
                              초기자금
                            </span>{" "}
                            {formatPrice(comp.initialAmount)}원
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-text-secondary font-medium">
                              현재 신청
                            </span>{" "}
                            <span className="text-brand">
                              {comp.participants}명
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/competitions/${comp.id}`}
                        className="w-full sm:w-auto mt-2 sm:mt-0"
                      >
                        <Button className="w-full sm:w-auto px-6 font-bold">
                          참가 신청
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))
                )}
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
