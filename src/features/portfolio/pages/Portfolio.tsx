import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { Badge } from '@/src/shared/components/ui/Badge';
import { ChevronDown, AlertTriangle, RefreshCw, X, Search, ChevronRight, Info, Sliders, ArrowRight, TrendingUp, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, formatPercent, cn } from '@/src/shared/lib/utils';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip,
  AreaChart, Area, XAxis, YAxis, ComposedChart, Line,
  BarChart, Bar, ReferenceLine, ResponsiveContainer
} from 'recharts';

const PORTFOLIO_DATA = {
  main: {
    id: 'main',
    name: '웹 메인 계좌',
    summary: {
      totalAsset: 12450000,
      totalPurchase: 10200000,
      totalPnL: 2250000,
      totalReturn: 22.06
    },
    holdings: [
      { code: '000660', name: 'SK하이닉스', qty: 50, avgPrice: 120000, currentPrice: 156000, amount: 7800000, pnl: 1800000, pnlPercent: 30.0, weight: 62.6 },
      { code: '005930', name: '삼성전자', qty: 30, avgPrice: 61000, currentPrice: 75000, amount: 2250000, pnl: 420000, pnlPercent: 22.9, weight: 18.1 },
      { code: '105560', name: 'KB금융', qty: 15, avgPrice: 55000, currentPrice: 67000, amount: 1005000, pnl: 180000, pnlPercent: 21.8, weight: 8.1 },
      { code: '001440', name: '대한전선', qty: 125, avgPrice: 12000, currentPrice: 11600, amount: 1450000, pnl: -50000, pnlPercent: -3.3, weight: 11.6 }
    ],
    history: [
      { date: '04-29', asset: 10000000, kospiRate: 0 },
      { date: '05-01', asset: 10500000, kospiRate: 1.0 },
      { date: '05-15', asset: 11200000, kospiRate: 1.5 },
      { date: '06-01', asset: 12000000, kospiRate: 3.2 },
      { date: '06-12', asset: 12450000, kospiRate: 2.8 }
    ],
    risk: { beta: 1.23, volatility: 18.4, sharpe: 1.87 }
  },
  comp1: {
    id: 'comp1',
    name: '제1회 제로리스크 실전투자대회',
    summary: {
      totalAsset: 12500000,
      totalPurchase: 10000000,
      totalPnL: 2500000,
      totalReturn: 25.0
    },
    holdings: [
      { code: '035420', name: 'NAVER', qty: 50, avgPrice: 200000, currentPrice: 250000, amount: 12500000, pnl: 2500000, pnlPercent: 25.0, weight: 100.0 }
    ],
    history: [
      { date: '06-01', asset: 10000000, kospiRate: 0 },
      { date: '06-05', asset: 11000000, kospiRate: -0.5 },
      { date: '06-10', asset: 12000000, kospiRate: 1.2 },
      { date: '06-12', asset: 12500000, kospiRate: 1.8 }
    ],
    risk: { beta: 1.55, volatility: 25.2, sharpe: 2.15 }
  }
};

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
  const [accountId, setAccountId] = useState<'main' | 'comp1'>('main');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('전체');
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Dynamic portfolio states that can be real-time rebalanced
  const [portfolioState, setPortfolioState] = useState(PORTFOLIO_DATA);
  const [activeStrategy, setActiveStrategy] = useState<'balanced' | 'safe' | 'growth'>('balanced');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executionProgress, setExecutionProgress] = useState(0);

  const currentData = portfolioState[accountId];
  const { summary, holdings, history, risk } = currentData;
  const isAlreadyRebalanced = holdings.some(h => h.name.includes('ETF') || h.name.includes('국채'));

  const handleRebalanceClick = () => {
    setIsRebalancing(true);
    setIsRebalanceModalOpen(true);
    setIsExecuting(false);
    setExecutionProgress(0);
    setExecutionLogs([]);
    setTimeout(() => {
      setIsRebalancing(false);
    }, 1100);
  };

  const getStrategyDetails = () => {
    switch (activeStrategy) {
      case 'safe':
        return {
          title: "안정 추구형 (Safe Yield)",
          color: "bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-300",
          badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
          desc: "변동성이 큰 주식 비중을 최소화하고 우량 국채 ETF, 단기 자금 및 고배당 저변동 주식 구성으로 하락장에 극단적인 탄력성을 지닌 안심 분산안입니다.",
          beta: "0.45",
          volatility: "5.2%",
          sharpe: "1.82",
          expectedReturn: "5.4%",
          items: accountId === 'main' ? [
            { name: "미국 국채 ETF", current: 0, target: 40, action: 'buy' },
            { name: "글로벌 배당귀족 ETF", current: 0, target: 30, action: 'buy' },
            { name: "삼성전자", current: 37.4, target: 15, action: 'sell' },
            { name: "SK하이닉스", current: 62.6, target: 15, action: 'sell' }
          ] : [
            { name: "미국 국채 ETF", current: 0, target: 40, action: 'buy' },
            { name: "글로벌 배당귀족 ETF", current: 0, target: 30, action: 'buy' },
            { name: "단기 채권 ETF", current: 0, target: 15, action: 'buy' },
            { name: "NAVER", current: 100, target: 15, action: 'sell' }
          ]
        };
      case 'growth':
        return {
          title: "수익 극대화형 (Growth Oriented)",
          color: "bg-purple-500/5 border-purple-500/10 text-purple-800 dark:text-purple-300",
          badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
          desc: "IT 빅테크, AI 산업 클러스터 및 성장 모멘텀이 극대화된 주식형 ETF를 집중 편입하여 지수 대비 초과 수익을 추구하고 복리 효과를 극대화하는 적극적 투자안입니다.",
          beta: "1.35",
          volatility: "18.4%",
          sharpe: "1.12",
          expectedReturn: "14.8%",
          items: accountId === 'main' ? [
            { name: "글로벌 AI/반도체 ETF", current: 0, target: 45, action: 'buy' },
            { name: "혁신 기술 테마 ETF", current: 0, target: 20, action: 'buy' },
            { name: "삼성전자", current: 37.4, target: 15, action: 'sell' },
            { name: "SK하이닉스", current: 62.6, target: 20, action: 'sell' }
          ] : [
            { name: "글로벌 AI/반도체 ETF", current: 0, target: 45, action: 'buy' },
            { name: "혁신 기술 테마 ETF", current: 0, target: 15, action: 'buy' },
            { name: "미국 국채 ETF (방어)", current: 0, target: 5, action: 'buy' },
            { name: "NAVER", current: 100, target: 35, action: 'sell' }
          ]
        };
      case 'balanced':
      default:
        return {
          title: "균형 성장형 (AI Recommended)",
          color: "bg-emerald-500/5 border-emerald-500/10 text-emerald-800",
          badgeColor: "bg-[#1CBC9A]/10 text-brand",
          desc: "AI 알고리즘이 분석한 자산 상관계수 매트릭스를 기반으로 주식과 우량 채권 및 테마 자산을 황금 분할하여 최적의 샤프지수(Sharpe Ratio)를 맞춘 가치 지향안입니다.",
          beta: "0.82",
          volatility: "8.9%",
          sharpe: "2.14",
          expectedReturn: "9.2%",
          items: accountId === 'main' ? [
            { name: "미국 테크 핵심 ETF", current: 0, target: 30, action: 'buy' },
            { name: "우량 회사채 ETF", current: 0, target: 25, action: 'buy' },
            { name: "국민 배당형 지수 ETF", current: 0, target: 20, action: 'buy' },
            { name: "삼성전자", current: 37.4, target: 15, action: 'sell' },
            { name: "SK하이닉스", current: 62.6, target: 10, action: 'sell' }
          ] : [
            { name: "미국 테크 핵심 ETF", current: 0, target: 30, action: 'buy' },
            { name: "우량 회사채 ETF", current: 0, target: 25, action: 'buy' },
            { name: "국민 배당형 지수 ETF", current: 0, target: 20, action: 'buy' },
            { name: "NAVER", current: 100, target: 25, action: 'sell' }
          ]
        };
    }
  };

  const handleExecuteRebalance = () => {
    setIsExecuting(true);
    setExecutionProgress(0);
    setExecutionLogs([]);

    const strat = getStrategyDetails();
    const logs = [
      "🔄 AI 리밸런싱 주문 엔진을 분석하고 시퀀스를 초기화합니다...",
      "🔍 자산 상관계수 매트릭스 복합 다차원 진단 개시...",
      `📊 대상 자산 전략 확인: [${strat.title}] 최적 분할 적용`,
      "📉 과도 수집 주식 청산 및 매도 주문 사전 확인...",
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) progress = 100;
      setExecutionProgress(progress);

      if (progress === 15) {
        setExecutionLogs(prev => [...prev, ...logs]);
      } else if (progress === 30) {
        setExecutionLogs(prev => [...prev, "💰 매각 주문 전송: 과대 편중주식 비중 하향 매도개시 (체결율 100%)..."]);
      } else if (progress === 50) {
        setExecutionLogs(prev => [...prev, `🚀 신규 매수 주문 전송: ${strat.items.map(h => `${h.name} (${h.target}%)`).join(', ')}...`]);
      } else if (progress === 70) {
        setExecutionLogs(prev => [...prev, "🔄 포트폴리오 트랙 시뮬레이션 및 분치 리스크 한도 테스팅 검증 완료..."]);
      } else if (progress === 90) {
        setExecutionLogs(prev => [...prev, "✅ 전체 맞춤 자산 운용 거래가 정상적으로 완료되었습니다!"]);
      } else if (progress >= 100) {
        clearInterval(interval);
        
        setPortfolioState(prev => {
          const updated = { ...prev };
          const account = updated[accountId];
          
          const newHoldings = strat.items.map((sh, index) => {
            const amount = Math.round(account.summary.totalAsset * (sh.target / 100));
            const currentPrice = sh.name.includes("국채") ? 100000 : sh.name.includes("ETF") ? 50000 : 156800;
            const avgPrice = sh.name.includes("국채") ? 98200 : sh.name.includes("ETF") ? 49100 : 154000;
            const qty = Math.max(1, Math.round(amount / currentPrice));
            return {
              code: `MOCK-${index}`,
              name: sh.name,
              qty,
              avgPrice,
              currentPrice,
              amount,
              pnl: Math.round(amount * 0.0182),
              pnlPercent: 1.82,
              weight: sh.target
            };
          });

          updated[accountId] = {
            ...account,
            risk: {
              beta: parseFloat(strat.beta),
              volatility: parseFloat(strat.volatility.replace('%', '')),
              sharpe: parseFloat(strat.sharpe)
            },
            holdings: newHoldings
          };
          
          return updated;
        });
      }
    }, 150);
  };

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
                 <h1 className="text-2xl font-bold tracking-tight">{currentData.name}</h1>
                 <ChevronDown className="w-6 h-6 text-text-primary" />
              </button>
              {isDropdownOpen && (
                 <div className="absolute top-full left-0 mt-2 w-56 bg-surface border border-border-color rounded-[12px] shadow-lg py-2 z-50">
                    <button 
                       className={cn("w-full text-left px-4 py-2 hover:bg-bg-main transition-colors text-sm font-medium", accountId === 'main' && 'text-brand')}
                       onClick={() => { setAccountId('main'); setIsDropdownOpen(false); }}
                    >
                       웹 메인 계좌
                    </button>
                    <button 
                       className={cn("w-full text-left px-4 py-2 hover:bg-bg-main transition-colors text-sm font-medium", accountId === 'comp1' && 'text-brand')}
                       onClick={() => { setAccountId('comp1'); setIsDropdownOpen(false); }}
                    >
                       제1회 제로리스크 실전투자대회
                    </button>
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
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
         {/* 6. AI Rebalancing / Diagnostic healthcare check */}
         <Card className="flex flex-col border border-border-color bg-white shadow-sm transition-all duration-300 relative overflow-hidden lg:h-[464px]">
            {/* Decorative background circle */}
            <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-slate-100/40 -z-10 blur-xl"></div>
            
            <CardContent className="p-6 h-full flex flex-col justify-between overflow-hidden">
               {/* Scrollable contents area */}
               <div className="flex-1 overflow-y-auto pr-1.5 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-slate-200">
                  <div className="flex items-center justify-between">
                     <span className="text-[13.5px] font-extrabold tracking-wider text-text-secondary uppercase">
                        AI 포트폴리오 안전 진단
                     </span>
                     <span className="text-[13px] font-medium text-slate-400">
                        최근 진단일: 2026.06.20
                     </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                     <span className={cn(
                        "text-5xl font-extrabold tracking-tight tabular-nums",
                        isAlreadyRebalanced ? "text-emerald-500" : "text-amber-500"
                      )}>
                        {isAlreadyRebalanced ? "96" : "45"}
                     </span>
                     <span className="text-lg font-bold text-text-secondary">/ 100 점</span>
                  </div>

                  {/* Paragraph 01: 나의 투자 분석 */}
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="bg-[#4B80EB] text-white rounded-[5px] w-[32px] h-[22px] flex items-center justify-center font-extrabold text-[16px] shrink-0 select-none leading-none">
                           01
                        </span>
                        <span className="text-[16px] font-bold text-[#191F28]">나의 투자 분석</span>
                     </div>
                     <div className="bg-[#F2F4F6]/50 border border-slate-200/40 rounded-[14px] p-4 space-y-4">
                        {/* Segmented Progress Bar */}
                        <div className="w-full h-[21px] bg-slate-200/40 rounded-full flex overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)]">
                           <div 
                              className="bg-[#4B80EB] h-full transition-all duration-550" 
                              style={{ width: isAlreadyRebalanced ? "75%" : "30%" }} 
                           />
                           <div 
                              className="bg-[#D5D8DC] h-full transition-all duration-550" 
                              style={{ width: isAlreadyRebalanced ? "20%" : "20%" }} 
                           />
                           <div 
                              className="bg-[#EA6A65] h-full transition-all duration-550" 
                              style={{ width: isAlreadyRebalanced ? "5%" : "50%" }} 
                           />
                        </div>
                        
                        <div className="space-y-3">
                           {/* Positive */}
                           <div className="flex items-center gap-2">
                              <span className="w-10 h-[21px] flex items-center justify-center bg-[#4B80EB] text-white text-[12px] font-bold rounded-full shrink-0 select-none leading-none">
                                 긍정
                              </span>
                              <span className="text-[14.5px] font-extrabold text-[#191F28] min-w-[28px] tabular-nums text-left">
                                 {isAlreadyRebalanced ? "75%" : "30%"}
                              </span>
                              <span className="text-[13.5px] text-[#4E5968] font-semibold truncate flex-1 block">
                                 {isAlreadyRebalanced 
                                    ? "가치주 및 최적화 성장 ETF 편입으로 자산 성장성 극대화"
                                    : "코스피 시총 상위 우량 대기업 보유로 기본 건전성 확보"}
                              </span>
                           </div>
                           
                           {/* Neutral */}
                           <div className="flex items-center gap-2">
                              <span className="w-10 h-[21px] flex items-center justify-center bg-[#9BA5B1] text-white text-[12px] font-bold rounded-full shrink-0 select-none leading-none">
                                 중립
                              </span>
                              <span className="text-[14.5px] font-extrabold text-[#191F28] min-w-[28px] tabular-nums text-left">
                                 {isAlreadyRebalanced ? "20%" : "20%"}
                              </span>
                              <span className="text-[13.5px] text-[#4E5968] font-semibold truncate flex-1 block">
                                 {isAlreadyRebalanced 
                                    ? "금리 변동 및 거시경제 지표 저항 보수 방어력 구비"
                                    : "경기 반등 및 실적 전망에 따른 주가 보합세 예상"}
                              </span>
                           </div>
                           
                           {/* Negative */}
                           <div className="flex items-center gap-2">
                              <span className="w-10 h-[21px] flex items-center justify-center bg-[#EA6A65] text-white text-[12px] font-bold rounded-full shrink-0 select-none leading-none">
                                 부정
                              </span>
                              <span className="text-[14.5px] font-extrabold text-[#191F28] min-w-[28px] tabular-nums text-left">
                                 {isAlreadyRebalanced ? "5%" : "50%"}
                              </span>
                              <span className="text-[13.5px] text-[#4E5968] font-semibold truncate flex-1 block">
                                 {isAlreadyRebalanced 
                                    ? "개별 고위험 자산 집중 리스크 대부분 해소 완료"
                                    : "단일 기술 기업 자산 편중이 지나치게 커 시장 방어력 취약"}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Paragraph 02: 나의 투자 성향 */}
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="bg-[#4B80EB] text-white rounded-[5px] w-[32px] h-[22px] flex items-center justify-center font-extrabold text-[16px] shrink-0 select-none leading-none">
                           02
                        </span>
                        <span className="text-[16px] font-bold text-[#191F28]">나의 투자 성향</span>
                     </div>
                     <div className="pl-[33px] space-y-1">
                        <div className="text-[15.5px] font-extrabold text-[#333D4B]">
                           {isAlreadyRebalanced ? "균형 성장형" : "안정 추구형"}
                        </div>
                        <div className="text-[14px] text-[#4E5968] leading-relaxed font-semibold">
                           {isAlreadyRebalanced 
                              ? "주식과 안전 실물 자산이 고르게 분산 설계되어 시장 하락 저항력과 자산 배분의 기하학적 균형이 최상으로 맞춰진 상태입니다." 
                              : "현재 핵심 자산의 변동성이 과하게 높은 상태이나, 안전 자산 보강을 통해 자금 손실 구간을 효과적으로 방어할 수 있는 투자 상태입니다."}
                        </div>
                     </div>
                  </div>

                  {/* Paragraph 03: AI 진단 의견 */}
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="bg-[#4B80EB] text-white rounded-[5px] w-[32px] h-[22px] flex items-center justify-center font-extrabold text-[16px] shrink-0 select-none leading-none">
                           03
                        </span>
                        <span className="text-[16px] font-bold text-[#191F28]">AI 진단 의견</span>
                     </div>
                     <div className="pl-[33px]">
                        {isAlreadyRebalanced ? (
                           <p className="text-[14px] leading-relaxed text-[#4E5968] font-semibold">
                              포트폴리오가 고르게 복합 배분되었으며, 시장 상황 변화에 저항력이 강하고 Sharpe 지수가 극대화된 우량 가치 상태입니다.
                           </p>
                        ) : (
                           <p className="text-[14px] leading-relaxed text-[#4E5968] font-semibold">
                              {accountId === 'main' 
                                 ? "특정 주식(SK하이닉스 62.6%) 자산 편중이 지나치게 커 시장 하강 시 방어 메커니즘이 약화된 상태입니다." 
                                 : "자료 편중도 극대화 상태(NAVER 100%)로, 지수 대비 베타(β) 불안정성이 매우 높습니다."}
                           </p>
                        )}
                     </div>
                  </div>
               </div>

               <Button 
                  onClick={handleRebalanceClick}
                  className={cn(
                     "w-full text-white font-bold py-3.5 text-sm flex items-center gap-2 justify-center rounded-[12px] shadow-sm transition duration-200 cursor-pointer shrink-0",
                     isAlreadyRebalanced 
                        ? "bg-slate-800 hover:bg-slate-900 border border-transparent" 
                        : "bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 border border-transparent"
                  )}
               >
                  {isAlreadyRebalanced ? (
                     <>
                        <Sliders className="w-4 h-4" />
                        포트폴리오 자산 구성 조정
                     </>
                  ) : (
                     "AI 진단하기"
                  )}
               </Button>
            </CardContent>
         </Card>

         <div className="flex flex-col gap-4 lg:h-[464px]">
            {/* 5. Risk Metrics */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
               <Card>
                  <CardContent className="p-5 flex flex-col h-full min-h-[120px]">
                     <div className="flex items-center gap-1.5 text-text-secondary cursor-help hover:text-text-primary transition-colors" title="시장 대비 변동성. 1보다 크면 더 많이 움직임">
                        <span className="text-sm font-bold">베타 (β)</span>
                        <Info className="w-3.5 h-3.5" />
                     </div>
                     <div className="mt-auto text-right">
                        <span className="text-3xl font-bold tracking-tight">{risk.beta}</span>
                     </div>
                  </CardContent>
               </Card>
               <Card>
                  <CardContent className="p-5 flex flex-col h-full min-h-[120px]">
                     <div className="flex items-center gap-1.5 text-text-secondary cursor-help hover:text-text-primary transition-colors" title="수익률의 표준편차. 낮을수록 안정적">
                        <span className="text-sm font-bold">변동성</span>
                        <Info className="w-3.5 h-3.5" />
                     </div>
                     <div className="mt-auto text-right">
                        <span className="text-3xl font-bold tracking-tight">{risk.volatility}%</span>
                     </div>
                  </CardContent>
               </Card>
               <Card>
                  <CardContent className="p-5 flex flex-col h-full min-h-[120px]">
                     <div className="flex items-center gap-1.5 text-text-secondary cursor-help hover:text-text-primary transition-colors" title="위험 대비 수익률. 높을수록 효율적">
                        <span className="text-sm font-bold">샤프지수</span>
                        <Info className="w-3.5 h-3.5" />
                     </div>
                     <div className="mt-auto text-right">
                        <span className="text-3xl font-bold tracking-tight">{risk.sharpe}</span>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* 4. PnL Contribution Bar Chart */}
            <Card className="flex-1 flex flex-col justify-between min-h-0 bg-white border border-border-color shadow-sm">
               <CardHeader className="pb-1 pt-4 px-5">
                  <CardTitle className="text-md font-bold text-text-primary">종목별 손익 기여도</CardTitle>
               </CardHeader>
               <CardContent className="flex-1 flex flex-col justify-center pb-2 px-5">
                  <div className="h-[245px] w-full mt-0">
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
               </CardContent>
            </Card>
         </div>
      </div>

      {/* Rebalance Result Modal */}
      {isRebalanceModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
           <Card className="w-full max-w-3xl shadow-2xl relative overflow-hidden rounded-[20px] border border-border-color bg-surface">
            
            {/* Top decorative gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-brand to-violet-500"></div>

            {isRebalancing ? (
               <CardContent className="p-12 flex flex-col items-center justify-center h-[460px] space-y-5">
                  <div className="relative flex items-center justify-center">
                     <span className="absolute animate-ping inline-flex h-12 w-12 rounded-full bg-brand/20 opacity-75"></span>
                     <RefreshCw className="w-10 h-10 text-brand animate-spin relative" />
                  </div>
                  <div className="text-center space-y-1.5">
                     <p className="text-base font-bold text-text-primary">최적 포트폴리오를 설계하는 중입니다</p>
                     <p className="text-xs text-text-secondary">MPT 평균분산최적화 연산 및 최근 6개월 팩터 트렌드를 수집 적용하고 있습니다...</p>
                  </div>
               </CardContent>
            ) : (
               <>
                  <button 
                     onClick={() => setIsRebalanceModalOpen(false)}
                     className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-bg-main text-text-secondary hover:text-text-primary transition-colors cursor-pointer z-10"
                  >
                     <X className="w-5 h-5" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-12">
                     
                     {/* Left Panel: Strategy & Settings (8 cols on big screen) */}
                     <div className="md:col-span-7 p-6 border-r border-border-color flex flex-col justify-between min-h-[500px]">
                        <div>
                           <div className="space-y-1 mb-5">
                              <div className="flex items-center gap-1.5 text-xs text-brand font-bold uppercase tracking-wider">
                                 <Sparkles className="w-3.5 h-3.5" />
                                 AI Healthcare Engine
                              </div>
                              <h2 className="text-xl font-extrabold text-text-primary">
                                 AI 최적화 자산 조정 전략
                              </h2>
                           </div>

                           {/* Tab buttons for Strategy Selection */}
                           <div className="grid grid-cols-3 gap-2 p-1 bg-[#F2F2F7] rounded-[12px] mb-5">
                              {[
                                 { id: 'safe', label: '🛡️ 안정 배분', color: 'emerald' },
                                 { id: 'balanced', label: '⚖️ AI 추천', color: 'teal' },
                                 { id: 'growth', label: '🚀 적극 성장', color: 'violet' }
                              ].map(strat => (
                                 <button
                                    key={strat.id}
                                    onClick={() => {
                                       if (!isExecuting) {
                                          setActiveStrategy(strat.id as any);
                                       }
                                    }}
                                    disabled={isExecuting}
                                    className={cn(
                                       "py-2 text-[12.5px] font-bold rounded-[9px] transition-all cursor-pointer text-center",
                                       activeStrategy === strat.id 
                                          ? "bg-white text-text-primary shadow-xs" 
                                          : "text-text-secondary hover:text-text-primary"
                                    )}
                                 >
                                    {strat.label}
                                 </button>
                              ))}
                           </div>

                           {/* Chosen Strategy details */}
                           {(() => {
                              const strat = getStrategyDetails();
                              return (
                                 <div className="space-y-4">
                                    <div className={cn("p-4 rounded-[12px] border text-xs leading-relaxed", strat.color)}>
                                       <h4 className="font-extrabold text-[13px] mb-1.5 flex items-center justify-between">
                                          <span>{strat.title}</span>
                                          <span className={cn("px-2 py-0.5 rounded-[6px] text-[10px] font-bold", strat.badgeColor)}>
                                             {activeStrategy === 'balanced' ? 'BEST RECOMMEND' : 'ALTERNATIVE'}
                                          </span>
                                       </h4>
                                       <p className="opacity-90">{strat.desc}</p>
                                    </div>

                                    {/* Weights comparison table bars */}
                                    <div className="space-y-3.5">
                                       <div className="flex justify-between items-center text-[11px] font-extrabold text-text-secondary px-1">
                                          <span>종목명 (Asset)</span>
                                          <div className="flex gap-12">
                                             <span>현재 비중</span>
                                             <span>조정 목표</span>
                                          </div>
                                       </div>
                                       <div className="space-y-2.5">
                                          {strat.items.map(item => {
                                             const isUp = item.action === 'buy';
                                              const diffVal = item.target - item.current;
                                             return (
                                                <div key={item.name} className="flex flex-col gap-1.5 p-2 rounded-[8px] bg-[#F2F2F7]/40 hover:bg-[#F2F2F7]/70 transition-colors">
                                                   <div className="flex justify-between items-center text-xs">
                                                      <span className="font-bold text-text-primary flex items-center gap-1.5">
                                                         {item.name}
                                                         <span className={cn(
                                                            "text-[9px] font-extrabold px-1 rounded-sm",
                                                            isUp ? "bg-up/10 text-up" : "bg-down/10 text-down"
                                                         )}>
                                                            {isUp ? '▲ 확대' : '▼ 축소'}
                                                         </span>
                                                      </span>
                                                      <div className="flex items-center gap-10 font-mono font-bold text-text-primary">
                                                         <span className="text-text-secondary text-[11px] tabular-nums">{item.current}%</span>
                                                         <span className="text-brand tabular-nums w-10 text-right">{item.target}%</span>
                                                      </div>
                                                   </div>
                                                   {/* Comparative indicator bar */}
                                                   <div className="w-full h-1.5 bg-[#E5E5EA] rounded-full relative overflow-hidden flex gap-0.5">
                                                      <div 
                                                         style={{ width: `${item.current}%` }} 
                                                         className="bg-slate-300 h-full rounded-l-full"
                                                      />
                                                      <div 
                                                         style={{ width: `${Math.abs(diffVal)}%` }} 
                                                         className={cn(
                                                            "h-full rounded-r-full",
                                                            isUp ? "bg-up" : "bg-down/50"
                                                         )}
                                                      />
                                                   </div>
                                                </div>
                                             );
                                          })}
                                       </div>
                                    </div>
                                 </div>
                              );
                           })()}
                        </div>

                        {/* Summary Risk Metrics Comparison footer */}
                        {(() => {
                           const strat = getStrategyDetails();
                           return (
                              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-border-color text-center mt-4">
                                 <div className="bg-bg-main p-2 rounded-[10px]">
                                    <div className="text-[10px] text-text-secondary font-bold">베타 (β)</div>
                                    <div className="flex justify-center items-center gap-1 mt-0.5">
                                       <span className="text-[11px] text-text-secondary line-through font-mono">{risk.beta}</span>
                                       <ArrowRight className="w-3 h-3 text-text-secondary" />
                                       <span className="text-xs font-extrabold text-text-primary font-mono">{strat.beta}</span>
                                    </div>
                                 </div>
                                 <div className="bg-bg-main p-2 rounded-[10px]">
                                    <div className="text-[10px] text-text-secondary font-bold">변동성</div>
                                    <div className="flex justify-center items-center gap-1 mt-0.5">
                                       <span className="text-[11px] text-text-secondary line-through font-mono">{risk.volatility}%</span>
                                       <ArrowRight className="w-3 h-3 text-text-secondary" />
                                       <span className="text-xs font-extrabold text-text-primary font-mono">{strat.volatility}%</span>
                                    </div>
                                 </div>
                                 <div className="bg-bg-main p-2 rounded-[10px]">
                                    <div className="text-[10px] text-text-secondary font-bold">샤프지수</div>
                                    <div className="flex justify-center items-center gap-1 mt-0.5">
                                       <span className="text-[11px] text-text-secondary line-through font-mono">{risk.sharpe}</span>
                                       <ArrowRight className="w-3 h-3 text-text-secondary" />
                                       <span className="text-xs font-extrabold text-[#4A5DF9] font-mono">{strat.sharpe}</span>
                                    </div>
                                 </div>
                              </div>
                           );
                        })()}
                     </div>

                     {/* Right Panel: Simulated execution Console (5 cols on big screen) */}
                     <div className="md:col-span-5 p-6 bg-[#0c1017] text-slate-300 flex flex-col justify-between min-h-[500px]">
                        
                        <div className="flex-1 flex flex-col h-full">
                           <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                              <span className="text-xs font-extrabold text-emerald-400 tracking-wider flex items-center gap-1">
                                 <Sliders className="w-3.5 h-3.5" />
                                 거래 캠페인 콘솔
                              </span>
                              <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 font-bold rounded">Simulated</span>
                           </div>

                           {!isExecuting && executionLogs.length === 0 ? (
                              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                 <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 mb-3">
                                    <Info className="w-5 h-5 text-brand" />
                                 </div>
                                 <p className="text-xs font-bold text-white mb-1.5">거래 전송 대기 중</p>
                                 <p className="text-[10.5px] text-text-secondary leading-relaxed max-w-[180px]">
                                    왼쪽 탭에서 전략을 확인한 후 '리밸런싱 일괄 실행' 버튼을 누르면 실시간 시뮬레이션 매매 주문이 개시됩니다.
                                 </p>
                              </div>
                           ) : (
                              <div className="flex-1 flex flex-col">
                                 {/* Progress Bar inside Console */}
                                 <div className="mb-4">
                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                                       <span>주문 처리율</span>
                                       <span className="font-mono text-emerald-400">{executionProgress}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                       <div 
                                          className="h-full bg-emerald-400 transition-all duration-300" 
                                          style={{ width: `${executionProgress}%` }}
                                       ></div>
                                    </div>
                                 </div>

                                 {/* Live Log Board */}
                                 <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2.5 max-h-[250px] scrollbar-thin scrollbar-thumb-white/15 pr-1">
                                    {executionLogs.map((log, idx) => {
                                       let itemColor = "text-slate-300";
                                       if (log.includes("🟢") || log.includes("🎉")) itemColor = "text-emerald-400";
                                       if (log.includes("🔵")) itemColor = "text-[#32ADE6]";
                                       if (log.includes("💰")) itemColor = "text-amber-300";
                                       return (
                                          <div key={idx} className={itemColor}>
                                             {log}
                                          </div>
                                       );
                                    })}
                                    {isExecuting && executionProgress < 100 && (
                                       <div className="flex items-center gap-1.5 text-[10px] text-slate-500 italic animate-pulse">
                                          <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                                          시스템에서 대량 주문 체결 처리 대기 중...
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* Trigger / Done buttons */}
                        <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                           {isExecuting ? (
                              <Button
                                 disabled
                                 className="w-full bg-slate-800 text-white font-bold py-3.5 text-xs rounded-[12px] cursor-not-allowed flex items-center gap-2 justify-center"
                              >
                                 <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                                 리밸런싱 캠페인 처리하는 중 ({executionProgress}%)
                              </Button>
                           ) : executionProgress === 100 ? (
                              <div className="space-y-2">
                                 <div className="bg-emerald-500/10 p-2.5 rounded-[10px] border border-emerald-500/20 text-center text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    포트폴리오 자산 배분 완료!
                                 </div>
                                 <Button
                                    onClick={() => setIsRebalanceModalOpen(false)}
                                    className="w-full bg-[#4A5DF9] hover:bg-[#4A5DF9]/95 text-white font-extrabold py-3.5 text-xs rounded-[12px] cursor-pointer"
                                 >
                                    마무리하고 내 계좌 돌아가기
                                 </Button>
                              </div>
                           ) : (
                              <div className="grid grid-cols-5 gap-2">
                                 <Button
                                    onClick={() => handleExecuteRebalance()}
                                    className="col-span-5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold py-3.5 text-xs rounded-[12px] cursor-pointer flex items-center gap-1.5 justify-center shadow-md active:scale-98 transition duration-150"
                                 >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    리밸런싱 일괄 실행 (One-Touch Trade)
                                 </Button>
                              </div>
                           )}
                           
                           <Button 
                              onClick={() => setIsRebalanceModalOpen(false)}
                              className="w-full bg-slate-900 border border-white/10 hover:bg-slate-850 hover:border-white/20 text-slate-400 hover:text-white font-bold py-2.5 text-xs rounded-[12px] cursor-pointer"
                           >
                              창 닫기
                           </Button>
                        </div>

                     </div>

                  </div>
               </>
            )}
           </Card>
         </div>
      )}

    </div>
  );
}


