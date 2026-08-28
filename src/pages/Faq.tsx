import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, Search, ChevronDown, ChevronUp, FileQuestion, MessageSquarePlus } from "lucide-react";
import { Input } from "@/src/shared/components/ui/Input";

interface FaqItem {
  id: number;
  category: "계정" | "투자" | "계좌연동" | "대회" | "포인트";
  q: string;
  a: string;
}

const FAQ_DATA: FaqItem[] = [
  // 계정
  {
    id: 1,
    category: "계정",
    q: "비밀번호를 잊어버렸어요",
    a: "로그인 화면 하단의 '비밀번호 찾기'를 클릭하시면, 가입 시 등록하신 메일 주소로 안전한 패스워드 재설정 고유 승인 링크를 즉시 발송해 드려요."
  },
  {
    id: 2,
    category: "계정",
    q: "소셜 로그인 계정은 비밀번호가 없나요?",
    a: "네! Google 또는 카카오 간편 가입을 이용하신 경우, 별도의 사이트 패스워드를 지정하지 않고 각 공식 파트너의 공식 인증 정보 연동으로만 즉시 접속해요."
  },
  {
    id: 3,
    category: "계정",
    q: "닉네임은 몇 번까지 변경할 수 있나요?",
    a: "닉네임은 횟수 제한 없이 자유롭게 언제든지 변경하실 수 있어요! 마이페이지 → 설정 메뉴에서 특수문자를 제외한 12자 이하의 안전한 이름으로 수정해 보세요."
  },
  // 계좌연동
  {
    id: 4,
    category: "계좌연동",
    q: "계좌를 연동하면 돈이 빠져나가나요?",
    a: "절대 아니에요! 금융결제원 공공 오픈파이프를 통한 단순 잔액 조회 라이센스만 안전하게 인증하므로, 실제 어떠한 출금이나 일방적인 자금 이체 프로세스는 일어나지 않아요."
  },
  {
    id: 5,
    category: "계좌연동",
    q: "어떤 은행 계좌를 연동할 수 있나요?",
    a: "오픈뱅킹 활성화 망에 공식 가입된 시중 내 1금융권 은행 및 주요 2금융권 금융사들의 유효 모바일 계좌라면 원활히 지정 및 연동 가능해요."
  },
  {
    id: 6,
    category: "계좌연동",
    q: "하루에 몇 번 계좌를 재동화(재인증)할 수 있나요?",
    a: "일일 최대 1회의 수동 실시간 자산 재인증(충전 요청)이 가능해요. 외부 연동 잔고 금액이 등락하여 자산 합계 수치가 늘어난 조건만큼 계좌 차액 포인트를 추가 갱신해 드려요."
  },
  {
    id: 7,
    category: "계좌연동",
    q: "잔액이 줄면 내 시드머니 포인트도 강제 회수되나요?",
    a: "아니요! 기존 연동 승인을 통해 이미 정상 배정받은 내 투자 시드머니 포인트는 회수되지 않고 그대로 안전하게 유지돼요. 외부 잔액이 다시 증가할 경우에 한해 격차 금액만큼의 추가 충전만 이뤄집니다."
  },
  // 투자
  {
    id: 8,
    category: "투자",
    q: "실제 주식 시세를 실시간 사용하나요?",
    a: "네, 제로리스크는 공식 제휴된 한국투자증권(KIS) 실시간 웹 오픈 API 소켓 채널 기술을 탑재했어요. 실제 KOSPI·KOSDAQ 호가 매수/매도 시스템과 100% 동일한 변동 지수를 실시간 차트로 공급받아 반영합니다."
  },
  {
    id: 9,
    category: "투자",
    q: "모의투자 자금을 초기화하고 처음부터 다시 하고 싶어요.",
    a: "마이페이지 우측 상단 톱니바퀴 [설정] → [투자 설정] 메뉴 하단에서 언제든지 자산 투자 히스토리를 깔끔하게 영(0)으로 밀거나 기본 5천만 원 값으로 완전 초깃값 복구 처리를 하실 수 있습니다."
  },
  // 대회
  {
    id: 10,
    category: "대회",
    q: "대회 참가는 유료인가요? 별도 수수료가 드나요?",
    a: "아니요! 제로리스크가 공인 주관 또는 개인이 개설하는 기수별 모의투자 리그의 승인 신청과 순위 대결 참여는 평생 100% 비용 납부 없는 완벽한 무료 챌린지 혜택입니다."
  },
  {
    id: 11,
    category: "대회",
    q: "대회 계좌와 평시 내 기본 모의계좌는 별개인가요?",
    a: "네! 서로 간섭하지 않도록 완전히 독립된 보증 금고로 분리 운영되며, 대회 모의 매수가 기본 총자산 수익 분석 흐름을 흔들지 않고 종료 일자 정산 시 리셋되도록 설계되어 있습니다."
  }
];

