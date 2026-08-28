import React from "react";
import { X } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import api from "@/src/shared/lib/api";

interface AdminInquiriesTabProps {
  inquiries: any[];
  inquiryFilterTab: "전체" | "PENDING" | "ANSWERED";
  setInquiryFilterTab: (v: any) => void;
  answerModal: { isOpen: boolean; inquiry: any | null };
  setAnswerModal: (v: { isOpen: boolean; inquiry: any | null }) => void;
  answerText: string;
  setAnswerText: (v: string) => void;
  fetchInquiries: () => Promise<void>;
  triggerToast: (msg: string) => void;
}

export function AdminInquiriesTab({
  inquiries, inquiryFilterTab, setInquiryFilterTab, answerModal, setAnswerModal,
  answerText, setAnswerText, fetchInquiries, triggerToast,
}: AdminInquiriesTabProps) {
  return (
    <>
              <div id="admin-inquiries-panel" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-[24px] font-bold text-[#1C1C1E]">1:1 문의 관리</h1>
                    <p className="text-[#8E8E93] text-[14px]">사용자들이 접수한 건의사항 및 기술지원 건을 검토하고 답변합니다</p>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1 bg-[#F2F2F7] p-1 rounded-[12px] w-fit">
                  {[
                    { key: "전체", count: inquiries.length },
                    { key: "PENDING", count: inquiries.filter(i => i.status === "PENDING").length, label: "미답변" },
                    { key: "ANSWERED", count: inquiries.filter(i => i.status === "ANSWERED").length, label: "답변완료" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setInquiryFilterTab(tab.key as any)}
                      className={cn(
                        "px-4 py-2 text-xs font-bold rounded-[10px] transition-all duration-200 flex items-center gap-1.5",
                        inquiryFilterTab === tab.key
                          ? "bg-white text-[#1C1C1E] shadow-sm"
                          : "text-[#8E8E93] hover:text-[#1C1C1E]"
                      )}
                    >
                      <span>{tab.label ?? tab.key}</span>
                      {tab.key === "PENDING" && tab.count > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF9500] text-white">
                          {tab.count}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8E8E93]/20 text-[#8E8E93]">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Inquiries Table */}
                <div className="bg-white rounded-[16px] border border-[#E5E5EA] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#F2F2F7] text-xs font-bold text-[#8E8E93] border-b border-[#E5E5EA]">
                          <th className="py-3.5 px-4 w-12 text-center whitespace-nowrap">No.</th>
                          <th className="py-3.5 px-4 w-32 whitespace-nowrap">작성자</th>
                          <th className="py-3.5 px-4 whitespace-nowrap">문의 제목</th>
                          <th className="py-3.5 px-4 text-center w-40 whitespace-nowrap">접수 날짜</th>
                          <th className="py-3.5 px-4 text-center w-28 whitespace-nowrap">상태</th>
                          <th className="py-3.5 px-4 text-center w-36 whitespace-nowrap">답변 제어</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {inquiries
                          .filter((i) => {
                            if (inquiryFilterTab === "전체") return true;
                            return i.status === inquiryFilterTab;
                          })
                          .map((inquiry, idx) => (
                            <tr key={inquiry.id} className="h-[60px] hover:bg-[#FAFAFA] transition-colors text-sm">
                              <td className="py-2 px-4 text-center font-bold text-[#8E8E93] whitespace-nowrap">{idx + 1}</td>
                              <td className="py-2 px-4 font-bold text-[#1C1C1E] whitespace-nowrap">{inquiry.authorNickname}</td>
                              <td className="py-2 px-4 font-semibold text-[#1C1C1E] max-w-sm truncate whitespace-nowrap">{inquiry.title}</td>
                              <td className="py-2 px-4 text-center text-[#8E8E93] tabular-nums whitespace-nowrap">
                                {inquiry.createdAt?.slice(0, 10)}
                              </td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-[16px] text-xs font-black uppercase inline-block",
                                  inquiry.status === "PENDING" ? "bg-[#FF9500]/11 text-[#FF9500]" : "bg-[#34C759]/11 text-[#34C759]"
                                )}>
                                  {inquiry.status === "PENDING" ? "미답변" : "답변완료"}
                                </span>
                              </td>
                              <td className="py-2 px-4 text-center whitespace-nowrap">
                                {inquiry.status === "PENDING" ? (
                                  <button
                                    onClick={() => {
                                      setAnswerText("");
                                      setAnswerModal({ isOpen: true, inquiry });
                                    }}
                                    className="px-3.5 py-1.5 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/90 text-xs font-bold rounded-[8px] transition shadow-sm cursor-pointer"
                                  >
                                    답변하기
                                  </button>
                                ) : (
                                  <div className="flex gap-2 justify-center">
                                    <button
                                      onClick={() => {
                                        setAnswerText(inquiry.answer || "");
                                        setAnswerModal({ isOpen: true, inquiry });
                                      }}
                                      className="px-3.5 py-1.5 bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 text-xs font-bold rounded-[8px] transition cursor-pointer"
                                    >
                                      답변 수정
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
      {/* 3. ANSWER INQUIRY MODAL (1:1 문의 답변 및 작성 창) */}
      {answerModal.isOpen && answerModal.inquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] w-full max-w-[680px] p-8 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-5 relative">
            <button
              onClick={() => setAnswerModal({ isOpen: false, inquiry: null })}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pb-2 border-b border-[#E5E5EA]">
              <h2 className="text-[19px] font-bold text-[#1C1C1E]">1:1 고객문의 처리</h2>
              <p className="text-[#8E8E93] text-[13px]">고객이 접수한 불편 애로사항을 청취해 성실히 전문성 있게 자문 처리해 주십시오</p>
            </div>

            {/* Left and Right Split Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

              {/* Left Panel: Query content display view only */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#4A5DF9]/10 text-[#4A5DF9] text-[10px] font-bold px-1.5 py-0.5 rounded">유저접수본</span>
                    <span className="text-[12px] text-[#8E8E93] tabular-nums">{answerModal.inquiry.createdAt?.slice(0, 10)}</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[#1C1C1E] leading-snug">{answerModal.inquiry.title}</h4>

                  <div className="h-[200px] overflow-y-auto bg-[#F2F2F7] rounded-[12px] p-4 text-[13px] text-[#333] font-medium leading-relaxed mt-2.5">
                    {answerModal.inquiry.content}
                  </div>
                </div>

                <div className="text-[12px] text-[#8E8E93] font-semibold">
                  작성자: <span className="text-[#1C1C1E] font-bold">{answerModal.inquiry.authorNickname}</span>
                </div>
              </div>

              {/* Right Panel: Admin Response editor area */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-bold text-[#8E8E93] uppercase">처리 답변 기재 창</label>
                    {answerModal.inquiry.status === "ANSWERED" && (
                      <span className="bg-[#34C759]/11 text-[#34C759] text-[10px] font-bold px-1.5 py-0.5 rounded">답변 완료본 복수 수정</span>
                    )}
                  </div>

                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="인사말, 해당 이슈에 대한 팩트체크 및 조치 예정 사항 등을 상세히 기답해 주시기 바랍니다."
                    className="w-full h-[200px] bg-[#F2F2F7] border border-transparent rounded-[12px] p-3.5 text-[13px] outline-none focus:bg-white focus:border-[#4A5DF9] resize-none transition"
                  />
                </div>

                {/* Confirm Action Button */}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!answerText.trim()) return;
                      const isEdit = answerModal.inquiry!.status === "ANSWERED";
                      try {
                        await api.post(`/admin/inquiries/${answerModal.inquiry!.id}/answer`, { answer: answerText });
                        await fetchInquiries();
                        triggerToast(`문의 #${answerModal.inquiry!.id}번에 대한 답변이 ${isEdit ? "수정" : "등록"}되었습니다.`);
                        setAnswerModal({ isOpen: false, inquiry: null });
                      } catch (error: any) {
                        triggerToast(`⚠️ ${error.response?.data?.message ?? "답변 등록에 실패했습니다."}`);
                      }
                    }}
                    className="flex-1 py-3 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/95 text-[13px] font-bold rounded-[12px] shadow-sm transition cursor-pointer text-center"
                  >
                    {answerModal.inquiry.status === "ANSWERED" ? "답변 수정" : "답변 등록"}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
