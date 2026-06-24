import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, Scale, ArrowUpRight, HelpCircle } from "lucide-react";

export function Terms() {
  const navigate = useNavigate();

  // Refs for quick jumping
  const sec1Ref = useRef<HTMLDivElement>(null);
  const sec2Ref = useRef<HTMLDivElement>(null);
  const sec3Ref = useRef<HTMLDivElement>(null);
  const sec4Ref = useRef<HTMLDivElement>(null);
  const sec5Ref = useRef<HTMLDivElement>(null);
  const sec6Ref = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="bg-bg-main min-h-screen font-sans pb-20">
      {/* Top Header */}
      <div className="max-w-3xl mx-auto pt-6 px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          id="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 돌아가기
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
        {/* Title Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-border-color/60 pb-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-[#191F28]">서비스 이용약관</h1>
          </div>
          <div className="text-right text-xs text-text-secondary font-bold shrink-0 space-y-1">
            <div>버전 : v1.0</div>
            <div>시행일 : 2026년 5월 1일</div>
          </div>
        </div>

        {/* Table of Contents Card */}
        <div className="bg-white border border-border-color/50 rounded-[24px] p-6 space-y-4.5 shadow-xs select-none">
          <div className="flex items-center gap-2 text-brand">
            <Scale className="w-4.5 h-4.5" />
            <span className="text-[14px] font-black">목차 가이딩</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[14px] sm:text-[15px] font-extrabold text-text-primary">
            <button
              type="button"
              onClick={() => scrollToSection(sec1Ref)}
              className="px-4.5 py-3 sm:py-3.5 rounded-xl bg-gray-100 text-left hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-all cursor-pointer flex justify-between items-center border border-transparent"
            >
              <span>제1조 목적</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(sec2Ref)}
              className="px-4.5 py-3 sm:py-3.5 rounded-xl bg-gray-100 text-left hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-all cursor-pointer flex justify-between items-center border border-transparent"
            >
              <span>제2조 회원가입</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(sec3Ref)}
              className="px-4.5 py-3 sm:py-3.5 rounded-xl bg-gray-100 text-left hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-all cursor-pointer flex justify-between items-center border border-transparent"
            >
              <span>제3조 서비스 이용</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(sec4Ref)}
              className="px-4.5 py-3 sm:py-3.5 rounded-xl bg-gray-100 text-left hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-all cursor-pointer flex justify-between items-center border border-transparent"
            >
              <span>제4조 회원의 의무</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(sec5Ref)}
              className="px-4.5 py-3 sm:py-3.5 rounded-xl bg-gray-100 text-left hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-all cursor-pointer flex justify-between items-center border border-transparent"
            >
              <span>제5조 이용 제한</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-70" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection(sec6Ref)}
              className="px-4.5 py-3 sm:py-3.5 rounded-xl bg-gray-100 text-left hover:text-brand hover:bg-brand/5 hover:border-brand/20 transition-all cursor-pointer flex justify-between items-center border border-transparent"
            >
              <span>제6조 면책 조항</span>
              <ArrowUpRight className="w-4 h-4 text-text-secondary opacity-70" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white border border-border-color/50 rounded-[28px] p-8 sm:p-12 space-y-12 shadow-xs">
          {/* Article 1 */}
          <div ref={sec1Ref} className="space-y-4 scroll-mt-6">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block"></span>
              제1조 (목적)
            </h3>
            <p className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold">
              본 약관은 제로리스크(이하 "서비스")가 온라인 네트워크 채널망을 기반으로 제공하는 모의주식투자 플랫폼 및 이에 부가된 모의 거래, 자산 분석, 투자 대회, 랭킹 리더보드, 커뮤니티 전용 부가 기능의 이용과 관련하여 가입 회원과 서비스 제공운영진 간에 서로 충실히 지켜야 할 주요 상호 약정, 계좌 연동 인증, 권리 및 포괄적인 책임 회피 책임 한도를 명확히 규정함을 목적으로 합니다.
            </p>
          </div>

          <div className="h-px bg-border-color/60" />

          {/* Article 2 */}
          <div ref={sec2Ref} className="space-y-4 scroll-mt-6">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block"></span>
              제2조 (회원가입 및 계정 등록)
            </h3>
            <div className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold space-y-2.5">
              <p>
                1. 회원가입은 가량 이메일 주소 등록 또는 공식 승인된 소셜 제휴 로그인 대리망에 따른 제3자 계정 연동 정보 매핑을 올바르게 등록한 뒤 완료할 수 있습니다.
              </p>
              <p>
                2. 타인의 정보를 도용하여 부정 가입하거나 명의 대여, 허위 닉네임 유포 시 당사는 고유 재량에 의거 가입 승인을 직권 철회하거나 계정 전체를 임의 소거할 권한을 지닙니다.
              </p>
              <p>
                3. 만 14세 미만 유저의 계정 연동 중 일어나는 문제나 실무 가이드에 관하여서는 법정대리인의 수칙 동의를 원칙으로 합니다.
              </p>
            </div>
          </div>

          <div className="h-px bg-border-color/60" />

          {/* Article 3 */}
          <div ref={sec3Ref} className="space-y-4 scroll-mt-6">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block"></span>
              제3조 (가상 모의투자 및 서비스 이용 범위)
            </h3>
            <div className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold space-y-2.5">
              <p>
                1. 제로리스크 플랫폼 내에서 오간 모든 현금 가치 표시 수치, 거래 포인트, 체결 목록, 랭킹 상금 내역 등은 데이터 조작 결과인 가상의 수치이며, <strong>실제 통화 및 거래 가치로서의 교환, 금융 기관 간 인출 신청은 기술적으로 절대 지원되지 않으며 성격상 성립 불가능합니다.</strong>
              </p>
              <p>
                2. 실시간 제공되는 종목 시세 값정보는 제휴 증권사 통신 노이즈, 기계 전송 딜레이 이슈 등으로 본래 원시장 호가와 미세한 연동 오차가 있을 수 있으며, 당사는 이 시간 격차로 발생한 순위 변동 등 결과에 수정을 대항해 줄 책임이 없습니다.
              </p>
            </div>
          </div>

          <div className="h-px bg-border-color/60" />

          {/* Article 4 */}
          <div ref={sec4Ref} className="space-y-4 scroll-mt-6">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block"></span>
              제4조 (회원의 책임 및 권장 사양 의무)
            </h3>
            <p className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold">
              회원은 웹에 진입하여 게시글 작성, 프로필 아바타 등록 시 비방, 음란 유도, 사설 리스크 주식 홍보, 불법 인공 도구 가동을 삼가야 합니다. 이를 누락 위반하여 타 구성원에게 자산 투자적 오도적 상용 피해가 확증되는 정황이 다량 파악되면, 해당 계정은 경고 없이 글쓰기 권한 압류 조치를 받을 수 있습니다.
            </p>
          </div>

          <div className="h-px bg-border-color/60" />

          {/* Article 5 */}
          <div ref={sec5Ref} className="space-y-4 scroll-mt-6">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block"></span>
              제5조 (서비스 제공 일부 차단 및 이용 제한)
            </h3>
            <p className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold">
              긴급 서버 무정전 다운, 공통 인터넷망 먹통 지연 사례, 한국거래소의 일시 매매정지 행정 명령, 해외 주식 포맷 개정 등으로 인한 대고객 실시간 송신 체결 서비스 지연 시 당사는 문제 즉각 체크 및 최단시간 가동 조치를 올리되 보상 소송 채권 신청 등은 면책 처리함을 주주 구성원들과 조율 합의합니다.
            </p>
          </div>

          <div className="h-px bg-border-color/60" />

          {/* Article 6 */}
          <div ref={sec6Ref} className="space-y-4 scroll-mt-6">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1.5 h-5 bg-brand rounded-full inline-block"></span>
              제6조 (상호 위자료 청구 배제 및 면책 조항)
            </h3>
            <p className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold leading-relaxed">
              본 플랫폼은 위험성이 상시 노출된 주주 투자 입문 단계의 전반적 학습력 개선 및 교육용 놀이터를 원칙으로 지원합니다. <strong>어떠한 경우에도 제로리스크를 통한 추천 종목, 리밸런싱 포토 등으로 유발된 실제 금융 오프라인 계좌 내 금전적 손실 책임은 전적으로 투자 실행 당사자의 자기 판단에 귀속됩니다.</strong>
            </p>
          </div>
        </div>

        {/* Legal Version Link and Inquire pivot footer */}
        <div className="bg-brand text-white rounded-[32px] p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md relative overflow-hidden text-left">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="space-y-1.5 z-10 relative">
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
              특정 내용에 설명이 더 필요한가요?
            </h2>
            <p className="text-white/80 text-sm sm:text-[15px] font-bold">
              실무진이 언제든 서면 소명 보드를 열어 드려요.
            </p>
          </div>

          <div className="z-10 relative shrink-0 w-full sm:w-auto">
            <Link
              to="/inquiry"
              className="w-full sm:w-auto px-8 py-3 bg-white text-brand font-black text-sm sm:text-[15px] rounded-xl hover:bg-gray-50 transition-all shadow-xs inline-flex items-center justify-center text-center min-h-[44px]"
            >
              1:1 문의하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
