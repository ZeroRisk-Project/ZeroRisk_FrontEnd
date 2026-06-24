import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

export function OAuthAdditional() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [isOptionalAgreed, setIsOptionalAgreed] = useState(false);
  const [isNicknameValid, setIsNicknameValid] = useState<boolean | null>(null);

  const email = "dog492***@gmail.com"; // Mock OAuth email

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNickname(val);
    if (val.length >= 2) setIsNicknameValid(true);
    else setIsNicknameValid(false);
  };

  const isAllRequiredAgreed = isAgreed;

  const handleStart = () => {
    if (!nickname || !isNicknameValid || !isAllRequiredAgreed) return;
    localStorage.setItem("isLoggedIn", "true");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-12 px-6 sm:px-8 animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-auto flex flex-col">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-[#8B95A1] hover:text-[#191F28] transition-colors cursor-pointer mb-6 animate-fade-in">
          <ArrowLeft className="w-4 h-4 mr-1" /> 돌아가기
        </Link>

        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-[#191F28] mb-2">
            거의 다 됐어요! 👋
          </h1>
          <p className="text-[#8B95A1] text-[15px]">
            닉네임만 설정하면 바로 시작할 수 있어요
          </p>
        </div>

        <div className="flex flex-col">
          <div className="space-y-6">
            {/* Email (Readonly) */}
            <div className="relative">
               <input
                type="text"
                id="email"
                value={email}
                readOnly
                className="peer w-full border-b border-[#E5E5EA] py-3 text-[17px] text-[#8B95A1] bg-transparent outline-none transition-colors"
              />
              <label
                htmlFor="email"
                className="absolute left-0 -top-3 text-[12px] text-[#8B95A1]"
              >
                이메일 (구글 연동)
              </label>
              <Lock className="absolute right-0 top-3 text-[#C7C7CC] w-5 h-5" />
            </div>

            {/* Nickname Input */}
            <div className="relative pt-4">
               <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={handleNicknameChange}
                className="peer w-full border-b border-[#E5E5EA] py-3 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                placeholder="닉네임"
              />
              <label
                htmlFor="nickname"
                className={`absolute left-0 transition-all cursor-text pointer-events-none ${
                  nickname ? "top-1 text-[12px] text-[#8B95A1]" : "top-7 text-[17px] text-[#8B95A1] peer-focus:top-1 peer-focus:text-[12px] peer-focus:text-brand"
                }`}
              >
                닉네임
              </label>
              {nickname && (
                <p className={`text-[12px] mt-1.5 font-medium ${isNicknameValid ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                  {isNicknameValid ? "사용 가능한 닉네임입니다" : "이미 사용 중인 닉네임입니다"}
                </p>
              )}
              {!nickname && (
                <p className="text-[12px] mt-1.5 font-medium text-[#8B95A1]">
                  12자 이하, 띄어쓰기와 특수문자 없이
                </p>
              )}
            </div>
          </div>

          {/* Agreement simplified */}
          <div className="mt-8 space-y-4">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isAgreed && isOptionalAgreed ? 'bg-brand' : 'bg-[#E5E5EA] group-hover:bg-[#C7C7CC]'}`}>
                     <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>
                  <span className="text-[17px] font-bold text-[#191F28]">약관 전체 동의</span>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isAgreed && isOptionalAgreed} 
                    onChange={(e) => {
                      setIsAgreed(e.target.checked);
                      setIsOptionalAgreed(e.target.checked);
                    }} 
                  />
               </label>
               <div className="h-[1px] bg-[#E5E5EA] ml-9 my-2"></div>
               <label className="flex items-center gap-3 cursor-pointer group ml-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                     <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke={isAgreed ? "#4A5DF9" : "#C7C7CC"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors"/>
                     </svg>
                  </div>
                  <span className="text-[15px] font-medium text-[#333D4B] flex-1">[필수] 서비스 이용약관 및 개인정보 처리방침</span>
                  <input type="checkbox" className="hidden" checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
               </label>
               <label className="flex items-center gap-3 cursor-pointer group ml-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                     <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke={isOptionalAgreed ? "#4A5DF9" : "#C7C7CC"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors"/>
                     </svg>
                  </div>
                  <span className="text-[15px] font-medium text-[#333D4B] flex-1">[선택] 마케팅 정보 수신 동의</span>
                  <input type="checkbox" className="hidden" checked={isOptionalAgreed} onChange={(e) => setIsOptionalAgreed(e.target.checked)} />
               </label>
          </div>

          <div className="mt-8">
            <button
              onClick={handleStart}
              disabled={!nickname || !isNicknameValid || !isAllRequiredAgreed}
              className={`w-full font-bold text-[16px] py-4 rounded-[16px] transition-colors active:scale-[0.98] ${
                nickname && isNicknameValid && isAllRequiredAgreed ? "bg-brand text-white hover:bg-brand/90" : "bg-[#F2F4F6] text-[#C7C7CC] cursor-not-allowed"
              }`}
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
