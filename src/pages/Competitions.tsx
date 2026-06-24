import React, { useState } from "react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Input } from "@/src/components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import { cn, formatPrice } from "@/src/lib/utils";
import { Users, Trophy, Lock, X, Search, Plus, ChevronLeft, ChevronRight, Calendar, Globe } from "lucide-react";

export function Competitions() {
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const [joinedIds, setJoinedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem("joined_competitions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [1];
      }
    }
    return [1]; // 기본값: 1번 대회는 참가 중 상태
  });

  const [competitions, setCompetitions] = useState<any[]>(() => {
    const saved = localStorage.getItem("competitions_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const defaults = [
      { id: 1, title: "제1회 제로리스크 대학생 실전 투자 대회", startDate: "2026-07-01", endDate: "2026-07-31", seedMoney: 50000000, initialAmount: 50000000, participants: 1542, maxParticipants: 3000, status: "ONGOING", isOpen: true, isOfficial: true, target: "전체", dday: "D-15" },
      { id: 2, title: "대학생 모의투자 챔피언십", startDate: "2026-12-01", endDate: "2026-12-31", seedMoney: 5000000, initialAmount: 5000000, participants: 850, maxParticipants: 1000, status: "WAITING", isOpen: true, isOfficial: false, target: "전체", hasPassword: true, password: "123456", dday: "D-5" },
      { id: 3, title: "제1회 우주항공 테마 단타대회", startDate: "2026-10-01", endDate: "2026-10-15", seedMoney: 10000000, initialAmount: 10000000, participants: 3200, maxParticipants: 5000, status: "FINISHED", isOpen: true, isOfficial: true, target: "우주항공 테마주", dday: "종료" },
      { id: 4, title: "삼성전자 수익률 대결", startDate: "2026-11-10", endDate: "2026-11-20", seedMoney: 5000000, initialAmount: 5000000, participants: 500, maxParticipants: 500, status: "ONGOING", isOpen: true, isOfficial: false, target: "삼성전자", dday: "D-3" }
    ];
    localStorage.setItem("competitions_list", JSON.stringify(defaults));
    return defaults;
  });

  const saveJoinedIds = (newIds: number[]) => {
    setJoinedIds(newIds);
    localStorage.setItem("joined_competitions", JSON.stringify(newIds));
  };

  React.useEffect(() => {
    // Sync latest competitions list from localStorage on mount
    const saved = localStorage.getItem("competitions_list");
    if (saved) {
      try {
        setCompetitions(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    // Check for post-creation toast message from CompetitionCreate page
    const toast = sessionStorage.getItem("show_created_toast");
    if (toast) {
      showToast(toast);
      sessionStorage.removeItem("show_created_toast");
    }
  }, []);

  const [newCompModal, setNewCompModal] = useState(false);
  const [newCompTitle, setNewCompTitle] = useState("");
  const [newCompDescription, setNewCompDescription] = useState("");
  const [newCompStartDate, setNewCompStartDate] = useState("");
  const [newCompEndDate, setNewCompEndDate] = useState("");
  const [newCompInitialAmount, setNewCompInitialAmount] = useState("1000");
  const [newCompMaxParticipants, setNewCompMaxParticipants] = useState("1000");
  const [newCompIsSecret, setNewCompIsSecret] = useState(false);
  const [newCompPassword, setNewCompPassword] = useState("");
  const [newCompIsOfficial, setNewCompIsOfficial] = useState(false);

  // Calendar States for Comp creation
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Stock Search / Restriction States for Comp creation
  const [stockSearch, setStockSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allowedStocks, setAllowedStocks] = useState<{ name: string; code: string }[]>([]);

  const STOCKS_DATA = [
    { code: "005930", name: "삼성전자" },
    { code: "000660", name: "SK하이닉스" },
    { code: "373220", name: "LG에너지솔루션" },
    { code: "207940", name: "삼성바이오로직스" },
    { code: "005380", name: "현대차" },
    { code: "000270", name: "기아" },
    { code: "035420", name: "NAVER" },
    { code: "035720", name: "카카오" },
  ];

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatKoreanDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`;
  };

  const getDurationDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getCalendarDays = () => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const prevMonthDays = [];
    const tempDate = new Date(currentYear, currentMonth, 0);
    const prevMonthLastDate = tempDate.getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDays.unshift({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }
    const currentMonthDays = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }
    const totalSlots = prevMonthDays.length + currentMonthDays.length;
    const remainingSlots = (7 - (totalSlots % 7)) % 7;
    const nextMonthDays = [];
    for (let i = 1; i <= remainingSlots; i++) {
      nextMonthDays.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handleDayClick = (dateStr: string) => {
    const todayStr = formatDateStr(new Date());
    if (dateStr < todayStr) return;
    if (!newCompStartDate || (newCompStartDate && newCompEndDate)) {
      setNewCompStartDate(dateStr);
      setNewCompEndDate("");
    } else {
      if (dateStr >= newCompStartDate) {
        setNewCompEndDate(dateStr);
      } else {
        setNewCompStartDate(dateStr);
        setNewCompEndDate("");
      }
    }
  };

  const handleDayMouseEnter = (dateStr: string) => {
    const todayStr = formatDateStr(new Date());
    if (dateStr < todayStr) return;
    if (newCompStartDate && !newCompEndDate && dateStr >= newCompStartDate) {
      setHoveredDate(dateStr);
    }
  };

  const setPreset = (days: number) => {
    const today = new Date();
    const startStr = formatDateStr(today);
    const end = new Date();
    end.setDate(today.getDate() + days - 1);
    const endStr = formatDateStr(end);
    setNewCompStartDate(startStr);
    setNewCompEndDate(endStr);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleStockSelect = (stock: { name: string; code: string }) => {
    setAllowedStocks([...allowedStocks, stock]);
    setStockSearch("");
    setIsSearchFocused(false);
  };

  const removeStock = (code: string) => {
    setAllowedStocks(allowedStocks.filter((s) => s.code !== code));
  };

  const handleParticipate = (comp: any) => {
    if (joinedIds.includes(comp.id)) return;

    if (comp.hasPassword) {
      setSelectedComp({ ...comp, actionType: "participate" });
      setPassword("");
      setError("");
    } else {
      const nextIds = [...joinedIds, comp.id];
      saveJoinedIds(nextIds);
      showToast(`🏆 [${comp.title}] 대회 참가가 완료되었습니다!`);
      const updatedComps = competitions.map(c => {
        if (c.id === comp.id) {
          return { ...c, participants: (c.participants || 0) + 1 };
        }
        return c;
      });
      setCompetitions(updatedComps);
      localStorage.setItem("competitions_list", JSON.stringify(updatedComps));
      setTimeout(() => {
        navigate(`/competitions/${comp.id}`);
      }, 700);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === selectedComp.password) {
      if (selectedComp.actionType === "participate") {
        const nextIds = [...joinedIds, selectedComp.id];
        saveJoinedIds(nextIds);
        showToast(`🏆 [${selectedComp.title}] 대회 참가가 완료되었습니다!`);
        const updatedComps = competitions.map(c => {
          if (c.id === selectedComp.id) {
            return { ...c, participants: (c.participants || 0) + 1 };
          }
          return c;
        });
        setCompetitions(updatedComps);
        localStorage.setItem("competitions_list", JSON.stringify(updatedComps));
        setTimeout(() => {
          navigate(`/competitions/${selectedComp.id}`);
        }, 700);
      } else {
        navigate(`/competitions/${selectedComp.id}`);
      }
      setSelectedComp(null);
      setPassword("");
      setError("");
    } else {
      setError("비밀번호가 일치하지 않습니다.");
    }
  };

  const availableCount = competitions.filter(
    (c) => c.status !== "FINISHED" && c.status !== "종료" && !joinedIds.includes(c.id)
  ).length;
  const joinedCount = joinedIds.length;
  const totalParticipantsCount = (
    competitions.reduce((acc, c) => acc + (c.participants || 0), 0) + 2200
  ).toLocaleString();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 relative">
      {/* Toast message overlay */}
      {toastMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#191F28] text-white font-bold px-6 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <span>🏆</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Banner Section (Unwrapped) */}
      <div className="space-y-3 py-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191F28] tracking-tight leading-tight">
          모의 투자자들과 겨뤄보는<br />실전 투자 랭킹 리그
        </h2>
        <p className="text-[#4E5968] text-sm sm:text-base font-medium max-w-[550px] leading-relaxed">
          분리된 전용 계좌로 공평한 시드에서 시작하여 최고의 주식 투자 수익률에 도전해 보세요.
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#F2F4F6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl font-bold">📈</div>
          <div>
            <div className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-wider mb-0.5">참가 가능한 대회</div>
            <div className="text-xl font-black text-[#191F28]">{availableCount}개 리그</div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-[#F2F4F6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center text-xl font-bold">🎖️</div>
          <div>
            <div className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-wider mb-0.5">나의 참여 도전</div>
            <div className="text-xl font-black text-[#191F28]">{joinedCount}개 참가 중</div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-[#F2F4F6] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xl font-bold">👥</div>
          <div>
            <div className="text-[12px] font-bold text-[#8B95A1] uppercase tracking-wider mb-0.5">누적 총 참가자</div>
            <div className="text-xl font-black text-[#191F28]">{totalParticipantsCount}명 활성</div>
          </div>
        </div>
      </div>

      {/* Filters & Search bar */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-border-color pb-2 gap-4 pt-4">
        <div className="flex gap-6">
          {["전체", "진행중", "예정", "종료"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-lg font-bold pb-2 transition-colors border-b-2 relative top-[9px]",
                activeTab === tab
                  ? "border-brand text-brand"
                  : "border-transparent text-text-secondary hover:text-text-primary",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
            <Input
              placeholder="대회명 검색"
              className="w-full sm:w-[200px] pl-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => {
              navigate("/competitions/create");
            }}
            className="shrink-0 rounded-[16px] px-6 bg-brand text-white border-transparent hover:bg-brand/90 cursor-pointer font-bold"
          >
            대회 만들기
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions
          .filter((c) => {
            const matchesTab =
              activeTab === "전체"
                ? true
                : activeTab === "진행중"
                  ? (c.status === "ONGOING" || c.status === "진행중")
                  : activeTab === "예정"
                    ? (c.status === "WAITING" || c.status === "예정")
                    : (c.status === "FINISHED" || c.status === "종료");
            const matchesSearch =
              searchQuery.trim() === ""
                ? true
                : c.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
          })
          .sort((a, b) => {
            if (a.isOfficial && !b.isOfficial) return -1;
            if (!a.isOfficial && b.isOfficial) return 1;
            return 0;
          })
          .map((comp) => (
            <Card key={comp.id} className={cn(comp.isOfficial && "border-brand border-[2px]")}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start min-h-[24px] mb-[1px]">
                  <div className="flex gap-1.5 items-center">
                    {comp.isOfficial && (
                      <Badge className="bg-brand text-white border-transparent font-black shrink-0">
                        공식
                      </Badge>
                    )}
                    {((comp.status === "ONGOING" || comp.status === "진행중") && joinedIds.includes(comp.id)) && (
                      <Badge className="bg-[#FF9500] text-white border-transparent font-bold shrink-0">
                        진행중
                      </Badge>
                    )}
                    {(comp.status === "WAITING" || comp.status === "예정") && (
                      <Badge className="bg-[#000000] text-white border-transparent font-bold shrink-0">
                        예정
                      </Badge>
                    )}
                    {(comp.status === "FINISHED" || comp.status === "종료") && (
                      <Badge className="bg-border-color text-text-secondary border-transparent font-bold shrink-0">
                        종료
                      </Badge>
                    )}
                  </div>

                  {comp.dday && comp.dday.startsWith("D-") && (
                    <Badge className="bg-up text-white border-transparent font-black shrink-0">
                      {comp.dday}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-1.5 line-clamp-2 min-h-[56px] flex items-start pt-[2px] gap-1.5 mt-0">
                  {comp.hasPassword && (
                    <Lock className="w-4 h-4 text-text-secondary shrink-0 mt-1" />
                  )}
                  {comp.title}
                </h3>

                <div className="flex flex-col gap-2 mb-6 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-text-secondary w-[110px] shrink-0 flex justify-between pr-4">
                      <span>종목</span>
                      <span className="text-gray-300">|</span>
                    </span>
                    <span className="font-bold text-text-primary">
                      {comp.target || "전체"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-text-secondary w-[110px] shrink-0 flex justify-between pr-4">
                      <span>기간</span>
                      <span className="text-gray-300">|</span>
                    </span>
                    <span className="font-bold text-text-primary tabular-nums">
                      {comp.startDate} ~ {comp.endDate}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-text-secondary w-[110px] shrink-0 flex justify-between pr-4">
                      <span>시작 시드머니</span>
                      <span className="text-gray-300">|</span>
                    </span>
                    <span className="font-bold text-text-primary tabular-nums">
                      {formatPrice(comp.initialAmount || comp.seedMoney)}원
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-text-secondary w-[110px] shrink-0 flex justify-between pr-4">
                      <span>참가자</span>
                      <span className="text-gray-300">|</span>
                    </span>
                    <span className="font-bold text-text-primary tabular-nums">
                      {comp.participants.toLocaleString()}명 /{" "}
                      {comp.maxParticipants && comp.maxParticipants !== "무제한" && comp.maxParticipants !== "제한 없음" && comp.maxParticipants !== 0 ? (
                        <span>{comp.maxParticipants.toLocaleString()}명</span>
                      ) : (
                        <span className="text-[#8E8E93] font-normal text-[13px]">제한 없음</span>
                      )}
                    </span>
                  </div>
                </div>

                {(comp.status === "FINISHED" || comp.status === "종료") ? (
                  <Link to={`/competitions/${comp.id}`} className="block w-full">
                    <Button variant="outline" className="w-full relative">
                      상세보기
                    </Button>
                  </Link>
                ) : joinedIds.includes(comp.id) ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {comp.hasPassword ? (
                      <Button
                        variant="outline"
                        className="w-full relative font-bold"
                        onClick={() => {
                          setSelectedComp({ ...comp, actionType: "view" });
                          setPassword("");
                          setError("");
                        }}
                      >
                        상세보기
                      </Button>
                    ) : (
                      <Link to={`/competitions/${comp.id}`} className="w-full">
                        <Button variant="outline" className="w-full relative font-bold">
                          상세보기
                        </Button>
                      </Link>
                    )}
                    <Button
                      disabled
                      className="w-full bg-[#F2F2F7] text-[#8E8E93] border border-[#E5E5EA] cursor-not-allowed font-extrabold disabled:opacity-100 shadow-none hover:bg-[#F2F2F7]"
                    >
                      참가 완료
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {comp.hasPassword ? (
                      <Button
                        variant="outline"
                        className="w-full relative font-bold"
                        onClick={() => {
                          setSelectedComp({ ...comp, actionType: "view" });
                          setPassword("");
                          setError("");
                        }}
                      >
                        상세보기
                      </Button>
                    ) : (
                      <Link to={`/competitions/${comp.id}`} className="w-full">
                        <Button variant="outline" className="w-full relative font-bold">
                          상세보기
                        </Button>
                      </Link>
                    )}
                    <Button
                      className="w-full font-bold bg-brand text-white hover:bg-brand/90 transition"
                      onClick={() => handleParticipate(comp)}
                    >
                      {(comp.status === "WAITING" || comp.status === "예정") ? "참가 신청" : "참가하기"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {selectedComp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">비밀번호 입력</h3>
                <button
                  onClick={() => setSelectedComp(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-text-secondary mb-4">
                이 대회는 비밀번호가 필요합니다.
              </p>
              <div className="space-y-4">
                <Input
                  type="password"
                  placeholder="비밀번호(6자리 숫자)"
                  value={password}
                  maxLength={6}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^[0-9]+$/.test(val)) {
                      setPassword(val.slice(0, 6));
                      setError("");
                    }
                  }}
                  className="w-full"
                />
                {error && <p className="text-sm text-down">{error}</p>}
                <Button className="w-full" onClick={handlePasswordSubmit}>
                  확인
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#1C1C1E] text-white py-2.5 px-4 rounded-[12px] shadow-lg text-sm font-semibold z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toastMsg}
        </div>
      )}

      {/* NEW COMPETITION MODAL (새 대회 기획 등록 모달) */}
      {newCompModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-border-color rounded-[20px] w-full max-w-[500px] p-6 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setNewCompModal(false)}
              className="absolute top-5 right-5 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer z-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pb-1">
              <h2 className="text-[20px] font-bold text-text-primary">새로운 모의투자 대회 만들기</h2>
              <p className="text-[13px] text-text-secondary leading-relaxed">대회를 생성하고 참가자들과 함께 주식 랭킹 대결을 진행합니다.</p>
            </div>

            <div className="space-y-6">
              {/* 대회 명칭 */}
              <div className="flex flex-col gap-3">
                <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                  대회 이름
                </label>
                <input
                  className="w-full bg-bg-main border border-border-color rounded-[12px] font-bold text-[15px] h-11 px-4 placeholder:text-text-secondary focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand transition"
                  placeholder="대회 이름을 입력하세요."
                  value={newCompTitle}
                  onChange={(e) => setNewCompTitle(e.target.value)}
                />
              </div>

              {/* 대회 설명 */}
              <div className="flex flex-col gap-3">
                <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                  대회 설명
                </label>
                <textarea
                  className="w-full min-h-[95px] bg-bg-main border border-border-color rounded-[12px] p-3.5 focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-semibold placeholder:text-text-secondary text-[15px] resize-none leading-relaxed transition"
                  placeholder="대회에 대한 간략한 설명을 입력하세요."
                  value={newCompDescription}
                  onChange={(e) => setNewCompDescription(e.target.value)}
                />
              </div>

              {/* 거래 한정 주종 선택 */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                      거래 가능 종목 한정
                    </label>
                    <span className="text-xs font-semibold text-text-secondary">
                      특정 종목 지정 (선택)
                    </span>
                  </div>
                  <div className="relative w-full sm:w-[220px] shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
                    <input
                      className="w-full bg-bg-main border border-border-color rounded-[12px] font-bold text-[14px] placeholder:text-text-secondary pl-9 pr-3 h-10 focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand transition"
                      placeholder="종목명 또는 코드 검색"
                      value={stockSearch}
                      onChange={(e) => setStockSearch(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() =>
                        setTimeout(() => setIsSearchFocused(false), 205)
                      }
                    />

                    {isSearchFocused && stockSearch.trim().length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-color rounded-[12px] shadow-lg max-h-[170px] overflow-y-auto z-50 animate-in fade-in duration-100">
                        {STOCKS_DATA.filter(
                          (stock) =>
                            (stock.name.includes(stockSearch) || stock.code.includes(stockSearch)) &&
                            !allowedStocks.find((s) => s.code === stock.code)
                        ).length > 0 ? (
                          <ul className="py-2">
                            {STOCKS_DATA.filter(
                              (stock) =>
                                (stock.name.includes(stockSearch) || stock.code.includes(stockSearch)) &&
                                !allowedStocks.find((s) => s.code === stock.code)
                            ).map((stock) => (
                              <li
                                key={stock.code}
                                className="px-4 py-2.5 hover:bg-bg-main cursor-pointer flex justify-between items-center transition-colors text-sm"
                                onClick={() => handleStockSelect(stock)}
                              >
                                <span className="font-bold text-text-primary">
                                  {stock.name}
                                </span>
                                <span className="text-xs font-semibold text-text-secondary">
                                  {stock.code}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-4 py-3 text-sm text-center text-text-secondary">
                            검색된 종목이 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 칩 영역 */}
                <div className="flex flex-wrap gap-2 pt-1 min-h-[40px] items-center">
                  {allowedStocks.length === 0 ? (
                    <Badge
                      variant="secondary"
                      className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-lg border border-border-color/40 bg-[#F8F9FA] text-text-primary font-bold text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none"
                    >
                      <span className="leading-none">전체 (모든 종목)</span>
                    </Badge>
                  ) : (
                    allowedStocks.map((stock) => (
                      <Badge
                        key={stock.code}
                        variant="secondary"
                        className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-lg border border-border-color/40 bg-[#F8F9FA] hover:bg-[#E9ECEF] transition-colors text-[13px] text-text-primary font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      >
                        <span className="leading-none">{stock.name}</span>
                        <button
                          onClick={() => removeStock(stock.code)}
                          className="text-text-secondary hover:text-red-500 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-border-color/20 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* 대회 기간 (시작일 ~ 종료일) 달력 */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                    대회 기간 (시작일 ~ 종료일)
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPreset(7)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E5E5EA] bg-white hover:bg-bg-main transition text-text-secondary cursor-pointer"
                    >
                      1주일
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreset(14)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E5E5EA] bg-white hover:bg-bg-main transition text-text-secondary cursor-pointer"
                    >
                      2주일
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreset(30)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-[#E5E5EA] bg-white hover:bg-bg-main transition text-text-secondary cursor-pointer"
                    >
                      1달 (30일)
                    </button>
                  </div>
                </div>

                {/* Premium Calendar Container */}
                <div className="border border-border-color rounded-[16px] bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] animate-in fade-in duration-205">
                  {newCompStartDate && newCompEndDate && (
                    <div className="mb-3.5 p-2 rounded-[12px] bg-brand/5 border border-brand/10 text-center animate-in fade-in duration-200">
                      <span className="text-[13px] font-bold text-brand flex items-center justify-center gap-1.5">
                        <Calendar className="w-4 h-4 text-brand shrink-0" />
                        <span>
                          <span className="font-extrabold underline underline-offset-2 decoration-brand/30">{formatKoreanDate(newCompStartDate)}</span> 부터{" "}
                          <span className="font-extrabold underline underline-offset-2 decoration-brand/30">{formatKoreanDate(newCompEndDate)}</span> 까지{" "}
                          <span className="px-1.5 py-0.5 rounded bg-brand text-white text-[11px] font-black">{getDurationDays(newCompStartDate, newCompEndDate)}일간</span>
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mb-3.5 px-1">
                    <span className="text-[14px] font-bold text-text-primary tracking-tight">
                      {currentYear}년 {currentMonth + 1}월
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1 rounded-lg border border-border-color hover:bg-bg-main text-text-secondary transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1 rounded-lg border border-border-color hover:bg-bg-main text-text-secondary transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Grid header */}
                  <div className="grid grid-cols-7 text-center text-[11.5px] font-extrabold text-text-secondary/60 mb-1.5">
                    <div className="text-red-500/70">일</div>
                    <div>월</div>
                    <div>화</div>
                    <div>수</div>
                    <div>목</div>
                    <div>금</div>
                    <div className="text-blue-500/70">토</div>
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-y-1 relative cursor-pointer" onMouseLeave={() => setHoveredDate(null)}>
                    {getCalendarDays().map(({ date, isCurrentMonth }, idx) => {
                      const dateStr = formatDateStr(date);
                      const todayStr = formatDateStr(new Date());
                      const isPast = dateStr < todayStr;
                      
                      const isStart = dateStr === newCompStartDate;
                      const isEnd = dateStr === newCompEndDate;
                      const hasEnd = !!newCompEndDate;
                      
                      let isRange = false;
                      let isHoverEnd = false;

                      if (hasEnd) {
                        isRange = dateStr > newCompStartDate && dateStr < newCompEndDate;
                      } else if (newCompStartDate && hoveredDate && hoveredDate > newCompStartDate) {
                        isRange = dateStr > newCompStartDate && dateStr < hoveredDate;
                        isHoverEnd = dateStr === hoveredDate;
                      }

                      const isAlone = !newCompEndDate && (!hoveredDate || hoveredDate <= newCompStartDate);

                      return (
                        <button
                          key={`${dateStr}-${idx}`}
                          type="button"
                          disabled={isPast}
                          onClick={() => handleDayClick(dateStr)}
                          onMouseEnter={() => handleDayMouseEnter(dateStr)}
                          className={cn(
                            "h-8 w-full flex items-center justify-center relative text-[12.5px] font-bold transition-all duration-155 rounded-md",
                            isPast ? "text-text-secondary/15 cursor-not-allowed" : "cursor-pointer",
                            !isPast && !isCurrentMonth ? "text-text-secondary/25" : "",
                            !isPast && isCurrentMonth ? "text-text-primary" : ""
                          )}
                        >
                          {isRange && (
                            <div className="absolute inset-y-1 left-0 right-0 bg-brand/10" />
                          )}
                          {isStart && (
                            <>
                              {!isAlone && (
                                <div className="absolute inset-y-1 left-1/2 right-0 bg-brand/10" />
                              )}
                              <div className="absolute w-7 h-7 rounded-full bg-brand shadow-sm animate-in zoom-in-75 duration-200" />
                            </>
                          )}
                          {isEnd && (
                            <>
                              <div className="absolute inset-y-1 left-0 right-1/2 bg-brand/10" />
                              <div className="absolute w-7 h-7 rounded-full bg-brand shadow-sm" />
                            </>
                          )}
                          {isHoverEnd && (
                            <>
                              <div className="absolute inset-y-1 left-0 right-1/2 bg-brand/10" />
                              <div className="absolute w-7 h-7 rounded-full bg-brand/70 shadow-sm" />
                            </>
                          )}

                          <span className={cn(
                            "relative z-10",
                            (isStart || isEnd || isHoverEnd) ? "text-white" : "",
                            isRange ? "text-brand font-extrabold" : ""
                          )}>
                            {date.getDate()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 초기 투자금 및 최대 참가자 수 제한 */}
              <div className="grid grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                    참가자 초기 투자금
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-bg-main border border-border-color rounded-[12px] px-3.5 h-[44px] focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-bold text-[14.5px] text-text-primary cursor-pointer appearance-none transition"
                      value={newCompInitialAmount}
                      onChange={(e) => setNewCompInitialAmount(e.target.value)}
                    >
                      <option value="100">100 만원</option>
                      <option value="500">500 만원</option>
                      <option value="1000">1,000 만원</option>
                      <option value="5000">5,000 만원</option>
                      <option value="10000 font-extrabold">1 억원</option>
                      <option value="50000">5 억원</option>
                      <option value="100000">10 억원</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                    최대 참가자 수 제한
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-bg-main border border-border-color rounded-[12px] px-3.5 h-[44px] focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-bold text-[14.5px] text-text-primary cursor-pointer appearance-none transition"
                      value={newCompMaxParticipants}
                      onChange={(e) => setNewCompMaxParticipants(e.target.value)}
                    >
                      <option value="10">10 명</option>
                      <option value="30">30 명</option>
                      <option value="50">50 명</option>
                      <option value="100">100 명</option>
                      <option value="500">500 명</option>
                      <option value="1000">1,000 명</option>
                      <option value="">무제한</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* 공개/비밀 설정 */}
              <div className="flex flex-col gap-3">
                <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                  공개 설정
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setNewCompIsSecret(false)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-[12px] border-2 flex items-center justify-center gap-2 transition-colors cursor-pointer",
                      !newCompIsSecret
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-border-color bg-surface text-text-secondary"
                    )}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-[14.5px] font-extrabold font-sans">공개 대회</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCompIsSecret(true)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-[12px] border-2 flex items-center justify-center gap-2 transition-colors cursor-pointer",
                      newCompIsSecret
                        ? "border-brand bg-brand/5 text-brand"
                        : "border-border-color bg-surface text-text-secondary"
                    )}
                  >
                    <Lock className="w-4 h-4" />
                    <span className="text-[14.5px] font-extrabold font-sans">비밀 대회</span>
                  </button>
                </div>
                {newCompIsSecret && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200 mt-1 relative">
                    <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="입장 비밀번호를 입력해주세요"
                      value={newCompPassword}
                      maxLength={6}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^[0-9]+$/.test(val)) {
                          setNewCompPassword(val.slice(0, 6));
                        }
                      }}
                      className="w-full bg-bg-main border border-border-color rounded-[12px] py-2.5 pl-10 pr-4 text-[14px] font-bold outline-none focus:bg-white focus:border-brand focus:ring-1.5 focus:ring-brand"
                    />
                  </div>
                )}
              </div>

              {/* 공식 대회 지정하기 */}
              <div className="flex items-center justify-between p-3.5 bg-bg-main border border-border-color rounded-[12px]">
                <div>
                  <h4 className="text-[13.5px] font-extrabold text-text-primary">공식 대회 지정하기</h4>
                  <p className="text-[11px] text-[#8E8E93] font-medium leading-relaxed mt-0.5">활성화 시 대회카드 옆에 브랜드 컬러의 공식 인증 마크가 표시됩니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewCompIsOfficial(!newCompIsOfficial)}
                  className={cn(
                    "w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative duration-200",
                    newCompIsOfficial ? "bg-[#4A5DF9]" : "bg-neutral-300"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                    newCompIsOfficial ? "translate-x-4" : "translate-x-0"
                  )} />
                </button>
              </div>
            </div>

            {/* Buttons control footer */}
            <div className="flex gap-2.5 pt-3.5 border-t border-[#E5E5EA]">
              <button
                type="button"
                onClick={() => setNewCompModal(false)}
                className="flex-1 py-3 border border-[#E5E5EA] text-[#8E8E93] hover:text-[#1C1C1E] text-[14px] font-bold rounded-[12px] cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newCompTitle.trim() || !newCompStartDate || !newCompEndDate) {
                    showToast("모든 항목을 올바르게 기입해주십시오.");
                    return;
                  }
                  const startTimestamp = new Date(newCompStartDate).getTime();
                  const endTimestamp = new Date(newCompEndDate).getTime();
                  const currentTimestamp = new Date().getTime();
                  
                  let compStatus: "WAITING" | "ONGOING" | "FINISHED" = "WAITING";
                  if (currentTimestamp >= startTimestamp && currentTimestamp <= endTimestamp) {
                    compStatus = "ONGOING";
                  } else if (currentTimestamp > endTimestamp) {
                    compStatus = "FINISHED";
                  }

                  const createdComp = {
                    id: competitions.length + 1,
                    title: newCompTitle,
                    description: newCompDescription,
                    startDate: newCompStartDate,
                    endDate: newCompEndDate,
                    seedMoney: (parseInt(newCompInitialAmount) || 1000) * 10000,
                    initialAmount: (parseInt(newCompInitialAmount) || 1000) * 10000,
                    participants: 0,
                    maxParticipants: newCompMaxParticipants ? parseInt(newCompMaxParticipants) : "무제한",
                    status: compStatus,
                    isOpen: true,
                    isOfficial: newCompIsOfficial,
                    target: allowedStocks.length > 0 ? allowedStocks.map(s => s.name).join(", ") : "전체",
                    hasPassword: newCompIsSecret,
                    password: newCompPassword,
                    dday: compStatus === "WAITING" ? "D-Day" : compStatus === "ONGOING" ? "진행중" : "종료"
                  };

                  const nextList = [createdComp, ...competitions];
                  setCompetitions(nextList);
                  localStorage.setItem("competitions_list", JSON.stringify(nextList));

                  showToast(`🏆 [ ${newCompTitle} ] 대회가 성공적으로 배포 등록되었습니다.`);
                  setNewCompModal(false);
                }}
                className="flex-1 py-3 bg-[#4A5DF9] text-white hover:bg-[#4A5DF9]/95 text-[14px] font-extrabold rounded-[12px] shadow-sm transition cursor-pointer"
              >
                대회 생성하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
