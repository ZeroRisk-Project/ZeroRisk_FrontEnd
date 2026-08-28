import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/src/shared/components/ui/Card";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Input } from "@/src/shared/components/ui/Input";
import { cn } from "@/src/shared/lib/utils";
import { User, Medal, Search } from "lucide-react";
import { getRankings, getMyRanking, RankingResponse } from "@/src/features/ranking/api/ranking";

export function Ranking() {
  const [activeTab, setActiveTab] = useState("주간");
  const [searchQuery, setSearchQuery] = useState("");
  const [rankings, setRankings] = useState<RankingResponse[]>([]);
  const [myRanking, setMyRanking] = useState<RankingResponse | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getRankings(page, 20)
      .then(setRankings)
      .catch(() => setRankings([]));
  }, [page]);

  useEffect(() => {
    getMyRanking()
      .then(setMyRanking)
      .catch(() => setMyRanking(null)); // 비로그인이거나 아직 랭킹 데이터가 없는 경우
  }, []);

  const filteredRankers = rankings
    .slice(3)
    .filter((ranker) =>
      ranker.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-border-color pb-2 gap-4">
        <div className="flex gap-6">
          {["일간", "주간", "월간"].map((tab) => (
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

      {myRanking && (
        <div className="bg-[#F2F4F6] rounded-[16px] p-4 flex items-center justify-between">
          <span className="text-[13px] font-bold text-[#4E5968]">내 순위</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#191F28]">{myRanking.rank}위</span>
            <span className={cn("font-bold", myRanking.returnRate >= 0 ? "text-up" : "text-down")}>
              {myRanking.returnRate >= 0 ? "+" : ""}{myRanking.returnRate}%
            </span>
          </div>
        </div>
      )}

      {rankings.length >= 3 && (
        <div className="max-w-[860px] mx-auto pt-[48px] px-[60px] pb-0 flex items-end justify-center gap-6 relative overflow-hidden mb-8 group/podium-container">
          {/* Subtle radial glow behind 1st place */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] -z-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 200px 120px at center top, rgba(255,215,0,0.08) 0%, transparent 70%)",
            }}
          ></div>

          {/* Optional Sparkles around 1st place */}
          <div className="absolute top-[40px] left-1/2 -translate-x-[60px] w-1.5 h-1.5 rounded-full bg-[#FFD700] opacity-60"></div>
          <div className="absolute top-[60px] left-1/2 translate-x-[70px] w-1 h-1 rounded-full bg-[#FF3B30] opacity-60"></div>
          <div className="absolute top-[90px] left-1/2 -translate-x-[80px] w-1 h-1 rounded-full bg-[#1CBC9A] opacity-60"></div>
          <div className="absolute top-[30px] left-1/2 translate-x-[40px] w-1 h-1 rounded-full bg-[#FFD700] opacity-60"></div>

          {[rankings[1], rankings[0], rankings[2]].map((ranker) => {
            let isFirst = ranker.rank === 1;
            let isSecond = ranker.rank === 2;
            let isThird = ranker.rank === 3;

            let podiumHeight = isFirst
              ? "h-[160px]"
              : isSecond
                ? "h-[120px]"
                : "h-[90px]";
            let podiumBg = isFirst ? "#F94A5D" : isSecond ? "#FF7A8A" : "#FFB3BA";
            let podiumTextColor = "text-white";
            let podiumBorder = isFirst
              ? "border-t border-[rgba(255,255,255,0.6)]"
              : "";

            let avatarSize = isFirst ? "w-24 h-24" : "w-20 h-20";
            let avatarBorder = isFirst
              ? "border-[4px] border-[#F94A5D] shadow-[0_0_0_2px_rgba(249,74,93,0.3)]"
              : isSecond
                ? "border-[4px] border-[#FF7A8A] shadow-[0_0_0_2px_rgba(255,122,138,0.3)]"
                : "border-[4px] border-[#FFB3BA] shadow-[0_0_0_2px_rgba(255,179,186,0.3)]";

            let nameStyle = isFirst
              ? "text-[17px] font-bold text-[#1C1C1E]"
              : "text-[15px] font-semibold text-[#1C1C1E]";

            let returnStyle = "text-[22px] font-bold";
            let returnColor =
              ranker.returnRate >= 0 ? "text-[#FF3B30]" : "text-[#007AFF]";

            return (
              <Link
                key={ranker.rank}
                to={`/users/${ranker.userId}`}
                className="w-[240px] flex flex-col items-center group relative cursor-pointer pt-2"
              >
                {isFirst ? (
                  <div className="text-[32px] mb-1 filter drop-shadow-[0_2px_6px_rgba(255,215,0,0.6)] z-10 leading-none">
                    👑
                  </div>
                ) : (
                  <div className="h-[36px]"></div>
                )}

                <div
                  className={cn(
                    "rounded-full bg-surface flex items-center justify-center mb-3 transition-transform duration-200 ease-out group-hover:scale-105 z-10 box-content",
                    avatarSize,
                    avatarBorder,
                  )}
                >
                  <User className="w-1/2 h-1/2 text-text-secondary" />
                </div>

                <div
                  className={cn(
                    "max-w-full truncate whitespace-nowrap mb-1.5 z-10",
                    nameStyle,
                  )}
                >
                  {ranker.nickname}
                </div>

                <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 mb-3.5 border-transparent px-1 font-bold">
                  Lv.{ranker.userLevel}
                </Badge>

                <div
                  className={cn(
                    "mb-5 z-10 tabular-nums tracking-tight",
                    returnStyle,
                    returnColor,
                  )}
                >
                  {ranker.returnRate >= 0 ? "+" : ""}
                  {ranker.returnRate}%
                </div>

                <div
                  className={cn(
                    "w-full rounded-t-[8px] relative overflow-hidden flex items-center justify-center group-hover:brightness-105 transition-all outline-none",
                    podiumHeight,
                    podiumTextColor,
                    podiumBorder,
                  )}
                  style={{ background: podiumBg }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-[48px] font-black text-[#ffffff] select-none pointer-events-none">
                    {ranker.rank}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex justify-end mb-3 mt-8">
        <div className="relative w-full sm:w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
          <Input
            placeholder="닉네임 검색"
            className="w-full pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-bg-main border-b border-border-color text-text-secondary">
              <tr>
                <th className="px-4 py-3 font-medium text-center w-16">순위</th>
                <th className="px-4 py-3 font-medium">닉네임</th>
                <th className="px-4 py-3 font-medium text-right">거래 건수</th>
                <th className="px-4 py-3 font-medium text-right">수익률</th>
              </tr>
            </thead>
            <tbody>
              {filteredRankers.map((ranker, idx) => {
                const isTied =
                  filteredRankers[idx - 1]?.rank === ranker.rank ||
                  filteredRankers[idx + 1]?.rank === ranker.rank;

                return (
                <tr
                  key={`${ranker.rank}-${ranker.userId}`}
                  className="border-b border-border-color last:border-0 transition-colors hover:bg-bg-main"
                >
                  <td className="px-4 py-4 text-center font-bold text-text-secondary relative">
                    <div className="flex items-center justify-center gap-1.5">
                      <span>{ranker.rank}</span>
                      {isTied && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#8E8E93]/15 text-[#8E8E93]">
                          동점
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/users/${ranker.userId}`}
                      className="flex items-center gap-3 group/row transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface border border-border-color flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-text-secondary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold flex items-center gap-1.5 group-hover/row:underline transition-colors">
                          {ranker.nickname}
                        </span>
                        <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 border-transparent px-1 font-bold">
                          Lv.{ranker.userLevel}
                        </Badge>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-text-secondary tabular-nums">
                    {ranker.tradeCount != null ? `${ranker.tradeCount}건` : "-"}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-right font-bold tabular-nums",
                      ranker.returnRate >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {ranker.returnRate >= 0 ? "+" : ""}
                    {ranker.returnRate}%
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
