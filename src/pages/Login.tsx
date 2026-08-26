import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import api from "@/src/lib/api";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("이메일 또는 비밀번호를 확인해주세요");
      return;
    }
    if (captchaRequired && !recaptchaToken) {
      setErrorMessage("보안 인증을 완료해주세요");
      return;
    }

    try {
      await api.post("/auth/login", {
        email,
        password,
        recaptchaToken: captchaRequired ? recaptchaToken : undefined,
      });
      setCaptchaRequired(false);
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (error: any) {
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === "AUTH_009") {
        setCaptchaRequired(true);
        setRecaptchaToken(null);
        recaptchaRef.current?.reset();
        setErrorMessage("로그인 시도가 많아 보안 인증이 필요해요");
      } else if (errorCode === "AUTH_010") {
        setErrorMessage(error.response?.data?.message ?? "잠시 후 다시 시도해주세요");
      } else {
        setErrorMessage("이메일 또는 비밀번호를 확인해주세요");
      }
    }
  };
  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 pb-12 px-6 sm:px-8 animate-in fade-in duration-300">
      <div className="w-full max-w-md mx-auto flex flex-col">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-[#8B95A1] hover:text-[#191F28] transition-colors cursor-pointer mb-6 animate-fade-in">
          <ArrowLeft className="w-4 h-4 mr-1" /> 홈으로 돌아가기
        </Link>

        <div className="mb-8">
          {/* Logo / Brand name could go here if needed, but heading is below */}
          <h1 className="text-[26px] font-bold tracking-tight text-[#191F28] leading-tight mb-2">
            안녕하세요,<br /><span className="text-brand">제로리스크</span>입니다
          </h1>
          <p className="text-[#8B95A1] text-[15px]">
            모의주식투자로 실전 감각을 키워보세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col">
          <div className="space-y-6">
            {/* Email Input */}
            <div className="relative">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                className="peer w-full border-b border-[#E5E5EA] py-3 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                placeholder="이메일"
              />
              <label
                htmlFor="email"
                className={`absolute left-0 transition-all cursor-text pointer-events-none ${email ? "-top-3 text-[12px] text-[#8B95A1]" : "top-3 text-[17px] text-[#8B95A1] peer-focus:-top-3 peer-focus:text-[12px] peer-focus:text-brand"
                  }`}
              >
                이메일
              </label>
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                className="peer w-full border-b border-[#E5E5EA] py-3 pr-10 text-[17px] text-[#191F28] bg-transparent outline-none focus:border-brand transition-colors placeholder-transparent"
                placeholder="비밀번호"
              />
              <label
                htmlFor="password"
                className={`absolute left-0 transition-all cursor-text pointer-events-none ${password ? "-top-3 text-[12px] text-[#8B95A1]" : "top-3 text-[17px] text-[#8B95A1] peer-focus:-top-3 peer-focus:text-[12px] peer-focus:text-brand"
                  }`}
              >
                비밀번호
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-3 text-[#8B95A1] hover:text-[#191F28] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {errorMessage && (
              <p className="text-[13px] text-[#FF3B30] mt-2 font-medium">{errorMessage}</p>
            )}

            {captchaRequired && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4 flex flex-col items-center gap-2">
                <div className="w-full bg-[#F2F4F6] rounded-[16px] p-4 flex flex-col items-center gap-3">
                  <p className="text-[13px] font-bold text-[#4E5968] text-center">
                    로그인 시도가 많아 보안 인증이 필요해요
                  </p>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                    onChange={(token) => setRecaptchaToken(token)}
                    onExpired={() => setRecaptchaToken(null)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4">
            <button
              type="submit"
              className="w-full bg-brand text-white font-bold text-[16px] py-4 rounded-[16px] hover:bg-brand/90 transition-colors active:scale-[0.98]"
            >
              로그인
            </button>

            <div className="flex items-center justify-center gap-4 text-[13px] text-[#8B95A1] font-medium pt-1">
              <Link to="/forgot-password" className="hover:text-[#191F28] transition-colors">비밀번호 찾기</Link>
              <div className="w-[1px] h-3 bg-[#E5E5EA]"></div>
              <Link to="/register" className="hover:text-[#191F28] transition-colors">회원가입</Link>
            </div>
          </div>
        </form>

        <div className="mt-8 w-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-[1px] bg-[#E5E5EA]"></div>
            <span className="text-[12px] text-[#8B95A1] font-medium">또는</span>
            <div className="flex-1 h-[1px] bg-[#E5E5EA]"></div>
          </div>

          <div className="space-y-3">
            <a href="http://localhost:8081/oauth2/authorization/google" className="w-full flex items-center justify-center gap-2 border border-[#E5E5EA] bg-white text-[#191F28] font-bold text-[15px] py-3.5 rounded-[16px] hover:bg-gray-50 transition-colors active:scale-[0.98]">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              Google 계정으로 로그인
            </a>
            <a href="http://localhost:8081/oauth2/authorization/kakao" className="w-full flex items-center justify-center gap-2 border border-[#FEE500] bg-[#FEE500] text-[#000000] font-bold text-[15px] py-3.5 rounded-[16px] hover:bg-[#FEE500]/90 transition-colors active:scale-[0.98]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-5.522 0-10 3.468-10 7.74 0 2.768 1.838 5.176 4.636 6.541-.15.545-1.127 3.99-1.295 4.634-.208.8.274.792.578.587 0 0 3.754-2.528 5.253-3.62.27.027.548.041.828.041 5.522 0 10-3.468 10-7.74S17.522 3 12 3z" />
              </svg>
              카카오로 로그인
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