export function Faq() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"전체" | "계정" | "투자" | "계좌연동" | "대회" | "포인트">("전체");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  // Filtration logic
  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = activeTab === "전체" || item.category === activeTab;
    const matchesSearch = searchQuery.trim() === "" || 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-bg-main min-h-screen font-sans pb-20">
      {/* Top Navigation Header */}
      <div className="max-w-3xl mx-auto pt-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          id="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 돌아가기
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        {/* Banner Headers */}
        <div className="space-y-1.5 text-center sm:text-left">
          <h1 className="text-3xl font-black text-[#191F28]">도움이 필요하신가요?</h1>
          <p className="text-[#8B95A1] font-medium text-sm">많은 유저들이 공통적으로 자주 묻는 가이드를 먼저 체크해 보세요.</p>
        </div>

        {/* Large Premium Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B95A1]" />
          <Input
            placeholder="궁금한 내용을 검색해 보세요 (예: 비밀번호, 출금, 포인트)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedFaqId(null); // fold items on query change
            }}
            className="w-full h-[52px] pl-11 bg-white border-[#E5E8EB] rounded-xl text-[15px]"
          />
        </div>

        {/* Category Tabs Scroll Wrapper */}
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 py-2 flex gap-2">
          {(["전체", "계정", "계좌연동", "투자", "대회", "포인트"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExpandedFaqId(null); // fold accordion
              }}
              className={`px-4.5 py-2.5 rounded-full text-sm font-black whitespace-nowrap border transition-all cursor-pointer ${
                activeTab === tab
                ? "bg-brand text-white border-transparent"
                : "bg-white text-text-secondary border-border-color/50 hover:bg-gray-50 hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FAQ Accordion Render */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(item => (
              <div
                key={item.id}
                className="bg-white border border-[#F2F4F6] rounded-3xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full text-left px-5 py-4 flex justify-between items-center gap-4 cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[12px] font-black text-brand bg-brand/10 px-2 py-0.5 rounded-md shrink-0 select-none">
                      {item.category}
                    </span>
                    <span className="font-extrabold text-sm sm:text-[15px] text-[#191F28] hover:text-brand transition-colors">
                      {item.q}
                    </span>
                  </span>
                  {expandedFaqId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-brand shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-secondary shrink-0" />
                  )}
                </button>

                {expandedFaqId === item.id && (
                  <div className="bg-bg-main/50 px-5 py-4 text-xs sm:text-sm text-[#4E5968] leading-relaxed font-semibold border-t border-border-color/30 animate-in slide-in-from-top-1 duration-150">
                    <span className="text-brand font-black select-none mr-1.5 text-md">A.</span>
                    {item.a}
                  </div>
                )}
              </div>
            ))
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white border border-[#F2F4F6] rounded-3xl space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-text-secondary">
                <FileQuestion className="w-6 h-6 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-[15px] text-text-primary">검색 결과가 없어요.</h4>
                <p className="text-xs text-text-secondary font-medium">단어를 축약하거나 다른 키워드로 검색해 보세요.</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/inquiry"
                  className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-brand/5 text-brand font-black text-xs sm:text-sm rounded-lg hover:bg-brand/10 transition-colors"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>1:1 문의 바로가기</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
