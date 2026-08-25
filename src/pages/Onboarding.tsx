import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Building2, ChevronRight, Coins } from "lucide-react";
import api from "@/src/lib/api";

export function Onboarding() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogType, setDialogType] = useState<"practice" | "real" | null>(null);
  const [dialogError, setDialogError] = useState("");

  const [hasPractice, setHasPractice] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get("/users/me");
        setHasPractice(!!response.data.hasClaimedPracticeCredit);
      } catch (error) {
        console.error(error);
      }
      try {
        await api.get("/openbanking/auths");
        setIsLinked(true);
      } catch {
        setIsLinked(false);
      }
    };
    fetchStatus();
  }, []);

  const canUsePractice = !hasPractice && !isLinked;

  const handlePracticeStart = () => {
    if (isSubmitting || !canUsePractice) return;
    setDialogError("");
    setDialogType("practice");
  };

  const handleRealAccountStart = () => {
    if (isSubmitting) return;
    setDialogError("");
    setDialogType("real");
  };

  const confirmPracticeStart = async () => {
    setIsSubmitting(true);
    try {
      await api.post("/users/me/practice-credit");
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (error: any) {
      setDialogError(error.response?.data?.message ?? "연습용 크레딧 지급에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  const confirmRealAccountStart = () => {
    navigate("/account-link/intro");
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center pt-24 pb-12 px-6 sm:px-8 animate-in fade-in duration-300 relative">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">

        <h1 className="text-[28px] font-bold tracking-tight text-[#191F28] mb-4 text-center leading-tight">
          반갑습니다!<br />
          어떻게 시작할까요?
        </h1>

        <p className="text-[#8B95A1] text-[15px] mb-10 text-center">
          투자를 경험해보고 싶다면 연습용 자금으로,<br />
          본격적인 관리를 원한다면 실계좌를 연결해보세요.
        </p>

        <div className="w-full space-y-4">

          {/* Card 1: Real Account */}
          <button
            onClick={handleRealAccountStart}
            disabled={isSubmitting}
            className="w-full flex items-start p-6 bg-white rounded-2xl ring-1 ring-inset ring-[#E5E8EB] hover:ring-2 hover:ring-inset hover:ring-[#00D26A] hover:shadow-md hover:-translate-y-0.5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed outline-none"
          >
            <div className="w-12 h-12 bg-emerald-50 text-[#00D26A] rounded-full flex items-center justify-center shrink-0 mr-4 group-hover:bg-[#00D26A] group-hover:text-white transition-colors">
              <Building2 size={24} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-[#191F28]">실계좌 인증하고 시작</h3>
                {canUsePractice && <span className="text-[11px] font-bold text-white bg-[#00D26A] px-2 py-0.5 rounded-full">추천</span>}
              </div>
              <p className="text-[14px] text-[#4E5968] font-medium mb-1">
                나의 실제 보유 자산 기반
              </p>
              <p className="text-[13px] text-[#8B95A1]">
                오픈뱅킹으로 안전하게 연동됩니다
              </p>
            </div>
            <div className="self-center text-[#B0B8C1] group-hover:text-[#00D26A] transition-colors">
              <ChevronRight size={20} />
            </div>
          </button>

          {/* Card 2: Practice Mode */}
          <button
            onClick={handlePracticeStart}
            disabled={isSubmitting || !canUsePractice}
            className="w-full flex items-start p-6 bg-white rounded-2xl ring-1 ring-inset ring-[#E5E8EB] hover:ring-2 hover:ring-inset hover:ring-[#3182F6] hover:shadow-md hover:-translate-y-0.5 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed outline-none"
          >
            <div className="w-12 h-12 bg-blue-50 text-[#3182F6] rounded-full flex items-center justify-center shrink-0 mr-4 group-hover:bg-[#3182F6] group-hover:text-white transition-colors">
              <Coins size={24} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-[#191F28]">연습용으로 시작</h3>
              </div>
              <p className="text-[14px] text-[#4E5968] font-medium mb-1">
                모의투자 지원금 <strong className="text-[#3182F6]">100만원</strong> 지급
              </p>
              <p className="text-[13px] text-[#8B95A1]">
                {hasPractice ? "이미 연습용 자금을 받으셨습니다" : isLinked ? "실계좌 인증 회원은 이용할 수 없습니다" : "평생 1회 한정 / 언제든 실잔액으로 전환 가능"}
              </p>
            </div>
            <div className="self-center text-[#B0B8C1] group-hover:text-[#3182F6] transition-colors">
              <ChevronRight size={20} />
            </div>
          </button>

        </div>

        <div className="mt-8 text-center bg-[#F2F4F6] px-4 py-3 rounded-lg flex gap-2 items-start text-left">
          <CheckCircle2 size={16} className="text-[#8B95A1] shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#8B95A1] leading-relaxed">
            실계좌 연동 후에는 연습용 자금을 신청할 수 없어요.<br />
            처음이시라면 먼저 연습용으로 시작해보시는 걸 추천해요!
          </p>
        </div>

      </div>

      {/* Confirmation Dialogs */}
      {dialogType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#191F28] mb-2">
                {dialogType === "practice" ? "연습용으로 시작하시겠어요?" : "실계좌를 연동하시겠어요?"}
              </h3>
              <p className="text-[14px] text-[#4E5968] leading-relaxed">
                {dialogType === "practice"
                  ? "모의투자 지원금 100만원이 즉시 지급됩니다. 추후 언제든지 실잔액을 추가로 연동하여 업그레이드할 수 있습니다."
                  : "실제 계좌를 먼저 연동하면 더 이상 연습용 모의투자 지원금(100만원)을 받을 수 없게 됩니다. 계속하시겠습니까?"}
              </p>
              {dialogError && (
                <p className="text-[13px] font-bold text-red-500 mt-3">❌ {dialogError}</p>
              )}
            </div>
            <div className="flex border-t border-[#E5E8EB]">
              <button
                onClick={() => setDialogType(null)}
                disabled={isSubmitting}
                className="flex-1 py-4 text-[15px] font-medium text-[#8B95A1] active:bg-neutral-50 transition-colors"
              >
                취소
              </button>
              <div className="w-[1px] bg-[#E5E8EB]" />
              <button
                onClick={dialogType === "practice" ? confirmPracticeStart : confirmRealAccountStart}
                disabled={isSubmitting}
                className={`flex-1 py-4 text-[15px] font-bold transition-colors active:bg-neutral-50 ${dialogType === 'practice' ? 'text-[#3182F6]' : 'text-[#00D26A]'}`}
              >
                {dialogType === "practice" ? "시작하기" : "연동하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
