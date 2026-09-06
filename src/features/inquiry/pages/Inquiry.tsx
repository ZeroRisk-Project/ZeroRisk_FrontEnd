import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  ChevronUp,
  ChevronDown,
  User,
  HelpCircle,
  Clock,
  Send,
} from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import { createInquiry, getMyInquiries } from "@/src/features/inquiry/api/inquiry";

const CATEGORY_OPTIONS = ["계정 관련", "투자·거래 관련", "계좌 연동 관련", "대회 관련", "포인트 관련", "기타"];

function formatDate(iso: string) {
  return iso.slice(0, 10).replaceAll("-", ".");
}

export function Inquiry() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");
  const [inquiryType, setInquiryType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [selectedInqId, setSelectedInqId] = useState<number | null>(null);

  const inquiriesQuery = useQuery({
    queryKey: ["inquiries", "me"],
    queryFn: () => getMyInquiries(),
    enabled: activeTab === "history",
  });

  const inquiries = inquiriesQuery.data?.content ?? [];

  const isFormValid = inquiryType !== "" && title.trim().length > 0 && content.trim().length >= 10;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const created = await createInquiry({
        category: inquiryType,
        title,
        content,
      });

      setSubmittedId(created.id);
      await queryClient.invalidateQueries({ queryKey: ["inquiries", "me"] });

      setInquiryType("");
      setTitle("");
      setContent("");
    } catch (error) {
      console.error(error);
      alert("문의 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const viewHistory = () => {
    setSubmittedId(null);
    setActiveTab("history");
  };

  return (
    <div className="bg-bg-main min-h-screen font-sans pb-20">
      {/* Top Header GNB */}
      <div className="max-w-3xl mx-auto pt-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          id="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 돌아가기
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-8">
        {submittedId ? (
          /* Success Submit Message */
          <div className="bg-white border border-[#F2F4F6] rounded-3xl p-8 text-center space-y-6 shadow-sm animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[#191F28]">문의가 성공적으로 접수됐어요!</h2>
              <p className="text-sm text-text-secondary font-semibold max-w-sm mx-auto leading-relaxed">
                작성해 주신 내용을 기반으로 세심히 분석하여 빠른 시일 내에 답변드릴게요. 평균 응답 대기시간은 24시간 이내입니다.
              </p>
            </div>
            <div className="bg-bg-main p-4.5 rounded-[16px] text-xs font-bold text-text-secondary border border-border-color/40 max-w-xs mx-auto">
              <div>접수 고유 번호</div>
              <div className="text-text-primary text-[14px] mt-1 font-black underline underline-offset-2 decoration-brand/35">
                #{submittedId}
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2 max-w-xs mx-auto">
              <button
                type="button"
                onClick={viewHistory}
                className="w-full py-3.5 bg-[#191F28] text-white rounded-2xl font-bold text-sm hover:bg-[#191F28]/90 transition cursor-pointer"
              >
                문의 내역 확인하기
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-3.5 bg-white text-text-secondary border border-[#F2F4F6] rounded-2xl font-bold text-sm hover:bg-bg-main transition cursor-pointer"
              >
                돌아가기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-[26px] font-black text-[#191F28] flex items-center gap-2">
                <HelpCircle className="w-7 h-7 text-brand" /> 1:1 문의
              </h1>
              <p className="text-sm text-text-secondary font-semibold mt-1">
                궁금하신 점을 남겨주시면 빠르게 답변드릴게요.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-[#F2F4F6] p-1 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("submit")}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer",
                  activeTab === "submit" ? "bg-white text-[#191F28] shadow-sm" : "text-text-secondary",
                )}
              >
                문의하기
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer",
                  activeTab === "history" ? "bg-white text-[#191F28] shadow-sm" : "text-text-secondary",
                )}
              >
                문의 내역
              </button>
            </div>

            {activeTab === "submit" ? (
              <form onSubmit={handleFormSubmit} className="bg-white border border-[#F2F4F6] rounded-3xl p-6 space-y-5 shadow-sm">
                <div>
                  <label className="text-sm font-bold text-[#191F28] mb-2 block">문의 유형</label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#F2F4F6] bg-bg-main text-sm font-medium outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="">선택해주세요</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#191F28] mb-2 block">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력해주세요"
                    className="w-full h-12 px-4 rounded-xl border border-[#F2F4F6] bg-bg-main text-sm font-medium outline-none focus:ring-2 focus:ring-brand placeholder:text-text-secondary/60"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#191F28] mb-2 block">내용</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="문의하실 내용을 10자 이상 입력해주세요"
                    className="w-full h-40 p-4 rounded-xl border border-[#F2F4F6] bg-bg-main text-sm font-medium outline-none focus:ring-2 focus:ring-brand resize-none placeholder:text-text-secondary/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className="w-full py-3.5 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand/90 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "접수 중..." : "문의 접수하기"}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {inquiriesQuery.isLoading ? (
                  <div className="p-10 text-center text-text-secondary text-sm">불러오는 중...</div>
                ) : inquiries.length === 0 ? (
                  <div className="p-10 text-center text-text-secondary text-sm bg-white border border-[#F2F4F6] rounded-3xl">
                    등록한 문의가 없습니다.
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="bg-white border border-[#F2F4F6] rounded-2xl overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedInqId(selectedInqId === inq.id ? null : inq.id)}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "text-[11px] font-bold px-2 py-0.5 rounded-full",
                                inq.status === "ANSWERED"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-amber-50 text-amber-600",
                              )}
                            >
                              {inq.status === "ANSWERED" ? "답변완료" : "답변대기"}
                            </span>
                            <span className="text-[11px] text-text-secondary font-semibold">
                              {inq.category}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#191F28] truncate">{inq.title}</p>
                          <p className="text-[11px] text-text-secondary font-medium mt-0.5">
                            {formatDate(inq.createdAt)}
                          </p>
                        </div>
                        {selectedInqId === inq.id ? (
                          <ChevronUp className="w-5 h-5 text-text-secondary shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-secondary shrink-0" />
                        )}
                      </button>

                      {selectedInqId === inq.id && (
                        <div className="px-4 pb-4 space-y-3 border-t border-[#F2F4F6] pt-3">
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {inq.content}
                          </p>

                          {inq.status === "ANSWERED" && inq.answer ? (
                            <div className="bg-bg-main rounded-xl p-4 space-y-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                                <User className="w-3.5 h-3.5" /> 답변
                                {inq.answeredAt && (
                                  <span className="text-text-secondary font-medium ml-auto">
                                    {formatDate(inq.answeredAt)}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-[#191F28] leading-relaxed whitespace-pre-wrap">
                                {inq.answer}
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary bg-bg-main rounded-xl p-3">
                              <Clock className="w-3.5 h-3.5" /> 답변을 준비 중입니다.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
