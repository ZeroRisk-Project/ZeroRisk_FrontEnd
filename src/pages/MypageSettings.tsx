import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckSquare,
  Square
} from "lucide-react";
import api from "@/src/lib/api";
import { DEFAULT_PROFILE_IMAGE } from "@/src/lib/constants";

// Types
type ActiveSheet =
  | null
  | "profile_edit"
  | "password_change"
  | "reset_confirm"
  | "account_delete";

type AccountType = "general" | "social";

export function MypageSettings() {
  const navigate = useNavigate();

  // State for Settings Page
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  // Profile Edit States
  const [nickname, setNickname] = useState("불러오는 중");
  const [tempNickname, setTempNickname] = useState("");
  const [profilePic, setProfilePic] = useState(DEFAULT_PROFILE_IMAGE);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameSuccess, setNicknameSuccess] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  // Password Change States
  const [accountType, setAccountType] = useState<AccountType>("general");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [email, setEmail] = useState("");

  // Notifications Toggles
  const [notifTrade, setNotifTrade] = useState(true);
  const [notifComment, setNotifComment] = useState(true);
  const [notifCompetition, setNotifCompetition] = useState(true);
  const [notifPrice, setNotifPrice] = useState(true);
  const [notifQna, setNotifQna] = useState(false);
  const [notifMarketing, setNotifMarketing] = useState(false);

  const [accountLinked, setAccountLinked] = useState(false);

  useEffect(() => {
    const checkAccountLink = async () => {
      try {
        await api.get("/openbanking/auths");
        setAccountLinked(true);
      } catch {
        setAccountLinked(false);
      }
    };
    checkAccountLink();
  }, []);

  const [profileSettings, setProfileSettings] = useState({
    showReturnRate: true,
    showPortfolio: true,
    showTrades: true,
    showStats: true,
    showCompetitions: true,
  });

  useEffect(() => {
    const fetchProfileSettings = async () => {
      try {
        const response = await api.get("/profiles/me/settings");
        setProfileSettings(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProfileSettings();
  }, []);

  const handleToggleSetting = async (key: keyof typeof profileSettings) => {
    const previous = profileSettings;
    const updated = { ...profileSettings, [key]: !profileSettings[key] };
    setProfileSettings(updated);
    try {
      await api.put("/profiles/me/settings", updated);
    } catch (error) {
      setProfileSettings(previous);
      triggerNotification("설정 변경에 실패했습니다.");
    }
  };

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const response = await api.get("/users/me");
        setNickname(response.data.nickname);
        setEmail(response.data.email);
        setProfilePic(response.data.profileImageUrl || DEFAULT_PROFILE_IMAGE);
        setAccountType(response.data.oauthProvider ? "social" : "general");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyInfo();
  }, []);

  // Delete Account States
  const [deleteStep, setDeleteStep] = useState<1 | 2 | 3>(1);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteReasonText, setDeleteReasonText] = useState("");
  const [confirmDeleteCheck1, setConfirmDeleteCheck1] = useState(false);
  const [confirmDeleteCheck2, setConfirmDeleteCheck2] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Handle Nickname validation
  const handleNicknameChange = (val: string) => {
    setTempNickname(val);
    if (!val.trim()) {
      setNicknameError("닉네임을 입력해 주세요.");
      setNicknameSuccess(false);
      return;
    }
    if (val.length > 12) {
      setNicknameError("12자 이하로 입력해 주세요.");
      setNicknameSuccess(false);
      return;
    }
    const hasSpecialChar = /[^a-zA-Z0-9가-힣\s]/.test(val);
    if (hasSpecialChar) {
      setNicknameError("특수문자는 사용하실 수 없습니다.");
      setNicknameSuccess(false);
      return;
    }

    // Mock duplicate check
    if (val === "이미사용중" || val === "test") {
      setNicknameError("이미 사용 중인 닉네임입니다.");
      setNicknameSuccess(false);
    } else {
      setNicknameError(null);
      setNicknameSuccess(true);
    }
  };

  // Profile Pic picker trigger
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePic(event.target.result as string);
          triggerNotification("프로필 이미지가 변경되었습니다.");
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Toast Notification helper
  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => {
      setShowNotification(null);
    }, 3000);
  };

  // Calc password strength
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { text: "없음", score: 0, color: "bg-neutral-200" };
    if (pw.length < 6) return { text: "위험 (너무 짧음)", score: 1, color: "bg-red-500 w-1/3" };
    const hasNumbers = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    if (hasNumbers && hasSpecial && pw.length >= 8) {
      return { text: "안전 (강함)", score: 3, color: "bg-emerald-500 w-full" };
    }
    return { text: "보통", score: 2, color: "bg-yellow-500 w-2/3" };
  };

  const pwStrength = getPasswordStrength(newPassword);

  const isPasswordChangeValid = 
    currentPassword.length > 0 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword;

  // Render bottom sheets
  const renderBottomSheet = () => {
    if (!activeSheet) return null;

    const closeSheet = () => {
      setActiveSheet(null);
      // Reset temporary states on close
      setDeleteStep(1);
      setDeleteReason("");
      setDeleteReasonText("");
      setConfirmDeleteCheck1(false);
      setConfirmDeleteCheck2(false);
      setDeletePassword("");
      setDeleteError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <div 
          onClick={closeSheet}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />
        
        {/* Sheet Content */}
        <div className="relative w-full max-w-[480px] bg-white rounded-[12px] shadow-[0_16px_48px_rgba(0,0,0,0.18)] flex flex-col max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 z-50">

          <button 
            onClick={closeSheet}
            className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-50 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="px-6 pb-8 pt-8">
            {/* 1. PROFILE EDIT */}
            {activeSheet === "profile_edit" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-bold text-neutral-900">프로필 편집</h3>
                </div>

                {/* Avatar change */}
                <div className="flex flex-col items-center">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img 
                      src={profilePic} 
                      alt="Profile Avatar" 
                      className="w-[84px] h-[84px] rounded-full object-cover border border-neutral-100 shadow-sm"
                    />
                    <div className="absolute bottom-0 right-0 p-1.5 bg-white border border-neutral-100 rounded-full shadow-md text-neutral-600 hover:bg-neutral-50 transition">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleProfilePicChange}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3.5 px-4 py-1.5 border border-neutral-200 rounded-full text-[13px] font-bold text-neutral-600 bg-white hover:bg-neutral-50 transition"
                  >
                    사진 변경
                  </button>
                </div>

                {/* Nickname Input - Floating label styled */}
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-neutral-500 block">닉네임</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={tempNickname}
                      onChange={(e) => handleNicknameChange(e.target.value)}
                      className={`w-full px-4 py-3.5 bg-neutral-50 border rounded-[16px] text-base font-semibold outline-none transition-colors ${
                        nicknameError ? 'border-red-400 focus:border-red-500 bg-red-50/10' : nicknameSuccess && tempNickname !== nickname ? 'border-emerald-400 focus:border-emerald-500' : 'border-neutral-200 focus:border-neutral-400'
                      }`}
                      placeholder="닉네임을 입력하세요"
                      maxLength={15}
                    />
                    {tempNickname && (
                      <button 
                        onClick={() => handleNicknameChange("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full"
                      >
                        <X className="w-4 h-4 bg-neutral-100 rounded-full p-0.5" />
                      </button>
                    )}
                  </div>

                  {/* Feedback Message */}
                  {nicknameError && (
                    <p className="text-[12px] font-semibold text-red-500 flex items-center gap-1 pl-1">
                      ❌ {nicknameError}
                    </p>
                  )}
                  {!nicknameError && nicknameSuccess && tempNickname !== nickname && tempNickname.length > 0 && (
                    <p className="text-[12px] font-semibold text-emerald-600 flex items-center gap-1 pl-1">
                      ✅ 사용 가능한 닉네임입니다
                    </p>
                  )}
                  <p className="text-[11px] font-medium text-neutral-400 pl-1">12자 이하, 특수문자 불가</p>
                </div>

                <button
                  onClick={async () => {
                    try {
                      await api.patch("/users/me", { nickname: tempNickname, profileImageUrl: profilePic });
                      setNickname(tempNickname);
                      triggerNotification("닉네임이 성공적으로 변경되었습니다.");
                      closeSheet();
                    } catch (error: any) {
                      setNicknameError(error.response?.data?.message ?? "변경에 실패했습니다.");
                    }
                  }}
                  disabled={!!nicknameError || tempNickname === nickname || !tempNickname.trim()}
                  className="w-full bg-[#4B80EB] disabled:bg-neutral-200 text-white font-bold py-4 rounded-[16px] transition-all hover:bg-blue-600 disabled:text-neutral-400 mt-4 cursor-pointer"
                >
                  저장하기
                </button>
              </div>
            )}

            {/* 2. PASSWORD CHANGE */}
            {activeSheet === "password_change" && (
              <div className="space-y-5">
                <div className="text-center mb-2">
                  <h3 className="text-lg font-bold text-neutral-900">비밀번호 변경</h3>
                  {/* Account Type switcher just for demonstration */}
                  <div className="mt-3 inline-flex bg-neutral-100 p-1 rounded-lg text-xs font-bold text-neutral-500">
                    <button 
                      onClick={() => setAccountType("general")}
                      className={`px-3 py-1.5 rounded-md transition ${accountType === "general" ? 'bg-white text-neutral-900 shadow-xs' : ''}`}
                    >
                      일반 계정
                    </button>
                    <button 
                      onClick={() => setAccountType("social")}
                      className={`px-3 py-1.5 rounded-md transition ${accountType === "social" ? 'bg-white text-neutral-900 shadow-xs' : ''}`}
                    >
                      소셜 계정
                    </button>
                  </div>
                </div>

                {accountType === "social" ? (
                  <div className="space-y-5 py-4">
                    <div className="bg-neutral-50 border border-neutral-100 rounded-[20px] p-5 text-center">
                      <div className="text-3xl mb-2">🔗</div>
                      <p className="text-[15px] font-bold text-neutral-800 leading-relaxed">
                        간편 로그인 계정은<br />비밀번호를 변경할 수 없어요
                      </p>
                      <p className="text-xs text-neutral-400 mt-2 font-medium">Google 이나 카카오 등의 연동 계정을 비밀번호 변경 시 해당 소셜 서비스에서 변경해 주세요.</p>
                    </div>
                    <button 
                      onClick={closeSheet}
                      className="w-full bg-neutral-900 text-white font-bold py-4 rounded-[16px] hover:bg-neutral-800 transition cursor-pointer"
                    >
                      확인
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Current password */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-neutral-500">현재 비밀번호</label>
                      <input 
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 rounded-[16px] text-base outline-none transition"
                        placeholder="현재 비밀번호를 입력해 주세요"
                      />
                    </div>

                    {/* New password */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-neutral-500">새 비밀번호</label>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 rounded-[16px] text-base outline-none transition"
                        placeholder="새 비밀번호를 입력해 주세요"
                      />
                      {newPassword && (
                        <div className="space-y-1 px-1">
                          <p className={`text-[12px] font-bold ${pwStrength.score === 1 ? 'text-red-500' : pwStrength.score === 2 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                            보안 수준: {pwStrength.text}
                          </p>
                          <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* New password confirm */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-neutral-500">새 비밀번호 확인</label>
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 rounded-[16px] text-base outline-none transition"
                        placeholder="새 비밀번호를 다시 입력해 주세요"
                      />
                      {confirmPassword && (
                        <p className={`text-[12px] font-bold pl-1 ${newPassword === confirmPassword ? 'text-emerald-500' : 'text-red-500'}`}>
                          {newPassword === confirmPassword ? "✅ 비밀번호가 일치합니다" : "❌ 비밀번호가 일치하지 않습니다"}
                        </p>
                      )}
                    </div>

                    {passwordError && (
                      <p className="text-[12px] font-bold text-red-500 pl-1">❌ {passwordError}</p>
                    )}

                    <button
                      onClick={async () => {
                        try {
                          await api.patch("/users/me/password", { currentPassword, newPassword });
                          triggerNotification("비밀번호가 안전하게 변경되었습니다.");
                          closeSheet();
                        } catch (error: any) {
                          setPasswordError(error.response?.data?.message ?? "변경에 실패했습니다.");
                        }
                      }}
                      disabled={!isPasswordChangeValid}
                      className="w-full bg-[#4B80EB] disabled:bg-neutral-200 text-white font-bold py-4 rounded-[16px] hover:bg-blue-600 disabled:text-neutral-400 mt-4 transition-all cursor-pointer"
                    >
                      변경하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 6. ACCOUNT RESET CONFIRMATION */}
            {activeSheet === "reset_confirm" && (
              <div className="space-y-6 text-center">
                <div className="flex justify-center pt-2">
                  <div className="w-[72px] h-[72px] bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900">정말 초기화하시겠어요?</h3>
                </div>

                <div className="bg-red-50/50 border border-red-100 rounded-[20px] p-5 text-left text-neutral-800">
                  <p className="text-sm font-bold text-red-600 mb-2.5">초기화하면 다음과 같이 처리됩니다</p>
                  <ul className="space-y-2 text-[13px] font-semibold text-neutral-600 pl-1">
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span> 기본 계좌 잔액이 0원으로 초기화됩니다
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-400">•</span> 오픈뱅킹 계좌 인증이 해제되어, 시드머니를 다시 받으려면 계좌 인증부터 다시 진행해야 합니다
                    </li>
                  </ul>
                  <p className="text-[12px] text-red-500/80 mt-3 font-bold">⚠️ 이 작업은 결과를 절대 되돌릴 수 없어요.</p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={async () => {
                      try {
                        await api.post("/users/me/reset-seed-money");
                        setAccountLinked(false);
                        triggerNotification("모의투자 자금이 초기화되었습니다. 계좌 인증을 다시 진행해주세요.");
                        closeSheet();
                      } catch (error: any) {
                        triggerNotification(error.response?.data?.message ?? "초기화에 실패했습니다.");
                      }
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-[16px] transition-all cursor-pointer"
                  >
                    초기화하기
                  </button>
                  <button 
                    onClick={closeSheet}
                    className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-4 rounded-[16px] transition-all cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 7. ACCOUNT DELETE (MULTI-STEP) */}
            {activeSheet === "account_delete" && (
              <div className="space-y-6">
                {/* STEP 1: Loss Aversion */}
                {deleteStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center py-2">
                      <div className="text-4xl mb-2.5">😢</div>
                      <h3 className="text-xl font-bold text-neutral-900">정말 떠나시려고요?</h3>
                      <p className="text-sm font-medium text-neutral-400 mt-1">포기하기엔 회원님의 투자 자산이 아까워요</p>
                    </div>

                    <div className="p-5 bg-neutral-50/80 border border-neutral-100 rounded-[20px] space-y-3.5">
                      <h4 className="text-[14px] font-bold text-neutral-800">탈퇴하면 사라지는 것들</h4>
                      <ul className="space-y-2.5 text-[13px] font-semibold text-neutral-500 pl-1">
                        <li className="flex items-center gap-2.5 text-red-500">
                          <span>✗</span> <span className="text-neutral-600">모의투자 수익 기록 및 자산</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-red-500">
                          <span>✗</span> <span className="text-neutral-600">커뮤니티 활동 및 대화 내역</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-red-500">
                          <span>✗</span> <span className="text-neutral-600">대회 참가 기록 및 수상 내역</span>
                        </li>
                        <li className="flex items-center gap-2.5 text-red-500">
                          <span>✗</span> <span className="text-neutral-600">연동된 계좌 명세 정보</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={closeSheet}
                        className="w-full bg-[#4B80EB] hover:bg-blue-600 text-white font-bold py-4 rounded-[16px] transition shadow-md cursor-pointer"
                      >
                        잠깐, 더 생각해볼게요
                      </button>
                      <button 
                        onClick={() => setDeleteStep(2)}
                        className="text-[13px] font-extrabold text-neutral-400 hover:text-red-500 transition self-center"
                      >
                        그래도 탈퇴할게요
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Reason Selection */}
                {deleteStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">떠나시는 이유가 뭔가요?</h3>
                      <p className="text-[13px] font-medium text-neutral-400 mt-1">더 나은 서비스를 위해 알려주세요</p>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                      {[
                        "자주 사용하지 않아서",
                        "원하는 기능이 없어서",
                        "사용하기 불편해서",
                        "개인정보가 걱정돼서",
                        "다른 서비스를 이용할 거라서",
                        "기타 (직접 입력)"
                      ].map((item, idx) => (
                        <label 
                          key={idx}
                          className="flex items-center justify-between p-3.5 bg-neutral-50 hover:bg-neutral-100/50 rounded-[14px] cursor-pointer"
                        >
                          <span className="text-[14px] font-bold text-neutral-700">{item}</span>
                          <input 
                            type="radio" 
                            name="delete_reason" 
                            value={item}
                            checked={deleteReason === item}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            className="w-5 h-5 accent-[#4B80EB] cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>

                    {/* 기타 selected text field */}
                    {deleteReason === "기타 (직접 입력)" && (
                      <textarea 
                        value={deleteReasonText}
                        onChange={(e) => setDeleteReasonText(e.target.value)}
                        className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-[16px] text-[14px] font-medium outline-none focus:border-neutral-400 transition"
                        placeholder="의견을 남겨주세요"
                        rows={3}
                      />
                    )}

                    <div className="flex gap-2.5">
                      <button 
                        onClick={() => setDeleteStep(1)}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-4 rounded-[16px] transition cursor-pointer"
                      >
                        이전
                      </button>
                      <button 
                        onClick={() => setDeleteStep(3)}
                        disabled={!deleteReason || (deleteReason === "기타 (직접 입력)" && !deleteReasonText.trim())}
                        className="flex-1 bg-neutral-900 text-white font-bold py-4 rounded-[16px] hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition cursor-pointer"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Final Confirm */}
                {deleteStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">탈퇴 전 확인해주세요</h3>
                      <p className="text-[13px] font-medium text-neutral-400 mt-1">마지막으로 확인 사항을 점검해 주세요</p>
                    </div>

                    {/* Checkbox item 1 */}
                    <button 
                      onClick={() => setConfirmDeleteCheck1(!confirmDeleteCheck1)}
                      className="w-full flex items-start gap-3 p-4 bg-neutral-50 hover:bg-neutral-100/40 rounded-[20px] transition text-left"
                    >
                      <span className="mt-0.5 text-[#4B80EB]">
                        {confirmDeleteCheck1 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-neutral-300" />}
                      </span>
                      <p className="text-[14px] font-bold text-neutral-700 leading-relaxed">
                        보유 중인 모든 계좌, 주식, 주문 내역이 완전히 삭제되는 것을 동의합니다
                      </p>
                    </button>

                    {/* Checkbox item 2 */}
                    <button 
                      onClick={() => setConfirmDeleteCheck2(!confirmDeleteCheck2)}
                      className="w-full flex items-start gap-3 p-4 bg-neutral-50 hover:bg-neutral-100/40 rounded-[20px] transition text-left"
                    >
                      <span className="mt-0.5 text-[#4B80EB]">
                        {confirmDeleteCheck2 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-neutral-300" />}
                      </span>
                      <p className="text-[14px] font-bold text-neutral-700 leading-relaxed">
                        한번 삭제된 자산과 사용자 활동 데이터 기록 등은 절대 복구할 수 없음을 이해하고 동의합니다
                      </p>
                    </button>

                    {accountType !== "social" && (
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-neutral-500">비밀번호 확인</label>
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 focus:border-neutral-400 rounded-[16px] text-base outline-none transition"
                          placeholder="본인 확인을 위해 비밀번호를 입력해 주세요"
                        />
                      </div>
                    )}

                    {deleteError && (
                      <p className="text-[12px] font-bold text-red-500 pl-1">❌ {deleteError}</p>
                    )}

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => setDeleteStep(2)}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-4 rounded-[16px] transition cursor-pointer"
                      >
                        이전
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await api.delete("/users/me", {
                              data: { password: accountType === "social" ? undefined : deletePassword },
                            });
                            triggerNotification("회원 탈퇴 요청이 정상 접수되었습니다. 이용해주셔서 감사합니다.");
                            closeSheet();
                            window.dispatchEvent(new Event("auth-change"));
                            navigate("/");
                          } catch (error: any) {
                            setDeleteError(error.response?.data?.message ?? "탈퇴에 실패했습니다.");
                          }
                        }}
                        disabled={!confirmDeleteCheck1 || !confirmDeleteCheck2 || (accountType !== "social" && !deletePassword)}
                        className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold py-4 rounded-[16px] transition-colors cursor-pointer"
                      >
                        탈퇴하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full text-text-primary animate-in fade-in duration-300 select-none pb-20 relative">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 text-white px-5 py-3 rounded-[16px] text-xs font-bold shadow-[0_8px_24px_rgba(0,0,0,0.2)] z-50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Info className="w-4 h-4 text-sky-400" />
          <span>{showNotification}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-[680px] mx-auto px-4">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between py-4 mb-4">
          <Link 
            to="/mypage" 
            className="flex items-center gap-1 font-bold text-neutral-500 hover:text-neutral-800 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </Link>
          <h1 className="text-lg font-black text-neutral-900 absolute left-1/2 -translate-x-1/2">설정</h1>
          <div className="w-16" /> {/* spacer */}
        </div>

        {/* SECTION 1: 프로필 */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-neutral-400 mb-2 px-1">프로필</div>
          <div className="bg-white rounded-[24px] p-2 border border-border-color">
            {/* ROW 1: 프로필 편집 */}
            <div 
              onClick={() => {
                setTempNickname(nickname);
                setActiveSheet("profile_edit");
              }}
              className="flex items-center justify-between p-4 rounded-[18px] hover:bg-neutral-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-3.5">
                <img
                  src={profilePic}
                  alt="Profile Avatar"
                  className="w-12 h-12 rounded-full object-cover border border-neutral-100"
                />
                <div>
                  <div className="text-base font-bold text-neutral-800">{nickname}</div>
                  <div className="text-[12px] font-medium text-neutral-400 mt-0.5">{email}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>
          </div>
        </div>

        {/* SECTION: 프로필 공개 설정 */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-neutral-400 mb-2 px-1">프로필 공개 설정</div>
          <p className="text-[11px] text-neutral-400 px-1 mb-2">다른 사용자에게 내 프로필의 어떤 정보를 보여줄지 설정할 수 있어요</p>
          <div className="bg-white rounded-[24px] p-2 border border-border-color divide-y divide-[#E5E5EA]/70">
            {[
              { key: "showReturnRate" as const, icon: "📈", label: "수익률", desc: "내 프로필의 누적 수익률" },
              { key: "showPortfolio" as const, icon: "🥧", label: "포트폴리오", desc: "보유 종목 구성" },
              { key: "showTrades" as const, icon: "📋", label: "거래내역", desc: "최근 매수·매도 기록" },
              { key: "showStats" as const, icon: "📊", label: "투자 통계", desc: "승률 등 투자 지표" },
              { key: "showCompetitions" as const, icon: "🏆", label: "대회 이력", desc: "참가한 대회와 순위" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <span className="text-[15px] font-bold text-neutral-800 flex items-center gap-1.5">
                      {item.label}
                      {item.key !== "showCompetitions" && (
                        <span className="text-[9px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">준비중</span>
                      )}
                    </span>
                    <span className="text-[11px] font-medium text-neutral-400 mt-0.5">{item.desc}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleSetting(item.key)}
                  className={`w-12 h-7 rounded-full p-1 transition-all duration-300 outline-none flex items-center ${profileSettings[item.key] ? 'bg-[#4B80EB] justify-end' : 'bg-neutral-200 justify-start'}`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: 알림 설정 */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-neutral-400 mb-2 px-1">알림 설정</div>
          <div className="bg-white rounded-[24px] p-2 border border-border-color divide-y divide-[#E5E5EA]/70">
            
            {/* ROW 1 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">📈</span>
                <div>
                  <span className="text-[15px] font-bold text-neutral-800 block">주식 체결 알림</span>
                  <span className="text-[11px] font-medium text-neutral-400 mt-0.5">매수·매도 체결 시 알림</span>
                </div>
              </div>
              <button 
                onClick={() => setNotifTrade(!notifTrade)}
                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 outline-none flex items-center ${notifTrade ? 'bg-[#4B80EB] justify-end' : 'bg-neutral-200 justify-start'}`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* ROW 2 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">💬</span>
                <div>
                  <span className="text-[15px] font-bold text-neutral-800 block">댓글 알림</span>
                  <span className="text-[11px] font-medium text-neutral-400 mt-0.5">내 게시글에 댓글이 달리면</span>
                </div>
              </div>
              <button 
                onClick={() => setNotifComment(!notifComment)}
                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 outline-none flex items-center ${notifComment ? 'bg-[#4B80EB] justify-end' : 'bg-neutral-200 justify-start'}`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* ROW 3 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">🏆</span>
                <div>
                  <span className="text-[15px] font-bold text-neutral-800 block">투자 대회 알림</span>
                  <span className="text-[11px] font-medium text-neutral-400 mt-0.5">대회 시작·종료·결과 알림</span>
                </div>
              </div>
              <button 
                onClick={() => setNotifCompetition(!notifCompetition)}
                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 outline-none flex items-center ${notifCompetition ? 'bg-[#4B80EB] justify-end' : 'bg-neutral-200 justify-start'}`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* ROW 4 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">🔔</span>
                <div>
                  <span className="text-[15px] font-bold text-neutral-800 block">관심종목 가격 알림</span>
                  <span className="text-[11px] font-medium text-neutral-400 mt-0.5">목표가 도달 시 알림</span>
                </div>
              </div>
              <button 
                onClick={() => setNotifPrice(!notifPrice)}
                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 outline-none flex items-center ${notifPrice ? 'bg-[#4B80EB] justify-end' : 'bg-neutral-200 justify-start'}`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* ROW 5 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">📩</span>
                <div>
                  <span className="text-[15px] font-bold text-neutral-800 block">문의 답변 알림</span>
                  <span className="text-[11px] font-medium text-neutral-400 mt-0.5">1:1 문의 답변 완료 시</span>
                </div>
              </div>
              <button 
                onClick={() => setNotifQna(!notifQna)}
                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 outline-none flex items-center ${notifQna ? 'bg-[#4B80EB] justify-end' : 'bg-neutral-200 justify-start'}`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

            {/* ROW 6 */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 text-left">
                <span className="text-xl">📢</span>
                <div>
                  <span className="text-[15px] font-bold text-neutral-800 block">마케팅·이벤트 알림</span>
                  <span className="text-[11px] font-medium text-neutral-400 mt-0.5">혜택, 이벤트 소식 알림</span>
                </div>
              </div>
              <button 
                onClick={() => setNotifMarketing(!notifMarketing)}
                className={`w-12 h-7 rounded-full p-1 transition-all duration-300 outline-none flex items-center ${notifMarketing ? 'bg-[#4B80EB] justify-end' : 'bg-neutral-200 justify-start'}`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
              </button>
            </div>

          </div>
        </div>

        {/* SECTION 4: 투자 설정 */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-neutral-400 mb-2 px-1">투자 설정</div>
          <div className="bg-white rounded-[24px] p-2 border border-border-color space-y-2">

            {/* ROW 2 — 모의투자 자금 초기화 */}
            <div
              onClick={() => setActiveSheet("reset_confirm")}
              className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition text-left"
            >
              <div>
                <span className="text-[15px] font-bold text-neutral-800 block">모의투자 자금 초기화</span>
                <span className="text-[11px] font-medium text-red-500 mt-0.5 font-bold">보유 주식·예수금 전체 초기화</span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

            {/* ROW 3 — 계좌 연동 관리 */}
            <div
              onClick={() => navigate(accountLinked ? "/account-link/recharge/confirm" : "/account-link/intro")}
              className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition text-left"
            >
              <div>
                <span className="text-[15px] font-bold text-neutral-800 block">계좌 연동 관리</span>
                <span className="text-[11px] font-bold text-neutral-400 mt-0.5">
                  {accountLinked ? "연동됨" : "미연동"}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

          </div>
        </div>

        {/* SECTION 5: 고객지원 */}
        <div className="mb-6">
          <div className="text-[13px] font-bold text-neutral-400 mb-2 px-1">고객지원</div>
          <div className="bg-white rounded-[24px] p-2 border border-border-color space-y-2">

            <div onClick={() => navigate("/inquiry")} className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition">
              <span className="text-[15px] font-bold text-neutral-800">1:1 문의</span>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

            <div onClick={() => navigate("/faq")} className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition">
              <span className="text-[15px] font-bold text-neutral-800">자주 묻는 질문</span>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

            <div onClick={() => navigate("/notice")} className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition">
              <span className="text-[15px] font-bold text-neutral-800">공지사항</span>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

            <div onClick={() => navigate("/terms")} className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition">
              <span className="text-[15px] font-bold text-neutral-800">서비스 이용약관</span>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

            <div onClick={() => navigate("/privacy")} className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition">
              <span className="text-[15px] font-bold text-neutral-800">개인정보 처리방침</span>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

            <div className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color">
              <span className="text-[15px] font-bold text-neutral-800">버전 정보</span>
              <span className="text-sm font-bold text-neutral-400 font-mono">v1.0.0</span>
            </div>

          </div>
        </div>

        {/* SECTION 6: 계정 관리 */}
        <div className="mb-10">
          <div className="text-[13px] font-bold text-neutral-400 mb-2 px-1">계정 관리</div>
          <div className="bg-white rounded-[24px] p-2 border border-border-color space-y-2">

            {/* 비밀번호 변경 */}
            <div
              onClick={() => setActiveSheet("password_change")}
              className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition"
            >
              <span className="text-[15px] font-bold text-neutral-800">비밀번호 변경</span>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

            {/* 회원 탈퇴 */}
            <div
              onClick={() => {
                setDeleteStep(1);
                setActiveSheet("account_delete");
              }}
              className="flex items-center justify-between p-4.5 rounded-[18px] border border-border-color hover:bg-neutral-50 cursor-pointer transition"
            >
              <div>
                <span className="text-[15px] font-bold text-neutral-800 block">회원 탈퇴</span>
                <span className="text-[11px] font-medium text-neutral-400 mt-1 block">계정과 모든 데이터가 완전히 삭제됩니다</span>
              </div>
              <ChevronRight className="w-5 h-5 text-neutral-300" />
            </div>

          </div>
        </div>

      </div>

      {/* Render Sheet Wrapper */}
      {renderBottomSheet()}

    </div>
  );
}
