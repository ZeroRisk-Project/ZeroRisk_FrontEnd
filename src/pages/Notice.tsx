import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Calendar, ChevronDown, ChevronUp, Bell, Megaphone } from "lucide-react";
import { Input } from "@/src/components/ui/Input";

interface NoticeItem {
  id: number;
  tag: "이벤트" | "안내" | "점검";
  title: string;
  date: string;
  content: string;
  important?: boolean;
}

const MOCK_NOTICES: NoticeItem[] = [
  {
    id: 1,
    tag: "이벤트",
    title: "실제 계좌 연동 시 100% 모의투자 보너스 지급 이벤트!",
    date: "2026.06.20",
    important: true,
    content: "안녕하세요. 제로리스크 운영팀입니다.\n\n주거래 금융사 실제 자산 연동을 진행하시는 모든 회원가입 고객님들께 추가 모의투자 머니 보너스를 즉시 100% 충전 지급해 드리는 한정 감사 프로모션 이벤트를 개최합니다!\n\n■ 이벤트 기간: 2026년 6월 20일 ~ 2026년 7월 31일까지\n■ 이벤트 대상: 제로리스크 회원 중 본인 명의 계좌 연동 1회 이상 완료 고객\n■ 혜택 내용: 계좌 연동 완료 시 마이페이지 기본 모의 잔고에 가상 포인트 1,000만 원 보너스 가산 동기화\n\n지금 리스크 없는 실전 모의고사를 안전한 보너스 머니로 시작해 보세요!\n\n감사합니다."
  },
  {
    id: 2,
    tag: "안내",
    title: "제로리스크 정식 서비스 런칭 안내 및 초보자 가이드",
    date: "2026.06.18",
    important: true,
    content: "안녕하세요. 제로리스크입니다.\n\n오랫동안 기다려주신 리스크 없는 실전 주식 모의투자 플랫폼 '제로리스크'가 정식 런칭하게 되었습니다!\n\n제로리스크는 실제 현금이 소요되지 않는 완전히 안전한 모의 전용 시뮬레이션 환경을 제공하며, 주거래 실계좌의 안전 연동을 통한 공평한 시드머니 연금 제도를 운용합니다. 실시간 주식 랭킹, 그리고 대회를 통해 나만의 실전 감각을 갈고닦아 보세요.\n\n■ 초보자를 위한 빠른 시작 가이드:\n1. 1분 간편 가입을 완료해 주세요.\n2. [마이페이지]에서 안전 계좌 연동을 눌러 시작 잔액을 지급받으세요.\n3. [주식] 및 [대회] 탭으로 이동해서 실시간 시세를 확인하며 매매 버튼을 활성화해 보세요!\n\n더 안정적이고 재미있는 서비스 제공을 위해 언제나 정직하게 최선만을 다하겠습니다.\n\n감사합니다."
  },
  {
    id: 3,
    tag: "점검",
    title: "오픈뱅킹 금융결제원 통신망 긴급 일시 점검 안내 (02:00 ~ 04:00)",
    date: "2026.06.15",
    content: "안녕하세요. 제로리스크 운영팀입니다.\n\n금융결제원 및 제휴은행 시스템의 정기 보안 패치 작업으로 인해 점검 기간 동안 실제 자산 연동 및 실시간 잔액 동기화 트랜잭션 처리가 일시 지연되거나 불가능할 수 있음을 사전 공지해 드립니다.\n\n■ 작업 시간: 2026년 6월 20일 새벽 02:00 ~ 04:00 (약 2시간)\n■ 영향 범위: 신규 실제 계좌 인증 및 기존 동기화 잔액을 기반으로 하는 시드 추가 기능 일시 중단\n\n작업 진행 중에도 이미 지급 받으신 모의 계좌 잔액을 활용한 실시간 주식 모수·매도 거래 및 커뮤니티 게시물 등록, 대회 이용은 100% 정상 가동되오니 안심하고 이용하셔도 좋습니다.\n\n신속하고 안전하게 마칠 수 있도록 상시 체크하겠습니다. 감사합니다."
  },
  {
    id: 4,
    tag: "안내",
    title: "모의투자 대회 상위 랭커 뱃지 영구 부여 및 명예의 전당 보상 설계",
    date: "2026.06.10",
    content: "안녕하세요. 제로리스크입니다.\n\n저희 메인 콘텐츠인 [투자 대회]의 투명성과 경쟁력 강화를 위하여 정기 마스터 선발 대회 입상자에 대한 영구 뱃지 제도가 전격 수립되었습니다.\n\n■ 뱃지 수혜 규칙:\n- 우승(1위): 우승 황금 마크 프로필 뱃지\n- 2위 및 3위: 실버 및 브론즈 왕관 프로필 뱃지\n- 뱃지는 닉네임 옆에 마운트되어 다른 모든 타인 커뮤니티 및 랭킹창에서 함께 표출됩니다.\n\n수익 극대화의 재미를 함께 도모하며 명예의 전당 주인이 되어보세요.\n\n감사합니다."
  }
];

