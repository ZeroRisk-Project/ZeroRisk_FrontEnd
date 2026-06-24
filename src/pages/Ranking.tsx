import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { cn, formatPercent, formatPrice } from "@/src/lib/utils";
import { User, Medal, Search } from "lucide-react";

const TOP_RANKERS = [
  {
    rank: 1,
    name: "주식천재",
    totalAsset: 245200000,
    totalPnL: 145200000,
    return: 145.2,
    level: "Lv.9",
    isMe: false,
  },
  {
    rank: 2,
    name: "단타의신",
    totalAsset: 189500000,
    totalPnL: 89500000,
    return: 89.5,
    level: "Lv.7",
    isMe: false,
  },
  {
    rank: 3,
    name: "존버승리",
    totalAsset: 172100000,
    totalPnL: 72100000,
    return: 72.1,
    level: "Lv.8",
    isMe: false,
  },
  {
    rank: 4,
    name: "워렌버핏",
    totalAsset: 165400000,
    totalPnL: 65400000,
    return: 65.4,
    level: "Lv.6",
    isMe: false,
  },
  {
    rank: 5,
    name: "피터린치",
    totalAsset: 158900000,
    totalPnL: 58900000,
    return: 58.9,
    level: "Lv.5",
    isMe: false,
  },
  {
    rank: 45,
    name: "제로주린이",
    totalAsset: 8760000,
    totalPnL: -1240000,
    return: -12.4,
    level: "Lv.2",
    isMe: true,
  },
];

export function Ranking() {
  const [activeTab, setActiveTab] = useState("주간");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRankers = TOP_RANKERS.slice(3).filter((ranker) =>
    ranker.name.toLowerCase().includes(searchQuery.toLowerCase())
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

        {[TOP_RANKERS[1], TOP_RANKERS[0], TOP_RANKERS[2]].map((ranker, i) => {
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
            ranker.return > 0 ? "text-[#FF3B30]" : "text-[#007AFF]";

          return (
            <Link
              key={ranker.rank}
              to={`/users/${encodeURIComponent(ranker.name)}`}
              className="w-[240px] flex flex-col items-center group relative cursor-pointer pt-2"
            >
              {/* Tooltip */}
              <div className="absolute -top-10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 bg-[#1C1C1E] text-white text-[12px] p-3 rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.2)] whitespace-nowrap pointer-events-none">
                <div className="mb-1 text-white/70">
                  총자산{" "}
                  <span className="font-bold ml-2 text-white">
                    ₩{formatPrice(ranker.totalAsset)}
                  </span>
                </div>
                <div className="mb-1 text-white/70">
                  수익률{" "}
                  <span className={cn("font-bold ml-2", returnColor)}>
                    {ranker.return > 0 ? "▲ +" : "▼ "}
                    {ranker.return.toFixed(1)}%
                  </span>
                </div>
                <div className="text-white/70">
                  주문 수{" "}
                  <span className="font-bold ml-2 text-white">142건</span>
                </div>
              </div>

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
                {ranker.name}
              </div>

              <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 mb-3.5 border-transparent px-1 font-bold">
                {ranker.level}
              </Badge>

              <div
                className={cn(
                  "mb-1 z-10 tabular-nums tracking-tight",
                  returnStyle,
                  returnColor,
                )}
              >
                {ranker.return > 0 ? "+" : ""}
                {ranker.return.toFixed(1)}%
              </div>

              <div className="text-[13px] text-[#8E8E93] mb-5 z-10 tracking-tight font-medium">
                ₩{formatPrice(ranker.totalAsset)}
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
                <th className="px-4 py-3 font-medium text-right">
                  총 가상자산
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  평가 누적 손익
                </th>
                <th className="px-4 py-3 font-medium text-right">수익률</th>
              </tr>
            </thead>
            <tbody>
              {TOP_RANKERS.slice(3).map((ranker) => (
                <tr
                  key={ranker.rank}
                  className="border-b border-border-color last:border-0 transition-colors hover:bg-bg-main"
                >
                  <td className="px-4 py-4 text-center font-bold text-text-secondary relative">
                    {ranker.rank}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/users/${encodeURIComponent(ranker.name)}`}
                      className="flex items-center gap-3 group/row transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-surface border border-border-color flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-text-secondary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold flex items-center gap-1.5 group-hover/row:underline transition-colors">
                          {ranker.name}
                        </span>
                        <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 border-transparent px-1 font-bold">
                          {ranker.level}
                        </Badge>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-right font-bold tabular-nums">
                    ₩{formatPrice(ranker.totalAsset)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-right font-bold tabular-nums",
                      ranker.totalPnL > 0 ? "text-up" : "text-down",
                    )}
                  >
                    {ranker.totalPnL > 0 ? "+" : ""}₩
                    {formatPrice(Math.abs(ranker.totalPnL))}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-right font-bold tabular-nums",
                      ranker.return > 0 ? "text-up" : "text-down",
                    )}
                  >
                    {ranker.return > 0 ? "+" : ""}
                    {ranker.return.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
