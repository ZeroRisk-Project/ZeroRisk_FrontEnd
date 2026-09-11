import React from "react";
import { X } from "lucide-react";
import { formatPrice, cn } from "@/src/shared/lib/utils";

export const TRADES_PAGE_SIZE = 100;

export function formatTransactionDate(isoDateTime: string): string {
  return `${isoDateTime.slice(2, 10).replaceAll("-", ".")} ${isoDateTime.slice(11, 16)}`;
}

export interface TransactionDoneItem {
  type: string;
  stock: string;
  date: string;
  price: number;
  qty: number;
}

export interface TransactionPendingItem {
  orderId: number | null;
  type: string;
  stock: string;
  date: string;
  price: number;
  qty: number;
}

interface TransactionHistoryGridProps {
  subTab: "거래내역" | "미체결 내역";
  done: TransactionDoneItem[];
  pending: TransactionPendingItem[];
  onCancelOrder?: (orderId: number) => void;
}

export function TransactionHistoryGrid({ subTab, done, pending, onCancelOrder }: TransactionHistoryGridProps) {
  const pendingGridCols = onCancelOrder
    ? "grid-cols-[120px_1fr_60px_100px_70px_120px_40px]"
    : "grid-cols-[120px_1fr_60px_100px_70px_120px]";

  return (
    <div className="min-w-[600px] pb-6">
      {subTab === "거래내역" ? (
        <>
          <div className="grid grid-cols-[120px_1fr_60px_100px_70px_120px] items-center py-3 px-6 border-b border-[#F2F4F6] text-sm text-[#6B7684] font-semibold bg-[#F9FAFB]">
            <div>일시</div>
            <div className="px-2">종목명</div>
            <div>구분</div>
            <div className="text-right pr-2">단가</div>
            <div className="text-right pr-2">수량</div>
            <div className="text-right">결제금액</div>
          </div>
          {done.length === 0 ? (
            <div className="p-10 text-center text-[#8B95A1] text-sm">
              거래 내역이 없습니다.
            </div>
          ) : (
            done.map((log, idx) => {
              const isBuy = log.type === "buy";
              return (
                <div
                  key={idx}
                  className="grid grid-cols-[120px_1fr_60px_100px_70px_120px] items-center h-[52px] border-b border-[#F2F4F6] hover:bg-[#F9FAFB] px-6 transition-colors text-[14px]"
                >
                  <div className="text-[13px] text-[#8B95A1] whitespace-nowrap pr-2">{log.date}</div>
                  <div className="font-bold text-[#191F28] px-2 truncate">{log.stock}</div>
                  <div>
                    <span className={cn(
                      "text-[12px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap",
                      isBuy ? "text-[#F04452] bg-[rgba(240,68,82,0.1)]" : "text-[#3182F6] bg-[rgba(49,130,246,0.1)]"
                    )}>
                      {isBuy ? "매수" : "매도"}
                    </span>
                  </div>
                  <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{formatPrice(log.price)}원</div>
                  <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{log.qty}주</div>
                  <div className="text-right font-bold text-[#191F28] tabular-nums">{formatPrice(log.price * log.qty)}원</div>
                </div>
              );
            })
          )}
        </>
      ) : (
        <>
          <div className={cn("grid items-center py-3 px-6 border-b border-[#F2F4F6] text-sm text-[#6B7684] font-semibold bg-[#F9FAFB]", pendingGridCols)}>
            <div>일시</div>
            <div className="px-2">종목명</div>
            <div>구분</div>
            <div className="text-right pr-2">단가</div>
            <div className="text-right pr-2">수량</div>
            <div className="text-right">결제금액</div>
            {onCancelOrder && <div></div>}
          </div>
          {pending.length === 0 ? (
            <div className="p-10 text-center text-[#8B95A1] text-sm">
              미체결 주문이 없습니다.
            </div>
          ) : (
            pending.map((log, idx) => {
              const isBuy = log.type === "buy";
              return (
                <div
                  key={idx}
                  className={cn("grid items-center h-[52px] border-b border-[#F2F4F6] hover:bg-[#F9FAFB] px-6 transition-colors text-[14px]", pendingGridCols)}
                >
                  <div className="text-[13px] text-[#8B95A1] whitespace-nowrap pr-2">{log.date}</div>
                  <div className="font-bold text-[#191F28] px-2 truncate">{log.stock}</div>
                  <div>
                    <span className={cn(
                      "text-[12px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap",
                      isBuy ? "text-[#F04452] bg-[rgba(240,68,82,0.1)]" : "text-[#3182F6] bg-[rgba(49,130,246,0.1)]"
                    )}>
                      {isBuy ? "매수대기" : "매도대기"}
                    </span>
                  </div>
                  <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{formatPrice(log.price)}원</div>
                  <div className="text-right text-[#4E5968] font-medium pr-2 tabular-nums">{log.qty}주</div>
                  <div className="text-right font-bold text-[#191F28] tabular-nums">{formatPrice(log.price * log.qty)}원</div>
                  {onCancelOrder && (
                    <div className="flex justify-end pl-2">
                      <button
                        onClick={() => log.orderId !== null && onCancelOrder(log.orderId)}
                        disabled={log.orderId === null}
                        className="w-8 h-8 flex items-center justify-center text-[#8B95A1] hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
