import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getPendingNotificationDlqItems,
  retryNotificationDlqItem,
  ignoreNotificationDlqItem,
  NotificationDlqResponse,
} from "@/src/features/notification/api/notificationDlq";

interface AdminNotificationDlqTabProps {
  activeTab: string;
  triggerToast: (msg: string) => void;
  logAdminAction: (type: string, target: string, content: string) => void;
}

export function AdminNotificationDlqTab({
  activeTab,
  triggerToast,
  logAdminAction,
}: AdminNotificationDlqTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<NotificationDlqResponse[]>([]);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const dlqQuery = useQuery({
    queryKey: ["admin", "notification-dlq", page],
    queryFn: () => getPendingNotificationDlqItems(page),
    enabled: activeTab === "notification-dlq",
    retry: false,
  });

  useEffect(() => {
    if (dlqQuery.data) {
      setItems(dlqQuery.data.content);
    }
  }, [dlqQuery.data]);

  const handleRetry = async (item: NotificationDlqResponse) => {
    setProcessingId(item.id);
    try {
      await retryNotificationDlqItem(item.id);
      triggerToast(`알림 [${item.title}] 재발송을 시도했습니다.`);
      logAdminAction("알림 DLQ", item.title, `재발송 시도 (userId: ${item.userId})`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "notification-dlq"] });
    } catch (error) {
      console.error(error);
      triggerToast("⚠️ 재발송에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleIgnore = async (item: NotificationDlqResponse) => {
    setProcessingId(item.id);
    try {
      await ignoreNotificationDlqItem(item.id);
      triggerToast(`알림 [${item.title}]을(를) 무시 처리했습니다.`);
      logAdminAction("알림 DLQ", item.title, `무시 처리 (userId: ${item.userId})`);
      await queryClient.invalidateQueries({ queryKey: ["admin", "notification-dlq"] });
    } catch (error) {
      console.error(error);
      triggerToast("⚠️ 처리에 실패했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  if (dlqQuery.isLoading) {
    return <div className="p-6 text-center text-[#8E8E93] text-sm">불러오는 중...</div>;
  }

  const totalPages = dlqQuery.data?.totalPages ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[15px] font-bold text-[#1C1C1E]">알림 발송 실패 목록</h3>
        <span className="text-[13px] text-[#8E8E93]">
          대기 중 {dlqQuery.data?.totalElements ?? 0}건
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-10 text-center text-[#8E8E93] text-sm bg-[#F2F2F7]/40 rounded-[16px]">
          처리 대기 중인 실패 알림이 없습니다.
        </div>
      ) : (
        <div className="border border-[#E5E5EA] rounded-[16px] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F2F2F7]/60 text-[12px] font-bold text-[#8E8E93]">
              <tr>
                <th className="px-4 py-3">유저ID</th>
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3">실패 사유</th>
                <th className="px-4 py-3 text-center">재시도</th>
                <th className="px-4 py-3">발생일</th>
                <th className="px-4 py-3 text-center">처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {items.map((item) => (
                <tr key={item.id} className="text-[13px]">
                  <td className="px-4 py-3 font-medium">{item.userId}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{item.title}</td>
                  <td className="px-4 py-3 max-w-[240px] truncate text-[#FF3B30]">
                    {item.failureReason ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center">{item.retryCount}</td>
                  <td className="px-4 py-3 text-[#8E8E93]">
                    {new Date(item.createdAt).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleRetry(item)}
                        disabled={processingId === item.id}
                        className="px-3 py-1.5 rounded-[8px] bg-[#4A5DF9]/10 text-[#4A5DF9] text-[12px] font-bold hover:bg-[#4A5DF9]/20 transition disabled:opacity-50"
                      >
                        재발송
                      </button>
                      <button
                        onClick={() => handleIgnore(item)}
                        disabled={processingId === item.id}
                        className="px-3 py-1.5 rounded-[8px] bg-[#8E8E93]/10 text-[#8E8E93] text-[12px] font-bold hover:bg-[#8E8E93]/20 transition disabled:opacity-50"
                      >
                        무시
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[12px] font-bold text-[#8E8E93]">
            {page + 1} / {totalPages} 페이지
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] rounded-[8px] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] rounded-[8px] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
