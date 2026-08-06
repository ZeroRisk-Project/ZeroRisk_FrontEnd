import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Badge } from "@/src/components/ui/Badge";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Plus, X, Search, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/src/lib/utils";
import api from "@/src/lib/api";

export function CompetitionCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await api.get("/users/me");
        if (response.data.userRole !== "ADMIN") {
          navigate("/competitions");
        }
      } catch {
        navigate("/competitions");
      }
    };
    checkAdmin();
  }, [navigate]);


  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateStr(new Date());

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

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
    
    // Previous month padding days
    const prevMonthDays = [];
    const tempDate = new Date(currentYear, currentMonth, 0);
    const prevMonthLastDate = tempDate.getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      prevMonthDays.unshift({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    const currentMonthDays = [];
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding days
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
    if (dateStr < todayStr) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate("");
    } else {
      if (dateStr >= startDate) {
        setEndDate(dateStr);
      } else {
        setStartDate(dateStr);
        setEndDate("");
      }
    }
  };

  const handleDayMouseEnter = (dateStr: string) => {
    if (dateStr < todayStr) return;
    if (startDate && !endDate && dateStr >= startDate) {
      setHoveredDate(dateStr);
    }
  };

  const setPreset = (days: number) => {
    const today = new Date();
    const startStr = formatDateStr(today);
    const end = new Date();
    end.setDate(today.getDate() + days - 1);
    const endStr = formatDateStr(end);
    setStartDate(startStr);
    setEndDate(endStr);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setHoveredDate(null);
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
  const [initialAmount, setInitialAmount] = useState("1000");
  const [maxParticipants, setMaxParticipants] = useState("");

  const [stockSearch, setStockSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ id: number; code: string; name: string }[]>([]);
  const [allowedStocks, setAllowedStocks] = useState<{ id: number; name: string; code: string }[]>([]);

  useEffect(() => {
    if (stockSearch.trim() === "") {
      setSearchResults([]);
      return;
    }
    const fetchResults = async () => {
      try {
        const response = await api.get("/stocks/search", { params: { keyword: stockSearch } });
        setSearchResults(response.data.content);
      } catch {
        setSearchResults([]);
      }
    };
    fetchResults();
  }, [stockSearch]);

  const filteredStocks = searchResults.filter(
    (stock) => !allowedStocks.find((s) => s.id === stock.id),
  );

  const handleStockSelect = (stock: { id: number; name: string; code: string }) => {
    setAllowedStocks([...allowedStocks, stock]);
    setStockSearch("");
    setIsSearchFocused(false);
  };

  const removeStock = (id: number) => {
    setAllowedStocks(allowedStocks.filter((s) => s.id !== id));
  };

  const [createError, setCreateError] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) {
      alert("대회 이름을 입력해주세요.");
      return;
    }
    if (!startDate || !endDate) {
      alert("대회 기간(시작일과 종료일)을 지정해주세요.");
      return;
    }

    try {
      await api.post("/admin/competitions", {
        title,
        description,
        startAt: `${startDate}T00:00:00`,
        endAt: `${endDate}T23:59:59`,
        seedMoney: (parseInt(initialAmount) || 1000) * 10000,
        isPublic: true,
        allowedStockIds: allowedStocks.map((s) => s.id),
        maxParticipants: maxParticipants.trim() === "" ? null : parseInt(maxParticipants),
      });

      sessionStorage.setItem("show_created_toast", `🏆 [ ${title} ] 대회가 성공적으로 개최되었습니다.`);
      navigate("/competitions");
    } catch (error: any) {
      setCreateError(error.response?.data?.message ?? "대회 생성에 실패했습니다.");
    }
  };

  return (
    <div className="max-w-[480px] mx-auto space-y-6 animate-in fade-in duration-500">
      <Link
        to="/competitions"
        className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> 목록으로
      </Link>

      <Card>
        <CardContent className="p-6 space-y-8">


          <div className="space-y-8">
            <div className="flex flex-col gap-4">
              <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                대회 이름
              </label>
              <Input
                className="w-full bg-bg-main border-border-color focus-visible:ring-brand font-bold text-[15px] h-11 px-4 placeholder:text-text-secondary"
                placeholder="대회 이름을 입력하세요."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                대회 설명
              </label>
              <textarea
                className="w-full min-h-[95px] bg-bg-main border border-border-color rounded-[12px] p-3.5 focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-semibold placeholder:text-text-secondary text-[15px] resize-none leading-relaxed"
                placeholder="대회에 대한 간략한 설명을 입력하세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-5 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col gap-2">
                  <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                    거래 가능 종목 한정
                  </label>
                  <span className="text-xs font-semibold text-text-secondary">
                    특정 종목 지정 (선택)
                  </span>
                </div>
                <div className="relative w-full sm:w-[220px] shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#636C7D]" />
                  <Input
                    className="w-full bg-bg-main border-border-color focus-visible:ring-brand font-bold text-[14px] placeholder:text-text-secondary pl-9 h-9.5"
                    placeholder="종목명 또는 코드 검색"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsSearchFocused(false), 200)
                    }
                  />

                  {isSearchFocused && stockSearch.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border-color rounded-[12px] shadow-lg max-h-[200px] overflow-y-auto z-50">
                      {filteredStocks.length > 0 ? (
                        <ul className="py-2">
                          {filteredStocks.map((stock) => (
                            <li
                              key={stock.id}
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
              <div className="flex flex-wrap gap-2 pt-1.5 min-h-[44px] items-center">
                {allowedStocks.length === 0 ? (
                  <Badge
                    variant="secondary"
                    className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-full border border-border-color/40 bg-[#F8F9FA] text-text-primary font-bold text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none"
                  >
                    <span className="leading-none">전체 (모든 종목)</span>
                  </Badge>
                ) : (
                  allowedStocks.map((stock) => (
                    <Badge
                      key={stock.id}
                      variant="secondary"
                      className="h-[34px] px-3.5 flex items-center gap-1.5 rounded-full border border-border-color/40 bg-[#F8F9FA] hover:bg-[#E9ECEF] transition-colors text-[13px] text-text-primary font-bold shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      <span className="leading-none">{stock.name}</span>
                      <button
                        onClick={() => removeStock(stock.id)}
                        className="text-text-secondary hover:text-red-500 transition-colors flex items-center justify-center p-0.5 rounded-full hover:bg-border-color/20 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                  대회 기간 (시작일 ~ 종료일)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPreset(7)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border-color bg-surface hover:bg-bg-main transition duration-155 text-text-secondary cursor-pointer"
                  >
                    1주일
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset(14)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border-color bg-surface hover:bg-bg-main transition duration-155 text-text-secondary cursor-pointer"
                  >
                    2주일
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreset(30)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-border-color bg-surface hover:bg-bg-main transition duration-155 text-text-secondary cursor-pointer"
                  >
                    1달 (30일)
                  </button>
                </div>
              </div>

              {/* Premium Calendar Container */}
              <div className="border border-border-color rounded-[16px] bg-white p-4.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                {/* 달력 안 상단 기간 정보 표시 */}
                {startDate && endDate && (
                  <div className="mb-4 p-3 rounded-[12px] bg-brand/5 border border-brand/10 text-center animate-in fade-in duration-200">
                    <span className="text-[13.5px] font-bold text-brand flex items-center justify-center gap-1.5">
                      <Calendar className="w-4 h-4 text-brand shrink-0" />
                      <span>
                        <span className="font-extrabold underline underline-offset-2 decoration-brand/30">{formatKoreanDate(startDate)}</span> 부터{" "}
                        <span className="font-extrabold underline underline-offset-2 decoration-brand/30">{formatKoreanDate(endDate)}</span> 까지{" "}
                        <span className="px-1.5 py-0.5 rounded bg-brand text-white text-[11.5px] font-black">{getDurationDays(startDate, endDate)}일간</span>
                      </span>
                    </span>
                  </div>
                )}

                {/* Month/Year Navigation */}
                <div className="flex items-center justify-between mb-4 px-1.5">
                  <span className="text-[14.5px] font-bold text-text-primary tracking-tight">
                    {currentYear}년 {currentMonth + 1}월
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={prevMonth}
                      className="p-1.5 rounded-lg border border-border-color hover:bg-bg-main text-text-secondary transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={nextMonth}
                      className="p-1.5 rounded-lg border border-border-color hover:bg-bg-main text-text-secondary transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day names headers */}
                <div className="grid grid-cols-7 text-center text-[12px] font-extrabold text-text-secondary/60 mb-2">
                  <div className="text-red-500/70">일</div>
                  <div>월</div>
                  <div>화</div>
                  <div>수</div>
                  <div>목</div>
                  <div>금</div>
                  <div className="text-blue-500/70">토</div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 relative" onMouseLeave={() => setHoveredDate(null)}>
                  {getCalendarDays().map(({ date, isCurrentMonth }, idx) => {
                    const dateStr = formatDateStr(date);
                    const isToday = dateStr === todayStr;
                    const isPast = dateStr < todayStr;
                    
                    const isStart = dateStr === startDate;
                    const isEnd = dateStr === endDate;
                    const hasEnd = !!endDate;
                    
                    let isRange = false;
                    let isHoverEnd = false;

                    if (hasEnd) {
                      isRange = dateStr > startDate && dateStr < endDate;
                    } else if (startDate && hoveredDate && hoveredDate > startDate) {
                      isRange = dateStr > startDate && dateStr < hoveredDate;
                      isHoverEnd = dateStr === hoveredDate;
                    }

                    const isAlone = !endDate && (!hoveredDate || hoveredDate <= startDate);

                    return (
                      <button
                        key={`${dateStr}-${idx}`}
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDayClick(dateStr)}
                        onMouseEnter={() => handleDayMouseEnter(dateStr)}
                        className={cn(
                          "h-9.5 w-full flex items-center justify-center relative text-[13px] font-bold transition-all duration-150 select-none rounded-md hover:z-20",
                          isPast ? "text-text-secondary/15 cursor-not-allowed" : "cursor-pointer",
                          !isPast && !isCurrentMonth ? "text-text-secondary/25" : "",
                          !isPast && isCurrentMonth ? "text-text-primary" : ""
                        )}
                      >
                        {/* Range highlights */}
                        {isRange && (
                          <div className="absolute inset-y-1 left-0 right-0 bg-brand/10" />
                        )}
                        {isStart && (
                          <>
                            {!isAlone && (
                              <div className="absolute inset-y-1 left-1/2 right-0 bg-brand/10" />
                            )}
                            <div className="absolute w-8 h-8 rounded-full bg-brand shadow-sm shadow-brand/20 animate-in zoom-in-75 duration-200" />
                          </>
                        )}
                        {isEnd && (
                          <>
                            <div className="absolute inset-y-1 left-0 right-1/2 bg-brand/10" />
                            <div className="absolute w-8 h-8 rounded-full bg-brand shadow-sm shadow-brand/20 animate-in zoom-in-75 duration-200" />
                          </>
                        )}
                        {isHoverEnd && (
                          <>
                            <div className="absolute inset-y-1 left-0 right-1/2 bg-brand/10" />
                            <div className="absolute w-8 h-8 rounded-full bg-brand/70 shadow-sm shadow-brand/10" />
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

            <div className="flex flex-col gap-4">
              <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                참가자 초기 투자금
              </label>
              <div className="relative">
                <select
                  className="w-full bg-bg-main border border-border-color rounded-[12px] px-3.5 h-[44px] focus:outline-none focus:ring-1.5 focus:ring-brand focus:border-brand font-bold text-[15px] text-text-primary cursor-pointer appearance-none"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                >
                  <option value="100">100 만원</option>
                  <option value="500">500 만원</option>
                  <option value="1000">1,000 만원</option>
                  <option value="5000">5,000 만원</option>
                  <option value="10000">1 억원</option>
                  <option value="50000">5 억원</option>
                  <option value="100000">10 억원</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs font-semibold text-text-secondary">
                대회 시작 시 생성될 초기 자본
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-[15px] font-extrabold text-text-primary tracking-tight">
                최대 참가자 수 (선택)
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="비워두면 무제한"
                className="w-full border-b-2 border-neutral-200 py-2 text-lg font-bold outline-none focus:border-[#3182F6]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-5 border-t border-border-color">
            {createError && <p className="text-sm text-down text-center">{createError}</p>}
            <Button className="w-full h-12 text-[15px] font-black rounded-[14px]" onClick={handleCreate}>
              개최하기
            </Button>
            <Link to="/competitions" className="w-full text-center py-1">
              <span className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors">
                취소하고 돌아가기
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
