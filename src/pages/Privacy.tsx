import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, Info, Search, ShieldAlert, Award, User, HelpCircle } from "lucide-react";

export function Privacy() {
  const navigate = useNavigate();

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

      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-8">
        {/* Title headers */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-border-color/60 pb-5">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black text-[#191F28] tracking-tight">개인정보처리방침</h1>
          </div>
          <div className="text-right text-xs text-text-secondary font-bold shrink-0 space-y-0.5">
            <div>시행일자 : 2026년 5월 1일</div>
          </div>
        </div>

        {/* Toss Style — Summary cards (Key Points First) */}
        <div className="space-y-4">
          <h2 className="text-[18px] font-black text-[#333D4B] pl-1 flex items-center gap-1.5">
            <span className="text-brand">⚡</span> 핵심만 먼저 알려드려요
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-white border border-border-color/50 rounded-[22px] p-5.5 space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-[#E5F1FF] text-brand flex items-center justify-center text-md font-bold">
                📋
              </div>
              <div>
                <h4 className="font-extrabold text-[15px] text-[#191F28]">수집하는 정보</h4>
                <p className="text-xs sm:text-sm text-[#4E5968] mt-1 leading-relaxed font-semibold">
                  로그인 연동을 위한 이메일, 프로필 닉네임, 그리고 매매 거래 과정에서 생기는 서비스 탐색/이용 기록들
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-border-color/50 rounded-[22px] p-5.5 space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-[#EAFBF3] text-[#2E7D32] flex items-center justify-center text-md font-bold">
                🎯
              </div>
              <div>
                <h4 className="font-extrabold text-[15px] text-[#191F28]">이용 목적</h4>
                <p className="text-xs sm:text-sm text-[#4E5968] mt-1 leading-relaxed font-semibold">
                  모의 자산 상태 갱신 제공, 대회 랭킹 산정, 부정 사용 행위 모니터링 및 실시간 알림 서비스 제공
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-border-color/50 rounded-[22px] p-5.5 space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-[#FFF5E6] text-[#FF9500] flex items-center justify-center text-md font-bold">
                ⏱️
              </div>
              <div>
                <h4 className="font-extrabold text-[15px] text-[#191F28]">보관 기간 (안심 파기)</h4>
                <p className="text-xs sm:text-sm text-[#4E5968] mt-1 leading-relaxed font-semibold">
                  회원 탈퇴 처리 즉시 완벽하고 복구 불가능하게 원격지에서 전면 삭제 처리 (단, 전자거래 보호법 등 일부 필수 영역 제외)
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-border-color/50 rounded-[22px] p-5.5 space-y-2.5 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-[#FFF0F0] text-red-500 flex items-center justify-center text-md font-bold">
                🔒
              </div>
              <div>
                <h4 className="font-extrabold text-[15px] text-[#191F28]">제3자 제공 배제 원칙</h4>
                <p className="text-xs sm:text-sm text-[#4E5968] mt-1 leading-relaxed font-semibold">
                  원칙적으로 어떠한 마케팅용 외부 유출 보장은 절대 없으며, 금융결제원 연동 시 해당 사용자 조회 API 목적 키값만 최소 활용돼요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Split Divider */}
        <div className="flex items-center gap-4 text-xs font-extrabold text-text-secondary select-none">
          <div className="h-px bg-border-color flex-1" />
          <span>전체 조항 내용 전문 보기</span>
          <div className="h-px bg-border-color flex-1" />
        </div>

        {/* Complete Policy Articles */}
        <div className="bg-white border border-border-color/50 rounded-[28px] p-8 sm:p-12 space-y-10 shadow-xs">
          {/* Article 1 */}
          <div className="space-y-3.5">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1 bg-[#4B80EB] h-4.5 rounded"></span>
              제1조 (개인정보의 수집 항목 및 범위)
            </h3>
            <div className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold space-y-3">
              <p className="p-3 bg-bg-main/75 border border-border-color/30 rounded-xl space-y-1">
                <strong>[필수 수집 항목 및 가치 데이터]</strong><br />
                • 로그인 및 식별 이메일 주소, 임시 설정 비밀번호<br />
                • 서비스 내 노출되는 프로필 닉네임, 아바타 세부 데이터<br />
                • 모의 자산 계좌 거래 체결 일시, 종목 수량, 종목 명칭, 랭킹 리더보드 히스토리
              </p>
              <p className="p-3 bg-bg-main/75 border border-border-color/30 rounded-xl space-y-1">
                <strong>[선택 수집 항목 및 가성 서비스]</strong><br />
                • 커뮤니티 첨부 이미지 파일 데이터 및 업로드 문서 파일<br />
                • 마케팅 또는 신규 투자 대회 실시간 웹 푸시 수신 동의 여부
              </p>
            </div>
          </div>

          <div className="h-px bg-border-color/40" />

          {/* Article 2 */}
          <div className="space-y-3.5">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1 bg-[#4B80EB] h-4.5 rounded"></span>
              제2조 (개인정보의 구체적 이용 목적)
            </h3>
            <p className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold">
              수집된 고객 고유 데이터는 오직 제로리스크 실시간 자산 금액 보증 조회, 오픈뱅킹 API 잔액 상계 매핑, 투자 순위 경쟁용 실시간 점수 분석 리포트 자동 작성, 커뮤니티 분쟁 해소 중개, 불법 봇 악이용 차단 처리를 올리기 위한 공식 서포트의 일환으로만 극히 투명하게 전유됩니다.
            </p>
          </div>

          <div className="h-px bg-[#E5E5EA]/50" />

          {/* Article 3 */}
          <div className="space-y-3.5">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1 bg-[#4B80EB] h-4.5 rounded"></span>
              제3조 (개인정보 파기 원칙 및 보관 기일)
            </h3>
            <p className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold">
              회원 탈퇴 승인 청구 접수 즉시 당사는 파쇄 알고리즘에 의건 해당 파일 세그멘트를 공중 폐기 처리하여 제로 레벨로 영구 소멸시킵니다. 단, 부정 매매 패턴 등으로 관리자 추방 징계 이력 대상이 기재된 로그 보존 가액의 경우 서비스 오용 예방 목적에 근거하여 탈퇴 후 최대 6개월 가량 최소화 보관될 수 있습니다.
            </p>
          </div>

          <div className="h-px bg-[#E5E5EA]/50" />

          {/* Article 4 */}
          <div className="space-y-3.5">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1 bg-[#4B80EB] h-4.5 rounded"></span>
              제4조 (금융결제원 오픈뱅킹 시스템 연동 및 제3자 제공 내용)
            </h3>
            <div className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold space-y-3">
              <p>
                사용자가 마이페이지 '실 계좌 연동' 프로세스를 가동할 시, 당사는 외부 은행에서 잔액만 안전히 받아오기 위해 다음과 같이 필요 최소한의 식별 연계 정보(CI 값)를 금융결제원 오프 파이썬 공식 시스템에 응답 중개 호출합니다.
              </p>
              <div className="p-3.5 bg-bg-main/75 border border-border-color/30 text-sm sm:text-[15px] text-[#4E5968] rounded-xl space-y-1 font-semibold">
                <div>• 제공 가액 대상 : 금융결제원(KFTC) 오픈뱅킹 API 기기 시스템</div>
                <div>• 연계 제공 정보 : 성명, CI 연동 고유 식별키값, 조회용 계좌번호</div>
                <div>• 목적 : 실시간 자산 상계 포인트 충전 및 본인 계좌 조회 목적 한정</div>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#E5E5EA]/50" />

          {/* Article 5 */}
          <div className="space-y-3.5">
            <h3 className="text-lg font-black text-[#191F28] flex items-center gap-2">
              <span className="w-1 bg-[#4B80EB] h-4.5 rounded"></span>
              제5조 (개인정보 관리 권한 및 보호책임자 지목)
            </h3>
            <div className="text-sm sm:text-[15px] text-[#4E5968] leading-relaxed font-semibold space-y-3">
              <p>
                개인화 데이터 오작동 누출 사고 방지 및 문의 대응을 위해 아래와 같은 전담 Data Protection Officer(개인정보 보호책임자)실을 상시 발족하여 권한 청원을 신속히 서포트하고 있습니다.
              </p>
              <div className="p-4 bg-bg-main/75 border border-border-color/30 rounded-xl text-sm sm:text-[15px] space-y-1 font-extrabold text-[#191F28]">
                <div>• 이름 : 홍길동 (보안관리본부 총괄 본부장)</div>
                <div>• 담당 이메일 : privacy@zerolisk.kr</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic pivot to inquire */}
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
