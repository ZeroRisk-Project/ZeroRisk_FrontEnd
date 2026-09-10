import React, { useState } from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";

const ACTION_TYPE_LABELS: Record<string, string> = {
  CREATE: "생성",
  UPDATE: "수정",
  DELETE: "삭제",
  SUSPEND: "정지",
  UNSUSPEND: "정지해제",
  PROCESS: "신고처리",
  REJECT: "신고반려",
  ANSWER: "문의답변",
  RETRY: "재처리",
  EXPEL: "강제퇴장",
  FORCE_DELETE: "강제삭제",
  RESTORE: "복구",
  DEACTIVATE: "비활성화",
};

// 게시판 코드(FREE/STOCK/NOTICE)를 한국어로 — 일부 로그 detail이 "[FREE] 제목" 형태로 내려옴
const BOARD_CODE_LABELS: Record<string, string> = {
  FREE: "자유게시판",
  STOCK: "종목게시판",
  NOTICE: "공지",
};
function localizeBoardCodes(detail: string): string {
  return (detail ?? "").replace(
    /\[(FREE|STOCK|NOTICE)\]/g,
    (_, code) => `[${BOARD_CODE_LABELS[code]}]`,
  );
}

// detail 말미의 "(사유: ...)"를 본문과 분리 — 인라인에는 본문만 노출하고
// 사유는 우클릭 '사유 보기'로만 확인하게 한다.
function splitReason(detail: string): { text: string; reason: string | null } {
  const raw = detail ?? "";
  const m = raw.match(/\s*\(사유:\s*([\s\S]+?)\)\s*$/);
  if (!m || m.index == null) return { text: raw, reason: null };
  return { text: raw.slice(0, m.index).trim(), reason: m[1].trim() };
}

interface AdminLogsTabProps {
  logs: any[];
  logMonitoringTab: "전체" | "CREATE" | "UPDATE" | "DELETE" | "SUSPEND" | "UNSUSPEND" | "PROCESS" | "REJECT" | "ANSWER";
  setLogMonitoringTab: (v: any) => void;
  logSearchQuery: string;
  setLogSearchQuery: (v: string) => void;
  logPage: number;
  setLogPage: (v: number) => void;
  triggerToast: (msg: string) => void;
}

