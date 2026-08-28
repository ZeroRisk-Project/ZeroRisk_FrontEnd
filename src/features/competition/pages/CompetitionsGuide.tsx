import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  Award, 
  Calendar, 
  Coins, 
  BarChart3, 
  RefreshCw,
  Sparkles,
  HelpCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";

export function CompetitionsGuide() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const FAQS = [
    {
      q: "대회 중 기본 계좌로도 거래할 수 있나요?",
      a: "네! 대회 계좌와 기본 계좌는 완전히 분리되어 있어 동시에 목적에 맞게 독립적으로 사용하실 수 있어요. 대회의 순위에는 오직 대회 전용 자산만 산정됩니다."
    },
    {
      q: "대회 중간에 탈퇴할 수 있나요?",
      a: "대회 참가 취소는 해당 대회가 공식적으로 시작하기 전까지만 가능해요. 일단 공식 진행 기간에 진입한 대회의 경우 중도 포기나 참가 탈퇴는 하실 수 없습니다."
    },
    {
      q: "시드머니는 어디서 오나요?",
      a: "대회 참가를 등록하시면 대회 조건에 정량 배정된 가상의 주식 투자 자금(시드머니)이 자동으로 해당 계좌로 안전하게 발급돼요. 실제 화폐가 아니므로 부담 없이 투자해 보세요!"
    },
    {
      q: "순위는 어떻게 계산되나요?",
      a: "수익률 = (현재 총 평가자산 - 최초 시드머니) / 최초 시드머니 × 100 으로 산출돼요. 소수점 이하 등 고도의 동점자가 존재할 시 최후 보유 총자산 가치가 높으신 분이 더 높은 상위 순위로 배정됩니다."
    }
  ];

  const STEPS = [
    {
      step: 1,
      icon: "📋",
      title: "대회 참가 신청",
      desc: "진행 예정 또는 진행 중인 다양한 대회 테마 중 마음에 드는 항목을 보고 신청해요."
    },
    {
      step: 2,
      icon: "💰",
      title: "대회 계좌 지급",
      desc: "대회에 고정 적용되는 전용 가상 모의계좌와 초기 시드머니가 자동 개설됩니다."
    },
    {
      step: 3,
      icon: "📈",
      title: "모의 투자",
      desc: "대회 기간 동안 제공되는 한국 실시간 거래 시세를 참고해 과감하게 매매 경쟁을 펼쳐요."
    },
    {
      step: 4,
      icon: "🎖️",
      title: "결과 발표",
      desc: "최종 수익률 순위에 따라 영예로운 리더보드 등극의 기회를 거머쥐어요."
    }
  ];

  return (
    <div className="bg-bg-main min-h-screen font-sans pb-20">
      {/* Top Navigation Row */}
      <div className="max-w-4xl mx-auto pt-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          id="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 돌아가기
        </button>
      </div>

      {/* Hero Header */}
      <section className="max-w-4xl mx-auto px-4 pt-10 pb-16 text-center space-y-6">
        <h1 className="text-3xl sm:text-5xl font-black text-[#191F28] leading-[1.3] tracking-tight">
          실력을 겨뤄보세요<br />
          1등의 투자 전략은 뭘까요?
        </h1>
        <p className="text-[#4E5968] text-base sm:text-[18px] leading-relaxed max-w-2xl mx-auto font-medium">
          모의투자 대회에서 다른 참가자들과 순위 대결을 펼치고 상위 포트폴리오를 탐색해 보세요. 다양한 컨셉과 시장 환경에서 자신의 투자 감각을 더 쉽고 재밌는 경쟁으로 키울 수 있어요.
        </p>

        {/* Quick buttons */}
        <div className="pt-2 flex justify-center gap-4">
          <Link
            to="/competitions"
            className="px-8 py-4 bg-brand text-white font-extrabold text-[15.5px] rounded-full hover:bg-[#3B4CD5] transition-all shadow-[0_4px_12px_rgba(74,93,249,0.18)]"
          >
            대회 참가신청 하러가기
          </Link>
        </div>
      </section>

      {/* 4단계 진행 방식 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-border-color/50 rounded-[28px] p-8 md:p-10 space-y-8 shadow-xs">
          <h2 className="text-2xl font-bold text-[#191F28] tracking-tight text-center">
            이렇게 진행돼요
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {STEPS.map((s, idx) => (
              <div key={s.step} className="flex flex-col items-center text-center space-y-3 relative">
                {/* Horizontal connection indicators on desktop only */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-7 -right-3.5 translate-x-1/2 text-text-secondary/40">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}

                <div className="w-14 h-14 rounded-full bg-bg-main border border-border-color/30 flex items-center justify-center text-2xl shadow-xs">
                  {s.icon}
                </div>
                <div>
                  <div className="text-xs font-black text-brand mb-0.5">STEP 0{s.step}</div>
                  <h4 className="font-extrabold text-[15px] text-[#191F28]">{s.title}</h4>
                  <p className="text-xs text-[#4E5968] mt-1.5 leading-relaxed font-medium px-2">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 대회 규칙 */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-border-color/50 rounded-[28px] p-8 md:p-10 space-y-8 shadow-xs">
          <h2 className="text-2xl font-bold text-[#191F28] tracking-tight">대회 규칙</h2>

          {/* Rules lists row items with dividers */}
          <div className="divide-y divide-border-color/60 font-medium">
            {/* Rule 1 */}
            <div className="py-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:w-48 shrink-0 text-brand">
                <Calendar className="w-5 h-5 stroke-[2]" />
                <span className="font-extrabold text-[#191F28] text-[15px]">대회 기간</span>
              </div>
              <p className="text-sm text-[#4E5968] leading-relaxed">
                관리자가 설정한 대회 진행 수칙과 기간에 준하여 운영돼요. 대회마다 기수별 진행 타임라인이 상이하니 참가 전 타임테이블을 대시보드에서 꼼꼼히 체크해 주세요.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="py-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:w-48 shrink-0 text-brand">
                <Coins className="w-5 h-5 stroke-[2]" />
                <span className="font-extrabold text-[#191F28] text-[15px]">시드머니</span>
              </div>
              <p className="text-sm text-[#4E5968] leading-relaxed">
                각 대회 규칙 조건에 정량 설정된 전용 가상 초기 보증 자산이 개설 시 자동 수급됩니다.<br />
                <span className="text-xs text-text-secondary font-semibold">(예시: 총액 1,000만 원 보증 지급 등)</span>
              </p>
            </div>

            {/* Rule 3 */}
            <div className="py-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:w-48 shrink-0 text-brand">
                <BarChart3 className="w-5 h-5 stroke-[2]" />
                <span className="font-extrabold text-[#191F28] text-[15px]">순위 기준</span>
              </div>
              <p className="text-sm text-[#4E5968] leading-relaxed">
                실현 이익금 및 미실현 평가손익금을 고루 반영한 합산 투자 수익률 기준으로 엄격히 리더보드가 실시간 갱신돼요. 동율 점수 마감 시 실질 잔고를 더 많이 획득하신 분이 최상위 배분됩니다.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="py-5 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
              <div className="flex items-center gap-2 sm:w-48 shrink-0 text-brand">
                <RefreshCw className="w-5 h-5 stroke-[2]" />
                <span className="font-extrabold text-[#191F28] text-[15px]">대회 계좌</span>
              </div>
              <p className="text-sm text-[#4E5968] leading-relaxed">
                대회 투자 실적 수치는 일반 홈 거래소의 기본 대표계좌 데이터와 철저하게 분기 분할 작동해요. 정해진 대회 일정이 마무리되면 해당 임시 시뮬레이션 머니는 완벽히 회수 정렬돼요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-border-color/50 rounded-[28px] p-8 md:p-10 space-y-6 shadow-xs">
          <h2 className="text-2xl font-bold text-[#191F28] tracking-tight">대회 관련 FAQ</h2>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border-b border-border-color/50 pb-4 last:border-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left py-2 flex justify-between items-center group cursor-pointer"
                >
                  <span className="font-extrabold text-[15px] sm:text-base text-[#191F28] hover:text-brand transition-colors flex items-center gap-2.5">
                    <span className="text-[#8E8E93] text-sm">Q.</span>
                    {faq.q}
                  </span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-5 h-5 text-brand" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8E8E93]" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <div className="pt-2 pl-6 pb-2 text-sm text-[#4E5968] leading-relaxed font-semibold animate-in fade-in duration-200">
                    <span className="text-brand font-black select-none mr-1.5">A.</span>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
