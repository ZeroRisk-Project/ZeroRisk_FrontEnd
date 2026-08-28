import React from "react";
import { Search, ChevronDown, X, Activity } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import { DEFAULT_PROFILE_IMAGE } from "@/src/shared/lib/constants";
import api from "@/src/shared/lib/api";
import { Button } from "@/src/shared/components/ui/Button";

const ACTIVITY_LABELS: Record<string, { label: string; color: string }> = {
  LOGIN: { label: "로그인", color: "bg-[#4A5DF9]/11 text-[#4A5DF9]" },
  SIGNUP: { label: "회원가입", color: "bg-[#34C759]/11 text-[#34C759]" },
  UPDATE_PROFILE: { label: "프로필 수정", color: "bg-[#FF9500]/11 text-[#FF9500]" },
  CHANGE_PASSWORD: { label: "비밀번호 변경", color: "bg-[#FF9500]/11 text-[#FF9500]" },
  WITHDRAW: { label: "회원 탈퇴", color: "bg-[#FF3B30]/11 text-[#FF3B30]" },
  OPENBANKING_AUTH: { label: "계좌 인증", color: "bg-[#30D158]/11 text-[#30D158]" },
  CHARGE: { label: "시드머니 충전", color: "bg-[#30D158]/11 text-[#30D158]" },
  RESET_SEED_MONEY: { label: "자금 초기화", color: "bg-[#8E8E93]/11 text-[#8E8E93]" },
  JOIN_COMPETITION: { label: "대회 참가", color: "bg-[#007AFF]/11 text-[#007AFF]" },
  FOLLOW: { label: "팔로우", color: "bg-[#4A5DF9]/11 text-[#4A5DF9]" },
  UNFOLLOW: { label: "언팔로우", color: "bg-[#8E8E93]/11 text-[#8E8E93]" },
};

interface AdminMembersTabProps {
  users: any[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filterStatus: "ALL" | "ACTIVE" | "SUSPENDED" | "QUIT";
  setFilterStatus: (v: any) => void;
  filterRole: "ALL" | "USER" | "ADMIN";
  setFilterRole: (v: any) => void;
  fetchUsers: () => Promise<void>;
  triggerToast: (msg: string) => void;
  suspensionModal: { isOpen: boolean; userId: number | null };
  setSuspensionModal: (v: { isOpen: boolean; userId: number | null }) => void;
  suspensionTime: string;
  setSuspensionTime: (v: string) => void;
  suspensionReason: string;
  setSuspensionReason: (v: string) => void;
  activityModal: { isOpen: boolean; user: any | null };
  setActivityModal: (v: { isOpen: boolean; user: any | null }) => void;
  activityLogs: any[];
  activityLogsLoading: boolean;
  openActivityModal: (user: any) => void;
  contextMenu: { isOpen: boolean; x: number; y: number; user: any | null };
  setContextMenu: (v: { isOpen: boolean; x: number; y: number; user: any | null }) => void;
}

export function AdminMembersTab({
  users, searchQuery, setSearchQuery, filterStatus, setFilterStatus, filterRole, setFilterRole,
  fetchUsers, triggerToast, suspensionModal, setSuspensionModal, suspensionTime, setSuspensionTime,
  suspensionReason, setSuspensionReason, activityModal, setActivityModal, activityLogs, activityLogsLoading,
  openActivityModal, contextMenu, setContextMenu,
}: AdminMembersTabProps) {
  return (
    <>
              <div id="admin-members-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">회원 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">웹 서비스에 가입된 회원들의 관리 및 정지 제어가 포함됩니다</p>
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  {/* Integrated Filter and Search row at the top of the table */}
                  <div className="p-4 border-b border-[#E5E5EA] flex flex-wrap gap-4 items-center justify-between bg-white">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636C7D] w-4.5 h-4.5" />
                        <input
                          type="text"
                          placeholder="이메일 또는 닉네임 검색"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-[#F2F2F7] border border-transparent rounded-[16px] pl-10 pr-4 py-2 text-[14px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                        />
                      </div>

                      <div className="relative">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as any)}
                          className="appearance-none bg-[#F2F2F7] rounded-[12px] border border-transparent text-[#1C1C1E] text-[13px] font-bold pl-3.5 pr-9 py-2 outline-none hover:bg-[#E5E5EA] transition cursor-pointer"
                        >
                          <option value="ALL">전체 상태</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="QUIT">QUIT</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>

