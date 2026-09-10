import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/src/shared/components/ui/Card';
import { formatPrice, formatPercent } from '@/src/shared/lib/utils';
import { getOrderBook } from '@/src/features/stock/api/stock';

interface OrderBookProps {
  code: string;
  currentPrice: number;
  changeRate: number;
}

export function OrderBook({ code, currentPrice, changeRate }: OrderBookProps) {
  const orderBookQuery = useQuery({
    queryKey: ['stocks', 'orderbook', code],
    queryFn: () => getOrderBook(code),
    enabled: !!code,
    retry: false,
    // 호가는 초 단위로 계속 바뀌므로 주기적으로 다시 조회한다.
    refetchInterval: 5000,
  });
  const orderBook = orderBookQuery.data ?? null;

  const maxQty = orderBook
      ? Math.max(...orderBook.sellLevels.map((l) => l.quantity), ...orderBook.buyLevels.map((l) => l.quantity), 1)
      : 1;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-2 p-4 border-b border-border-color">
          <h3 className="font-bold">호가</h3>
          <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></span>
        </div>

        {orderBookQuery.isLoading ? (
          <div className="p-10 text-center text-sm text-text-secondary">불러오는 중...</div>
        ) : orderBookQuery.isError || !orderBook ? (
          <div className="p-10 text-center text-sm text-text-secondary">호가 정보를 불러오지 못했습니다.</div>
        ) : (
          <div className="w-full text-sm">
            {/* Sell Orders */}
            <div className="flex flex-col">
              {orderBook.sellLevels.map((order, i) => (
                <div key={i} className="flex relative h-[28px] items-center bg-[#007AFF]/[0.05]">
                   <div className="absolute top-0 right-1/2 bottom-0 bg-[#007AFF]/20" style={{ width: `${(order.quantity / maxQty) * 50}%` }}></div>
                   <div className="flex-1 flex justify-between px-4 z-10">
                     <div className="text-text-secondary w-1/2 text-right tabular-nums pr-4">{order.quantity.toLocaleString()}</div>
                     <div className="text-[#007AFF] font-medium w-1/2 tabular-nums">{order.price.toLocaleString()}</div>
                   </div>
                </div>
              ))}
            </div>

            {/* Current Price Divider */}
            <div className="flex items-center h-[36px] bg-[#1CBC9A]/15 border-y border-border-color px-4">
               <div className={`w-1/2 flex justify-end pr-4 text-[13px] font-medium ${changeRate >= 0 ? 'text-[#FF3B30]' : 'text-[#007AFF]'}`}>
                 {changeRate >= 0 ? '▲' : '▼'} {formatPercent(changeRate)}
               </div>
               <div className="w-1/2 text-[#1C1C1E] font-bold text-[15px] tabular-nums">{formatPrice(currentPrice)}</div>
            </div>

            {/* Buy Orders */}
            <div className="flex flex-col">
              {orderBook.buyLevels.map((order, i) => (
                <div key={i} className="flex relative h-[28px] items-center bg-[#FF3B30]/[0.05]">
                   <div className="absolute top-0 left-1/2 bottom-0 bg-[#FF3B30]/20" style={{ width: `${(order.quantity / maxQty) * 50}%` }}></div>
                   <div className="flex-1 flex justify-between px-4 z-10">
                     <div className="w-1/2"></div>
                     <div className="text-[#FF3B30] font-medium w-1/2 tabular-nums -ml-full flex justify-between w-full">
                        <div className="w-1/2 text-left tabular-nums">{order.price.toLocaleString()}</div>
                        <div className="text-text-secondary w-1/2 text-right tabular-nums">{order.quantity.toLocaleString()}</div>
                     </div>
                   </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-border-color text-xs tabular-nums">
               <div className="w-1/2 pr-4 text-right font-medium text-[#007AFF]">매도잔량 {orderBook.totalSellQuantity.toLocaleString()}</div>
               <div className="w-1/2 pl-4 text-left font-medium text-[#FF3B30]">매수잔량 {orderBook.totalBuyQuantity.toLocaleString()}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
