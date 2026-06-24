import React, { useState } from 'react';
import { Card, CardContent } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { ArrowLeft, X, Search, Plus, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { cn } from '@/src/lib/utils';
import { STOCKS_DATA } from './Stocks';

const LINE_COLORS = [
  'var(--color-brand)', // 브랜드 컬러 (주 컬러)
  '#007AFF',            // 네온 블루
  '#34C759',            // 그린
  '#AF52DE',            // 퍼플
  '#FF9500',            // 오렌지
  '#FF3B30',            // 레드
  '#5AC8FA',            // 연한 블루
  '#FFCC00',            // 옐로우
];

export function Compare() {
  const [activePeriod, setActivePeriod] = useState('1개월');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // localStorage에서 체크된 종목 코드 가져오기
  const [compareCodes, setCompareCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('compare_stocks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddCode = (code: string) => {
    if (compareCodes.includes(code)) return;
    const next = [...compareCodes, code];
    setCompareCodes(next);
    localStorage.setItem('compare_stocks', JSON.stringify(next));
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleRemoveCode = (code: string) => {
    const next = compareCodes.filter(c => c !== code);
    setCompareCodes(next);
    localStorage.setItem('compare_stocks', JSON.stringify(next));
  };

  const handleReset = () => {
    setCompareCodes([]);
    localStorage.removeItem('compare_stocks');
  };

  // 실제로 보여줄 필터 코드 목록 (아무것도 없으면 삼성전자, SK하이닉스 예시 노출)
  const isDefaultExample = compareCodes.length === 0;
  const displayCodes = !isDefaultExample ? compareCodes : ['005930', '000660'];

  const activeCompareStocks = STOCKS_DATA.filter(s => displayCodes.includes(s.code));

  // 검색어에 따른 자동완성 종목
  const suggestions = STOCKS_DATA.filter(s => {
    const matchText = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.includes(searchQuery);
    const notSelected = !compareCodes.includes(s.code);
    return searchQuery ? (matchText && notSelected) : notSelected;
  });

  // 선택된 기간에 따른 데이터 포인트 수 지정
  const points = activePeriod === '1개월' ? 30 : activePeriod === '3개월' ? 90 : activePeriod === '6개월' ? 180 : 365;

  const dynamicMockData = Array.from({ length: points }).map((_, i) => {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - (points - i));
    
    const row: any = {
      date: dateObj.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
    };
    
    activeCompareStocks.forEach((stock, sIdx) => {
      const codeSeed = parseInt(stock.code) || 12345;
      const sinVal = Math.sin(i * 0.15 + sIdx * 1.2 + codeSeed * 0.01);
      const cosVal = Math.sin(i * 0.05 - sIdx * 0.5);
      const trend = stock.change * (i / points) * 3;
      const val = (sinVal * 10) + (cosVal * 4) + trend;
      
      row[stock.name] = Number(val.toFixed(2));
    });
    return row;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Link to="/stocks" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">종목 비교 차트</h1>
          {isDefaultExample && (
            <p className="text-xs text-text-secondary mt-1">
              💡 체크된 종목이 없어 기본 예시(삼성전자, SK하이닉스)를 표시하고 있습니다. 주식 목록에서 비교하고 싶은 종목의 <span className="font-semibold text-brand">+</span> 버튼을 눌러보세요!
            </p>
          )}
        </div>
        {!isDefaultExample && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="flex items-center gap-1.5 self-start sm:self-center text-xs text-text-secondary border-border-color hover:bg-bg-main"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            전체 초기화
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
                <Input 
                  placeholder="종목 추가 검색..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-9 w-full sm:w-56 bg-bg-main" 
                />
                
                {/* Auto Suggestions dropdown */}
                {showSuggestions && (searchQuery || suggestions.length > 0) && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />
                    <div className="absolute top-full left-0 mt-1 w-full max-h-60 overflow-y-auto bg-surface border border-border-color rounded-[12px] shadow-lg z-20 divide-y divide-border-color">
                      {suggestions.length > 0 ? (
                        suggestions.map(s => (
                          <div 
                            key={s.code}
                            onClick={() => handleAddCode(s.code)}
                            className="px-4 py-3 hover:bg-bg-main cursor-pointer flex justify-between items-center transition-colors text-sm"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary">{s.name}</span>
                              <span className="text-xs text-text-secondary">{s.code}</span>
                            </div>
                            <Button size="xs" variant="outline" className="h-6 w-6 p-0 shrink-0">
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-xs text-text-secondary text-center">검색 결과가 없습니다</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Dynamic Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {activeCompareStocks.map((stock, idx) => {
                  const color = LINE_COLORS[idx % LINE_COLORS.length];
                  return (
                    <Badge 
                      key={stock.code}
                      style={{ backgroundColor: `transparent`, color: color, borderColor: `${color}40` }}
                      className="border py-1 px-3 text-xs flex items-center gap-1.5 font-semibold rounded-[12px]"
                    >
                      {stock.name} 
                      {!isDefaultExample && compareCodes.includes(stock.code) && (
                        <X 
                          className="w-3.5 h-3.5 cursor-pointer hover:scale-110 active:scale-95 transition-transform text-current" 
                          onClick={() => handleRemoveCode(stock.code)} 
                        />
                      )}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="flex bg-bg-main p-1 rounded-[16px] border border-border-color self-end md:self-auto">
              {['1개월', '3개월', '6개월', '1년'].map(t => (
                <button 
                  key={t}
                  onClick={() => setActivePeriod(t)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-semibold rounded-[12px] transition-colors",
                    activePeriod === t 
                      ? "bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-brand border border-border-color/50" 
                      : "text-text-secondary hover:text-text-primary border border-transparent"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[430px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dynamicMockData} margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5EA" />
                <XAxis dataKey="date" tick={{ fill: '#8E8E93', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis 
                   tick={{ fill: '#8E8E93', fontSize: 11 }} 
                   axisLine={false} 
                   tickLine={false} 
                   tickFormatter={(val) => `${val > 0 ? '+' : ''}${val.toFixed(1)}%`}
                   dx={-5}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: '#fff', color: '#1C1C1E', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  labelStyle={{ color: '#8E8E93', marginBottom: '4px' }}
                  itemStyle={{ padding: '2px 0' }}
                  formatter={(value: number) => [`${value > 0 ? '+' : ''}${value.toFixed(2)}%`]}
                />
                <ReferenceLine y={0} stroke="#8E8E93" strokeDasharray="3 3" strokeWidth={1} />
                {activeCompareStocks.map((stock, idx) => (
                  <Line 
                    key={stock.code}
                    type="monotone" 
                    dataKey={stock.name} 
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]} 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
