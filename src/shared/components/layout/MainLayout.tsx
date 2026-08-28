import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Wallet, X } from "lucide-react";
import { cn, formatPrice } from "@/src/shared/lib/utils";
import { DEFAULT_PROFILE_IMAGE } from "@/src/shared/lib/constants";
import api from "@/src/shared/lib/api";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAlertSettings,
  updateAlertSettings,
  NotificationResponse,
  AlertSettingsResponse,
} from "@/src/features/notification/api/notifications";

const NAV_ITEMS = [
  { label: "홈", path: "/" },
  { label: "주식", path: "/stocks" },
  { label: "포트폴리오", path: "/portfolio" },
  { label: "대회", path: "/competitions" },
  { label: "랭킹", path: "/ranking" },
  { label: "커뮤니티", path: "/community" },
  { label: "마이페이지", path: "/mypage" },
];

const ALERT_SETTING_LABELS: { key: keyof AlertSettingsResponse; label: string; description: string }[] = [
  { key: 'orderFilled', label: '주문 체결', description: '보유 종목 매수/매도 체결 시 알림' },
  { key: 'commentAdded', label: '댓글', description: '내 게시글에 댓글이 달렸을 때 알림' },
  { key: 'competition', label: '대회', description: '참가 중인 투자 대회 관련 알림' },
  { key: 'priceAlert', label: '목표가', description: '관심 종목 목표가 도달 시 알림' },
  { key: 'inquiryAnswered', label: '문의 답변', description: '등록한 문의에 답변이 달렸을 때 알림' },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "stock",
    title: "삼성전자 체결 알림",
    content: "삼성전자 10주 매수가 체결되었습니다.",
    time: "방금 전",
    isRead: false,
  },
  {
    id: 2,
    type: "comment",
    title: "새로운 댓글",
    content:
      "회원님의 '투자 전략 질문있습니다' 게시물에 새로운 댓글이 달렸습니다.",
    time: "10분 전",
    isRead: false,
  },
  {
    id: 3,
    type: "post",
    title: "인기 게시물",
    content: "회원님이 작성한 게시물이 실시간 인기글에 등록되었습니다.",
    time: "1시간 전",
    isRead: true,
  },
  {
    id: 4,
    type: "stock",
    title: "지정가 도달",
    content: "설정하신 SK하이닉스 150,000원 이하 조건에 도달했습니다.",
    time: "2시간 전",
    isRead: true,
  },
  {
    id: 5,
    type: "system",
    title: "수익률 랭킹 변동",
    content: "이번 주 누적 랭킹이 토너먼트 상위 10%에 진입했습니다!",
    time: "어제",
    isRead: true,
  },
];

