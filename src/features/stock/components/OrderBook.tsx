import React from 'react';
import { Card, CardContent } from '@/src/shared/components/ui/Card';

export function OrderBook() {
  const sellOrders = Array.from({ length: 10 }).map((_, i) => ({
    price: 270000 + (10 - i) * 500,
    qty: Math.floor(Math.random() * 50000 + 10000),
    ratio: Math.random() * 0.8 + 0.1
  }));

  const buyOrders = Array.from({ length: 10 }).map((_, i) => ({
    price: 269000 - i * 500,
    qty: Math.floor(Math.random() * 50000 + 10000),
    ratio: Math.random() * 0.8 + 0.1
  }));

  const totalSell = sellOrders.reduce((acc, cur) => acc + cur.qty, 0);
  const totalBuy = buyOrders.reduce((acc, cur) => acc + cur.qty, 0);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 p-4 border-b border-border-color">
          <h3 className="font-bold">호가</h3>
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
        </div>

        <div className="w-full text-sm">
          {/* Sell Orders */}
          <div className="flex flex-col">
            {sellOrders.map((order, i) => (
              <div key={i} className="flex relative h-[28px] items-center bg-[#007AFF]/[0.05]">
                 <div className="absolute top-0 right-1/2 bottom-0 bg-[#007AFF]/20" style={{ width: `${order.ratio * 50}%` }}></div>
                 <div className="flex-1 flex justify-between px-4 z-10">
                   <div className="text-text-secondary w-1/2 text-right tabular-nums pr-4">{order.qty.toLocaleString()}</div>
                   <div className="text-[#007AFF] font-medium w-1/2 tabular-nums">{order.price.toLocaleString()}</div>
                 </div>
              </div>
            ))}
          </div>

          {/* Current Price Divider */}
          <div className="flex items-center h-[36px] bg-[#1CBC9A]/15 border-y border-border-color px-4">
             <div className="w-1/2 flex justify-end pr-4 text-[#007AFF] text-[13px] font-medium">▼ -0.83%</div>
             <div className="w-1/2 text-[#1C1C1E] font-bold text-[15px] tabular-nums">269,250</div>
          </div>

          {/* Buy Orders */}
          <div className="flex flex-col">
            {buyOrders.map((order, i) => (
              <div key={i} className="flex relative h-[28px] items-center bg-[#FF3B30]/[0.05]">
                 <div className="absolute top-0 left-1/2 bottom-0 bg-[#FF3B30]/20" style={{ width: `${order.ratio * 50}%` }}></div>
                 <div className="flex-1 flex justify-between px-4 z-10">
                   <div className="w-1/2"></div>
                   <div className="text-[#FF3B30] font-medium w-1/2 tabular-nums -ml-full flex justify-between w-full">
                      <div className="w-1/2 text-left tabular-nums">{order.price.toLocaleString()}</div>
                      <div className="text-text-secondary w-1/2 text-right tabular-nums">{order.qty.toLocaleString()}</div>
                   </div>
                 </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-4 border-t border-border-color text-xs tabular-nums">
             <div className="w-1/2 pr-4 text-right font-medium text-[#007AFF]">매도잔량 {totalSell.toLocaleString()}</div>
             <div className="w-1/2 pl-4 text-left font-medium text-[#FF3B30]">매수잔량 {totalBuy.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
