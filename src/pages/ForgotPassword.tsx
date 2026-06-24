import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20 pb-12 px-6 sm:px-8 animate-in fade-in zoom-in-95 duration-400">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          <CheckCircle2 className="w-16 h-16 text-brand mb-6 animate-bounce" />
          <h1 className="text-2xl font-bold tracking-tight text-[#191F28] mb-3 text-center">
            이메일을 확인해주세요
          </h1>
          <p className="text-[#8B95A1] text-[15px] text-center px-4 leading-relaxed mb-8">
            <span className="font-semibold text-[#191F28]">{email}</span>로<br />
            비밀번호 재설정 링크를 보냈어요
          </p>
          <Link
            to="/login"
            className="w-full bg-[#F2F4F6] text-[#333D4B] font-bold text-[15px] py-4 rounded-[16px] text-center hover:bg-gray-200 transition-colors"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-12 px-6 sm:px-8 animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-auto flex flex-col">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-[#8B95A1] hover:text-[#191F28] transition-colors cursor-pointer mb-6 animate-fade-in">
          <ArrowLeft className="w-4 h-4 mr-1" /> 로그인으로 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-[#191F28] leading-tight mb-2">
            비밀번호를<br />잊으셨나요?
          </h1>
          <p className="text-[#8B95A1] text-[15px]">
            가입하신 이메일로 재설정 링크를 보내드릴게요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-6">
            <div className="relative">
               <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full border-b border-[#E5E5EA] py-3 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                placeholder="이메일"
              />
              <label
                htmlFor="email"
                className={`absolute left-0 transition-all cursor-text pointer-events-none ${
                  email ? "-top-3 text-[12px] text-[#8B95A1]" : "top-3 text-[17px] text-[#8B95A1] peer-focus:-top-3 peer-focus:text-[12px] peer-focus:text-brand"
                }`}
              >
                이메일
              </label>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              type="submit"
              disabled={!email}
              className={`w-full font-bold text-[16px] py-4 rounded-[16px] transition-colors active:scale-[0.98] ${
                email ? "bg-brand text-white hover:bg-brand/90" : "bg-[#F2F4F6] text-[#C7C7CC] cursor-not-allowed"
              }`}
            >
              재설정 링크 보내기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