const MOCK_ACCOUNTS = [
  { id: "main", name: "웹 메인 계좌", balance: 50000000 },
  { id: "comp1", name: "제1회 제로리스크 대회", balance: 12500000 },
  { id: "comp2", name: "대학생 투자 챔피언십", balance: 5200000 },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAccountAlert, setShowAccountAlert] = useState(true);
  const [showCompAlert, setShowCompAlert] = useState(true);
  const [showRankAlert, setShowRankAlert] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeAccount, setActiveAccount] = useState({ id: "main", name: "웹 메인 계좌", balance: 0 });
  const [userProfile, setUserProfile] = useState<{ nickname: string; profileImageUrl: string | null }>({ nickname: "", profileImageUrl: null });

  const fetchMainAccountBalance = async () => {
    try {
      const response = await api.get("/accounts");
      const basicAccount = response.data.find((acc: any) => acc.accountType === "BASIC");
      if (basicAccount) {
        setActiveAccount({ id: "main", name: "웹 메인 계좌", balance: basicAccount.balance });
      }
    } catch {
      setActiveAccount({ id: "main", name: "웹 메인 계좌", balance: 0 });
    }
  };

  const checkLoginStatus = async () => {
    try {
      const response = await api.get("/users/me");
      console.log("users/me 성공:", response.status, response.data);
      setIsLoggedIn(true);
      const admin = response.data.userRole === "ADMIN";
      setIsAdmin(admin);
      setUserProfile({ nickname: response.data.nickname, profileImageUrl: response.data.profileImageUrl });
      await fetchMainAccountBalance();

      if (!admin && !response.data.hasClaimedPracticeCredit) {
        let accountLinked = true;
        try {
          await api.get("/openbanking/auths");
        } catch {
          accountLinked = false;
        }
        if (!accountLinked) {
          navigate("/start", { replace: true });
        }
      }
    } catch (error) {
      console.log("users/me 실패:", error);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setActiveAccount({ id: "main", name: "웹 메인 계좌", balance: 0 });
    }
  };

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const isNotificationOpenRef = useRef(isNotificationOpen);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.content);
    } catch (error) {
      console.error('알림 목록 조회 실패', error);
    }
  };

  const handleNotificationOpen = () => {
    const next = !isNotificationOpen;
    setIsNotificationOpen(next);
    if (next) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('전체 읽음 처리 실패', error);
    }
  };

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettingsResponse | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const openSettingsModal = async () => {
    setIsNotificationOpen(false);
    setIsSettingsModalOpen(true);
    setSettingsLoading(true);
    try {
      const settings = await getAlertSettings();
      setAlertSettings(settings);
    } catch (error) {
      console.error('알림 설정 조회 실패', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const toggleAlertSetting = async (key: keyof AlertSettingsResponse) => {
    if (!alertSettings) return;

    const updated = { ...alertSettings, [key]: !alertSettings[key] };
    setAlertSettings(updated);

    try {
      await updateAlertSettings(updated);
    } catch (error) {
      console.error('알림 설정 변경 실패', error);
      setAlertSettings(alertSettings);
    }
  };

  // 알림 시간 표시용: 백엔드 createdAt(ISO 문자열)을 "N분 전" 형식으로 변환
  const formatNotificationTime = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
    return `${Math.floor(diffMinutes / 1440)}일 전`;
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("auth-change", checkLoginStatus);
    return () => {
      window.removeEventListener("auth-change", checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    isNotificationOpenRef.current = isNotificationOpen;
  }, [isNotificationOpen]);

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
    const sseBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, '');
    const eventSource = new EventSource(`${sseBaseUrl}/sse/subscribe`, { withCredentials: true });

    eventSource.addEventListener('notification', () => {
      // 새 알림이 오면, 드롭다운이 열려있을 때만 목록을 다시 불러와 최신화.
      // ref로 최신값을 읽어서 stale closure 방지 (deps에 넣으면 매번 재연결되므로 이 방식 사용)
      if (isNotificationOpenRef.current) {
        loadNotifications();
      }
    });

    eventSource.onerror = () => {
      // 연결 끊김은 브라우저가 자동 재연결을 시도하므로 별도 처리는 하지 않음
      console.warn('SSE 연결 오류 발생, 자동 재연결 대기 중');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-bg-main">
      {/* GNB */}
      <header className="sticky top-0 z-50 w-full bg-surface border-b border-border-color shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex h-20 items-center justify-between px-6 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link
            to="/"
            className="text-text-primary font-bold text-xl tracking-tight flex items-center gap-1.5"
          >
            <span className="text-2xl leading-none">🌀</span>
            제로리스크
          </Link>

          {/* Nav Menu */}
          <nav className="flex space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base font-bold h-20 flex items-center px-1 transition-colors",
                  location.pathname === item.path ||
                    (item.path !== "/" &&
                      location.pathname.startsWith(item.path))
                    ? "text-text-primary"
                    : "text-[#636C7D] hover:text-text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          {!isLoggedIn ? (
            <div className="flex items-center space-x-2 translate-y-[2px]">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-[15px] font-bold text-[#4E5968] hover:text-[#191F28] hover:bg-[#F2F4F6] rounded-[10px] transition-all"
              >
                로그인
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-[15px] font-bold bg-brand text-white hover:bg-[#3B4CD5] rounded-[10px] transition-all shadow-xs"
              >
                회원가입
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-5 translate-y-[2px]">
              {/* Account Selector */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="flex items-center gap-2.5 hover:bg-bg-main px-4 py-2.5 rounded-[14px] transition-colors border border-border-color shadow-xs"
                >
                  <div className="flex flex-col items-start min-w-[100px]">
                    <span className="text-[11px] font-bold text-text-secondary leading-tight truncate max-w-[140px]">
                      {activeAccount.name}
                    </span>
                    <span className="text-[15px] font-extrabold leading-tight text-text-primary">
                      {formatPrice(activeAccount.balance)}원
                    </span>
                  </div>
                  <ChevronDown className="w-[18px] h-[18px] text-text-secondary" />
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border-color rounded-[12px] shadow-md py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 text-xs font-bold text-text-secondary border-b border-border-color mb-1">
                      계좌 선택
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {MOCK_ACCOUNTS.map((acc) => (
                        <button
                          key={acc.id}
                          onClick={() => {
                            setActiveAccount(acc);
                            setIsAccountMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 hover:bg-bg-main transition-colors flex flex-col gap-1",
                            activeAccount.id === acc.id ? "bg-brand/5" : "",
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                activeAccount.id === acc.id
                                  ? "text-brand"
                                  : "text-text-primary",
                              )}
                            >
                              {acc.name}
                            </span>
                            {activeAccount.id === acc.id && (
                              <span className="w-2 h-2 rounded-full bg-brand" />
                            )}
                          </div>
                          <span className="text-xs text-text-secondary font-medium">
                            보유 자산 {formatPrice(acc.balance)}원
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={handleNotificationOpen}
                  className="relative p-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-main rounded-[12px] transition-colors"
                >
                  <Bell className="w-5.5 h-5.5" />
                  {notifications.some((n) => !n.isRead) && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5 rounded-full bg-up"></span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[360px] bg-surface border border-border-color rounded-[16px] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3 text-sm font-bold text-text-primary border-b border-border-color flex justify-between items-center">
                      <span>알림</span>
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-text-secondary hover:text-brand transition-colors font-medium"
                      >
                        모두 읽음 처리
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-sm text-text-secondary py-8">알림이 없습니다.</p>
                      ) : (
                        notifications.map((noti) => (
                          <div
                            key={noti.id}
                            onClick={() => !noti.isRead && handleMarkAsRead(noti.id)}
                            className={cn(
                              "px-5 py-4 border-b border-border-color last:border-0 hover:bg-bg-main transition-colors cursor-pointer",
                              !noti.isRead ? "bg-brand/5" : "",
                            )}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                                {!noti.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                                )}
                                {noti.title}
                              </span>
                              <span className="text-xs text-text-secondary whitespace-nowrap">
                                {formatNotificationTime(noti.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                              {noti.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-3 py-2 border-t border-border-color mt-1">
                      <button
                        onClick={openSettingsModal}
                        className="w-full py-2 text-sm text-text-secondary font-medium hover:bg-bg-main rounded-[8px] transition-colors"
                      >
                        알림 설정
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isSettingsModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                  <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-border-color flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-text-primary">알림 설정</h3>
                      <button
                        onClick={() => setIsSettingsModalOpen(false)}
                        className="w-8 h-8 rounded-full bg-bg-main hover:bg-border-color flex items-center justify-center transition cursor-pointer text-text-secondary hover:text-text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {settingsLoading || !alertSettings ? (
                      <p className="text-center text-sm text-text-secondary py-8">불러오는 중...</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {ALERT_SETTING_LABELS.map(({ key, label, description }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 py-3 border-b border-border-color last:border-0"
                          >
                            <div>
                              <p className="text-sm font-bold text-text-primary">{label}</p>
                              <p className="text-xs text-text-secondary mt-0.5">{description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={alertSettings[key]}
                                onChange={() => toggleAlertSetting(key)}
                              />
                              <div className="w-11 h-6 bg-border-color peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="relative" ref={userMenuRef}>
                <div
                  className="flex items-center space-x-2.5 cursor-pointer p-2 pr-4 rounded-[16px] hover:bg-bg-main transition-colors border border-transparent hover:border-border-color"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <img
                    src={userProfile.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                    alt="profile"
                    className="w-9 h-9 rounded-full object-cover border border-border-color"
                  />
                  <span className="text-[14.5px] font-bold">{userProfile.nickname}</span>
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                </div>

                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-border-color rounded-[12px] shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/mypage"
                      className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-main font-medium"
                    >
                      마이페이지
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-brand hover:bg-bg-main font-bold"
                      >
                        관리자 페이지
                      </Link>
                    )}
                    <div className="h-px bg-border-color my-1"></div>
                    <button
                      onClick={async () => {
                        await api.post("/auth/logout");
                        window.dispatchEvent(new Event("auth-change"));
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-main font-medium transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Dismissible Alerts Area - absolutely positioned so it overlaps/layers over the main content instead of pushing it down */}
      {(showAccountAlert || showCompAlert || showRankAlert) && (
        <div className="absolute top-[80px] left-0 right-0 z-30 py-3 px-6 select-none pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="max-w-7xl mx-auto flex flex-col items-end gap-3 pointer-events-auto w-full md:max-w-[600px] md:ml-auto">
            {showAccountAlert && (
              <div
                onClick={() => navigate("/mypage")}
                className="w-full bg-white rounded-[20px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors border border-slate-100 hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full">💳</div>
                  <div className="text-[15px] font-bold text-slate-800">
                    실제 계좌를 연동하면 그만큼 시드머니가 지급돼요
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/account-link/intro");
                    }}
                    className="text-[14px] font-bold text-[#4B80EB] bg-blue-50 px-4 py-2 rounded-[10px] hover:bg-blue-100 transition-colors"
                  >
                    연동하기
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAccountAlert(false);
                      localStorage.setItem("dismiss_account_link_banner", "true");
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {showCompAlert && (
              <div
                onClick={() => navigate("/competitions")}
                className="w-full bg-white rounded-[20px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors border border-slate-100 hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-yellow-50 w-10 h-10 flex items-center justify-center rounded-full">🏆</div>
                  <div>
                    <div className="text-[15px] font-bold text-slate-800">[제2회 단타 마스터] 진행 중</div>
                    <div className="text-[13px] font-medium text-slate-500 mt-0.5">현재 내 순위: 12위 / 45명</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/competitions");
                    }}
                    className="text-[14px] font-bold text-slate-800 bg-gray-100 px-4 py-2 rounded-[10px] hover:bg-gray-200 transition-colors"
                  >
                    대회 보기
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCompAlert(false);
                      localStorage.setItem("dismiss_competition_banner", "true");
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {showRankAlert && (
              <div
                onClick={() => navigate("/ranking")}
                className="w-full bg-white rounded-[20px] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center justify-between group cursor-pointer hover:bg-gray-50 transition-colors border border-slate-100 hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl bg-amber-50 w-10 h-10 flex items-center justify-center rounded-full">👑</div>
                  <div>
                    <div className="text-[15px] font-bold text-slate-800">지금 1위는 +47.3% 수익 중</div>
                    <div className="text-[13px] font-medium text-slate-500 mt-0.5">실시간 투자 고수들의 포트폴리오를 구경해보세요</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/ranking");
                    }}
                    className="text-[14px] font-bold text-up bg-[#F2F4F6]/60 px-4 py-2 rounded-[10px] hover:bg-[#F2F4F6] transition-colors"
                  >
                    랭킹 보기
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRankAlert(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 w-full",
          location.pathname === "/" || location.pathname === "/about"
            ? ""
            : cn(
              "mx-auto px-6 py-8",
              location.pathname.startsWith("/stocks") &&
                !location.pathname.includes("/compare")
                ? "max-w-[1800px]"
                : "max-w-7xl"
            )
        )}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#f9fafb] border-t border-border-color mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* COL 1: Logo & Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[#191F28] font-black text-lg tracking-tight">
                <span className="text-2xl leading-none">🌀</span>
                <span>제로리스크</span>
              </div>
              <div className="space-y-1">
                <p className="text-[13px] font-bold text-[#4E5968]">모의주식투자 플랫폼</p>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  리스크 없이 가능한 실전 투자
                </p>
              </div>
            </div>

            {/* COL 2: Service Links */}
            <div className="flex flex-col space-y-2">
              <span className="font-extrabold text-[#191F28] text-sm mb-3 select-none">서비스</span>
              <Link
                to="/about"
                className="text-xs sm:text-sm text-[#4E5968] hover:text-brand font-bold transition-all"
              >
                서비스 소개
              </Link>
              <Link
                to="/competitions/guide"
                className="text-xs sm:text-sm text-[#4E5968] hover:text-brand font-bold transition-all"
              >
                대회 안내
              </Link>
            </div>

            {/* COL 3: Support Links */}
            <div className="flex flex-col space-y-2">
              <span className="font-extrabold text-[#191F28] text-sm mb-3 select-none">고객지원</span>
              <Link
                to="/notice"
                className="text-xs sm:text-sm text-[#4E5968] hover:text-brand font-bold transition-all"
              >
                공지사항
              </Link>
              <Link
                to="/faq"
                className="text-xs sm:text-sm text-[#4E5968] hover:text-brand font-bold transition-all"
              >
                자주 묻는 질문
              </Link>
              <Link
                to="/inquiry"
                className="text-xs sm:text-sm text-[#4E5968] hover:text-brand font-bold transition-all"
              >
                1:1 문의하기
              </Link>
            </div>

            {/* COL 4: Policy Links */}
            <div className="flex flex-col space-y-2">
              <span className="font-extrabold text-[#191F28] text-sm mb-3 select-none">정책</span>
              <Link
                to="/terms"
                className="text-xs sm:text-sm text-[#4E5968] hover:text-brand font-bold transition-all"
              >
                이용약관
              </Link>
              <Link
                to="/privacy"
                className="text-xs sm:text-sm text-[#4E5968] hover:text-brand font-bold transition-all"
              >
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
