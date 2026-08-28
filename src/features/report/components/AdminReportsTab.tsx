import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import api from "@/src/shared/lib/api";
import { Button } from "@/src/shared/components/ui/Button";

const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: "미처리",
  PROCESSED: "처리완료",
  REJECTED: "반려",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  POST: "게시글",
  COMMENT: "댓글",
  CHAT: "채팅",
  USER: "회원",
};

interface AdminReportsTabProps {
  reports: any[];
  fetchReports: () => Promise<void>;
  triggerToast: (msg: string) => void;
  reportFilterTab: "전체" | "PENDING" | "PROCESSED" | "REJECTED";
  setReportFilterTab: (v: any) => void;
  reportDetailModal: { isOpen: boolean; report: any | null };
  setReportDetailModal: (v: { isOpen: boolean; report: any | null }) => void;
}

export function AdminReportsTab({
  reports, fetchReports, triggerToast, reportFilterTab, setReportFilterTab,
  reportDetailModal, setReportDetailModal,
}: AdminReportsTabProps) {
  const navigate = useNavigate();
  return (
    <>
              <div id="admin-reports-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">신고 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">사용자들이 신고한 불건전한 게시글 및 채팅 차단 관리소입니다</p>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 bg-[#F2F2F7] p-1 rounded-[12px] w-fit">
                  {[
                    { key: "전체", count: reports.length },
                    { key: "PENDING", count: reports.filter(r => r.status === "PENDING").length, badge: true, label: "미처리" },
                    { key: "PROCESSED", count: reports.filter(r => r.status === "PROCESSED").length, label: "처리완료" },
                    { key: "REJECTED", count: reports.filter(r => r.status === "REJECTED").length, label: "반려" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setReportFilterTab(tab.key as any)}
                      className={cn(
                        "px-4 py-2 text-xs font-bold rounded-[10px] transition-all duration-200 flex items-center gap-1.5",
                        reportFilterTab === tab.key
                          ? "bg-white text-[#1C1C1E] shadow-sm"
                          : "text-[#8E8E93] hover:text-[#1C1C1E]"
                      )}
                    >
                      <span>{tab.label ?? tab.key}</span>
                      {tab.count > 0 && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                          tab.key === "PENDING" ? "bg-[#FF3B30] text-white" : "bg-[#8E8E93]/20 text-[#8E8E93]"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">신고자</th>
                          <th className="py-3.5 px-4 w-28 whitespace-nowrap">대상 유형</th>
                          <th className="py-3.5 px-4 w-32 whitespace-nowrap">신고 사유</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">신고 일자</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">상태</th>
                          <th className="py-3.5 px-4 text-center w-[180px] whitespace-nowrap">처리 동작</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {reports
                          .filter((r) => {
                            if (reportFilterTab === "전체") return true;
                            return r.status === reportFilterTab;
                          })
                          .map((report, idx) => {
                            const handleReportAction = async (reportId: number, status: "PROCESSED" | "REJECTED") => {
                              try {
                                await api.patch(`/admin/reports/${reportId}`, { status });
                                await fetchReports();
                                const processedReport = reports.find(r => r.id === reportId);
                                setReportDetailModal({ isOpen: true, report: { ...processedReport, status } });
                                triggerToast(`신고 #${reportId}가 처리되었습니다.`);
                              } catch (error: any) {
                                triggerToast(`⚠️ ${error.response?.data?.message ?? "처리에 실패했습니다."}`);
                              }
                            };

                            return (
                              <tr key={report.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                                <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                                <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{report.reporterNickname}</td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                    report.targetType === "POST" && "bg-[#BF5AF2]/11 text-[#BF5AF2]",
                                    report.targetType === "COMMENT" && "bg-[#FF9500]/11 text-[#FF9500]",
                                    report.targetType === "CHAT" && "bg-[#4A5DF9]/11 text-[#4A5DF9]",
                                    report.targetType === "USER" && "bg-[#34C759]/11 text-[#34C759]"
                                  )}>
                                    {TARGET_TYPE_LABELS[report.targetType] ?? report.targetType}
                                  </span>
                                </td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                  <span className="px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block bg-[#8E8E93]/11 text-[#8E8E93]">
                                    {report.reason}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">{report.createdAt ? report.createdAt.slice(0, 10) : "-"}</td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                    report.status === "PENDING" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                    report.status === "PROCESSED" && "bg-[#34C759]/11 text-[#34C759]",
                                    report.status === "REJECTED" && "bg-[#8E8E93]/11 text-[#8E8E93]"
                                  )}>
                                    {REPORT_STATUS_LABELS[report.status] ?? report.status}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  {report.status === "PENDING" ? (
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => handleReportAction(report.id, "PROCESSED")}
                                        className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        삭제 처리
                                      </button>
                                      <button
                                        onClick={() => handleReportAction(report.id, "REJECTED")}
                                        className="px-2.5 py-1.5 bg-[#F2F2F7] text-[#8E8E93] hover:text-[#1C1C1E] text-xs font-bold rounded-[8px] transition cursor-pointer"
                                      >
                                        반려
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex gap-2 justify-center">
                                      <span className="px-2.5 py-1.5 bg-[#F2F2F7] text-[#8E8E93] text-xs font-bold rounded-[8px] select-none text-center inline-block cursor-default">
                                        처리 종결
                                      </span>
                                      <button
                                        onClick={() => setReportDetailModal({ isOpen: true, report })}
                                        className="px-2.5 py-1.5 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/90 text-xs font-bold rounded-[8px] transition cursor-pointer text-center inline-block"
                                      >
                                        확인
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      {/* Report Detail & Solution Log View Modal */}
      {reportDetailModal.isOpen && reportDetailModal.report && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#E5E5EA] flex flex-col gap-5 text-[#1C1C1E]">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-[#4A5DF9]/10 text-[#4A5DF9] text-[11px] font-extrabold px-2.5 py-1 rounded-[12px] uppercase">
                  신고사항 처리종결 확인
                </span>
                <h3 className="text-[18px] font-bold text-[#1C1C1E] mt-2">신고 건번호 #{reportDetailModal.report.id} 상세 처리내역</h3>
              </div>
              <button
                onClick={() => setReportDetailModal({ isOpen: false, report: null })}
                className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] flex items-center justify-center transition cursor-pointer text-[#8E8E93] hover:text-[#1C1C1E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content info wrapper */}
            <div className="space-y-3.5 text-sm">
              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">신고자</span>
                <span className="font-extrabold text-[#1C1C1E]">{reportDetailModal.report.reporterNickname}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">대상 유형</span>
                <span className="font-extrabold text-[#1C1C1E]">{TARGET_TYPE_LABELS[reportDetailModal.report.targetType] ?? reportDetailModal.report.targetType}</span>
              </div>

              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">신고 사유</span>
                <span className="font-extrabold px-2 py-0.5 rounded text-white text-[11px] bg-[#FF3B30] w-fit">
                  {reportDetailModal.report.reason}
                </span>
              </div>

              <div className="grid grid-cols-[100px_1fr] bg-[#F2F2F7]/40 p-3 rounded-[12px] border border-[#E5E5EA]/40">
                <span className="text-[#8E8E93] font-bold">신고 일자</span>
                <span className="font-semibold text-[#1C1C1E] tabular-nums">{reportDetailModal.report.createdAt ? reportDetailModal.report.createdAt.slice(0, 10) : "-"}</span>
              </div>

              {reportDetailModal.report.targetPostId ? (
                <button
                  onClick={() => navigate(`/community/${reportDetailModal.report.targetPostId}`)}
                  className="w-full py-3 bg-[#4A5DF9]/10 text-[#4A5DF9] font-bold rounded-[12px] text-[13px]"
                >
                  신고된 {reportDetailModal.report.targetType === "COMMENT" ? "댓글이 달린 게시글" : "게시글"} 확인하러 가기
                </button>
              ) : (
                <p className="text-[12px] text-[#8E8E93] text-center">확인 가능한 페이지가 없습니다</p>
              )}

              {/* Resolved processing content details (처리내용) */}
              <div className="flex flex-col gap-1.5 bg-[#34C759]/5 p-3 rounded-[12px] border border-[#34C759]/20">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  <span className="text-[#34C759] text-[12px] font-bold">최종 처리 결과 및 내용</span>
                </div>
                <div className="bg-white border border-[#34C759]/20 p-2.5 rounded-[8px] text-[13px] text-[#1C1C1E] font-medium leading-relaxed">
                  {reportDetailModal.report.status === "PROCESSED" ? (
                    <span>
                      본 신고 항목에 명시된 비규격 활동 및 규정 위반 사실에 대하여 운영원칙에 기반한 정밀 심사를 거쳐 <strong className="text-[#FF3B30]">삭제 처리 및 일시적 조치 제한권고</strong> 처리를 완료하였습니다. 커뮤니티의 쾌적한 질서 유지를 위해 제로리스크의 실시간 규정 가이드라인을 위배 조치하였습니다.
                    </span>
                  ) : (
                    <span>
                      통배포 또는 타겟 오용으로 전달된 단순 분쟁 건으로 파악되었습니다. 당사 운영원칙 상의 엄격한 제재 요건(욕설/비하/불건전성)에 미온하여 <strong className="text-[#8E8E93]">무혐의 반려</strong> 처리 종결되었습니다. 관리부서의 추가 모니터링 주기에 기록되었습니다.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setReportDetailModal({ isOpen: false, report: null })}
              className="w-full h-11 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] font-bold rounded-[12px] mt-1 text-[13px] transition cursor-pointer shrink-0"
            >
              닫기
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
