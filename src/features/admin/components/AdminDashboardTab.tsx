import React from "react";
import { cn } from "@/src/shared/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/shared/components/ui/Card";

interface AdminDashboardTabProps {
  dashboardSummary: any;
  serverHealth: any;
  metricsHistory: any[];
  totalReportsCount: number;
  totalInquiriesCount: number;
}

export function AdminDashboardTab({ dashboardSummary, serverHealth, metricsHistory, totalReportsCount, totalInquiriesCount }: AdminDashboardTabProps) {
  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}분`;
    return `${hours}시간 ${minutes}분`;
  };

  const buildSvgPath = (points: any[]) => {
    if (points.length === 0) return { line: "", area: "" };

    const maxMs = Math.max(...points.map(p => p.responseTimeMs), 200);
    const width = 500;
    const height = 150;
    const stepX = points.length > 1 ? width / (points.length - 1) : 0;

    const coords = points.map((p, i) => {
      const x = i * stepX;
      const y = height - (p.responseTimeMs / maxMs) * height;
      return { x, y };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x},${c.y}`).join(" ");
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return { line: linePath, area: areaPath };
  };

  return (
              <div id="admin-dashboard-panel" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">대시보드</h1>
                    <p className="text-[#8E8E93] text-[14px]">제로리스크 서비스 현황</p>
                  </div>
                  <div className="bg-[#34C759]/10 text-[#34C759] font-bold text-[13px] px-3 py-1.5 rounded-[12px] flex items-center gap-1.5">
                    <span>서버 가동중 ({formatUptime(dashboardSummary?.uptimeSeconds ?? 0)})</span>
                  </div>
                </div>

                {/* 3 STATS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <Card className="rounded-[16px]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[#8E8E93]">전체 회원수</p>
                        <p className="text-[28px] font-bold text-[#1C1C1E] tabular-nums">
                          {(dashboardSummary?.totalUserCount ?? 0).toLocaleString()}명
                        </p>
                        <p className="text-[12px] font-bold text-[#34C759] flex items-center gap-1">
                          <span>+{dashboardSummary?.todayNewUserCount ?? 0}명 오늘 신규</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#4A5DF9]/12 text-[#4A5DF9] flex items-center justify-center text-[19px]">
                        👥
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 3 */}
                  <Card className="rounded-[16px]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[#8E8E93]">미처리 신고</p>
                        <p className="text-[28px] font-bold text-[#FF3B30] tabular-nums">{totalReportsCount}건</p>
                        <p className="text-[12px] font-bold text-[#FF3B30] flex items-center gap-1">
                          <span>즉시 확인 필요</span>
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#FF3B30]/12 text-[#FF3B30] flex items-center justify-center text-[19px]">
                        🚨
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 4 */}
                  <Card className="rounded-[16px]">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[#8E8E93]">미답변 문의</p>
                        <p className="text-[28px] font-bold text-[#FF9500] tabular-nums">{totalInquiriesCount}건</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-[#FF1493]/12 text-[#FF9500] flex items-center justify-center text-[19px]">
                        💬
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* API LATENCY & ACTIVE TRAFFIC */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                  {/* Left (60%): Live API latency SVG AREA CHART */}
                  <Card className="rounded-[16px] lg:col-span-3 flex flex-col justify-between">
                    <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <CardTitle className="text-[15px] font-bold text-[#1C1C1E]">API 응답시간 (ms)</CardTitle>
                        <p className="text-[11px] text-[#8E8E93]">실시간 트래픽 가중 응답 처리 지표</p>
                      </div>
                      <span className="bg-[#34C759]/11 text-[#34C759] text-[11px] font-bold px-2 py-0.5 rounded-[12px]">
                        현재 {dashboardSummary?.latestResponseTimeMs ?? 0}ms
                      </span>
                    </CardHeader>
                    <CardContent className="p-5 flex flex-col justify-end">
                      <div className="relative w-full h-[180px] bg-[#F2F2F7]/40 rounded-[8px] overflow-hidden px-2 pt-4 border border-[#E5E5EA]">
                        {/* Warning Line at 200ms */}
                        <div className="absolute top-[40%] left-0 w-full border-t border-dashed border-[#FF9500]/70 z-10">
                          <span className="absolute right-2 -top-4 text-[9px] font-bold text-[#FF9500] bg-white px-1 rounded border border-[#FF9500]/30 shadow-none">Warning 200ms</span>
                        </div>

                        {/* Chart Render */}
                        <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="apiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4A5DF9" stopOpacity="0.28" />
                              <stop offset="100%" stopColor="#4A5DF9" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Y-axis Labels */}
                          <line x1="0" y1="120" x2="500" y2="120" stroke="#E5E5EA" strokeWidth="1" />
                          <line x1="0" y1="60" x2="500" y2="60" stroke="#E5E5EA" strokeWidth="1" />

                          {metricsHistory.length > 0 && (
                            <>
                              <path d={buildSvgPath(metricsHistory).area} fill="url(#apiAreaGrad)" />
                              <path d={buildSvgPath(metricsHistory).line} stroke="#4A5DF9" strokeWidth="2" fill="none" />
                            </>
                          )}
                        </svg>

                        {/* X-axis custom tags */}
                        <div className="flex justify-between text-[9px] text-[#8E8E93] mt-1 pr-1 font-semibold">
                          {metricsHistory.length > 0 ? (
                            [0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                              const index = Math.floor((metricsHistory.length - 1) * ratio);
                              const point = metricsHistory[index];
                              const isLast = idx === 4;
                              return (
                                <span key={idx}>
                                  {isLast ? "현재" : point?.timestamp?.slice(11, 16)}
                                </span>
                              );
                            })
                          ) : (
                            <span className="w-full text-center">데이터 수집 중...</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right (40%): Server health card */}
                  <Card className="rounded-[16px] lg:col-span-2 p-5 flex flex-col">
                    <h4 className="text-[14px] font-bold text-[#8E8E93]">서버 상태</h4>

                    {/* Status signals with circular color tags */}
                    <div className="flex-1 flex flex-col justify-center gap-4 mt-2">
                      <div className="flex justify-between items-center text-[15px] bg-[#F2F2F7]/50 rounded-[14px] p-5 border border-[#E5E5EA]">
                        <span className="flex items-center gap-2.5 font-bold text-[#1C1C1E]">
                          <span className={cn("w-3 h-3 rounded-full", serverHealth?.webServerUp ? "bg-[#34C759]" : "bg-[#FF3B30]")} />
                          <span>웹서버</span>
                        </span>
                        <span className={cn("font-bold", serverHealth?.webServerUp ? "text-[#34C759]" : "text-[#FF3B30]")}>
                          {serverHealth?.webServerUp ? "정상운영" : "장애 발생"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[15px] bg-[#F2F2F7]/50 rounded-[14px] p-5 border border-[#E5E5EA]">
                        <span className="flex items-center gap-2.5 font-bold text-[#1C1C1E]">
                          <span className={cn("w-3 h-3 rounded-full", serverHealth?.databaseUp ? "bg-[#34C759]" : "bg-[#FF3B30]")} />
                          <span>데이터베이스</span>
                        </span>
                        <span className={cn("font-bold", serverHealth?.databaseUp ? "text-[#34C759]" : "text-[#FF3B30]")}>
                          {serverHealth?.databaseUp ? "정상운영" : "장애 발생"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
  );
}
