import React, { useState } from "react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";

// Helper to generate mock candlestick data
const generateData = () => {
  const data = [];
  let currentPrice = 280000;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);

  for (let i = 0; i < 60; i++) {
    const isDownTrend = i < 20;
    const isConsolidation = i >= 20 && i < 40;
    const isUpTrend = i >= 40;

    let volatility = 5000;
    let trendMove = 0;
    if (isDownTrend) {
      trendMove = -3000;
      volatility = 8000;
    }
    if (isConsolidation) {
      trendMove = 0;
      volatility = 3000;
    }
    if (isUpTrend) {
      trendMove = 4000;
      volatility = 6000;
    }

    const open = currentPrice + (Math.random() - 0.5) * volatility;
    const close = open + trendMove + (Math.random() - 0.5) * volatility;
    const minPrice = Math.min(open, close);
    const maxPrice = Math.max(open, close);
    const low = minPrice - Math.random() * (volatility * 0.5);
    const high = maxPrice + Math.random() * (volatility * 0.5);
    const volume = Math.max(
      1000000,
      Math.random() * 8000000 + (isUpTrend ? 2000000 : 0),
    );

    // MA simulation
    const ma5 = close + (Math.random() - 0.5) * 2000;
    const ma20 =
      close +
      (Math.random() - 0.5) * 5000 -
      (isUpTrend ? 5000 : isDownTrend ? -5000 : 0);
    const ma60 = 265000;

    // Bollinger
    const ub = ma20 + 8000;
    const lb = ma20 - 8000;

    // RSI
    const rsi = isUpTrend
      ? 60 + Math.random() * 20
      : isDownTrend
        ? 40 - Math.random() * 20
        : 50 + (Math.random() * 10 - 5);

    // MACD
    const macd = isUpTrend
      ? 2000 + Math.random() * 1000
      : isDownTrend
        ? -2000 - Math.random() * 1000
        : Math.random() * 1000 - 500;
    const signal = macd - (Math.random() * 500 - 250);

    data.push({
      date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        .toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\./g, "")
        .replace(/ /g, "."),
      open,
      high,
      low,
      close,
      volume,
      ma5,
      ma20,
      ma60,
      ub,
      lb,
      rsi,
      macd,
      signal,
      hist: macd - signal,
    });
    currentPrice = close;
  }
  return data;
};

const CHART_DATA = generateData();
const MY_AVG_PRICE = 269250;

