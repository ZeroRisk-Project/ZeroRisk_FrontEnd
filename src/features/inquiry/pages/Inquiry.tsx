import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  ChevronLeft, 
  MessageSquare, 
  FileText, 
  Paperclip, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  User, 
  HelpCircle,
  Clock,
  Send,
  Trash2
} from "lucide-react";
import { cn } from "@/src/shared/lib/utils";

interface InqItem {
  id: string;
  category: string;
  title: string;
  content: string;
  date: string;
  status: "pending" | "answered";
  fileName?: string;
  answer?: string;
  answerDate?: string;
}

const DEFAULT_INQUIRIES: InqItem[] = [
  {
    id: "20260610-001",
    category: "계정 관련",
    title: "비밀번호 변경 메일이 오지 않아요",
    content: "비밀번호 찾기를 하고 보냈는데, 네이버 메일함에 재설정 인증 이메일이 도착해 있지 않습니다. 스팸 보관함도 다 확인해 봤는데 왜 안 가는지 궁금해요.",
    date: "2026.06.10",
    status: "answered",
    fileName: "screen_error.png",
    answer: "안녕하세요, 제로리스크 고객지원센터입니다.\n\n우선 서비스 이용에 불편을 드려 진심으로 죄송합니다.\n\n네이버 외부 이메일의 경우, 당사 발신 서버의 도메인 트래픽 누적으로 인해 발송 지연되거나 외부 전력 스팸 차단 필터에 의해 차단 처리되는 사례가 종종 보고되고 있습니다.\n\n임시 방편으로 고객님의 계정 상태를 기술 지원 부서에서 수동 확인하여 인증해 드리거나, 다른 Gmail 아이디 계정으로 가입 정보 변경 연동을 수동 지원해 드리고자 합니다.\n\n번거로우시겠지만, 평일 일과 시간에 당사 유선 회신을 주시거나 임시 로그인 요청을 작성해 주시면 담당자가 즉시 해결을 도와드리도록 하겠습니다.\n\n감사합니다. 즐거운 투자 하루 되세요!",
    answerDate: "2026.06.11"
  },
  {
    id: "20260615-042",
    category: "대회 관련",
    title: "대회 중 거래 종목 한정이 삼성전자뿐인가요?",
    content: "제1회 단타 대회를 가입했는데, 종목 중 매수할 수 있는 항목이 검색되지 않고 수수료만 뜨네요. 대회 주종 검색 제한이 걸린 것인가요?",
    date: "2026.06.15",
    status: "pending"
  }
];

