import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { ChevronDown, AlertTriangle, Search, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, formatPercent, cn } from '@/src/shared/lib/utils';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  AreaChart, Area, XAxis, YAxis, ComposedChart, Line,
  BarChart, Bar, ReferenceLine, ResponsiveContainer
} from 'recharts';
import {
    getAccounts, getComposition, getHoldings, getSnapshots,
} from '@/src/features/portfolio/api/portfolio';
import api from '@/src/shared/lib/api';

const PIE_COLORS = ['#4A5DF9', '#5856D6', '#FF9500', '#FF3B30', '#34C759', '#AF52DE'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-border-color p-3 rounded-[8px] shadow-lg text-sm">
        <div className="font-bold mb-1">{data.name}</div>
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">비중</span>
          <span className="font-medium">{data.weight}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const LineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface border border-border-color p-3 rounded-[8px] shadow-lg text-sm">
        <div className="font-bold mb-1">{label}</div>
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">내 총자산</span>
          <span className="font-medium text-[#4A5DF9]">{formatPrice(payload[0].value)}원</span>
        </div>
        {payload[1] && (
          <div className="flex justify-between gap-4 mt-1">
            <span className="text-text-secondary">KOSPI 수익률</span>
            <span className="font-medium text-[#8E8E93]">{payload[1].value > 0 ? '+' : ''}{payload[1].value}%</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const BarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const pnl = payload[0].value;
    const isPositive = pnl > 0;
    return (
      <div className="bg-surface border border-border-color p-3 rounded-[8px] shadow-lg text-sm">
        <div className="font-bold mb-1">{payload[0].payload.name}</div>
        <div className="flex justify-between gap-4">
          <span className="text-text-secondary">기여도</span>
          <span className={cn("font-medium", isPositive ? "text-up" : "text-down")}>
             {isPositive ? '+' : ''}{formatPrice(pnl)}원
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function Portfolio() {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('전체');

    // 계좌 목록은 selectedAccountId(선택된 탭)와 무관하게 항상 같은 응답이라, 쿼리 키에 selectedAccountId를
    // 안 넣어서 React Query가 최초 1회만 조회하고 이후엔 캐시를 재사용한다 - 화면에 보이는
    // 최종 결과(effectiveAccountId)는 기존과 동일, 중복 요청만 자연스럽게 줄어든다.
    const accountsQuery = useQuery({
        queryKey: ['portfolio', 'accounts'],
        queryFn: () => getAccounts(),
        retry: false,
    });

    const basicAccount = accountsQuery.data?.find((account) => account.accountType === 'BASIC') ?? null;
    const competitionAccounts = accountsQuery.data?.filter((account) => account.accountType === 'COMPETITION') ?? [];
    const effectiveAccountId = selectedAccountId ?? basicAccount?.accountId ?? null;
    const selectedAccount = accountsQuery.data?.find((account) => account.accountId === effectiveAccountId) ?? null;

    // 대회 계좌명은 계좌 API에 없으므로, 내 프로필의 참가 대회 이력에서 competitionId로 제목을 매칭한다.
    const myProfileQuery = useQuery({
        queryKey: ['portfolio', 'myProfile'],
        queryFn: async () => {
            const meResponse = await api.get('/users/me');
            const profileResponse = await api.get(`/profiles/${meResponse.data.userId}`);
            return profileResponse.data;
        },
        retry: false,
    });
    const myCompetitions = myProfileQuery.data?.competitionHistory ?? [];
    const getCompetitionTitle = (competitionId: number | null) =>
        myCompetitions.find((c: any) => c.competitionId === competitionId)?.title ?? '대회 전용 계좌';

    const accountName = selectedAccount
        ? selectedAccount.accountType === 'BASIC'
            ? '웹 메인 계좌'
            : getCompetitionTitle(selectedAccount.competitionId)
        : '웹 메인 계좌';

    // 기존엔 세 요청을 개별적으로 발사해 각자 따로 성공/실패를 처리했다 - 쿼리 3개로 그대로 대응.
    const holdingsQuery = useQuery({
        queryKey: ['portfolio', 'holdings', effectiveAccountId],
        queryFn: () => getHoldings(effectiveAccountId as number),
        enabled: effectiveAccountId !== null,
        retry: false,
    });
    const serverHoldings = holdingsQuery.data ?? null;

    const compositionQuery = useQuery({
        queryKey: ['portfolio', 'composition', effectiveAccountId],
        queryFn: () => getComposition(effectiveAccountId as number),
        enabled: effectiveAccountId !== null,
        retry: false,
    });
    const serverComposition = compositionQuery.data ?? null;

    const snapshotsQuery = useQuery({
        queryKey: ['portfolio', 'snapshots', effectiveAccountId],
        queryFn: () => getSnapshots(effectiveAccountId as number),
        enabled: effectiveAccountId !== null,
        retry: false,
    });
    const serverSnapshots = snapshotsQuery.data ?? null;

  const holdings = useMemo(() => {
      if (!serverHoldings) return [];
      const weightByCode = new Map(
          (serverComposition?.stocks ?? []).map((stock) => [stock.stockCode, stock.weight]),
          );
      return serverHoldings.map((holding) => ({
          code: holding.stockCode,
          name: holding.stockName,
          qty: holding.quantity,
          avgPrice: holding.averagePrice,
          currentPrice: holding.currentPrice,
          amount: holding.evaluationAmount,
          pnl: holding.profitLoss,
          pnlPercent: holding.profitRate,
          weight: weightByCode.get(holding.stockCode) ?? 0,
      }));
  }, [serverHoldings, serverComposition]);

  const summary = useMemo(() => {
      if (!serverHoldings || !serverComposition) {
          return { totalAsset: 0, totalPurchase: 0, totalPnL: 0, totalReturn: 0 };
      }
      const totalPurchase = serverHoldings.reduce(
          (sum, holding) => sum + holding.averagePrice * holding.quantity, 0,);
      const totalPnL = serverHoldings.reduce((sum, holding) => sum + holding.profitLoss, 0);
      return {
          totalAsset: serverComposition.totalAsset,
          totalPurchase,
          totalPnL,
          totalReturn: totalPurchase > 0 ? (totalPnL / totalPurchase) * 100 : 0,
      };
  }, [serverHoldings, serverComposition]);

  const history = useMemo(() => {
      if (!serverSnapshots) return [];
        return serverSnapshots.map((snapshot) => ({
            date: snapshot.snapshotDate.slice(5),
            asset: snapshot.totalAsset,
            kospiRate: 0,
        }));
  }, [serverSnapshots]);

  // Check for risk warning
  const highRiskStock = holdings.find(h => h.weight > 30);

  // Compute history for composed chart
  const historyData = history.map(h => ({
     ...h,
     kospiScaled: summary.totalPurchase * (1 + h.kospiRate / 100) // Dummy scale KOSPI to match asset for visual overlay
  }));

  return (
    <div className="space-y-8 pb-10 relative">

      {/* 1. Top Section - Account Selection & Summary */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
           <div className="relative">
              <button
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                 <h1 className="text-2xl font-bold tracking-tight">{accountName}</h1>
                 <ChevronDown className="w-6 h-6 text-text-primary" />
              </button>
              {isDropdownOpen && (
                 <div className="absolute top-full left-0 mt-2 w-56 bg-surface border border-border-color rounded-[12px] shadow-lg py-2 z-50">
                    {basicAccount && (
                       <button
                          className={cn("w-full text-left px-4 py-2 hover:bg-bg-main transition-colors text-sm font-medium", effectiveAccountId === basicAccount.accountId && 'text-brand')}
                          onClick={() => { setSelectedAccountId(basicAccount.accountId); setIsDropdownOpen(false); }}
                       >
                          웹 메인 계좌
                       </button>
                    )}
                    {competitionAccounts.map((account) => (
                       <button
                          key={account.accountId}
                          className={cn("w-full text-left px-4 py-2 hover:bg-bg-main transition-colors text-sm font-medium", effectiveAccountId === account.accountId && 'text-brand')}
                          onClick={() => { setSelectedAccountId(account.accountId); setIsDropdownOpen(false); }}
                       >
                          {getCompetitionTitle(account.competitionId)}
                       </button>
                    ))}
                 </div>
              )}
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <Card>
              <CardContent className="p-5 flex flex-col h-full min-h-[120px]">
                 <span className="text-sm font-bold text-text-secondary">총 자산</span>
                 <div className="mt-auto text-right">
                    <span className="text-2xl font-bold tracking-tight text-text-primary">₩{summary.totalAsset.toLocaleString()}</span>
                 </div>
              </CardContent>
           </Card>
           <Card>
              <CardContent className="p-5 flex flex-col h-full min-h-[120px]">
                 <span className="text-sm font-bold text-text-secondary">총 매수금액</span>
                 <div className="mt-auto text-right">
                    <span className="text-2xl font-bold tracking-tight text-[#8E8E93]">₩{summary.totalPurchase.toLocaleString()}</span>
                 </div>
              </CardContent>
           </Card>
           <Card>
              <CardContent className="p-5 flex flex-col h-full min-h-[120px]">
                 <span className="text-sm font-bold text-text-secondary">총 평가손익</span>
                 <div className="mt-auto text-right">
                    <span className={cn("text-2xl font-bold tracking-tight", summary.totalPnL > 0 ? "text-up" : "text-down")}>
                       {summary.totalPnL > 0 ? '+' : ''}₩{summary.totalPnL.toLocaleString()}
                    </span>
                 </div>
              </CardContent>
           </Card>
           <Card>
              <CardContent className="p-5 flex flex-col h-full min-h-[120px]">
                 <span className="text-sm font-bold text-text-secondary">전체 수익률</span>
                 <div className="mt-auto text-right">
                    <span className={cn("text-2xl font-bold tracking-tight", summary.totalReturn > 0 ? "text-up" : "text-down")}>
                       {formatPercent(summary.totalReturn)}
                    </span>
                 </div>
              </CardContent>
           </Card>
        </div>

        {highRiskStock && (
           <div className="flex items-center gap-2 p-4 rounded-[12px] bg-[rgba(255,59,48,0.1)] text-[#FF3B30]">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium text-sm">
                 {highRiskStock.name} 비중이 {highRiskStock.weight}%입니다. 분산 투자를 권장합니다.
              </p>
           </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* 2. Asset Composition Donut Chart */}
         <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
               <CardTitle className="text-lg">자산 구성 비중</CardTitle>
            </CardHeader>
            <CardContent>
               {holdings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[240px] text-text-secondary">
                     <p>보유 종목이 없습니다.</p>
                  </div>
               ) : (
                  <>
                     <div className="relative h-[240px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={holdings}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={70}
                                 outerRadius={100}
                                 paddingAngle={2}
                                 dataKey="amount"
                                 stroke="none"
                              >
                                 {holdings.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                 ))}
                              </Pie>
                              <RechartsTooltip content={<CustomTooltip />} />
                           </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <span className="text-xs text-text-secondary font-medium mb-1">총 평가금액</span>
                           <span className="font-bold text-sm">₩{summary.totalAsset.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="mt-4 space-y-2">
                        {holdings.map((h, i) => (
                           <div key={h.code} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                 <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                                 <span className="font-medium text-text-primary">{h.name}</span>
                              </div>
                              <span className="font-bold">{h.weight.toFixed(1)}%</span>
                           </div>
                        ))}
                     </div>
                  </>
               )}
            </CardContent>
         </Card>

         {/* 3. Asset Growth Line Chart */}
         <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
               <CardTitle className="text-lg">자산 성장 곡선</CardTitle>
               <div className="flex gap-1.5 flex-wrap">
                  {['1주', '1개월', '3개월', '전체'].map(period => (
                     <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className={cn(
                           "px-3 py-1.5 text-xs font-semibold rounded-[6px] border transition-all duration-200",
                           chartPeriod === period
                              ? "border-[#636C7D] bg-[#636C7D] text-white"
                              : "border-border-color bg-white text-text-secondary hover:bg-bg-main hover:text-text-primary"
                        )}
                     >
                        {period}
                     </button>
                  ))}
               </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6 flex flex-col">
               <div className="w-full h-[240px] mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={historyData} margin={{ top: 10, right: 0, left: 10, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorAsset" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4A5DF9" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#4A5DF9" stopOpacity={0.0} />
                           </linearGradient>
                        </defs>
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8E8E93' }} dy={10} />
                        <YAxis yAxisId="left" hide domain={['auto', 'auto']} />
                        <YAxis yAxisId="right" orientation="right" hide domain={['auto', 'auto']} />
                        <RechartsTooltip content={<LineTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="asset" stroke="#4A5DF9" strokeWidth={2} fillOpacity={1} fill="url(#colorAsset)" />
                        <Line yAxisId="right" type="monotone" dataKey="kospiScaled" stroke="#8E8E93" strokeWidth={2} strokeDasharray="4 4" dot={false} activeDot={false} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
               <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-[#4A5DF9]"></span>
                     <span>내 자산</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-[#8E8E93]"></span>
                     <span>KOSPI</span>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Holdings Table */}
         <Card className="lg:col-span-2">
            <CardHeader>
               <CardTitle className="text-lg">보유 종목 현황</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
               {holdings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary">
                     <p>보유 종목이 없습니다.</p>
                  </div>
               ) : (
                  <table className="w-full text-sm text-left">
                     <thead>
                        <tr className="border-b border-border-color text-text-secondary">
                           <th className="py-3 px-4 font-medium whitespace-nowrap">종목명</th>
                           <th className="py-3 px-4 font-medium text-right whitespace-nowrap">보유 수량</th>
                           <th className="py-3 px-4 font-medium text-right whitespace-nowrap">평균 매수가</th>
                           <th className="py-3 px-4 font-medium text-right whitespace-nowrap">현재가</th>
                           <th className="py-3 px-4 font-medium text-right whitespace-nowrap">평가금액</th>
                           <th className="py-3 px-4 font-medium text-right whitespace-nowrap">평가손익</th>
                           <th className="py-3 px-4 font-medium text-right whitespace-nowrap">수익률</th>
                        </tr>
                     </thead>
                     <tbody>
                        {holdings.map((h, idx) => (
                           <tr key={h.code} className="border-b border-border-color hover:bg-bg-main/50 transition-colors">
                              <td className="py-4 px-4 font-bold text-text-primary">
                                 <Link className="hover:text-brand hover:underline" to={`/stocks/${h.code}`}>{h.name}</Link>
                              </td>
                              <td className="py-4 px-4 text-right tabular-nums">{h.qty.toLocaleString()}</td>
                              <td className="py-4 px-4 text-right tabular-nums">₩{h.avgPrice.toLocaleString()}</td>
                              <td className="py-4 px-4 text-right tabular-nums font-semibold">₩{h.currentPrice.toLocaleString()}</td>
                              <td className="py-4 px-4 text-right tabular-nums font-bold">₩{h.amount.toLocaleString()}</td>
                              <td className={cn("py-4 px-4 text-right tabular-nums font-bold", h.pnl > 0 ? "text-up" : "text-down")}>
                                 {h.pnl > 0 ? '+' : ''}₩{Math.abs(h.pnl).toLocaleString()}
                              </td>
                              <td className={cn("py-4 px-4 text-right tabular-nums font-bold", h.pnlPercent > 0 ? "text-up" : "text-down")}>
                                 {formatPercent(h.pnlPercent)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </CardContent>
         </Card>
      </div>

      {/* PnL Contribution Bar Chart */}
      <Card className="bg-white border border-border-color shadow-sm">
         <CardHeader>
            <CardTitle className="text-lg">종목별 손익 기여도</CardTitle>
         </CardHeader>
         <CardContent>
            {holdings.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-[245px] text-text-secondary">
                  <p>보유 종목이 없습니다.</p>
               </div>
            ) : (
               <div className="h-[245px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={holdings} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <XAxis type="number" hide />
                        <YAxis
                           dataKey="name"
                           type="category"
                           axisLine={false}
                           tickLine={false}
                           width={160}
                           tick={{ fontSize: 13, fill: '#4E5968', fontWeight: 700 }}
                        />
                        <RechartsTooltip cursor={{ fill: 'transparent' }} content={<BarTooltip />} />
                        <ReferenceLine x={0} stroke="#E5E5EA" strokeWidth={2} />
                        <Bar dataKey="pnl" barSize={24} radius={[0, 4, 4, 0]}>
                           {holdings.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.pnl > 0 ? '#FF3B30' : '#007AFF'} radius={(entry.pnl > 0 ? [0, 4, 4, 0] : [4, 0, 0, 4]) as unknown as number} />
                           ))}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            )}
         </CardContent>
      </Card>

    </div>
  );
}