                      <div className="relative">
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value as any)}
                          className="appearance-none bg-[#F2F2F7] rounded-[12px] border border-transparent text-[#1C1C1E] text-[13px] font-bold pl-3.5 pr-9 py-2 outline-none hover:bg-[#E5E5EA] transition cursor-pointer"
                        >
                          <option value="ALL">전체 역할</option>
                          <option value="USER">일반 사용자 (USER)</option>
                          <option value="ADMIN">관리자 (ADMIN)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93] pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                      <div className="text-[13px] text-[#8E8E93] font-bold">
                        검색 결과: <span className="text-[#1C1C1E] font-black">{users.length}</span>명
                      </div>
                      <div className="text-[11.5px] text-[#4A5DF9] font-bold animate-pulse">
                        💡 Tip: 회원 칸을 마우스 우클릭하면 개별 활동 로그(매수/매도/게시글/댓글/대회참가 등) 보기 드롭다운이 노출됩니다.
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3 px-4 w-15 text-center whitespace-nowrap">프로필</th>
                          <th className="py-3 px-4 whitespace-nowrap">이메일</th>
                          <th className="py-3 px-4 whitespace-nowrap">닉네임</th>
                          <th className="py-3 px-4 w-32 whitespace-nowrap">역할</th>
                          <th className="py-3 px-4 w-36 whitespace-nowrap">상태 관리</th>
                          <th className="py-3 px-4 text-center whitespace-nowrap">계좌번호</th>
                          <th className="py-3 px-4 text-center whitespace-nowrap">가입일</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {users
                          .map((user, idx) => {
                            const handleStatusChangeLocally = async (val: "ACTIVE" | "SUSPENDED" | "QUIT") => {
                              if (val === "SUSPENDED") {
                                setSuspensionModal({ isOpen: true, userId: user.id });
                                return;
                              }
                              if (val === "ACTIVE" && user.status === "SUSPENDED") {
                                try {
                                  await api.patch(`/admin/users/${user.id}/unsuspend`);
                                  await fetchUsers();
                                  triggerToast(`${user.nickname}님의 정지가 해제되었습니다.`);
                                } catch (error: any) {
                                  triggerToast(`⚠️ ${error.response?.data?.message ?? "처리에 실패했습니다."}`);
                                }
                              }
                            };

                            return (
                              <tr
                                key={user.id}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setContextMenu({ isOpen: true, x: e.pageX, y: e.pageY, user });
                                }}
                                className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm select-none"
                              >
                                <td className="py-2 px-4 text-center font-bold text-[#8E8E93] tabular-nums whitespace-nowrap">{idx + 1}</td>
                                <td className="py-2 px-4 text-center whitespace-nowrap">
                                  <img
                                    src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                                    alt="avatar"
                                    className="flex-shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full object-cover border border-[#E5E5EA] mx-auto shadow-inner aspect-square"
                                    referrerPolicy="no-referrer"
                                  />
                                </td>
                                <td className="py-2 px-4 font-semibold text-[#1C1C1E] whitespace-nowrap">{user.email}</td>
                                <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{user.nickname}</td>

                                <td className="py-2 px-4 whitespace-nowrap">
                                  <span
                                    className={cn(
                                      "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold",
                                      user.userRole === "ADMIN" ? "bg-[#FF3B30]/10 text-[#FF3B30]" : "bg-[#F2F2F7] text-[#8E8E93]"
                                    )}
                                  >
                                    {user.userRole === "ADMIN" ? "관리자" : "일반"}
                                  </span>
                                </td>
                                <td className="py-2 px-4 whitespace-nowrap">
                                  <div className="relative inline-block w-full min-w-[110px]">
                                    <select
                                      value={user.status}
                                      onChange={(e) => handleStatusChangeLocally(e.target.value as any)}
                                      className={cn(
                                        "appearance-none w-full rounded-[8px] text-xs font-extrabold pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#4A5DF9] border border-transparent cursor-pointer transition-all",
                                        user.status === "ACTIVE" && "bg-[#34C759]/10 text-[#34C759]",
                                        user.status === "SUSPENDED" && "bg-[#FF9500]/10 text-[#FF9500]",
                                        user.status === "QUIT" && "bg-[#8E8E93]/10 text-[#8E8E93]"
                                      )}
                                    >
                                      <option value="ACTIVE">활성</option>
                                      <option value="SUSPENDED">정지</option>
                                      <option value="QUIT">탈퇴</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8E8E93] pointer-events-none" />
                                  </div>
                                </td>
                                <td className="py-2 px-4 text-center tabular-nums text-[#8E8E93] font-medium whitespace-nowrap">{user.accountNumMasked ?? "-"}</td>
                                <td className="py-2 px-4 text-center tabular-nums text-[#8E8E93] whitespace-nowrap">{user.createdAt ? user.createdAt.slice(0, 10) : "-"}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      {/* 1. SUSPENSION MODAL (상태정지 상세모달) */}
      {suspensionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[440px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSuspensionModal({ isOpen: false, userId: null })}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">회원 제재 처리</h2>
              <p className="text-[#8E8E93] text-[13px]">지정된 사용자가 서비스를 악용하는 사례가 적발될 시 제한을 적용합니다</p>
            </div>

            {/* Target account panel */}
            {(() => {
              const targetUser = users.find(u => u.id === suspensionModal.userId);
              return targetUser ? (
                <div className="bg-[#F2F2F7] rounded-[12px] p-3 flex items-center gap-3">
                  <img src={targetUser.profileImageUrl || DEFAULT_PROFILE_IMAGE} alt="avatar" className="flex-shrink-0 w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-[13px] font-bold text-[#1C1C1E]">{targetUser.nickname}</p>
                    <p className="text-[11px] text-[#8E8E93]">{targetUser.email}</p>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Expire settings */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#8E8E93] uppercase">상태정지 기간 설정 (일)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={suspensionTime}
                  onChange={(e) => setSuspensionTime(e.target.value)}
                  className="flex-1 bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[14px] font-semibold outline-none focus:bg-white focus:border-[#FF3B30] transition"
                  placeholder="예: 7, 30, -1"
                />
              </div>
              <p className="text-[11px] font-bold text-[#FF3B30]">-1 입력 시 영구 정지</p>
            </div>

            {/* Cause specification */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#8E8E93] uppercase">이유 및 사유 기재</label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={3}
                placeholder="사용자 제재 적용의 구체적인 약관 위배 사항을 기록하여 고지함에 대비해주십시오."
                className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] p-3.5 text-[13px] outline-none focus:bg-white focus:border-[#FF3B30] resize-none transition"
              />
            </div>

            {/* Predefined info box */}
            <div className="bg-[#FF9500]/8 border-l-3 border-[#FF9500] rounded-r-lg p-3.5 text-[11.5px] leading-relaxed text-[#FF9500] font-medium">
              신고 및 제재 처리를 확정하면 해당 즉시 해당 계정의 모의거래, 게시글 작성, 프로필 변경 등이 전체 차단되거나 탈퇴 준한 제한이 걸립니다.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSuspensionModal({ isOpen: false, userId: null })}
                className="flex-1 py-3 border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] hover:border-[#8E8E93] transition text-[13px] font-bold rounded-[12px]"
              >
                취소
              </button>
              <button
                onClick={async () => {
                  if (!suspensionModal.userId) return;

                  if (!suspensionReason.trim()) {
                    triggerToast("⚠️ 정지 사유를 입력해주세요.");
                    return;
                  }

                  const days = parseInt(suspensionTime);
                  if (isNaN(days)) {
                    triggerToast("⚠️ 정지 기간을 정확히 입력해주세요.");
                    return;
                  }

                  const suspendedUntil = days === -1
                    ? null
                    : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

                  try {
                    await api.patch(`/admin/users/${suspensionModal.userId}/suspend`, {
                      suspendedUntil,
                      reason: suspensionReason,
                    });
                    await fetchUsers();
                    triggerToast("정지 처리가 완료되었습니다.");
                  } catch (error: any) {
                    triggerToast(`⚠️ ${error.response?.data?.message ?? "처리에 실패했습니다."}`);
                  }

                  setSuspensionModal({ isOpen: false, userId: null });
                }}
                className="flex-1 py-3 bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 transition text-[13px] font-bold rounded-[12px] shadow-sm cursor-pointer"
              >
                정지 적용
              </button>
            </div>

          </div>
        </div>
      )}
      {/* 2. ACTIVITY LOG MODAL (활동 로그 상세모달) */}
      {activityModal.isOpen && activityModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[640px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative">
            <button
              onClick={() => setActivityModal({ isOpen: false, user: null })}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">{activityModal.user.nickname}님의 활동 로그</h2>
              <p className="text-[#8E8E93] text-[13px]">선택된 회원이 수행한 로그인·가입·계정 변경 등 주요 활동 내역입니다</p>
            </div>

            {/* Profile banner */}
            <div className="bg-[#F2F2F7] rounded-[16px] p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={activityModal.user.profileImageUrl || DEFAULT_PROFILE_IMAGE} alt="avatar" className="flex-shrink-0 w-11 h-11 rounded-full object-cover" />
                <div>
                  <p className="text-[14px] font-bold text-[#1C1C1E]">{activityModal.user.nickname}</p>
                  <p className="text-[12px] text-[#8E8E93]">{activityModal.user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#8E8E93]">가입일</p>
                <p className="text-[13px] font-bold text-[#1C1C1E] tabular-nums">{activityModal.user.createdAt ? activityModal.user.createdAt.slice(0, 10) : "-"}</p>
              </div>
            </div>

            {/* Activity log list */}
            {activityLogsLoading ? (
              <p className="text-center text-sm text-neutral-400 py-8">불러오는 중...</p>
            ) : activityLogs.length === 0 ? (
              <p className="text-center text-sm text-neutral-400 py-8">활동 기록이 없습니다</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {activityLogs.map((log, idx) => {
                  const meta = ACTIVITY_LABELS[log.actionType] ?? { label: log.actionType, color: "bg-neutral-100 text-neutral-500" };
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-md text-[11px] font-bold", meta.color)}>
                          {meta.label}
                        </span>
                        <span className="text-[13px] text-neutral-700">{log.detail}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-neutral-400">{log.createdAt?.slice(0, 16).replace("T", " ")}</p>
                        <p className="text-[10px] text-neutral-300">{log.ipAddress ?? "-"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setActivityModal({ isOpen: false, user: null })}
                className="bg-[#1C1C1E] hover:bg-black text-white px-5 rounded-[12px]"
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 5. USER ROW RIGHT-CLICK CONTEXT MENU DROPDOWN */}
      {contextMenu.isOpen && contextMenu.user && (
        <div
          className="fixed z-[100] bg-white border border-[#E5E5EA] rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.12)] p-1.5 min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
          style={{
            top: contextMenu.y,
            left: contextMenu.x
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              openActivityModal(contextMenu.user);
              setContextMenu({ isOpen: false, x: 0, y: 0, user: null });
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13.5px] font-bold text-[#4A5DF9] hover:bg-[#4A5DF9]/10 rounded-[8px] transition cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#4A5DF9]" />
            <span>로그 보기</span>
          </button>
        </div>
      )}
    </>
  );
}