export function AdvancedStockChart({
  hideControlsAndIndicators = false,
  noCardStyle = false,
}: {
  hideControlsAndIndicators?: boolean;
  noCardStyle?: boolean;
}) {
  const [activeIndicators, setActiveIndicators] = useState({
    ma: !hideControlsAndIndicators,
    bollinger: false,
    rsi: !hideControlsAndIndicators,
    macd: !hideControlsAndIndicators,
  });
  const [timeUnit, setTimeUnit] = useState("일");
  const [hoverIndex, setHoverIndex] = useState<number | null>(15);

  const toggleIndicator = (key: keyof typeof activeIndicators) => {
    setActiveIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Rendering helpers
  const maxPrice = Math.max(
    ...CHART_DATA.map((d) => Math.max(d.high, d.ub || 0)),
  );
  const minPrice = Math.min(
    ...CHART_DATA.map((d) => Math.min(d.low, d.lb || 1000000)),
  );
  const priceRange = maxPrice - minPrice;

  const getY = (val: number, h: number) =>
    h - ((val - minPrice) / priceRange) * h;
  const getX = (index: number, w: number, total: number) =>
    (w / total) * index + w / total / 2;

  const maxVol = Math.max(...CHART_DATA.map((d) => d.volume));

  return (
    <Card
      className={cn(
        "overflow-hidden",
        noCardStyle ? "border-0 shadow-none bg-transparent" : "",
      )}
    >
      <CardContent
        className={cn("p-0", noCardStyle ? "" : "border-b border-border-color")}
      >
        {/* Section A: Chart Control Bar */}
        {!hideControlsAndIndicators && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 bg-surface">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "ma", label: "이동평균" },
                { id: "bollinger", label: "볼린저밴드" },
                { id: "rsi", label: "RSI" },
                { id: "macd", label: "MACD" },
              ].map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => toggleIndicator(ind.id as any)}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-semibold rounded-[6px] border transition-all duration-200",
                    activeIndicators[ind.id as keyof typeof activeIndicators]
                      ? "border-[#636C7D] bg-[#636C7D] text-white"
                      : "border-border-color bg-white text-text-secondary hover:bg-bg-main hover:text-text-primary",
                  )}
                >
                  {ind.label}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              {["분", "일", "주", "월"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeUnit(t)}
                  className={cn(
                    "pb-1 text-sm transition-colors font-medium relative border-b-2",
                    timeUnit === t
                      ? "text-[#636C7D] border-[#636C7D] font-bold"
                      : "text-text-secondary border-transparent hover:text-text-primary",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div
          className="p-4 bg-surface space-y-2 relative"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Section B: Main Candlestick Chart */}
          <div className="relative w-full h-[420px]">
            {/* Y-Axis Labels */}
            <div className="absolute right-0 top-0 bottom-0 w-[60px] flex flex-col justify-between text-[12px] text-text-secondary items-end z-0">
              {[1, 0.75, 0.5, 0.25, 0].map((pct) => (
                <span key={pct} className="-translate-y-1/2">
                  {Math.floor(minPrice + priceRange * pct).toLocaleString()}
                </span>
              ))}
            </div>

            <svg
              className="w-[calc(100%-65px)] h-full absolute left-0"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const index = Math.floor(
                  (e.clientX - rect.left) / (rect.width / CHART_DATA.length),
                );
                if (index >= 0 && index < CHART_DATA.length)
                  setHoverIndex(index);
              }}
            >
              {/* Grid */}
              {[0.25, 0.5, 0.75].map((pct) => (
                <line
                  key={pct}
                  x1="0"
                  y1={420 * pct}
                  x2="100%"
                  y2={420 * pct}
                  stroke="#F2F2F7"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Bollinger Bands Fill */}
              {activeIndicators.bollinger && (
                <polygon
                  points={
                    CHART_DATA.map(
                      (d, i) => `${getX(i, 1000, 60)}%,${getY(d.ub, 420)}`,
                    ).join(" ") +
                    " " +
                    CHART_DATA.map(
                      (d, i) => `${getX(i, 1000, 60)}%,${getY(d.lb, 420)}`,
                    )
                      .reverse()
                      .join(" ")
                  }
                  fill="rgba(142,142,147,0.06)"
                />
              )}
              {/* Bollinger Band Lines */}
              {activeIndicators.bollinger && (
                <>
                  <polyline
                    points={CHART_DATA.map(
                      (d, i) => `${getX(i, 1000, 60)}%,${getY(d.ub, 420)}`,
                    ).join(" ")}
                    fill="none"
                    stroke="#8E8E93"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <polyline
                    points={CHART_DATA.map(
                      (d, i) => `${getX(i, 1000, 60)}%,${getY(d.lb, 420)}`,
                    ).join(" ")}
                    fill="none"
                    stroke="#8E8E93"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                </>
              )}

              {/* Moving Averages */}
              {activeIndicators.ma && (
                <>
                  <polyline
                    points={CHART_DATA.map(
                      (d, i) => `${getX(i, 1000, 60)}%,${getY(d.ma5, 420)}`,
                    ).join(" ")}
                    fill="none"
                    stroke="#FF9500"
                    strokeWidth="1.5"
                  />
                  <polyline
                    points={CHART_DATA.map(
                      (d, i) => `${getX(i, 1000, 60)}%,${getY(d.ma20, 420)}`,
                    ).join(" ")}
                    fill="none"
                    stroke="#1CBC9A"
                    strokeWidth="1.5"
                  />
                  <polyline
                    points={CHART_DATA.map(
                      (d, i) => `${getX(i, 1000, 60)}%,${getY(d.ma60, 420)}`,
                    ).join(" ")}
                    fill="none"
                    stroke="#BF5AF2"
                    strokeWidth="1.5"
                  />
                </>
              )}

              {/* Candles */}
              {CHART_DATA.map((d, i) => {
                const x = getX(i, 100, 60);
                const yOpen = getY(d.open, 420);
                const yClose = getY(d.close, 420);
                const yHigh = getY(d.high, 420);
                const yLow = getY(d.low, 420);
                const isUp = d.close >= d.open;
                const color =
                  Math.abs(d.close - d.open) < 500
                    ? "#8E8E93"
                    : isUp
                      ? "#FF3B30"
                      : "#007AFF";
                const boxY = Math.min(yOpen, yClose);
                const boxH = Math.max(1, Math.abs(yClose - yOpen));

                return (
                  <g key={i}>
                    <line
                      x1={`${x}%`}
                      y1={yHigh}
                      x2={`${x}%`}
                      y2={yLow}
                      stroke={color}
                      strokeWidth="1"
                    />
                    <rect
                      x={`calc(${x}% - 4px)`}
                      y={boxY}
                      width="8"
                      height={boxH}
                      fill={color}
                    />
                  </g>
                );
              })}

              {/* My Avg Price */}
              <line
                x1="0"
                y1={getY(MY_AVG_PRICE, 420)}
                x2="100%"
                y2={getY(MY_AVG_PRICE, 420)}
                stroke="#FF9500"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <foreignObject
                x="10"
                y={getY(MY_AVG_PRICE, 420) - 10}
                width="150"
                height="20"
              >
                <div className="bg-[#FF9500]/15 text-[#FF9500] text-[10px] font-bold px-2 py-0.5 rounded-[8px] inline-block">
                  내 평단가 {MY_AVG_PRICE.toLocaleString()}
                </div>
              </foreignObject>

              {/* Crosshair */}
              {hoverIndex !== null && (
                <line
                  x1={`${getX(hoverIndex, 100, 60)}%`}
                  y1="0"
                  x2={`${getX(hoverIndex, 100, 60)}%`}
                  y2="100%"
                  stroke="#8E8E93"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}
            </svg>

            {/* Legend MA */}
            {activeIndicators.ma && (
              <div className="absolute top-2 right-[70px] flex gap-3 text-[11px] font-semibold bg-surface/80 p-1.5 rounded-[8px] z-10">
                <span className="text-text-primary">
                  <span className="text-[#FF9500]">●</span> MA5
                </span>
                <span className="text-text-primary">
                  <span className="text-[#1CBC9A]">●</span> MA20
                </span>
                <span className="text-text-primary">
                  <span className="text-[#BF5AF2]">●</span> MA60
                </span>
              </div>
            )}

            {/* X-Axis Date Labels inside chart area bottom */}
            <div className="absolute bottom-0 left-0 w-[calc(100%-65px)] flex justify-between text-[11px] text-text-secondary pt-1">
              {["0", "14", "29", "44", "59"].map((i) => (
                <span key={i} className="px-2">
                  {CHART_DATA[Number(i)]?.date}
                </span>
              ))}
            </div>

            {/* Tooltip Hover Card */}
            {hoverIndex !== null && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  left: `min(max(10px, calc(${getX(hoverIndex, 100, 60)}% + 15px)), calc(100% - 160px))`,
                  top:
                    getY(CHART_DATA[hoverIndex].close, 420) > 210
                      ? "20px"
                      : "auto",
                  bottom:
                    getY(CHART_DATA[hoverIndex].close, 420) > 210
                      ? "auto"
                      : "20px",
                }}
              >
                <div className="bg-[#1C1C1E] text-white rounded-[12px] p-3 shadow-xl text-xs w-[140px]">
                  <div className="text-[#8E8E93] text-[11px] mb-2">
                    {CHART_DATA[hoverIndex].date}
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#F5F5F7]">시가</span>{" "}
                    <span className="tabular-nums font-medium">
                      {CHART_DATA[hoverIndex].open.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#FF3B30]">고가</span>{" "}
                    <span className="tabular-nums font-medium text-[#FF3B30]">
                      {CHART_DATA[hoverIndex].high.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#007AFF]">저가</span>{" "}
                    <span className="tabular-nums font-medium text-[#007AFF]">
                      {CHART_DATA[hoverIndex].low.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-[#F5F5F7]">종가</span>{" "}
                    <span className="tabular-nums font-bold text-[#F5F5F7]">
                      {CHART_DATA[hoverIndex].close.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between mb-1">
                    <span className="text-[#FF9500]">내 평단가</span>{" "}
                    <span className="tabular-nums text-[#FF9500]">
                      {MY_AVG_PRICE.toLocaleString()}
                    </span>
                  </div>
                  {activeIndicators.ma && (
                    <div className="flex justify-between mb-1">
                      <span className="text-[#FF9500]">MA5</span>{" "}
                      <span className="tabular-nums text-[#FF9500]">
                        {Math.floor(
                          CHART_DATA[hoverIndex].ma5,
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {activeIndicators.rsi && (
                    <div className="flex justify-between">
                      <span className="text-[#1CBC9A]">RSI(14)</span>{" "}
                      <span className="tabular-nums text-[#1CBC9A]">
                        {CHART_DATA[hoverIndex].rsi.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-2"></div>

          {/* Section C: Volume Chart */}
          <div className="relative w-full h-[80px]">
            <div className="absolute right-0 top-0 bottom-0 w-[60px] flex flex-col justify-between text-[10px] text-text-secondary items-end z-0">
              <span>{(maxVol / 1000000).toFixed(1)}M</span>
              <span>{(maxVol / 2000000).toFixed(1)}M</span>
              <span>0</span>
            </div>
            {/* Avg Volume line */}
            <div className="absolute top-[50%] left-0 w-[calc(100%-65px)] border-t border-[#8E8E93]/50 border-dashed z-0">
              <span className="text-[9px] text-[#8E8E93] ml-1 bg-surface relative -top-2 px-1">
                평균거래량
              </span>
            </div>
            <svg
              className="w-[calc(100%-65px)] h-full absolute left-0 z-10"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const index = Math.floor(
                  (e.clientX - rect.left) / (rect.width / CHART_DATA.length),
                );
                if (index >= 0 && index < CHART_DATA.length)
                  setHoverIndex(index);
              }}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {CHART_DATA.map((d, i) => {
                const x = getX(i, 100, 60);
                const h = (d.volume / maxVol) * 80;
                const isUp = d.close >= d.open;
                const color =
                  Math.abs(d.close - d.open) < 500
                    ? "rgba(142,142,147,0.4)"
                    : isUp
                      ? "rgba(255,59,48,0.4)"
                      : "rgba(0,122,255,0.4)";
                return (
                  <rect
                    key={i}
                    x={`calc(${x}% - 4px)`}
                    y={80 - h}
                    width="8"
                    height={h}
                    fill={color}
                  />
                );
              })}
              {hoverIndex !== null && (
                <line
                  x1={`${getX(hoverIndex, 100, 60)}%`}
                  y1="0"
                  x2={`${getX(hoverIndex, 100, 60)}%`}
                  y2="100%"
                  stroke="#8E8E93"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}
            </svg>
          </div>

          {/* Section D: RSI Sub-chart */}
          {activeIndicators.rsi && (
            <div className="relative w-full h-[100px] mt-2 border-t border-border-color pt-2">
              <div className="absolute left-2 top-2 text-[11px] text-text-secondary font-bold z-10">
                RSI (14)
              </div>
              <div
                className="absolute right-[70px] top-2 text-[11px] font-bold z-10"
                style={{
                  color:
                    CHART_DATA[hoverIndex || CHART_DATA.length - 1].rsi > 70
                      ? "#FF3B30"
                      : CHART_DATA[hoverIndex || CHART_DATA.length - 1].rsi < 30
                        ? "#007AFF"
                        : "#1CBC9A",
                }}
              >
                RSI{" "}
                {CHART_DATA[hoverIndex || CHART_DATA.length - 1].rsi.toFixed(1)}
              </div>

              <div className="absolute right-0 top-0 bottom-0 w-[60px] flex flex-col justify-between text-[10px] text-text-secondary items-end z-0 h-full py-1">
                <span className="text-[#FF3B30]">과매수 70</span>
                <span>50</span>
                <span className="text-[#007AFF]">과매도 30</span>
              </div>

              <svg
                className="w-[calc(100%-65px)] h-full absolute left-0 z-10"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const index = Math.floor(
                    (e.clientX - rect.left) / (rect.width / CHART_DATA.length),
                  );
                  if (index >= 0 && index < CHART_DATA.length)
                    setHoverIndex(index);
                }}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <line
                  x1="0"
                  y1="30%"
                  x2="100%"
                  y2="30%"
                  stroke="#FF3B30"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke="rgba(142,142,147,0.3)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1="0"
                  y1="70%"
                  x2="100%"
                  y2="70%"
                  stroke="#007AFF"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="30%"
                  fill="rgba(255,59,48,0.08)"
                />
                <rect
                  x="0"
                  y="70%"
                  width="100%"
                  height="30%"
                  fill="rgba(0,122,255,0.08)"
                />

                <polyline
                  points={CHART_DATA.map(
                    (d, i) => `${getX(i, 1000, 60)}%,${100 - d.rsi}%`,
                  ).join(" ")}
                  fill="none"
                  stroke="#BF5AF2"
                  strokeWidth="1.5"
                />

                {hoverIndex !== null && (
                  <line
                    x1={`${getX(hoverIndex, 100, 60)}%`}
                    y1="0"
                    x2={`${getX(hoverIndex, 100, 60)}%`}
                    y2="100%"
                    stroke="#8E8E93"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
              </svg>
            </div>
          )}

          {/* Section E: MACD Sub-chart */}
          {activeIndicators.macd && (
            <div className="relative w-full h-[100px] mt-2 border-t border-border-color pt-2">
              <div className="absolute left-2 top-2 text-[11px] text-text-secondary font-bold z-10">
                MACD (12, 26, 9)
              </div>
              <div className="absolute right-[70px] top-2 flex gap-3 text-[11px] font-semibold bg-surface/80 p-0.5 rounded-[8px] z-10">
                <span className="text-text-primary">
                  <span className="text-[#1CBC9A]">●</span> MACD
                </span>
                <span className="text-text-primary">
                  <span className="text-[#FF9500]">●</span> Signal
                </span>
              </div>

              <div className="absolute right-0 top-[50%] w-[60px] text-right text-[10px] text-text-secondary -translate-y-1/2">
                0
              </div>

              <svg
                className="w-[calc(100%-65px)] h-full absolute left-0 z-10"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const index = Math.floor(
                    (e.clientX - rect.left) / (rect.width / CHART_DATA.length),
                  );
                  if (index >= 0 && index < CHART_DATA.length)
                    setHoverIndex(index);
                }}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <line
                  x1="0"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke="rgba(142,142,147,0.4)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />

                {/* Histogram */}
                {CHART_DATA.map((d, i) => {
                  const x = getX(i, 100, 60);
                  const maxVal = 4000;
                  const rh = Math.abs((d.hist / maxVal) * 50);
                  const ry = d.hist > 0 ? 50 - rh : 50;
                  const color =
                    d.hist > 0 ? "rgba(255,59,48,0.6)" : "rgba(0,122,255,0.6)";
                  return (
                    <rect
                      key={i}
                      x={`calc(${x}% - 2px)`}
                      y={`${ry}%`}
                      width="4"
                      height={`${rh}%`}
                      fill={color}
                    />
                  );
                })}

                {/* Lines */}
                <polyline
                  points={CHART_DATA.map(
                    (d, i) =>
                      `${getX(i, 1000, 60)}%,${50 - (d.macd / 4000) * 50}%`,
                  ).join(" ")}
                  fill="none"
                  stroke="#1CBC9A"
                  strokeWidth="1.5"
                />
                <polyline
                  points={CHART_DATA.map(
                    (d, i) =>
                      `${getX(i, 1000, 60)}%,${50 - (d.signal / 4000) * 50}%`,
                  ).join(" ")}
                  fill="none"
                  stroke="#FF9500"
                  strokeWidth="1.5"
                />

                {hoverIndex !== null && (
                  <line
                    x1={`${getX(hoverIndex, 100, 60)}%`}
                    y1="0"
                    x2={`${getX(hoverIndex, 100, 60)}%`}
                    y2="100%"
                    stroke="#8E8E93"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
              </svg>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
