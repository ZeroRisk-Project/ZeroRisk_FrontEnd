import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Plus, X } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import api from "@/src/shared/lib/api";

interface AdminCompetitionsTabProps {
  competitions: any[];
  fetchAdminCompetitions: () => Promise<void>;
  triggerToast: (msg: string) => void;
  logAdminAction: (type: string, target: string, content: string) => void;
  compParticipants: { [compId: number]: any[] };
  setCompParticipants: React.Dispatch<React.SetStateAction<{ [compId: number]: any[] }>>;
  selectedCompForParticipants: any | null;
  setSelectedCompForParticipants: (v: any | null) => void;
  participantsModalOpen: boolean;
  setParticipantsModalOpen: (v: boolean) => void;
  editCompModal: { isOpen: boolean; competition: any | null };
  setEditCompModal: (v: { isOpen: boolean; competition: any | null }) => void;
  editTitle: string;
  setEditTitle: (v: string) => void;
  editDescription: string;
  setEditDescription: (v: string) => void;
  editStartDate: string;
  setEditStartDate: (v: string) => void;
  editEndDate: string;
  setEditEndDate: (v: string) => void;
  editIsPublic: boolean;
  setEditIsPublic: (v: boolean) => void;
  editMaxParticipants: string;
  setEditMaxParticipants: (v: string) => void;
  editError: string;
  setEditError: (v: string) => void;
  handleEditSubmit: () => Promise<void>;
}

