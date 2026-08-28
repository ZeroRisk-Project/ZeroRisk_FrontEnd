import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronRight, X, ArrowLeft } from "lucide-react";
import api from "@/src/shared/lib/api";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  // Step 1 states
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [countdown, setCountdown] = useState(293); // 4:53
  const [sendError, setSendError] = useState("");
  
  // Step 2 states
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // Step 3 states
  const [isAllAgreed, setIsAllAgreed] = useState(false);
  const [terms, setTerms] = useState({
    service: false,
    privacy: false,
    marketing: false
  });
  const [showModal, setShowModal] = useState<string | null>(null);
  const [signupError, setSignupError] = useState("");

  // Format countdown
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isEmailSent && !isCodeVerified && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isEmailSent, isCodeVerified, countdown]);

  const handleSendEmail = async () => {
    try {
      await api.post("/auth/send-code", { email });
      setIsEmailSent(true);
      setCountdown(293);
      setSendError("");
    } catch (error: any) {
      setSendError(error.response?.data?.message ?? "인증번호 발송에 실패했습니다.");
    }
  };

  const handleAllAgree = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsAllAgreed(checked);
    setTerms({
      service: checked,
      privacy: checked,
      marketing: checked
    });
  };

  const handleTermChange = (key: keyof typeof terms) => {
    const newTerms = { ...terms, [key]: !terms[key] };
    setTerms(newTerms);
    setIsAllAgreed(newTerms.service && newTerms.privacy && newTerms.marketing);
  };

  const handleSignupComplete = async () => {
    try {
      await api.post("/auth/signup", { email, nickname, password });
      await api.post("/auth/login", { email, password });
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (error: any) {
      setSignupError(error.response?.data?.message ?? "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-12 px-6 sm:px-8 animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-auto flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="inline-flex items-center text-sm font-medium text-[#8B95A1] hover:text-[#191F28] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {step > 1 ? "이전으로" : "돌아가기"}
          </button>
          <span className="text-[14px] font-bold text-[#8B95A1]">
            {step} / 3
          </span>
        </div>

        {step === 1 && (
          <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="mb-8">
              <h1 className="text-[26px] font-bold tracking-tight text-[#191F28] leading-tight mb-2">
                이메일을 입력해주세요
              </h1>
              <p className="text-[#8B95A1] text-[15px]">
                인증번호를 보내드릴게요
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative flex items-end gap-3">
                 <div className="relative flex-1">
                   <input
                     type="text"
                     id="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     disabled={isEmailSent}
                     className="peer w-full border-b border-[#E5E5EA] py-3 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent disabled:text-[#8B95A1]"
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
                 <button 
                    onClick={handleSendEmail}
                    disabled={!email || isEmailSent}
                    className={`px-4 py-2 text-[13px] font-bold rounded-[8px] transition-colors whitespace-nowrap mb-1 ${
                      email && !isEmailSent ? "bg-[#F2F4F6] text-[#191F28] hover:bg-[#E5E5EA]" : "bg-[#F2F4F6] text-[#C7C7CC] cursor-not-allowed"
                    }`}
                  >
                   인증번호 받기
                 </button>
              </div>
              {email && !isEmailSent && (
                <p className="text-[12px] text-[#34C759] font-medium -mt-2">사용 가능한 이메일입니다</p>
              )}
              {sendError && (
                <p className="text-[12px] text-[#FF3B30] font-medium -mt-2">{sendError}</p>
              )}

              {isEmailSent && (
                <div className="relative pt-4 animate-in fade-in duration-300">
                   <input
                    type="text"
                    id="code"
                    value={code}
                    maxLength={6}
                    onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                      const value = e.target.value;
                      setCode(value);
                      setIsCodeVerified(false);

                      if (value.length === 6) {
                        try {
                          await api.post("/auth/verify-code", { email, code: value });
                          setIsCodeVerified(true);
                        } catch {
                          setIsCodeVerified(false);
                        }
                      }
                    }}
                    className="peer w-full border-b border-[#E5E5EA] py-3 text-[17px] text-[#191F28] tracking-widest bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                    placeholder="인증번호 6자리"
                  />
                  <label
                    htmlFor="code"
                    className={`absolute left-0 transition-all cursor-text pointer-events-none ${
                      code ? "top-1 text-[12px] text-[#8B95A1]" : "top-7 text-[17px] text-[#8B95A1] peer-focus:top-1 peer-focus:text-[12px] peer-focus:text-brand"
                    }`}
                  >
                    인증번호 6자리
                  </label>
                  
                  <div className="absolute right-0 top-7 flex items-center gap-3">
                    {!isCodeVerified && (
                       <span className={`text-[14px] font-medium ${countdown < 60 ? "text-[#FF3B30]" : "text-brand"}`}>
                         {formatTime(countdown)}
                       </span>
                    )}
                    {isCodeVerified ? (
                      <span className="text-[13px] font-bold text-[#34C759]">인증완료</span>
                    ) : (
                      <button onClick={handleSendEmail} className="text-[13px] font-bold text-[#8B95A1] hover:text-[#191F28] transition-colors">
                        재발송
                      </button>
                    )}
                  </div>
                  {isCodeVerified && (
                    <p className="text-[12px] text-[#34C759] font-medium mt-1.5">이메일 인증이 완료되었습니다</p>
                  )}
                  {code.length === 6 && !isCodeVerified && (
                    <p className="text-[12px] text-[#FF3B30] font-medium mt-1.5">인증번호가 일치하지 않습니다 (123456 입력)</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={() => setStep(2)}
                disabled={!isCodeVerified}
                className={`w-full font-bold text-[16px] py-4 rounded-[16px] transition-colors active:scale-[0.98] ${
                  isCodeVerified ? "bg-brand text-white hover:bg-brand/90" : "bg-[#F2F4F6] text-[#C7C7CC] cursor-not-allowed"
                }`}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="mb-8">
              <h1 className="text-[26px] font-bold tracking-tight text-[#191F28] mb-2 leading-tight">
                닉네임과 비밀번호를<br />설정해주세요
              </h1>
            </div>

            <div className="space-y-6">
              {/* Nickname */}
              <div className="relative">
                 <input
                  type="text"
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="peer w-full border-b border-[#E5E5EA] py-3 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                  placeholder="닉네임"
                />
                <label
                  htmlFor="nickname"
                  className={`absolute left-0 transition-all cursor-text pointer-events-none ${
                    nickname ? "-top-3 text-[12px] text-[#8B95A1]" : "top-3 text-[17px] text-[#8B95A1] peer-focus:-top-3 peer-focus:text-[12px] peer-focus:text-brand"
                  }`}
                >
                  닉네임
                </label>
                {nickname && nickname.length > 2 ? (
                  <p className="text-[12px] text-[#34C759] font-medium mt-1.5">사용 가능한 닉네임입니다</p>
                ) : (
                  <p className="text-[12px] text-[#8B95A1] font-medium mt-1.5">12자 이하, 띄어쓰기와 특수문자 없이</p>
                )}
              </div>

              {/* Password */}
              <div className="relative pt-2">
                 <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full border-b border-[#E5E5EA] py-3 pr-10 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                  placeholder="비밀번호"
                />
                <label
                  htmlFor="password"
                  className={`absolute left-0 transition-all cursor-text pointer-events-none ${
                    password ? "-top-1 text-[12px] text-[#8B95A1]" : "top-5 text-[17px] text-[#8B95A1] peer-focus:-top-1 peer-focus:text-[12px] peer-focus:text-brand"
                  }`}
                >
                  비밀번호
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-5 text-[#8B95A1] hover:text-[#191F28] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                
                <div className="mt-2 flex items-center gap-1 h-1 w-full max-w-[120px]">
                  <div className={`h-full flex-1 rounded-full ${password.length > 0 ? "bg-[#FF3B30]" : "bg-[#E5E5EA]"}`}></div>
                  <div className={`h-full flex-1 rounded-full ${password.length > 5 ? "bg-[#FF9500]" : "bg-[#E5E5EA]"}`}></div>
                  <div className={`h-full flex-1 rounded-full ${password.length > 8 ? "bg-[#34C759]" : "bg-[#E5E5EA]"}`}></div>
                </div>
                <p className="text-[12px] text-[#8B95A1] font-medium mt-1.5">8자 이상, 영문+숫자+특수문자 포함</p>
              </div>

              {/* Password Confirm */}
              <div className="relative pt-2">
                 <input
                  type={showPasswordConfirm ? "text" : "password"}
                  id="passwordConfirm"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="peer w-full border-b border-[#E5E5EA] py-3 pr-10 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                  placeholder="비밀번호 확인"
                />
                <label
                  htmlFor="passwordConfirm"
                  className={`absolute left-0 transition-all cursor-text pointer-events-none ${
                    passwordConfirm ? "-top-1 text-[12px] text-[#8B95A1]" : "top-5 text-[17px] text-[#8B95A1] peer-focus:-top-1 peer-focus:text-[12px] peer-focus:text-brand"
                  }`}
                >
                  비밀번호 확인
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-0 top-5 text-[#8B95A1] hover:text-[#191F28] transition-colors"
                >
                  {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {passwordConfirm.length > 0 && (
                  <p className={`text-[12px] font-medium mt-1.5 ${password === passwordConfirm ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                    {password === passwordConfirm ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setStep(3)}
                disabled={!nickname || password.length < 8 || password !== passwordConfirm}
                className={`w-full font-bold text-[16px] py-4 rounded-[16px] transition-colors active:scale-[0.98] ${
                  nickname && password.length >= 8 && password === passwordConfirm ? "bg-brand text-white hover:bg-brand/90" : "bg-[#F2F4F6] text-[#C7C7CC] cursor-not-allowed"
                }`}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <h1 className="text-[26px] font-bold tracking-tight text-[#191F28] mb-2 leading-tight">
                서비스 이용을 위해<br />동의가 필요해요
              </h1>
            </div>

            <div className="space-y-4">
              {/* All agree */}
               <label className="flex items-center gap-4 cursor-pointer group p-4 border border-[#E5E5EA] rounded-[16px] bg-white shadow-sm hover:border-brand/30 transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isAllAgreed ? 'bg-brand' : 'bg-[#E5E5EA] group-hover:bg-[#C7C7CC]'}`}>
                     <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 6L6 10.5L14.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                  </div>
                  <span className="text-[18px] font-bold text-[#191F28]">전체 동의</span>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={isAllAgreed} 
                    onChange={handleAllAgree} 
                  />
               </label>

               <div className="space-y-1">
                 <div className="flex items-center justify-between py-2.5">
                    <label className="flex items-center gap-3 cursor-pointer group flex-1">
                      <div className="w-6 h-6 flex items-center justify-center">
                         <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L5 9L13 1" stroke={terms.service ? "#4A5DF9" : "#C7C7CC"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors"/>
                         </svg>
                      </div>
                      <span className="text-[15px] font-medium text-[#333D4B]">[필수] 서비스 이용약관</span>
                      <input type="checkbox" className="hidden" checked={terms.service} onChange={() => handleTermChange('service')} />
                    </label>
                    <button onClick={() => setShowModal('service')} className="text-[#8B95A1] text-[14px] font-medium flex items-center hover:text-[#191F28] transition-colors">
                       보기 <ChevronRight size={16} />
                    </button>
                 </div>

                 <div className="flex items-center justify-between py-2.5">
                    <label className="flex items-center gap-3 cursor-pointer group flex-1">
                      <div className="w-6 h-6 flex items-center justify-center">
                         <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L5 9L13 1" stroke={terms.privacy ? "#4A5DF9" : "#C7C7CC"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors"/>
                         </svg>
                      </div>
                      <span className="text-[15px] font-medium text-[#333D4B]">[필수] 개인정보 처리방침</span>
                      <input type="checkbox" className="hidden" checked={terms.privacy} onChange={() => handleTermChange('privacy')} />
                    </label>
                    <button onClick={() => setShowModal('privacy')} className="text-[#8B95A1] text-[14px] font-medium flex items-center hover:text-[#191F28] transition-colors">
                       보기 <ChevronRight size={16} />
                    </button>
                 </div>

                 <div className="flex items-center justify-between py-2.5">
                    <label className="flex items-center gap-3 cursor-pointer group flex-1">
                      <div className="w-6 h-6 flex items-center justify-center">
                         <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5L5 9L13 1" stroke={terms.marketing ? "#4A5DF9" : "#C7C7CC"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors"/>
                         </svg>
                      </div>
                      <span className="text-[15px] font-medium text-[#333D4B]">[선택] 마케팅 정보 수신</span>
                      <input type="checkbox" className="hidden" checked={terms.marketing} onChange={() => handleTermChange('marketing')} />
                    </label>
                    <button onClick={() => setShowModal('marketing')} className="text-[#8B95A1] text-[14px] font-medium flex items-center hover:text-[#191F28] transition-colors">
                       보기 <ChevronRight size={16} />
                    </button>
                 </div>
               </div>
            </div>

            <div className="mt-8">
               <button
                  onClick={handleSignupComplete}
                  disabled={!terms.service || !terms.privacy}
                  className={`w-full font-bold text-[16px] py-4 rounded-[16px] transition-colors active:scale-[0.98] ${
                    terms.service && terms.privacy ? "bg-brand text-white hover:bg-brand/90" : "bg-[#F2F4F6] text-[#C7C7CC] cursor-not-allowed"
                  }`}
               >
                  회원가입 완료
               </button>
               {signupError && (
                 <p className="text-[12px] text-[#FF3B30] font-medium mt-2 text-center">{signupError}</p>
               )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Dimmed Background */}
          <div 
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setShowModal(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-t-[24px] flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            {/* Handle bar */}
            <div className="w-full flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 bg-[#E5E5EA] rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between px-6 pb-4">
               <h2 className="text-xl font-bold">
                 {showModal === 'service' ? '서비스 이용약관' : showModal === 'privacy' ? '개인정보 처리방침' : '마케팅 정보 수신 동의'}
               </h2>
               <button onClick={() => setShowModal(null)} className="p-1 text-[#8E8E93] hover:text-[#1C1C1E] transition-colors">
                 <X size={24} />
               </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1 text-[15px] text-[#3A3A3C] leading-relaxed">
              <h3 className="font-bold text-[#1C1C1E] mb-2">제1조 (목적)</h3>
              <p className="mb-4">
                본 약관은 모의투자 플랫폼 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
              <h3 className="font-bold text-[#1C1C1E] mb-2">제2조 (용어의 정의)</h3>
              <p className="mb-4">
                이 약관에서 사용하는 용어의 정의는 다음과 같습니다.<br />
                1. "서비스"란 구현되는 단말기(PC, TV, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 "회원"이 이용할 수 있는 모의투자 관련 제반 서비스를 의미합니다.
              </p>
              <h3 className="font-bold text-[#1C1C1E] mb-2">제3조 (약관의 게시와 개정)</h3>
              <p className="mb-4">
                ① "회사"는 본 약관의 내용을 "회원"이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
              </p>
              <h3 className="font-bold text-[#1C1C1E] mb-2">제4조 (회원의 의무)</h3>
              <p className="mb-4">
                회원은 다음 행위를 하여서는 안 됩니다.<br />
                1. 신청 또는 변경 시 허위내용의 등록<br />
                2. 타인의 정보도용
              </p>
              <div className="h-20"></div> {/* Bottom padding */}
            </div>

            {/* Sticky Bottom Button */}
            <div className="px-6 py-4 bg-white border-t border-[#E5E5EA]">
              <button
                onClick={() => {
                  if (showModal === 'service') handleTermChange('service');
                  if (showModal === 'privacy') handleTermChange('privacy');
                  if (showModal === 'marketing') handleTermChange('marketing');
                  setShowModal(null);
                }}
                className="w-full bg-brand text-white font-bold text-[16px] py-4 rounded-[16px] hover:bg-brand/90 transition-colors active:scale-[0.98]"
              >
                동의하고 체크하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
