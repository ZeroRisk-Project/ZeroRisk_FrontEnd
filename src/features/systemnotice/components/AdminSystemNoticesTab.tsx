import React from "react";
import { X } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import { Button } from "@/src/shared/components/ui/Button";

const SYSTEM_NOTICE_SEVERITY_LABELS: Record<string, string> = {
  MAINTENANCE: "점검",
  INCIDENT: "장애",
  NOTICE: "알림",
};

interface AdminSystemNoticesTabProps {
  systemNotices: any[];
  openSystemNoticeCreate: () => void;
  handleSystemNoticeDeactivate: (id: number) => Promise<void>;
  systemNoticeModal: boolean;
  setSystemNoticeModal: (v: boolean) => void;
  systemNoticeForm: { severity: string; title: string; message: string };
  setSystemNoticeForm: React.Dispatch<React.SetStateAction<{ severity: string; title: string; message: string }>>;
  handleSystemNoticeSubmit: () => Promise<void>;
}

export function AdminSystemNoticesTab({
  systemNotices, openSystemNoticeCreate, handleSystemNoticeDeactivate,
  systemNoticeModal, setSystemNoticeModal, systemNoticeForm, setSystemNoticeForm, handleSystemNoticeSubmit,
}: AdminSystemNoticesTabProps) {
  return (
    <>
              <div id="admin-system-notices-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">긴급 알림</h1>
                    <p className="text-[#8E8E93] text-[14px]">점검·장애 등 긴급 알림 팝업을 전체 페이지에 노출합니다</p>
                  </div>
                  <Button
                    onClick={openSystemNoticeCreate}
                    className="bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white rounded-[12px] text-[13px] font-bold px-4"
                  >
                    긴급 알림 등록
                  </Button>
                </div>

                {/* 현재 활성화된 알림 */}
                <div className="space-y-2">
                  <h2 className="text-[15px] font-bold text-[#1C1C1E]">현재 활성화된 알림</h2>
                  {systemNotices.filter((n) => n.isActive).length === 0 ? (
                    <div className="bg-white rounded-[16px] border border-[#E5E5EA] py-8 text-center text-[#8E8E93] text-[13px] font-bold">
                      현재 활성화된 알림이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {systemNotices.filter((n) => n.isActive).map((notice) => (
                        <div key={notice.id} className="bg-white rounded-[16px] border border-[#E5E5EA] p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={cn(
                              "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block shrink-0",
                              notice.severity === "MAINTENANCE" && "bg-[#3182F6]/11 text-[#3182F6]",
                              notice.severity === "INCIDENT" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                              notice.severity === "NOTICE" && "bg-[#4A5DF9]/11 text-[#4A5DF9]"
                            )}>
                              {SYSTEM_NOTICE_SEVERITY_LABELS[notice.severity] ?? notice.severity}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-[#1C1C1E] text-sm truncate">{notice.title}</p>
                              <p className="text-[#8E8E93] text-xs truncate">{notice.message}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSystemNoticeDeactivate(notice.id)}
                            className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer shrink-0"
                          >
                            종료
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 과거 알림 이력 */}
                <div className="space-y-2">
                  <h2 className="text-[15px] font-bold text-[#1C1C1E]">과거 알림 이력</h2>
                  <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                            <th className="py-3.5 px-4 w-24 text-center whitespace-nowrap">심각도</th>
                            <th className="py-3.5 px-4 whitespace-nowrap">제목</th>
                            <th className="py-3.5 px-4 w-24 text-center whitespace-nowrap">상태</th>
                            <th className="py-3.5 px-4 w-32 text-center whitespace-nowrap">등록일</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E5E5EA]">
                          {systemNotices.filter((n) => !n.isActive).map((notice) => (
                            <tr key={notice.id} className="h-[52px] hover:bg-[#FAFAFA] transition-colors text-sm">
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block bg-[#8E8E93]/11 text-[#8E8E93]">
                                  {SYSTEM_NOTICE_SEVERITY_LABELS[notice.severity] ?? notice.severity}
                                </span>
                              </td>
                              <td className="py-2 px-4 font-bold text-[#1C1C1E]">{notice.title}</td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <span className="text-[#8E8E93] text-xs font-bold">종료됨</span>
                              </td>
                              <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">
                                {notice.createdAt ? notice.createdAt.slice(0, 10) : "-"}
                              </td>
                            </tr>
                          ))}
                          {systemNotices.filter((n) => !n.isActive).length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-12 text-center text-[#8E8E93] text-[13px] font-bold">
                                과거 알림 이력이 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
      {/* SYSTEM NOTICE CREATE MODAL */}
      {systemNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[480px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative">
            <button
              onClick={() => setSystemNoticeModal(false)}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">긴급 알림 등록</h2>
              <p className="text-[#8E8E93] text-[13px]">등록 즉시 모든 페이지에 팝업으로 노출됩니다</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#8E8E93]">심각도</label>
                <select
                  value={systemNoticeForm.severity}
                  onChange={(e) => setSystemNoticeForm((prev) => ({ ...prev, severity: e.target.value }))}
                  className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-bold outline-none focus:bg-white focus:border-[#FF3B30] transition-all"
                >
                  <option value="MAINTENANCE">점검</option>
                  <option value="INCIDENT">장애</option>
                  <option value="NOTICE">알림</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#8E8E93]">제목</label>
                <input
                  type="text"
                  value={systemNoticeForm.title}
                  onChange={(e) => setSystemNoticeForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[13.5px] outline-none focus:bg-white focus:border-[#FF3B30] transition-all"
                  placeholder="예: 서버 점검 안내"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#8E8E93]">메시지</label>
                <textarea
                  value={systemNoticeForm.message}
                  onChange={(e) => setSystemNoticeForm((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[13.5px] outline-none focus:bg-white focus:border-[#FF3B30] transition-all resize-none"
                  placeholder="사용자에게 보여줄 안내 메시지를 입력하세요"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-1 shrink-0">
              <Button
                onClick={handleSystemNoticeSubmit}
                disabled={!systemNoticeForm.title.trim() || !systemNoticeForm.message.trim()}
                className="flex-1 bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white rounded-[12px] text-[13px] font-bold disabled:opacity-40"
              >
                등록 및 활성화
              </Button>
              <button
                onClick={() => setSystemNoticeModal(false)}
                className="py-3 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] text-[13px] font-bold rounded-[12px] px-5 transition cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