export function Notice() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"전체" | "안내" | "점검" | "이벤트">("전체");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredNotices = MOCK_NOTICES.filter((notice) => {
    const matchesTab = activeTab === "전체" || notice.tag === activeTab;
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[800px] mx-auto w-full px-4 sm:px-6 py-6 animate-in fade-in duration-500">
      {/* Header with Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          id="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 돌아가기
        </button>
      </div>

      {/* Hero Headline */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#191F28] tracking-tight">
          소식과 공지사항을<br />
          직접 확인해 보세요
        </h2>
      </div>

      {/* Search notice */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B95A1]" />
        <Input
          placeholder="궁금한 공지 키워드를 검색해 보세요"
          className="w-full h-[52px] pl-11 bg-white border-[#E5E8EB] rounded-xl text-[15px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Tabs */}
      <div className="flex border-b border-[#E5E8EB] mb-6 gap-5">
        {(["전체", "안내", "점검", "이벤트"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedId(null);
            }}
            className={`font-extrabold text-[14.5px] pb-2.5 transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === tab
                ? "border-brand text-brand"
                : "border-transparent text-[#8B95A1] hover:text-[#4E5968]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notice List */}
      <div className="space-y-3">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isExpanded = expandedId === notice.id;
            return (
              <div
                key={notice.id}
                className={`bg-white rounded-3xl border transition-all ${
                  notice.important
                    ? "border-brand border-[2px] shadow-sm"
                    : isExpanded
                      ? "border-[#F2F4F6] shadow-sm bg-[#F9FAFB]"
                      : "border-[#F2F4F6] hover:bg-[#F9FAFB] shadow-sm"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.tag === "이벤트" && (
                        <span className="text-[10.5px] font-extrabold text-[#4E5968] bg-[#F2F4F6] px-2 py-0.5 rounded-md">
                          이벤트
                        </span>
                      )}
                      {notice.tag === "안내" && (
                        <span className="text-[10.5px] font-extrabold text-[#4E5968] bg-[#F2F4F6] px-2 py-0.5 rounded-md">
                          안내
                        </span>
                      )}
                      {notice.tag === "점검" && (
                        <span className="text-[10.5px] font-extrabold text-[#4E5968] bg-[#F2F4F6] px-2 py-0.5 rounded-md">
                          점검
                        </span>
                      )}
                      {notice.important && (
                        <span className="text-[10.5px] font-extrabold text-brand bg-brand/10 px-2 py-0.5 rounded-md">
                          공지
                        </span>
                      )}
                    </div>
                    <h3 className={`font-extrabold text-[15px] sm:text-base leading-snug ${
                      notice.important ? "text-[#191F28]" : "text-[#333D4B]"
                    }`}>
                      {notice.title}
                    </h3>
                    <div className="flex items-center text-xs text-[#8B95A1] font-medium gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{notice.date}</span>
                    </div>
                  </div>

                  <div className="text-[#8B95A1] min-w-[24px] pt-1 flex justify-end">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-brand" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-6 pt-1 border-t border-[#E5E8EB] bg-[#F9FAFB] rounded-b-2xl animate-in slide-in-from-top-1 duration-200">
                    <p className="text-sm text-[#4E5968] font-medium leading-relaxed whitespace-pre-wrap pt-4">
                      {notice.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#F2F4F6] text-[#8B95A1] font-bold text-sm shadow-sm">
            등록된 공지사항이 존재하지 않습니다.
          </div>
        )}
      </div>
    </div>
  );
}
