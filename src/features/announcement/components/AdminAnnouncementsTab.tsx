import React from "react";
import { X } from "lucide-react";
import { Button } from "@/src/shared/components/ui/Button";

const ANNOUNCEMENT_TAG_LABELS: Record<string, string> = {
  EVENT: "이벤트",
  GUIDE: "안내",
  MAINTENANCE: "점검",
};

interface AdminAnnouncementsTabProps {
  announcements: any[];
  openAnnouncementCreate: () => void;
  openAnnouncementEdit: (announcement: any) => void;
  handleAnnouncementDelete: (id: number) => Promise<void>;
  announcementModal: { isOpen: boolean; announcement: any | null };
  setAnnouncementModal: (v: { isOpen: boolean; announcement: any | null }) => void;
  announcementForm: { tag: string; title: string; content: string; isImportant: boolean };
  setAnnouncementForm: React.Dispatch<React.SetStateAction<{ tag: string; title: string; content: string; isImportant: boolean }>>;
  handleAnnouncementSubmit: () => Promise<void>;
}

export function AdminAnnouncementsTab({
  announcements, openAnnouncementCreate, openAnnouncementEdit, handleAnnouncementDelete,
  announcementModal, setAnnouncementModal, announcementForm, setAnnouncementForm, handleAnnouncementSubmit,
}: AdminAnnouncementsTabProps) {
  return (
    <>
              <div id="admin-announcements-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">공지사항</h1>
                    <p className="text-[#8E8E93] text-[14px]">서비스 공지사항 게시판을 관리합니다</p>
                  </div>
                  <Button
                    onClick={openAnnouncementCreate}
                    className="bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 text-white rounded-[12px] text-[13px] font-bold px-4"
                  >
                    공지사항 등록
                  </Button>
                </div>

                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-20 text-center whitespace-nowrap">태그</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">제목</th>
                          <th className="py-3.5 px-4 w-24 text-center whitespace-nowrap">중요</th>
                          <th className="py-3.5 px-4 w-32 text-center whitespace-nowrap">등록일</th>
                          <th className="py-3.5 px-4 w-40 text-center whitespace-nowrap">관리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {announcements.map((announcement) => (
                          <tr key={announcement.id} className="h-[56px] hover:bg-[#FAFAFA] transition-colors text-sm">
                            <td className="py-2 px-4 text-center whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block bg-[#4A5DF9]/11 text-[#4A5DF9]">
                                {ANNOUNCEMENT_TAG_LABELS[announcement.tag] ?? announcement.tag}
                              </span>
                            </td>
                            <td className="py-2 px-4 font-bold text-[#1C1C1E]">{announcement.title}</td>
                            <td className="py-2 px-4 text-center whitespace-nowrap">
                              {announcement.isImportant ? (
                                <span className="px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block bg-[#FF3B30]/11 text-[#FF3B30]">중요</span>
                              ) : (
                                <span className="text-[#8E8E93] text-xs">-</span>
                              )}
                            </td>
                            <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">
                              {announcement.createdAt ? announcement.createdAt.slice(0, 10) : "-"}
                            </td>
                            <td className="py-2 px-4 text-center whitespace-nowrap">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => openAnnouncementEdit(announcement)}
                                  className="px-2.5 py-1.5 bg-[#F2F2F7] text-[#8E8E93] hover:text-[#1C1C1E] text-xs font-bold rounded-[8px] transition cursor-pointer"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => handleAnnouncementDelete(announcement.id)}
                                  className="px-2.5 py-1.5 border border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/5 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {announcements.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-[#8E8E93] text-[13px] font-bold">
                              등록된 공지사항이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      {/* ANNOUNCEMENT CREATE/EDIT MODAL */}
      {announcementModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[520px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAnnouncementModal({ isOpen: false, announcement: null })}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">
                {announcementModal.announcement ? "공지사항 수정" : "공지사항 등록"}
              </h2>
              <p className="text-[#8E8E93] text-[13px]">서비스 공지사항 게시판에 노출됩니다</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#8E8E93]">태그</label>
                <select
                  value={announcementForm.tag}
                  onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, tag: e.target.value }))}
                  className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[13.5px] font-bold outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                >
                  <option value="EVENT">이벤트</option>
                  <option value="GUIDE">안내</option>
                  <option value="MAINTENANCE">점검</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#8E8E93]">제목</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[13.5px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all"
                  placeholder="공지 제목을 입력하세요"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#8E8E93]">내용</label>
                <textarea
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full bg-[#F2F2F7] border border-transparent rounded-[12px] px-3.5 py-2.5 text-[13.5px] outline-none focus:bg-white focus:border-[#4A5DF9] transition-all resize-none"
                  placeholder="공지 내용을 입력하세요"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={announcementForm.isImportant}
                  onChange={(e) => setAnnouncementForm((prev) => ({ ...prev, isImportant: e.target.checked }))}
                  className="w-4 h-4 accent-[#4A5DF9]"
                />
                <span className="text-[13px] font-bold text-[#1C1C1E]">중요 공지로 표시</span>
              </label>
            </div>

            <div className="flex gap-2.5 mt-1 shrink-0">
              <Button
                onClick={handleAnnouncementSubmit}
                disabled={!announcementForm.title.trim() || !announcementForm.content.trim()}
                className="flex-1 bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 text-white rounded-[12px] text-[13px] font-bold disabled:opacity-40"
              >
                {announcementModal.announcement ? "수정 완료" : "등록"}
              </Button>
              <button
                onClick={() => setAnnouncementModal({ isOpen: false, announcement: null })}
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