export function Inquiry() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");
  const [inquiryType, setInquiryType] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [selectedInqId, setSelectedInqId] = useState<string | null>(null);

  // Inquiries State loaded from localStorage or fallback to defaults
  const [inquiries, setInquiries] = useState<InqItem[]>(() => {
    const saved = localStorage.getItem("mock_inquiries");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_INQUIRIES; }
    }
    return DEFAULT_INQUIRIES;
  });

  useEffect(() => {
    localStorage.setItem("mock_inquiries", JSON.stringify(inquiries));
  }, [inquiries]);

  // Handle Form validation
  const isFormValid = inquiryType !== "" && title.trim().length > 0 && content.trim().length >= 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("최대 5MB 이하의 파일만 첨부할 수 있어요.");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
      const generatedId = `${year}${month}${day}-${randomNum}`;

      const newInquiry: InqItem = {
        id: generatedId,
        category: inquiryType,
        title: title,
        content: content,
        date: `${year}.${month}.${day}`,
        status: "pending",
        fileName: file ? file.name : undefined
      };

      setInquiries([newInquiry, ...inquiries]);
      setSubmittedId(generatedId);
      setSubmitting(false);

      // Clean inputs
      setInquiryType("");
      setTitle("");
      setContent("");
      setFile(null);
    }, 1000);
  };

  const selectedInq = inquiries.find(inq => inq.id === selectedInqId);

  // Go to history tab from success state
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
                className="w-full py-3.5 bg-brand text-white font-extrabold rounded-xl hover:bg-[#3B4CD5] transition text-[14.5px] shadow-xs"
              >
                문의 내역 보러가기
              </button>
              <Link
                to="/"
                className="text-xs text-text-secondary font-extrabold hover:text-[#191F28] transition-colors py-1"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        ) : (
          /* Main Tabbed Container */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header Description */}
            <div className="flex items-center justify-center gap-2 text-center text-sm font-bold bg-brand/5 text-brand py-3 px-5 rounded-[16px] select-none">
              <Clock className="w-4  h-4 stroke-[2.5]" />
              <span>💬 평균 고객 상담 피드백 응답 대기 시간 : 24시간 이내!</span>
            </div>

            {/* Selector Tabs */}
            <div className="grid grid-cols-2 bg-[#F2F4F6] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("submit")}
                className={cn(
                  "py-3 text-[14.5px] font-black rounded-lg transition-all cursor-pointer",
                  activeTab === "submit"
                    ? "bg-white text-text-primary shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                문의 작성하기
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={cn(
                  "py-3 text-[14.5px] font-black rounded-lg transition-all cursor-pointer",
                  activeTab === "history"
                    ? "bg-white text-text-primary shadow-xs"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                내 문의 목록 ({inquiries.length})
              </button>
            </div>

            {activeTab === "submit" ? (
              /* TAB 1: SUBMIT FORM */
              <form onSubmit={handleFormSubmit} className="bg-white border border-[#F2F4F6] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                {/* 문의 유형 선택 */}
                <div className="space-y-2">
                  <label className="block text-[14px] font-extrabold text-[#191F28]">
                    문의 유형 선택 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-bg-main border border-border-color rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-bold text-sm text-[#191F28] cursor-pointer"
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                    >
                      <option value="">문의 유형을 선택해주세요 ▾</option>
                      <option value="계정 관련">계정 관련</option>
                      <option value="투자·거래 관련">투자·거래 관련</option>
                      <option value="계좌 연동 관련">계좌 연동 관련</option>
                      <option value="대회 관련">대회 관련</option>
                      <option value="포인트 관련">포인트 관련</option>
                      <option value="기타">기타</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                      <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 제목 */}
                <div className="space-y-2">
                  <label className="block text-[14px] font-extrabold text-[#191F28]">
                    제목입력 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="문의할 내용의 제목을 기술해 주세요."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-bg-main border border-border-color rounded-xl px-4 py-3 focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-bold text-sm text-[#191F28]"
                  />
                </div>

                {/* 내용 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[14px] font-extrabold text-[#191F28]">
                      상세 내용 기술 <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-text-secondary font-mono">
                      {content.length} / 1000
                    </span>
                  </div>
                  <textarea
                    placeholder="문의 내용을 10자 이상 성실하게 기술해 주세요. 계정 이름, 대회 기수명, 발생 일시를 상세히 기재해 주실 경우 훨씬 만족도 높은 수정을 서포트 받으실 수 있어요."
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 1000))}
                    className="w-full min-h-[180px] bg-bg-main border border-border-color rounded-xl p-4 focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-medium text-sm text-[#191F28] resize-none leading-relaxed"
                  />
                </div>

                {/* 파일 첨부 */}
                <div className="space-y-2.5">
                  <label className="block text-[14px] font-extrabold text-[#191F28]">
                    참고 이미지 또는 문서 첨부 <span className="text-text-secondary text-[12px] font-medium">(선택)</span>
                  </label>

                  {file ? (
                    <div className="p-3.5 bg-brand/[0.03] border border-brand/20 rounded-xl flex justify-between items-center animate-in fade-in duration-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand truncate pr-4">
                        <Paperclip className="w-4 h-4 shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] text-text-secondary font-mono shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)}MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 rounded bg-[#FFEBEC] text-[#FF3B30] hover:bg-[#FFD1D4] transition"
                        title="파일 제거"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border-color rounded-xl p-5 text-center bg-bg-main hover:bg-gray-50 transition-colors relative cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="space-y-1.5 select-none pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8B95A1] mx-auto border border-border-color/30">
                          <Paperclip className="w-4 h-4 group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="text-xs font-bold text-text-primary group-hover:text-brand transition-colors">
                          파일 첨부하기 (이미지, PDF 최대 5MB)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || submitting}
                    className={cn(
                      "w-full py-4 rounded-xl text-sm font-black transition-all flex justify-center items-center gap-2 cursor-pointer shadow-xs",
                      isFormValid && !submitting
                        ? "bg-brand text-white hover:bg-[#3B4CD5]"
                        : "bg-[#F2F4F6] text-[#8B95A1] cursor-not-allowed"
                    )}
                  >
                    {submitting ? (
                      <span className="w-5 h-5 rounded-full border-2 border-[#8B95A1] border-t-white animate-spin"></span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>문의 접수하기</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: INQUIRY HISTORY */
              <div className="space-y-3">
                {inquiries.length > 0 ? (
                  inquiries.map((inq) => {
                    const isExpanded = selectedInqId === inq.id;
                    return (
                      <div
                        key={inq.id}
                        className={cn(
                          "bg-white border rounded-3xl transition-all overflow-hidden relative shadow-sm",
                          isExpanded
                            ? "border-brand border-[2px]"
                            : "border-[#F2F4F6] hover:border-[#CBD5E1]"
                        )}
                      >
                        <button
                          onClick={() => setSelectedInqId(isExpanded ? null : inq.id)}
                          className="w-full p-5 text-left flex justify-between items-start sm:items-center gap-4 cursor-pointer"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="bg-[#F2F4F6] text-[#4E5968] text-[10px] sm:text-xs font-black px-2 py-0.5 rounded">
                                {inq.category}
                              </span>
                              <span className="text-[11px] text-text-secondary font-bold font-mono">
                                #{inq.id}
                              </span>
                            </div>
                            <h3 className={cn(
                              "font-extrabold text-[14.5px] sm:text-[16px] leading-snug transition-colors",
                              isExpanded ? "text-brand" : "text-[#191F28]"
                            )}>
                              {inq.title}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold">
                              <span className="text-text-secondary">{inq.date}</span>
                              <span className="text-gray-300">|</span>
                              {inq.status === "answered" ? (
                                <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-lg text-[11px] font-black leading-none shrink-0">
                                  답변 완료
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-[#FFF9E6] text-[#D69E2E] rounded-lg text-[11px] font-black leading-none shrink-0">
                                  답변 대기
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-start sm:self-auto relative" onClick={(e) => e.stopPropagation()}>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-brand shrink-0 cursor-pointer" onClick={() => setSelectedInqId(null)} />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-text-secondary shrink-0 cursor-pointer" onClick={() => setSelectedInqId(inq.id)} />
                            )}
                          </div>
                        </button>

                        {/* Expanded Section */}
                        {isExpanded && (
                          <div className="px-5 pb-6 pt-5 border-t border-border-color/50 bg-[#F9FAFB] animate-in slide-in-from-top-1 duration-200">
                            {/* Chat bubbles container */}
                            <div className="flex flex-col space-y-4">
                              {/* My Question Card bubble (on the left) */}
                              <div className="flex items-start justify-start gap-3 self-start max-w-[85%] text-left">
                                <div className="w-8.5 h-8.5 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                                  <User className="w-4 h-4" />
                                </div>
                                <div className="flex-1 bg-[#F2F4F6] border border-[#E2E8F0] rounded-[20px] rounded-tl-none p-4 shadow-sm text-left">
                                  <div className="text-[11px] text-[#4E5968] font-bold mb-1">내 질문</div>
                                  <p className="text-sm text-[#333D4B] leading-relaxed whitespace-pre-line font-medium">
                                    {inq.content}
                                  </p>
                                  {inq.fileName && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand font-bold bg-brand/5 px-2.5 py-1.5 rounded-md">
                                      <Paperclip className="w-3.5 h-3.5" />
                                      <span>첨부파일 : {inq.fileName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Answer bubble if any (on the right) */}
                              {inq.status === "answered" && inq.answer && (
                                <div className="flex items-start justify-end gap-3 self-end max-w-[85%] text-right animate-in fade-in duration-200">
                                  <div className="flex-1 bg-white border border-[#E2E8F0] rounded-[20px] rounded-tr-none p-4 shadow-sm text-left">
                                    <div className="flex items-center justify-between mb-1 gap-4 flex-wrap">
                                      <span className="text-xs text-brand font-black">제로리스크 고객지원</span>
                                      <span className="text-[10px] sm:text-[11px] text-[#8B95A1] font-bold">{inq.answerDate || inq.date}</span>
                                    </div>
                                    <p className="text-sm text-[#333D4B] leading-relaxed whitespace-pre-line font-semibold">
                                      {inq.answer}
                                    </p>
                                  </div>
                                  <div className="w-8.5 h-8.5 rounded-full bg-brand flex items-center justify-center text-white shrink-0 text-xs font-black">
                                    🌀
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* Empty State inside history */
                  <div className="text-center py-20 bg-white border border-dashed border-border-color/60 rounded-[28px] space-y-3">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-text-secondary text-2xl">
                      💌
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-[#191F28] text-sm">아직 등록하신 일대일 문의 내역이 없어요.</h4>
                      <p className="text-xs text-[#8B95A1] font-medium">서비스 이용 중 부과 수수료 오류, 가입 장벽 등이 확인되면 언제든 편히 남겨 주세요.</p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab("submit")}
                        className="px-4.5 py-2.5 bg-brand text-white text-xs sm:text-sm font-black rounded-lg hover:bg-[#3B4CD5] transition-colors"
                      >
                        문의 작성해 보기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