export function AdminLogsTab({
  logs, logMonitoringTab, setLogMonitoringTab, logSearchQuery, setLogSearchQuery, logPage, setLogPage, triggerToast,
}: AdminLogsTabProps) {
  // 우클릭 컨텍스트 메뉴 / 사유 보기 모달
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; reason: string } | null>(null);
  const [reasonModal, setReasonModal] = useState<string | null>(null);

  return (
              <div id="admin-logs-panel" className="space-y-4">
                <div>
                  <h1 className="text-[24px] font-bold text-[#1C1C1E]">관리자 로그 모니터링</h1>
                  <p className="text-[#8E8E93] text-[14px]">관리자 페이지에서 이루어진 모든 활동 내역 및 상태 변경 로그를 실시간으로 기록 및 모니터링합니다</p>
                </div>

                {/* Main Table & Filter Card Combined */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden shadow-sm">
                  {/* Embedded Header for Filter and Search */}
                  <div className="p-4 border-b border-[#E5E5EA] flex flex-wrap gap-4 items-center justify-between bg-white animate-in fade-in duration-300">
                    {/* Left: Search Bar on Left Side */}
                    <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                      <div className="w-72 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636C7D] w-4.5 h-4.5" />
                        <input
                          type="text"
                          placeholder="수행 대상 IP 또는 활동 내용 검색"
                          value={logSearchQuery}
                          onChange={(e) => {
                            setLogSearchQuery(e.target.value);
                            setLogPage(1);
                          }}
                          className="w-full bg-[#F2F2F7] border border-transparent rounded-[16px] pl-10 pr-4 py-2 text-[13.5px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                        />
                      </div>
                      <div className="text-[13px] text-[#8E8E93] font-bold hidden sm:inline-block">
                        총 <span className="text-[#1C1C1E] font-black">{
                          logs.filter((l) => {
                            const matchTab = logMonitoringTab === "전체" || l.actionType === logMonitoringTab;
                            const query = logSearchQuery.toLowerCase();
                            const matchQuery =
                              (l.ipAddress ?? "").toLowerCase().includes(query) ||
                              (l.detail ?? "").toLowerCase().includes(query) ||
                              (l.targetType ?? "").toLowerCase().includes(query) ||
                              String(l.targetId ?? "").includes(query);
                            return matchTab && matchQuery;
                          }).length
                        }</span>건의 기록
                      </div>
                    </div>

                    {/* Right: Dropdown Select Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8E8E93]">로그 필터:</span>
                      <div className="relative inline-block w-44">
                        <select
                          value={logMonitoringTab}
                          onChange={(e) => {
                            setLogMonitoringTab(e.target.value as any);
                            setLogPage(1);
                          }}
                          className="appearance-none w-full bg-[#F2F2F7] border border-[#E5E5EA] rounded-[12px] text-xs font-extrabold pl-3.5 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#4A5DF9] cursor-pointer"
                        >
                          <option value="전체">전체 활동</option>
                          <option value="CREATE">생성 (대회 등)</option>
                          <option value="UPDATE">수정</option>
                          <option value="DELETE">삭제</option>
                          <option value="SUSPEND">회원 정지</option>
                          <option value="UNSUSPEND">정지 해제</option>
                          <option value="PROCESS">신고 처리</option>
                          <option value="REJECT">신고 반려</option>
                          <option value="ANSWER">문의 답변</option>
                          {(["전체", "CREATE", "UPDATE", "DELETE", "SUSPEND", "UNSUSPEND", "PROCESS", "REJECT", "ANSWER"] as const).map((tab) => (
                            <option key={tab} value={tab}>
                              {tab === "전체" ? "전체 활동" : ACTION_TYPE_LABELS[tab]}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3 px-4 w-44 whitespace-nowrap">일시</th>
                          <th className="py-3 px-4 w-28 whitespace-nowrap">활동 유형</th>
                          <th className="py-3 px-4 w-36 whitespace-nowrap">수행 대상</th>
                          <th className="py-3 px-4 whitespace-nowrap">활동 기록 및 내용</th>
                          <th className="py-3 px-4 w-36 text-center whitespace-nowrap">접속 IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {logs
                          .filter((l) => {
                            const matchTab = logMonitoringTab === "전체" || l.actionType === logMonitoringTab;
                            const query = logSearchQuery.toLowerCase();
                            const matchQuery =
                              (l.ipAddress ?? "").toLowerCase().includes(query) ||
                              (l.detail ?? "").toLowerCase().includes(query) ||
                              (l.targetType ?? "").toLowerCase().includes(query) ||
                              String(l.targetId ?? "").includes(query);
                            return matchTab && matchQuery;
                          })
                          .map((log) => {
                            const { text: detailText, reason } = splitReason(log.detail);
                            return (
                            <tr
                              key={log.id}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setCtxMenu({ x: e.pageX, y: e.pageY, reason: reason ?? "" });
                              }}
                              className="h-[52px] hover:bg-[#FAFAFA] transition-colors text-sm font-medium text-[#1C1C1E] select-none"
                            >
                              <td className="py-2 px-4 text-[#8E8E93] tabular-nums whitespace-nowrap">
                                {log.createdAt?.slice(0, 19).replace("T", " ")}
                              </td>
                              <td className="py-2 px-4 whitespace-nowrap">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-[16px] text-xs font-black inline-block",
                                  log.actionType === "CREATE" && "bg-[#30D158]/11 text-[#30D158]",
                                  log.actionType === "UPDATE" && "bg-[#007AFF]/11 text-[#007AFF]",
                                  log.actionType === "DELETE" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                  log.actionType === "SUSPEND" && "bg-[#FF9500]/11 text-[#FF9500]",
                                  log.actionType === "UNSUSPEND" && "bg-[#4A5DF9]/11 text-[#4A5DF9]",
                                  log.actionType === "PROCESS" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                  log.actionType === "REJECT" && "bg-[#8E8E93]/11 text-[#8E8E93]",
                                  log.actionType === "ANSWER" && "bg-[#30D158]/11 text-[#30D158]",
                                  log.actionType === "RETRY" && "bg-[#007AFF]/11 text-[#007AFF]",
                                  log.actionType === "FORCE_DELETE" && "bg-[#FF3B30]/11 text-[#FF3B30]",
                                  log.actionType === "RESTORE" && "bg-[#30D158]/11 text-[#30D158]",
                                  log.actionType === "EXPEL" && "bg-[#FF9500]/11 text-[#FF9500]",
                                  log.actionType === "DEACTIVATE" && "bg-[#8E8E93]/11 text-[#8E8E93]"
                                )}>
                                  {ACTION_TYPE_LABELS[log.actionType] ?? log.actionType}
                                </span>
                              </td>
                              <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">
                                <span className="text-[#4A5DF9]">{log.adminNickname}</span> → {log.targetType} #{log.targetId}
                              </td>
                              <td className="py-2 px-4 text-[#3A3A3C] font-semibold whitespace-nowrap">{localizeBoardCodes(detailText)}</td>
                              <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums font-semibold whitespace-nowrap">
                                {log.ipAddress ?? "-"}
                              </td>
                            </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination bar */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[12px] font-bold text-[#8E8E93]">Showing 1-{Math.min(9, logs.length)} of {logs.length} logs</span>

                  <div className="flex items-center gap-1.5">
                    <button className="p-2 bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] rounded-[8px] transition cursor-pointer">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {[1].map((page) => (
                      <button
                        key={page}
                        onClick={() => triggerToast(`페이지 ${page}로 이동했습니다.`)}
                        className={cn(
                          "w-8 h-8 text-[12px] font-bold rounded-[8px] flex items-center justify-center transition cursor-pointer",
                          page === 1
                            ? "bg-[#4A5DF9] text-white shadow-sm"
                            : "bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93]"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                    <button className="p-2 bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] rounded-[8px] transition cursor-pointer">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 로그 우클릭 컨텍스트 메뉴 */}
                {ctxMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[99]"
                      onClick={() => setCtxMenu(null)}
                      onContextMenu={(e) => { e.preventDefault(); setCtxMenu(null); }}
                    />
                    <div
                      className="fixed z-[100] bg-white border border-[#E5E5EA] rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.12)] p-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
                      style={{ top: ctxMenu.y, left: ctxMenu.x }}
                    >
                      <button
                        disabled={!ctxMenu.reason}
                        onClick={() => { setReasonModal(ctxMenu.reason); setCtxMenu(null); }}
                        className="w-full text-left px-3 py-2 text-[13.5px] font-bold text-[#4A5DF9] hover:bg-[#4A5DF9]/10 rounded-[8px] transition cursor-pointer disabled:text-[#C7C7CC] disabled:hover:bg-transparent disabled:cursor-not-allowed"
                      >
                        사유 보기
                      </button>
                    </div>
                  </>
                )}

                {/* 사유 보기 모달 */}
                {reasonModal !== null && (
                  <div
                    className="fixed inset-0 z-[101] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setReasonModal(null)}
                  >
                    <div
                      className="bg-white rounded-[20px] w-full max-w-[420px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="text-[17px] font-bold text-[#1C1C1E]">처리 사유</h2>
                      <p className="text-[14px] text-[#3A3A3C] leading-relaxed whitespace-pre-wrap break-words">
                        {reasonModal || "기재된 사유가 없습니다."}
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setReasonModal(null)}
                          className="px-4 py-2 bg-[#1C1C1E] hover:bg-black text-white text-[13px] font-bold rounded-[12px] transition cursor-pointer"
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
  );
}
