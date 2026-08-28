import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/shared/components/ui/Card";
import { Button } from "@/src/shared/components/ui/Button";
import { Badge } from "@/src/shared/components/ui/Badge";
import { Input } from "@/src/shared/components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import { cn, formatPrice } from "@/src/shared/lib/utils";
import { Search } from "lucide-react";
import api from "@/src/shared/lib/api";

export function Competitions() {
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  const [competitions, setCompetitions] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await api.get("/competitions", { params: { page: 0, size: 100 } });
        setCompetitions(response.data.content.map((c: any) => ({
          id: c.id,
          title: c.title,
          startDate: c.startAt?.slice(0, 10),
          endDate: c.endAt?.slice(0, 10),
          seedMoney: c.seedMoney,
          participants: c.participantCount,
          status: c.status,
        })));
      } catch {
        setCompetitions([]);
      }
    };
    fetchCompetitions();
  }, []);

  useEffect(() => {
    const fetchJoined = async () => {
      try {
        const response = await api.get("/competitions/my");
        setJoinedIds(response.data.competitionIds);
      } catch {
        setJoinedIds([]);
      }
    };
    fetchJoined();
  }, []);

  useEffect(() => {
    // Check for post-creation toast message from CompetitionCreate page
    const toast = sessionStorage.getItem("show_created_toast");
    if (toast) {
      showToast(toast);
      sessionStorage.removeItem("show_created_toast");
    }
  }, []);


  const handleParticipate = async (comp: any) => {
    if (joinedIds.includes(comp.id)) return;
    try {
      await api.post(`/competitions/${comp.id}/join`);
      setJoinedIds([...joinedIds, comp.id]);
      showToast(`🏆 [${comp.title}] 대회 참가가 완료되었습니다!`);
      setTimeout(() => { navigate(`/competitions/${comp.id}`); }, 700);
    } catch (error: any) {
      showToast(`⚠️ ${error.response?.data?.message ?? "대회 참가에 실패했습니다."}`);
    }
  };

  const availableCount = competitions.filter(
    (c) => c.status !== "ENDED" && c.status !== "CALCULATING" && !joinedIds.includes(c.id)
  ).length;
  const joinedCount = joinedIds.length;
  const totalParticipantsCount = competitions
    .reduce((acc, c) => acc + (c.participants || 0), 0)
    .toLocaleString();

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
            <div className="text-xl font-black text-[#191F28]">총 {joinedCount}회 참여</div>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions
          .filter((c) => {
            const matchesTab =
              activeTab === "전체"
                ? true
                : activeTab === "진행중"
                  ? c.status === "ONGOING"
                  : activeTab === "예정"
                    ? c.status === "SCHEDULED"
                    : c.status === "ENDED" || c.status === "CALCULATING";
            const matchesSearch =
              searchQuery.trim() === ""
                ? true
                : c.title.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
          })
          .map((comp) => (
            <Card key={comp.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start min-h-[24px] mb-[1px]">
                  <div className="flex gap-1.5 items-center">
                    {comp.status === "ONGOING" && (
                      <Badge className="bg-[#FF9500] text-white border-transparent font-bold shrink-0">
                        진행중
                      </Badge>
                    )}
                    {comp.status === "SCHEDULED" && (
                      <Badge className="bg-[#000000] text-white border-transparent font-bold shrink-0">
                        예정
                      </Badge>
                    )}
                    {comp.status === "CALCULATING" && (
                      <Badge className="bg-[#8B95A1] text-white border-transparent font-bold shrink-0">
                        결과 집계중
                      </Badge>
                    )}
                    {comp.status === "ENDED" && (
                      <Badge className="bg-border-color text-text-secondary border-transparent font-bold shrink-0">
                        종료
                      </Badge>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1.5 line-clamp-2 min-h-[56px] flex items-start pt-[2px] gap-1.5 mt-0">
                  {comp.title}
                </h3>

                <div className="flex flex-col gap-2 mb-6 text-sm">
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
                      {formatPrice(comp.seedMoney)}원
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-text-secondary w-[110px] shrink-0 flex justify-between pr-4">
                      <span>참가자</span>
                      <span className="text-gray-300">|</span>
                    </span>
                    <span className="font-bold text-text-primary tabular-nums">
                      {comp.participants.toLocaleString()}명 참가
                    </span>
                  </div>
                </div>

                {comp.status === "ENDED" || comp.status === "CALCULATING" || (comp.status === "ONGOING" && !joinedIds.includes(comp.id)) ? (
                  <Link to={`/competitions/${comp.id}`} className="block w-full">
                    <Button variant="outline" className="w-full relative">
                      상세보기
                    </Button>
                  </Link>
                ) : joinedIds.includes(comp.id) ? (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Link to={`/competitions/${comp.id}`} className="w-full">
                      <Button variant="outline" className="w-full relative font-bold">
                        상세보기
                      </Button>
                    </Link>
                    <Button
                      disabled
                      className="w-full bg-[#F2F2F7] text-[#8E8E93] border border-[#E5E5EA] cursor-not-allowed font-extrabold disabled:opacity-100 shadow-none hover:bg-[#F2F2F7]"
                    >
                      참가 완료
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Link to={`/competitions/${comp.id}`} className="w-full">
                      <Button variant="outline" className="w-full relative font-bold">
                        상세보기
                      </Button>
                    </Link>
                    <Button
                      className="w-full font-bold bg-brand text-white hover:bg-brand/90 transition"
                      onClick={() => handleParticipate(comp)}
                    >
                      참가 신청
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#1C1C1E] text-white py-2.5 px-4 rounded-[12px] shadow-lg text-sm font-semibold z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
