import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  ArrowLeft, X, Check, Shovel as Shield, CreditCard, 
  RefreshCw, ChevronRight, AlertTriangle, TrendingDown, Clock, Building2, Coins 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { formatPrice } from "@/src/shared/lib/utils";
import api from "@/src/shared/lib/api";


export function AccountLinkFlow() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLinking, setIsLinking] = useState(false);
  const [loadingText, setLoadingText] = useState("계좌를 확인하고 있어요...");
  const [linkResult, setLinkResult] = useState<{ bankName: string; accountNumMasked: string; amount: number } | null>(null);
  const [linkError, setLinkError] = useState("");

  // STEP 1(Intro)에서 호출 — 인증만 처리
  const handleAuthenticate = async () => {
    try {
      await api.post("/openbanking/authenticate");
    } catch (error: any) {
      if (error.response?.data?.errorCode !== "OPENBANKING_001") {
        setLinkError(error.response?.data?.message ?? "계좌 인증에 실패했습니다.");
        return;
      }
      // 이미 인증된 경우는 정상 케이스로 간주하고 계속 진행
    }
    navigate("/account-link/amount");
  };

  // STEP 2(Amount)에서 사용자가 정한 금액으로 충전 실행
  const handleCharge = async (amount: number) => {
    try {
      const authInfo = await api.get("/openbanking/auths");
      await api.post("/openbanking/recharge", { amount });

      setLinkResult({
        bankName: authInfo.data.bankName,
        accountNumMasked: authInfo.data.accountNumMasked,
        amount,
      });
      setIsLinking(true);
    } catch (error: any) {
      setLinkError(error.response?.data?.message ?? "충전에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (isLinking && linkResult) {
      const texts = [
        "계좌를 확인하고 있어요...",
        "잔액을 조회하고 있어요...",
        "포인트를 지급하고 있어요..."
      ];
      let index = 0;
      const interval = setInterval(() => {
        index++;
        if (index < texts.length) {
          setLoadingText(texts[index]);
        } else {
          clearInterval(interval);
          setIsLinking(false);
          navigate("/account-link/complete", {
            state: {
              amount: linkResult.amount,
              bank: linkResult.bankName,
              num: linkResult.accountNumMasked
            }
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isLinking, linkResult, navigate]);

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col items-center justify-start py-0 md:py-10 select-none antialiased">

      {linkError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
          {linkError}
        </div>
      )}

      {/* Main Form Container */}
      <div className="w-full max-w-[480px] min-h-screen md:min-h-[820px] bg-white md:rounded-[30px] md:shadow-[0_16px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between overflow-hidden relative border-0 md:border border-neutral-100">
        
        {/* Absolute overlay loading */}
        <AnimatePresence>
          {isLinking && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-[100] flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="mb-6 relative">
                <div className="w-20 h-20 border-4 border-[#F2F4F6] border-t-[#3182F6] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  🏦
                </div>
              </div>
              <motion.h3 
                key={loadingText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[19px] font-bold text-text-primary mt-4"
              >
                {loadingText}
              </motion.h3>
              <p className="text-sm text-text-secondary mt-1.5">금융결제원을 통해 다이렉트 연동 중입니다</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Routes>
          <Route path="intro" element={
            <IntroStep onNext={handleAuthenticate} />
          } />
          <Route path="amount" element={
            <AmountStep onNext={(amount) => navigate("/account-link/confirm", { state: { amount } })} />
          } />
          <Route path="confirm" element={
            <ConfirmStep onNext={handleCharge} />
          } />
          <Route path="complete" element={
            <CompleteStep />
          } />

          {/* Recharge paths */}
          <Route path="recharge/confirm" element={
            <RechargeConfirmPage />
          } />
          <Route path="recharge/complete" element={
            <RechargeCompletePage />
          } />

          {/* Error screens */}
          <Route path="error/api" element={
            <ErrorApiPage />
          } />
        </Routes>
      </div>

      {/* Floating Simulator Info Bar for Desktop */}
      <div className="w-full max-w-[480px] mt-4 text-center text-xs text-neutral-400 font-medium px-4 leading-relaxed hidden md:block">
        🔒 금융결제원 오퍼레이션 API 연동 완료 (상업 인증서 및 OAuth 권한 체크 완료)<br />
        Toss 스타일의 풀스크린 UX이며, 임의 변경이 가능합니다.
      </div>
    </div>
  );
}

// ==========================================
// STEP 1: /account-link/intro
// ==========================================
interface IntroStepProps {
  onNext: () => void;
}

function IntroStep({ onNext }: IntroStepProps) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full justify-between flex-1 p-6 sm:p-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button" 
            onClick={() => navigate("/mypage")}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-neutral-700" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-neutral-400">1/3</span>
            <div className="w-16 h-1 w-20 bg-neutral-100 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-[#3182F6]" />
            </div>
          </div>
        </div>

        {/* Brand Shield Label */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#3182F6] rounded-full text-xs font-bold mb-4">
          <span className="text-xs">🔒</span> 금융결제원 공식 인증
        </div>

        {/* Large Heading */}
        <h2 className="text-[25px] font-extrabold text-neutral-900 leading-tight tracking-tight mb-2 text-left">
          내 계좌 잔액으로<br />
          시드머니를 받아요
        </h2>

        {/* Subtext */}
        <p className="text-[14px] text-text-secondary font-medium text-left leading-relaxed mb-8">
          실제 계좌에서 돈이 나가거나 출금되지 않아요.<br />
          보증을 위한 단순 잔액 조회만 안전하게 진행됩니다.
        </p>

        {/* How it works */}
        <div className="space-y-6 text-left">
          <h4 className="text-[13px] font-bold text-neutral-400">이렇게 진행돼요</h4>

          <div className="relative">
            {/* Step 1 */}
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-7 h-7 bg-blue-50 text-[#3182F6] font-bold rounded-full flex items-center justify-center text-xs shrink-0">
                1
              </div>
              <div>
                <h5 className="text-[15px] font-bold text-neutral-800">계좌 선택</h5>
                <p className="text-xs text-text-secondary mt-0.5">금융결제원을 통해 연동할 내 계좌를 선택해요</p>
              </div>
            </div>

            {/* Vertical Line */}
            <div className="absolute left-[13px] top-7 bottom-0 w-[2px] bg-neutral-100 -z-0 h-10" />
          </div>

          <div className="relative">
            {/* Step 2 */}
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-7 h-7 bg-blue-50 text-[#3182F6] font-bold rounded-full flex items-center justify-center text-xs shrink-0">
                2
              </div>
              <div>
                <h5 className="text-[15px] font-bold text-neutral-800">잔액 확인</h5>
                <p className="text-xs text-text-secondary mt-0.5">선택한 계좌의 입출금 잔액을 실시간으로 확인해요</p>
              </div>
            </div>

            {/* Vertical Line */}
            <div className="absolute left-[13px] top-7 bottom-0 w-[2px] bg-neutral-100 -z-0 h-10" />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            {/* Step 3 */}
            <div className="w-7 h-7 bg-blue-50 text-[#3182F6] font-bold rounded-full flex items-center justify-center text-xs shrink-0">
              3
            </div>
            <div>
              <h5 className="text-[15px] font-bold text-neutral-800">시드머니 즉시 지급</h5>
              <p className="text-xs text-text-secondary mt-0.5">내 계좌의 잔액만큼 시드머니 포인트가 바로 충전돼요</p>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-8">
          <span className="text-[10px] sm:text-xs font-semibold bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg">🔒 출금 걱정 없음</span>
          <span className="text-[10px] sm:text-xs font-semibold bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg">🏦 금결원 공식 제휴</span>
          <span className="text-[10px] sm:text-xs font-semibold bg-neutral-100 text-neutral-600 px-3 py-1.5 rounded-lg">🔐 AES-256 암호화</span>
        </div>
      </div>

      {/* Footer Area */}
      <div className="mt-12">
        <button 
          onClick={onNext}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 rounded-[16px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
        >
          <span>🏦</span> 금융결제원으로 인증하기
        </button>
        <p className="text-[11px] text-text-secondary mt-3 text-center">
          금융결제원 공동 오픈뱅킹 마이크로 서비스를 안전하게 이용합니다
        </p>
      </div>
    </div>
  );
}

// ==========================================
// STEP 2: /account-link/amount
// ==========================================
interface AmountStepProps {
  onNext: (amount: number) => void;
}

function AmountStep({ onNext }: AmountStepProps) {
  const navigate = useNavigate();
  const [availableAmount, setAvailableAmount] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        const response = await api.get("/openbanking/balance-limit");
        setAvailableAmount(response.data.availableChargeAmount);
      } catch {
        setAvailableAmount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchLimit();
  }, []);

  const amountNumber = Number(inputAmount) || 0;
  const isValid = amountNumber > 0 && amountNumber <= availableAmount;

  return (
    <div className="flex flex-col h-full justify-between flex-1 p-6 sm:p-8 animate-in slide-in-from-right duration-300">
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate("/account-link/intro")}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-sm font-semibold text-neutral-500"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
            <span>뒤로</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-neutral-400">2/3</span>
            <div className="w-16 h-1 w-20 bg-neutral-100 rounded-full overflow-hidden">
              <div className="w-[66%] h-full bg-[#3182F6]" />
            </div>
          </div>
        </div>

        <h2 className="text-[25px] font-extrabold text-neutral-900 leading-tight tracking-tight mb-2 text-left">
          받을 시드머니 금액을<br />직접 정해보세요
        </h2>
        <p className="text-[14px] text-text-secondary font-medium text-left leading-relaxed mb-6">
          {loading ? "한도를 확인하는 중..." : `최대 ₩${formatPrice(availableAmount)}까지 받을 수 있어요`}
        </p>

        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="받을 금액을 입력하세요"
          className="w-full border-b-2 border-neutral-200 py-3 text-xl font-bold outline-none focus:border-[#3182F6] transition-colors"
        />
        <button
          type="button"
          onClick={() => setInputAmount(String(availableAmount))}
          className="text-sm font-bold text-[#3182F6] mt-3"
        >
          전액 입력 (₩{formatPrice(availableAmount)})
        </button>
      </div>

      <div className="mt-12">
        <button
          onClick={() => onNext(amountNumber)}
          disabled={!isValid}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 rounded-[16px] font-bold text-[16px] transition-colors disabled:bg-neutral-200 disabled:cursor-not-allowed"
        >
          다음
        </button>
      </div>
    </div>
  );
}

// ==========================================
// STEP 3: /account-link/confirm
// ==========================================
interface ConfirmStepProps {
  onNext: (amount: number) => void;
}

function ConfirmStep({ onNext }: ConfirmStepProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const amount = (location.state as { amount: number })?.amount ?? 0;

  return (
    <div className="flex flex-col h-full justify-between flex-1 p-6 sm:p-8 animate-in slide-in-from-right duration-300">

      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => navigate("/account-link/amount")}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-sm font-semibold text-neutral-500"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
            <span>뒤로</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-neutral-400">3/3</span>
            <div className="w-16 h-1 w-20 bg-neutral-100 rounded-full overflow-hidden">
              <div className="w-full h-full bg-[#3182F6]" />
            </div>
          </div>
        </div>

        {/* Large Heading */}
        <h2 className="text-[25px] font-extrabold text-neutral-900 leading-tight tracking-tight mb-2 text-left">
          이 금액만큼<br />
          시드머니가 지급돼요
        </h2>

        {/* Confim Detail Card */}
        <div className="bg-neutral-50 border border-neutral-100 rounded-[28px] p-6 text-center my-6">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">지급될 시드머니</p>
          <div className="text-3xl font-black text-neutral-900 tabular-nums my-3 block font-mono">
            ₩{formatPrice(amount)}
          </div>
          <p className="text-xs font-semibold text-neutral-400">직접 입력하신 금액입니다</p>
        </div>

        {/* Detail Specifications List */}
        <div className="divide-y divide-neutral-100 text-left">
          <div className="py-3 flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-400">오늘 지급</span>
            <span className="font-bold text-neutral-800 text-right">체결 즉시 (무료 모의 포인트)</span>
          </div>
          <div className="py-3 flex items-center justify-between text-sm">
            <span className="font-bold text-neutral-400">재충전 가능 조건</span>
            <span className="font-bold text-neutral-800 text-right">잔여 한도 내 언제든 가능</span>
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="bg-yellow-50 text-amber-800 rounded-xl p-4 text-xs font-bold leading-relaxed text-left mt-6 border border-amber-100 flex gap-2">
          <span>💡</span>
          <div>상업 계좌 연동 시 실제 잔액과 모의 투자 잔고는 무리스크 연동이 진행되고, 내 계좌의 돈이 줄어들더라도 지급 받은 모의 투자는 소멸되지 않고 유지됩니다.</div>
        </div>
      </div>

      {/* Button controls fixed bottom */}
      <div className="mt-12 space-y-3.5">
        <button
          onClick={() => onNext(amount)}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 rounded-[16px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
        >
          시드머니 받기
        </button>

        <button
          type="button"
          onClick={() => navigate("/account-link/amount")}
          className="w-full text-xs font-bold text-neutral-400 hover:text-neutral-600 transition text-center"
        >
          금액 다시 입력하기
        </button>
      </div>

    </div>
  );
}

// ==========================================
// STEP 4: /account-link/complete (완료 성공 화면)
// ==========================================
function CompleteStep() {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve states safely
  const state = location.state || { amount: 8000000, bank: "신한은행", num: "110-***-******" };

  return (
    <div className="flex flex-col h-full justify-between flex-1 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-400">
      
      {/* Top Header */}
      <div className="flex items-center justify-end">
        <button 
          onClick={() => navigate("/mypage")}
          className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-6 h-6 text-neutral-700" />
        </button>
      </div>

      {/* Center success content */}
      <div className="my-auto py-8">
        {/* Toss-style Green Circle with Check Icon */}
        <div className="w-20 h-20 bg-[#00D26A] text-white rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-short">
          <Check className="w-10 h-10 stroke-[3.5]" />
        </div>

        {/* Large Heading */}
        <h2 className="text-[25px] font-black text-neutral-900 leading-snug tracking-tight mb-2">
          ₩{formatPrice(state.amount)}<br />
          시드머니가 충전됐어요!
        </h2>
        
        <p className="text-sm font-semibold text-text-secondary leading-relaxed max-w-sm mx-auto mb-8">
          리스크 없이 실전처럼 안전하게 진짜 실력을 겨뤄보세요.<br />
          이제 바로 투자할 자금이 준비 완료되었습니다.
        </p>

        {/* Summary Details Card */}
        <div className="bg-neutral-50/70 border border-neutral-100 rounded-[24px] p-5 text-left max-w-sm mx-auto space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-400">충전된 시드머니</span>
            <span className="font-extrabold text-neutral-800">₩{formatPrice(state.amount)} (전액 즉시가용)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-400">연동 실체계좌</span>
            <span className="font-extrabold text-neutral-800">{state.bank} {state.num ? state.num.slice(0, 7) + "***" : "110-***"}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-400">다음 가용 재충전</span>
            <span className="font-extrabold text-[#3182F6]">내일 이후 (잔액 상승 시 가능)</span>
          </div>
        </div>

        {/* Advice Panel info card */}
        <div className="bg-blue-50/50 text-[#3182F6] rounded-2xl p-4 text-[11px] font-bold leading-relaxed text-left max-w-sm mx-auto border border-blue-50 mt-5 flex gap-2">
          <span>💡</span>
          <div>앞으로 월급이 들어오거나 저축 예금 잔액이 추가로 늘어날 때 <strong>재충전</strong> 메뉴를 통해 늘어난 증가 갭만큼 한도 포인트를 언제든지 추가 수령 가능합니다!</div>
        </div>
      </div>

      {/* Action triggers bottom screen */}
      <div className="space-y-3">
        <button 
          onClick={() => navigate("/stocks")}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 rounded-[16px] font-bold text-[16px] transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
        >
          지금 바로 투자하기
        </button>

        <button 
          type="button"
          onClick={() => navigate("/mypage")}
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-4 rounded-[16px] font-bold text-[16px] transition-colors cursor-pointer"
        >
          마이페이지로 돌아가기
        </button>
      </div>

    </div>
  );
}

// ==========================================
// RECHARGE STEP 1: /account-link/recharge/confirm
// ==========================================
function RechargeConfirmPage() {
  const navigate = useNavigate();
  const [currentBank, setCurrentBank] = useState("");
  const [currentNum, setCurrentNum] = useState("");
  const [availableAmount, setAvailableAmount] = useState(0);
  const [inputAmount, setInputAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [rechargeError, setRechargeError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authRes, limitRes] = await Promise.all([
          api.get("/openbanking/auths"),
          api.get("/openbanking/balance-limit"),
        ]);
        setCurrentBank(authRes.data.bankName);
        setCurrentNum(authRes.data.accountNumMasked);
        setAvailableAmount(limitRes.data.availableChargeAmount);
      } catch {
        setAvailableAmount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const amountNumber = Number(inputAmount) || 0;
  const isValid = amountNumber > 0 && amountNumber <= availableAmount;

  const handleExecuteRecharge = async () => {
    if (!isValid) return;
    try {
      await api.post("/openbanking/recharge", { amount: amountNumber });
      navigate("/account-link/recharge/complete", { state: { amount: amountNumber } });
    } catch (error: any) {
      setRechargeError(error.response?.data?.message ?? "충전에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col h-full justify-between flex-1 p-6 sm:p-8 animate-in fade-in duration-300">
      
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            type="button"
            onClick={() => navigate("/mypage")}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer flex items-center gap-1 text-sm font-semibold text-neutral-500"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
            <span>뒤로</span>
          </button>
          
          <span className="text-[13px] font-black text-[#3182F6] bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">잔액 재충전</span>
        </div>

        {/* Large Heading */}
        <h2 className="text-[25px] font-extrabold text-neutral-900 leading-tight tracking-tight mb-2 text-left">
          잔액이 늘어났나요?<br />
          추가 포인트를 받아요
        </h2>

        {/* Connected account card */}
        <div className="border border-neutral-200/80 rounded-2xl p-4 flex items-center justify-between bg-white text-left my-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-xl shrink-0">🏦</div>
            <div className="font-extrabold text-[13px] text-neutral-400">현재 연동 계좌</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[15px] text-neutral-800">{currentBank}</div>
            <div className="text-xs text-neutral-400">{currentNum}</div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="bg-neutral-50 border-2 border-neutral-200 rounded-[28px] p-5 my-5 text-left">
          <p className="text-sm text-text-secondary mb-2">
            {loading ? "한도를 확인하는 중..." : `최대 ₩${formatPrice(availableAmount)}까지 추가로 받을 수 있어요`}
          </p>
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="받을 금액을 입력하세요"
            className="w-full border-b-2 border-neutral-200 py-3 text-xl font-bold outline-none focus:border-[#3182F6] transition-colors bg-transparent"
          />
          <button
            type="button"
            onClick={() => setInputAmount(String(availableAmount))}
            className="text-sm font-bold text-[#3182F6] mt-3"
          >
            전액 입력
          </button>
          {rechargeError && (
            <p className="text-[12px] text-[#FF3B30] font-medium mt-3">{rechargeError}</p>
          )}
        </div>

        <p className="text-[11px] text-text-secondary mt-5 text-left">
          * 이미 교부된 모의 포인트는 계좌 잔액이 줄어들더라도 삭감되거나 강제 회수되지 않습니다.
        </p>
      </div>

      {/* Button Controls bottom side */}
      <div className="mt-8 space-y-3.5">
        <button
          onClick={handleExecuteRecharge}
          disabled={!isValid}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 rounded-[16px] font-bold text-[16px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-neutral-200 disabled:cursor-not-allowed"
        >
          재충전하기
        </button>

        <button
          onClick={() => navigate("/account-link/intro")}
          className="w-full text-xs font-bold text-[#E21010]/80 hover:text-[#E21010] transition text-center"
        >
          다른 계좌로 변경하기
        </button>
      </div>

    </div>
  );
}

// ==========================================
// RECHARGE STEP 2: /account-link/recharge/complete
// ==========================================
function RechargeCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || { amount: 3000000 };

  return (
    <div className="flex flex-col h-full justify-between flex-1 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-400">
      
      {/* Top Header */}
      <div className="flex items-center justify-end">
        <button 
          onClick={() => navigate("/mypage")}
          className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-6 h-6 text-neutral-700" />
        </button>
      </div>

      {/* Center success content */}
      <div className="my-auto py-10">
        
        <div className="w-16 h-16 bg-blue-50 text-[#3182F6] rounded-full flex items-center justify-center text-2.5xl mx-auto mb-6 shadow-xs">
          ⚡
        </div>

        {/* Title */}
        <p className="text-xs font-extrabold text-[#3182F6] uppercase tracking-wider mb-1.5">RECHARGE COMPLETED</p>
        <h2 className="text-[25px] font-black text-neutral-900 leading-snug tracking-tight mb-2">
          ₩{formatPrice(state.amount)}<br />
          추가 충전됐어요!
        </h2>

        <p className="text-sm font-semibold text-text-secondary leading-relaxed max-w-sm mx-auto mb-8">
          연동 계좌의 증가액이 성공적으로 확인되었습니다.<br />
          추가된 자금으로 더욱 능동적인 전술을 수립해보세요.
        </p>

        {/* Receipt table details */}
        <div className="bg-neutral-50/70 border border-neutral-150 rounded-[24px] p-5 text-left max-w-xs mx-auto space-y-3.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-400">추가 충전</span>
            <span className="font-extrabold text-[#3182F6]">+ ₩{formatPrice(state.amount)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-neutral-400">총 보유 포인트</span>
            <span className="font-extrabold text-neutral-800">지급 완료</span>
          </div>
        </div>
      </div>

      {/* Button footer controls */}
      <div className="space-y-3">
        <button 
          onClick={() => navigate("/stocks")}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 rounded-[16px] font-bold text-[16px] transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
        >
          투자하러 가기
        </button>

        <button 
          type="button"
          onClick={() => navigate("/mypage")}
          className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-4 rounded-[16px] font-bold text-[16px] transition-colors cursor-pointer"
        >
          마이페이지로 돌아가기
        </button>
      </div>

    </div>
  );
}

// ==========================================
// ERROR: 오픈뱅킹 네트워크 통신 오류
// ==========================================
function ErrorApiPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-full justify-between flex-1 p-6 sm:p-8 text-center animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-end">
        <button onClick={() => navigate("/mypage")} className="p-1 hover:bg-neutral-100 rounded-full" aria-label="닫기">
          <X className="w-6 h-6 text-neutral-700" />
        </button>
      </div>

      <div className="my-auto py-12">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
          ⚠️
        </div>
        
        <h2 className="text-[23px] font-black text-neutral-900 leading-snug tracking-tight mb-2">
          연결에 실패했어요
        </h2>

        <p className="text-sm font-semibold text-text-secondary leading-relaxed max-w-sm mx-auto mb-6">
          금융결제원 오픈플랫폼과의 데이터 릴레이 도중 일시 전송 지연이 관측되었습니다. 잠시 후 재시도를 진행해주시기 바랍니다.
        </p>
      </div>

      <div className="space-y-3">
        <button 
          onClick={() => navigate("/account-link/intro")}
          className="w-full bg-[#3182F6] hover:bg-[#1B64DA] text-white py-4 rounded-[16px] font-bold text-[16px] transition cursor-pointer"
        >
          다시 시도하기
        </button>

        <button 
          type="button"
          onClick={() => navigate("/mypage")}
          className="w-full text-xs font-bold text-neutral-400 hover:text-neutral-600 transition tracking-wide text-center"
        >
          나중에 하기
        </button>
      </div>
    </div>
  );
}