export function AdminCompetitionsTab({
  competitions, fetchAdminCompetitions, triggerToast, logAdminAction, compParticipants, setCompParticipants,
  selectedCompForParticipants, setSelectedCompForParticipants, participantsModalOpen, setParticipantsModalOpen,
  editCompModal, setEditCompModal, editTitle, setEditTitle, editDescription, setEditDescription,
  editStartDate, setEditStartDate, editEndDate, setEditEndDate, editIsPublic, setEditIsPublic,
  editMaxParticipants, setEditMaxParticipants, editError, setEditError, handleEditSubmit,
}: AdminCompetitionsTabProps) {
  const navigate = useNavigate();
  return (
    <>
              <div id="admin-competitions-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">대회 및 상금 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">웹 서비스상에 열려있는 주식 실시간 및 게릴라 모의투자 대회를 기획하고 배포합니다</p>
                  </div>
                  <button
                    onClick={() => navigate("/competitions/create")}
                    className="bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 text-white font-bold text-[13px] px-4 py-2.5 rounded-[12px] flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새 대회 등록</span>
                  </button>
                </div>

                {/* Competition History Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">대회명</th>
                          <th className="py-3.5 px-4 w-60 text-center whitespace-nowrap">대회 기간</th>
                          <th className="py-3.5 px-4 text-right whitespace-nowrap">시드머니</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">참가 인원</th>
                          <th className="py-3.5 px-4 text-center whitespace-nowrap">대회 상태</th>
                          <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">공개 처리</th>
                          <th className="py-3.5 px-4 text-center w-[160px] whitespace-nowrap">관리 제어</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {competitions.map((comp, idx) => {
                          const toggleOpenStatus = async () => {
                            try {
                              await api.put(`/admin/competitions/${comp.id}`, {
                                title: comp.title,
                                description: comp.description,
                                startAt: comp.startAt,
                                endAt: comp.endAt,
                                isPublic: !comp.isPublic,
                              });
                              await fetchAdminCompetitions();
                              triggerToast(`${comp.title}의 공개상태를 노출 ${!comp.isPublic ? "ON" : "OFF"} 하였습니다.`);
                              logAdminAction("기타", comp.title, `대회 공개여부를 [${!comp.isPublic ? "공개" : "비공개"}]로 설정 변경하였습니다.`);
                            } catch (error: any) {
                              triggerToast(`⚠️ ${error.response?.data?.message ?? "변경에 실패했습니다."}`);
                            }
                          };

                          const handleDeleteComp = async () => {
                            try {
                              await api.delete(`/admin/competitions/${comp.id}`);
                              await fetchAdminCompetitions();
                              triggerToast(`${comp.title}이 성공적으로 파기/삭제 되었습니다.`);
                              logAdminAction("기타", comp.title, `대회 파기 및 강제 해산 처리를 수행하였습니다.`);
                            } catch (error: any) {
                              triggerToast(`⚠️ ${error.response?.data?.message ?? "삭제에 실패했습니다."}`);
                            }
                          };

                          return (
                            <tr key={comp.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                              <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                              <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{comp.title}</td>
                              <td className="py-2 px-4 text-center font-medium text-[#8E8E93] tabular-nums whitespace-nowrap">
                                {comp.startAt?.slice(0, 10)} ~ {comp.endAt?.slice(0, 10)}
                              </td>
                              <td className="py-2 px-4 text-right font-bold text-[#1C1C1E] tabular-nums whitespace-nowrap">
                                ₩{comp.seedMoney.toLocaleString()}
                              </td>
                              <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums font-semibold whitespace-nowrap">{comp.participantCount ?? 0}명</td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                  comp.status === "SCHEDULED" && "bg-[#FF9500]/11 text-[#FF9500]",
                                  comp.status === "ONGOING" && "bg-[#34C759]/11 text-[#34C759]",
                                  comp.status === "CALCULATING" && "bg-[#4A5DF9]/11 text-[#4A5DF9]",
                                  comp.status === "ENDED" && "bg-[#8E8E93]/11 text-[#8E8E93]"
                                )}>
                                  {comp.status === "SCHEDULED" ? "대기 중" : comp.status === "ONGOING" ? "진행 중" : comp.status === "CALCULATING" ? "결과 집계중" : "종료됨"}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                {/* Toggle switch style ON / OFF */}
                                <button
                                  onClick={toggleOpenStatus}
                                  className={cn(
                                    "w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative duration-200 inline-block",
                                    comp.isPublic ? "bg-[#4A5DF9]" : "bg-[#E5E5EA]"
                                  )}
                                >
                                  <div className={cn(
                                    "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                                    comp.isPublic ? "translate-x-5" : "translate-x-0"
                                  )} />
                                </button>
                              </td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={async () => {
                                      setSelectedCompForParticipants(comp);
                                      setParticipantsModalOpen(true);
                                      try {
                                        const response = await api.get(`/admin/competitions/${comp.id}/participants`);
                                        setCompParticipants(prev => ({ ...prev, [comp.id]: response.data }));
                                      } catch (error) {
                                        console.error(error);
                                        setCompParticipants(prev => ({ ...prev, [comp.id]: [] }));
                                      }
                                    }}
                                    className="px-2.5 py-1.5 border border-[#10B981] text-[#10B981] hover:bg-[#10B981]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                  >
                                    참가자
                                  </button>
                                  {comp.status === "SCHEDULED" && (
                                    <button
                                      onClick={() => {
                                        setEditCompModal({ isOpen: true, competition: comp });
                                        setEditTitle(comp.title);
                                        setEditDescription(comp.description ?? "");
                                        setEditStartDate(comp.startAt?.slice(0, 10) ?? "");
                                        setEditEndDate(comp.endAt?.slice(0, 10) ?? "");
                                        setEditIsPublic(comp.isPublic);
                                        setEditMaxParticipants(comp.maxParticipants?.toString() ?? "");
                                        setEditError("");
                                      }}
                                      className="px-2.5 py-1.5 border border-[#4A5DF9] text-[#4A5DF9] hover:bg-[#4A5DF9]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                    >
                                      수정
                                    </button>
                                  )}
                                  <button
                                    onClick={handleDeleteComp}
                                    className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      {editCompModal.isOpen && editCompModal.competition && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-[#E5E5EA] flex flex-col gap-4 text-[#1C1C1E]">
            <div className="flex justify-between items-start">
              <h3 className="text-[18px] font-bold">대회 정보 수정</h3>
              <button
                onClick={() => setEditCompModal({ isOpen: false, competition: null })}
                className="w-8 h-8 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="대회 이름"
                className="w-full border border-[#E5E5EA] rounded-[12px] py-2.5 px-3.5 text-sm font-bold outline-none focus:border-[#3182F6]"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="대회 설명"
                className="w-full border border-[#E5E5EA] rounded-[12px] py-2.5 px-3.5 text-sm outline-none focus:border-[#3182F6]"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="border border-[#E5E5EA] rounded-[12px] py-2.5 px-3 text-sm font-bold outline-none focus:border-[#3182F6]"
                />
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="border border-[#E5E5EA] rounded-[12px] py-2.5 px-3 text-sm font-bold outline-none focus:border-[#3182F6]"
                />
              </div>
              <input
                type="number"
                value={editMaxParticipants}
                onChange={(e) => setEditMaxParticipants(e.target.value)}
                placeholder="최대 참가자 수 (비우면 무제한)"
                className="w-full border border-[#E5E5EA] rounded-[12px] py-2.5 px-3.5 text-sm font-bold outline-none focus:border-[#3182F6]"
              />
              <div className="flex items-center justify-between p-3 bg-[#F2F2F7] rounded-[12px]">
                <span className="text-sm font-bold">공개 대회</span>
                <button
                  type="button"
                  onClick={() => setEditIsPublic(!editIsPublic)}
                  className={cn("w-10 h-6 rounded-full p-0.5 transition-colors relative", editIsPublic ? "bg-[#4A5DF9]" : "bg-neutral-300")}
                >
                  <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-transform", editIsPublic ? "translate-x-4" : "translate-x-0")} />
                </button>
              </div>
              {editError && <p className="text-[12px] text-[#FF3B30] font-medium">{editError}</p>}
            </div>

            <button
              onClick={handleEditSubmit}
              className="w-full py-3 bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 text-white font-bold text-[14px] rounded-[12px] transition cursor-pointer"
            >
              저장
            </button>
          </div>
        </div>
      )}
      {/* 6. COMPETITION PARTICIPANTS LIST MANAGEMENT MODAL */}
      {participantsModalOpen && selectedCompForParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[550px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative text-[#1C1C1E]">
            <button
              onClick={() => {
                setParticipantsModalOpen(false);
                setSelectedCompForParticipants(null);
              }}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pb-3 border-b border-[#E5E5EA]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FFD700]" />
                <h2 className="text-[17px] font-black text-[#1C1C1E]">대회 참가 유저 관리</h2>
              </div>
              <p className="text-[#8E8E93] text-[12.5px] font-semibold">대회명: <span className="text-[#1C1C1E] font-extrabold">{selectedCompForParticipants.title}</span></p>
            </div>

            <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1">
              {(!compParticipants[selectedCompForParticipants.id] || compParticipants[selectedCompForParticipants.id].length === 0) ? (
                <div className="py-12 text-center text-[#8E8E93] text-[13px] font-bold">
                  현재 본 대회에 등록된 참가 유저가 없습니다.
                </div>
              ) : (
                compParticipants[selectedCompForParticipants.id].map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 rounded-[12px] bg-[#F2F2F7]/50 border border-[#E5E5EA]/40 hover:bg-[#F2F2F7]/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#E5E5EA] flex items-center justify-center text-[12px] font-bold text-[#8E8E93]">
                        {user.nickname?.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-[13px] font-extrabold text-[#1C1C1E]">{user.nickname}</div>
                        <div className="text-[11px] font-semibold text-[#8E8E93]">{user.email}</div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        const hasConfirmed = window.confirm(`${user.nickname}님을 본 대회에서 강제 퇴장(실적 박탈) 시키겠습니까?`);
                        if (!hasConfirmed) return;
                        try {
                          await api.delete(`/admin/competitions/${selectedCompForParticipants.id}/participants/${user.userId}`);
                          // 목록 다시 조회해서 화면 갱신
                          const response = await api.get(`/admin/competitions/${selectedCompForParticipants.id}/participants`);
                          setCompParticipants(prev => ({ ...prev, [selectedCompForParticipants.id]: response.data }));
                          await fetchAdminCompetitions(); // 대회 목록의 참가자 수도 갱신
                          triggerToast(`${user.nickname}님이 강제 퇴장 처리되었습니다.`);
                        } catch (error: any) {
                          triggerToast(`⚠️ ${error.response?.data?.message ?? "처리에 실패했습니다."}`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-[8px] bg-[#FF3B30]/10 text-[#FF3B30] text-[11.5px] font-black hover:bg-[#FF3B30] hover:text-white transition cursor-pointer"
                    >
                      강제퇴장
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setParticipantsModalOpen(false);
                  setSelectedCompForParticipants(null);
                }}
                className="px-4 py-2 bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] text-[12.5px] font-bold rounded-[10px] transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
