import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { cn, formatPercent } from "@/src/shared/lib/utils";
import { getOrders, getTrades } from "@/src/features/order/api/order";
import { getHoldings } from "@/src/features/portfolio/api/portfolio";
import {
  TransactionHistoryGrid,
  TRADES_PAGE_SIZE,
  formatTransactionDate,
} from "@/src/features/user/components/TransactionHistoryGrid";

interface CompetitionAccountPopupProps {
  accountId: number;
  competitionTitle: string;
  onClose: () => void;
}

export function CompetitionAccountPopup({ accountId, competitionTitle, onClose }: CompetitionAccountPopupProps) {
  const [tab, setTab] = useState<"history" | "holdings">("history");
  const [historySubTab, setHistorySubTab] = useState<"거래내역" | "미체결 내역">("거래내역");

  const tradesQuery = useQuery({
    queryKey: ["competitionAccountPopup", "trades", accountId],
    queryFn: () => getTrades(accountId, 0, TRADES_PAGE_SIZE),
    retry: false,
  });
  const pendingOrdersQuery = useQuery({
    queryKey: ["competitionAccountPopup", "pendingOrders", accountId],
    queryFn: () => getOrders(accountId, "PENDING"),
    retry: false,
  });
  const holdingsQuery = useQuery({
    queryKey: ["competitionAccountPopup", "holdings", accountId],
    queryFn: () => getHoldings(accountId),
    retry: false,
  });

  const done = (tradesQuery.data?.content ?? []).map((trade) => ({
    type: trade.side === "BUY" ? "buy" : "sell",
    stock: trade.stockName,
    date: formatTransactionDate(trade.tradedAt),
    price: trade.price,
    qty: trade.quantity,
  }));

  const pending = (pendingOrdersQuery.data?.content ?? []).map((order) => ({
    orderId: order.orderId,
    type: order.side === "BUY" ? "buy" : "sell",
    stock: order.stockName,
    date: formatTransactionDate(order.createdAt),
    price: order.limitPrice ?? 0,
    qty: order.quantity,
  }));

  const holdings = holdingsQuery.data ?? [];

  return (
    <div
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] w-full max-w-[720px] max-h-[80vh] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-[17px] font-bold text-[#191F28] truncate pr-4">{competitionTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 text-[#8B95A1] hover:text-[#191F28] rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-[#F2F4F6] p-1 rounded-xl w-fit shrink-0">
          <button
            onClick={() => setTab("history")}
            className={cn(
              "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors cursor-pointer",
              tab === "history" ? "bg-white text-[#191F28] shadow-sm" : "text-[#6B7684] hover:text-[#191F28]"
            )}
          >
            거래내역·미체결
          </button>
          <button
            onClick={() => setTab("holdings")}
            className={cn(
              "px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors cursor-pointer",
              tab === "holdings" ? "bg-white text-[#191F28] shadow-sm" : "text-[#6B7684] hover:text-[#191F28]"
            )}
          >
            보유 종목
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-auto -mx-6 px-6">
          {tab === "history" ? (
            <>
              <div className="flex items-center gap-6 border-b border-[#F2F4F6] mb-2">
                <button
                  onClick={() => setHistorySubTab("거래내역")}
                  className={cn(
                    "h-10 flex items-center font-bold text-[14px] border-b-[3px] transition-colors -mb-[1px] cursor-pointer",
                    historySubTab === "거래내역"
                      ? "border-[#191F28] text-[#191F28]"
                      : "border-transparent text-[#8B95A1] hover:text-[#191F28]"
                  )}
                >
                  거래내역
                </button>
                <button
                  onClick={() => setHistorySubTab("미체결 내역")}
                  className={cn(
                    "h-10 flex items-center font-bold text-[14px] border-b-[3px] transition-colors -mb-[1px] cursor-pointer",
                    historySubTab === "미체결 내역"
                      ? "border-[#191F28] text-[#191F28]"
                      : "border-transparent text-[#8B95A1] hover:text-[#191F28]"
                  )}
                >
                  미체결 내역
                </button>
              </div>
              <TransactionHistoryGrid subTab={historySubTab} done={done} pending={pending} />
            </>
          ) : (
            <div className="min-w-[600px] pb-2">
              {holdings.length === 0 ? (
                <div className="p-10 text-center text-[#8B95A1] text-sm">
                  보유 중인 종목이 없습니다.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-[#F2F4F6] text-[#6B7684]">
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
                    {holdings.map((h) => (
                      <tr key={h.holdingId} className="border-b border-[#F2F4F6] hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-4 px-4 font-bold text-[#191F28]">{h.stockName}</td>
                        <td className="py-4 px-4 text-right tabular-nums">{h.quantity.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right tabular-nums">₩{h.averagePrice.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right tabular-nums font-semibold">₩{h.currentPrice.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right tabular-nums font-bold">₩{h.evaluationAmount.toLocaleString()}</td>
                        <td className={cn("py-4 px-4 text-right tabular-nums font-bold", h.profitLoss > 0 ? "text-up" : "text-down")}>
                          {h.profitLoss > 0 ? "+" : ""}₩{Math.abs(h.profitLoss).toLocaleString()}
                        </td>
                        <td className={cn("py-4 px-4 text-right tabular-nums font-bold", h.profitRate > 0 ? "text-up" : "text-down")}>
                          {formatPercent(h.profitRate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
