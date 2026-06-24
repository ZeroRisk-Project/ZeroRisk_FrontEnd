import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  ArrowRight, 
  TrendingDown, 
  Check, 
  ShieldCheck, 
  Unlock, 
  Activity,
  Award, 
  LineChart, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Lock
} from "lucide-react";
import { motion } from "motion/react";

export function About() {
  const navigate = useNavigate();

  return (
    <div className="bg-bg-main min-h-screen font-sans pb-20">
      {/* Top Header/Navigation */}
      <div className="max-w-7xl mx-auto pt-6 px-4 sm:px-6 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          id="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 돌아가기
        </button>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 pb-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#191F28] leading-[1.25] tracking-tight">
            리스크 없이 시작하는<br />
            실전 주식 투자
          </h1>
          <p className="text-[#4E5968] text-base sm:text-[18px] leading-relaxed font-medium">
            실제 계좌 잔액만큼 시드머니를 받고 진짜 한국 주식 시장에서 투자 연습을 해보세요. 단 한 푼도 잃지 않으니까 리스크 걱정 없이 안심하고 경험을 쌓을 수 있어요.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="px-6 py-3.5 bg-brand text-white font-bold text-[16px] rounded-full hover:bg-[#3B4CD5] transition-all shadow-[0_4px_12px_rgba(74,93,249,0.2)]"
            >
              무료로 시작하기
            </Link>
            <Link
              to="/competitions/guide"
              className="px-6 py-3.5 bg-white text-[#4E5968] border border-border-color font-bold text-[16px] rounded-full hover:bg-gray-50 transition-all"
            >
              대회 안내 보기
            </Link>
          </div>
        </div>

        {/* Mockup Dashboard UI Previews */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-4 bg-gradient-to-tr from-brand/10 to-transparent rounded-[32px] blur-2xl opacity-60 pointer-events-none"></div>
          <div className="relative bg-white border border-border-color/60 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] p-6 space-y-5 max-w-[380px] mx-auto select-none">

            {/* Custom Interactive stock item */}
            <div className="space-y-3.5">
              <div className="p-3 bg-bg-main rounded-[16px] flex justify-between items-center border border-border-color/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#ECF3FF] flex items-center justify-center text-md font-bold text-brand">삼성</div>
                  <div>
                    <div className="font-extrabold text-sm text-[#191F28]">삼성전자</div>
                    <div className="text-[11px] text-[#8B95A1] font-bold">005930</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-sm text-up">78,400원</div>
                  <div className="text-[11px] text-up font-bold">+2.35%</div>
                </div>
              </div>

              {/* Chart Line preview */}
              <div className="h-28 bg-bg-main rounded-[16px] p-3.5 flex flex-col justify-between border border-border-color/50 relative overflow-hidden">
                <div className="flex justify-between items-start z-10">
                  <span className="text-xs font-bold text-text-secondary">실시간 캔들 차트</span>
                  <span className="text-xs font-black text-up bg-up/10 px-1.5 py-0.5 rounded">+2.35%</span>
                </div>
                
                {/* Real-looking Fluctuating Stock Candlestick Chart (K-Line) matching the user's uploaded image */}
                <div className="absolute inset-x-0 bottom-2 top-11 z-0 px-3">
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    {/* Horizontal baseline */}
                    <line x1="0" y1="62" x2="200" y2="62" stroke="#F2F4F6" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Candle 1 (Blue) */}
                    <line x1="8" y1="64" x2="8" y2="77" stroke="#007AFF" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="6.25" y="68" width="3.5" height="5" fill="#007AFF" rx="0.5" />

                    {/* Candle 2 (Red) */}
                    <line x1="17.5" y1="73" x2="17.5" y2="88" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="15.75" y="78" width="3.5" height="5" fill="#FF3B30" rx="0.5" />

                    {/* Candle 3 (Red) */}
                    <line x1="27" y1="69" x2="27" y2="82" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="25.25" y="73" width="3.5" height="5" fill="#FF3B30" rx="0.5" />

                    {/* Candle 4 (Red) */}
                    <line x1="36.5" y1="66" x2="36.5" y2="79" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="34.75" y="70" width="3.5" height="5" fill="#FF3B30" rx="0.5" />

                    {/* Candle 5 (Blue) */}
                    <line x1="46" y1="62" x2="46" y2="69" stroke="#007AFF" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="44.25" y="64" width="3.5" height="3" fill="#007AFF" rx="0.5" />

                    {/* Candle 6 (Gray) */}
                    <line x1="55.5" y1="67" x2="55.5" y2="71" stroke="#7C8085" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="53.75" y="69" width="3.5" height="0.8" fill="#7C8085" rx="0.1" />

                    {/* Candle 7 (Blue) */}
                    <line x1="65" y1="70" x2="65" y2="80" stroke="#007AFF" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="63.25" y="73" width="3.5" height="4" fill="#007AFF" rx="0.5" />

                    {/* Candle 8 (Blue) */}
                    <line x1="74.5" y1="75" x2="74.5" y2="88" stroke="#007AFF" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="72.75" y="78" width="3.5" height="5" fill="#007AFF" rx="0.5" />

                    {/* Candle 9 (Blue) */}
                    <line x1="84" y1="71" x2="84" y2="82" stroke="#007AFF" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="82.25" y="75" width="3.5" height="3" fill="#007AFF" rx="0.5" />

                    {/* Candle 10 (Blue) */}
                    <line x1="93.5" y1="75" x2="93.5" y2="81" stroke="#007AFF" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="91.75" y="77" width="3.5" height="2" fill="#007AFF" rx="0.5" />

                    {/* Candle 11 (Red) */}
                    <line x1="103" y1="82" x2="103" y2="97" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="101.25" y="86" width="3.5" height="7" fill="#FF3B30" rx="0.5" />

                    {/* Candle 12 (Red) */}
                    <line x1="112.5" y1="88" x2="112.5" y2="99" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="110.75" y="88" width="3.5" height="8" fill="#FF3B30" rx="0.5" />

                    {/* Candle 13 (Red) */}
                    <line x1="122" y1="52" x2="122" y2="79" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="120.25" y="56" width="3.5" height="18" fill="#FF3B30" rx="0.5" />

                    {/* Candle 14 (Red) */}
                    <line x1="131.5" y1="37" x2="131.5" y2="64" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="129.75" y="41" width="3.5" height="19" fill="#FF3B30" rx="0.5" />

                    {/* Candle 15 (Red) */}
                    <line x1="141" y1="33" x2="141" y2="54" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="139.25" y="38" width="3.5" height="9" fill="#FF3B30" rx="0.5" />

                    {/* Candle 16 (Red) */}
                    <line x1="150.5" y1="32" x2="150.5" y2="51" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="148.75" y="36" width="3.5" height="10" fill="#FF3B30" rx="0.5" />

                    {/* Candle 17 (Red) */}
                    <line x1="160" y1="19" x2="160" y2="39" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="158.25" y="24" width="3.5" height="15" fill="#FF3B30" rx="0.5" />

                    {/* Candle 18 (Red) */}
                    <line x1="169.5" y1="10" x2="169.5" y2="26" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="167.75" y="14" width="3.5" height="9" fill="#FF3B30" rx="0.5" />

                    {/* Candle 19 (Red) */}
                    <line x1="179" y1="4" x2="179" y2="19" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="177.25" y="5" width="3.5" height="9" fill="#FF3B30" rx="0.5" />

                    {/* Candle 20 (Red) */}
                    <line x1="188.5" y1="0" x2="188.5" y2="12" stroke="#FF3B30" strokeWidth="1.2" strokeLinecap="round" />
                    <rect x="186.75" y="0" width="3.5" height="8" fill="#FF3B30" rx="0.5" />
                  </svg>
                </div>
              </div>

              {/* Order form simulation */}
              <div className="flex gap-2.5 relative">
                <button className="flex-1 bg-up text-white font-extrabold h-11 rounded-[14px] text-sm hover:bg-up/90 transition-all shadow-[0_4px_12px_rgba(255,59,48,0.2)] cursor-pointer">
                  매수
                </button>
                <button className="flex-1 bg-down text-white font-extrabold h-11 rounded-[14px] text-sm hover:bg-down/90 transition-all shadow-[0_4px_12px_rgba(0,122,255,0.2)] cursor-pointer">
                  매도
                </button>

                {/* Cursor and "당신의 선택은?" Overlap design */}
                <div className="absolute -bottom-12 -right-12 z-20 pointer-events-none select-none flex flex-col items-center animate-bounce" style={{ animationDuration: '3.5s' }}>
                  {/* Speech Bubble */}
                  <div className="bg-[#1C1C1E] text-white px-6 py-3.5 rounded-[100px] text-base sm:text-lg font-black shadow-2xl flex items-center gap-2.5 relative whitespace-nowrap border border-white/10">
                    <span className="text-lg sm:text-xl">👉</span>
                    <span>당신의 선택은?</span>
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-1.5 left-10 w-3.5 h-3.5 bg-[#1C1C1E] rotate-45 border-r border-b border-white/10"></div>
                  </div>
                  {/* Mouse Pointer Cursor SVG */}
                  <div className="mt-4 self-start ml-8 text-text-primary drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
                    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 3V18.5L8.91 14.1L12.51 21.3L15.3 19.9L11.7 12.7L17.5 12.7L4.5 3Z" fill="white" stroke="#1C1C1E" strokeWidth="2" strokeLinejoin="miter" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 핵심 기능 소개 */}
      <section className="bg-white border-y border-border-color/60 py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-[#191F28] tracking-tight">
              제로리스크로 할 수 있는 것들
            </h2>
            <p className="text-text-secondary text-[15px] font-medium">따로 배울 필요 없이 바로 익힐 수 있는 똑똑한 핵심 기능들을 만나보세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 bg-bg-main border border-border-color/40 rounded-[24px] hover:shadow-md transition-all space-y-4">
              <div className="text-2xl w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-xs">📈</div>
              <div className="space-y-1">
                <h3 className="text-[17px] font-extrabold text-text-primary">실시간 주식 거래</h3>
                <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                  한국 주식 시장의 실시간 시세로 실제와 똑같이 매수·매도해요.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-bg-main border border-border-color/40 rounded-[24px] hover:shadow-md transition-all space-y-4">
              <div className="text-2xl w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-xs">🏦</div>
              <div className="space-y-1">
                <h3 className="text-[17px] font-extrabold text-text-primary">계좌 연동 시드머니</h3>
                <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                  내 실제 계좌 잔액만큼 안전하게 시드머니를 지급받아 연습해요.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-bg-main border border-border-color/40 rounded-[24px] hover:shadow-md transition-all space-y-4">
              <div className="text-2xl w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-xs">🏆</div>
              <div className="space-y-1">
                <h3 className="text-[17px] font-extrabold text-text-primary">투자 대회</h3>
                <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                  다른 투자자들과 한정된 예산으로 수익률을 경쟁하는 토너먼트에 참가해요.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-bg-main border border-border-color/40 rounded-[24px] hover:shadow-md transition-all space-y-4">
              <div className="text-2xl w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-xs">📊</div>
              <div className="space-y-1">
                <h3 className="text-[17px] font-extrabold text-text-primary">포트폴리오 분석</h3>
                <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                  내 투자 성과를 자산별 차트로 분석하고 AI 리밸런싱을 추천받아요.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="p-6 bg-bg-main border border-border-color/40 rounded-[24px] hover:shadow-md transition-all space-y-4">
              <div className="text-2xl w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-xs">👥</div>
              <div className="space-y-1">
                <h3 className="text-[17px] font-extrabold text-text-primary">투자 커뮤니티</h3>
                <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                  다른 투자자의 매매 기록을 확인하고 소식을 실시간으로 나눠요.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="p-6 bg-bg-main border border-border-color/40 rounded-[24px] hover:shadow-md transition-all space-y-4">
              <div className="text-2xl w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-xs">🎯</div>
              <div className="space-y-1">
                <h3 className="text-[17px] font-extrabold text-text-primary">실시간 랭킹</h3>
                <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                  일간·주간·월간 수익률 리더보드로 나의 상대적인 투자 위치를 확인해요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 왜 제로리스크인가요? */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-[#191F28] tracking-tight">
              이런 분들에게 딱 맞아요
            </h2>
            <p className="text-text-secondary text-[15px] font-medium">투자 전 경험치와 자신감을 쌓고자 하는 분들을 위해 준비했어요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Persona 1 */}
            <div className="bg-white border border-border-color/50 rounded-[22px] p-6 text-center space-y-3 shadow-xs">
              <div className="text-3xl">🌱</div>
              <div className="inline-block px-2.5 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-xs font-black rounded">주식 입문자</div>
              <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                처음 주식을 시작하는데 실전 경험과 모의 매매 연습이 꼭 필요한 예비 주주분
              </p>
            </div>

            {/* Persona 2 */}
            <div className="bg-white border border-border-color/50 rounded-[22px] p-6 text-center space-y-3 shadow-xs">
              <div className="text-3xl">💼</div>
              <div className="inline-block px-2.5 py-0.5 bg-[#E3F2FD] text-[#1565C0] text-xs font-black rounded">직장인 투자자</div>
              <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                소중한 월급을 어떻게 배분하여 굴리면 좋을지 미리 안전하게 시뮬레이션해보고 싶은 분
              </p>
            </div>

            {/* Persona 3 */}
            <div className="bg-white border border-border-color/50 rounded-[22px] p-6 text-center space-y-3 shadow-xs">
              <div className="text-3xl">🎓</div>
              <div className="inline-block px-2.5 py-0.5 bg-[#FFF3E0] text-[#E65100] text-xs font-black rounded">투자 공부 중</div>
              <p className="text-sm text-[#4E5968] leading-relaxed font-medium">
                기술적 차트 분석, 포트폴리오 다각화 등 배운 이론을 진짜 호가창에서 테스트해보고 싶은 분
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 어떻게 시작하나요? (Step Flow) */}
      <section className="bg-white border-y border-border-color/60 py-20 px-4">
        <div className="max-w-xl mx-auto space-y-12">
          <h2 className="text-3xl font-extrabold text-center text-[#191F28] tracking-tight">
            3단계면 충분해요
          </h2>

          <div className="space-y-10 relative">
            {/* Connecting Vertical Line */}
            <div className="absolute left-6 -translate-x-1/2 top-6 bottom-6 w-[2px] bg-border-color"></div>

            {/* Step 1 */}
            <div className="flex gap-5 relative z-10">
              <div className="w-12 h-12 rounded-full bg-brand text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                1
              </div>
              <div className="pt-2">
                <h3 className="text-[17px] font-extrabold text-[#191F28]">회원가입</h3>
                <p className="text-sm text-[#4E5968] font-medium mt-1 leading-relaxed">
                  이메일 주소 또는 소셜 계정을 연동해 단 30초 만에 가입해요.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-5 relative z-10">
              <div className="w-12 h-12 rounded-full bg-brand text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                2
              </div>
              <div className="pt-2">
                <h3 className="text-[17px] font-extrabold text-[#191F28]">계좌 연동</h3>
                <p className="text-sm text-[#4E5968] font-medium mt-1 leading-relaxed">
                  금융결제원 공식 오픈뱅킹으로 실제 계좌를 연동하면, 그 금액만큼의 가상 시드머니를 자동 지급해 드려요.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-5 relative z-10">
              <div className="w-12 h-12 rounded-full bg-brand text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                3
              </div>
              <div className="pt-2">
                <h3 className="text-[17px] font-extrabold text-[#191F28]">투자 시작</h3>
                <p className="text-sm text-[#4E5968] font-medium mt-1 leading-relaxed">
                  실시간으로 수신되는 변동 주가지수 기반 가상 통화로 바로 매수·매도 주문 등록!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 안전한가요? */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-3xl font-extrabold text-center text-[#191F28] tracking-tight">
            안전하게 설계했어요
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-border-color/50 rounded-[24px] p-6 space-y-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-[12px] bg-[#E3F2FD] text-brand flex items-center justify-center">
                <Unlock className="w-5.5 h-5.5 stroke-[2.5]" />
              </div>
              <h3 className="text-[16px] font-extrabold text-[#191F28]">출금 없음</h3>
              <p className="text-xs sm:text-sm text-[#4E5968] leading-relaxed font-semibold">
                잔액 조회만 안전하게 진행되고, 가상의 시드머니일 뿐 실제 돈은 절대 이동하거나 결제되지 않아요.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-border-color/50 rounded-[24px] p-6 space-y-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-[12px] bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
                <ShieldCheck className="w-5.5 h-5.5 stroke-[2.5]" />
              </div>
              <h3 className="text-[16px] font-extrabold text-[#191F28]">금융결제원 공식 인증</h3>
              <p className="text-xs sm:text-sm text-[#4E5968] leading-relaxed font-semibold">
                안정성이 인증된 금융결제원 오픈뱅킹 시스템 연동 가이드를 따라 최고의 상호작용 표준을 지킵니다.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-border-color/50 rounded-[24px] p-6 space-y-3.5 shadow-xs">
              <div className="w-10 h-10 rounded-[12px] bg-[#FFF3E0] text-[#E65100] flex items-center justify-center">
                <Lock className="w-5.5 h-5.5 stroke-[2.5]" />
              </div>
              <h3 className="text-[16px] font-extrabold text-[#191F28]">데이터 전면 암호화</h3>
              <p className="text-xs sm:text-sm text-[#4E5968] leading-relaxed font-semibold">
                모든 금융 정보와 개인 식별 닉네임, 키값은 고도로 암호화되어 안전하게 보관되고 철저히 숨겨집니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-brand text-white rounded-[32px] p-8 md:p-12 text-center space-y-6 shadow-md relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="space-y-2 z-10 relative">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              지금 바로 시작해볼까요?
            </h2>
            <p className="text-white/80 text-[15px] font-bold">
              회원가입과 모의 매수, 매도, 대결 참가는 전부 평생 무료예요.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center z-10 relative">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 h-12 bg-white text-brand font-black text-sm sm:text-[15px] rounded-xl hover:bg-gray-50 transition-all shadow-xs inline-flex items-center justify-center text-center"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
