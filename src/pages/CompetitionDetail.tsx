import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trophy, ChevronDown } from "lucide-react";
import { cn, formatPrice, formatPercent } from "@/src/lib/utils";
import api from "@/src/lib/api";

export function CompetitionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const compId = Number(id);

  const [activeTab, setActiveTab] = useState("랭킹");
  const [toastMsg, setToastMsg] = useState("");
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2000);
  };

  const [competitions] = useState<any[]>(() => {
    const saved = localStorage.getItem("competitions_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 1, title: "제1회 제로리스크 대학생 실전 투자 대회", startDate: "2026-07-01", endDate: "2026-07-31", seedMoney: 50000000, initialAmount: 50000000, participants: 1542, maxParticipants: 3000, status: "ONGOING", isOpen: true, isOfficial: true, target: "전체", dday: "D-15" },
      { id: 2, title: "대학생 모의투자 챔피언십", startDate: "2026-12-01", endDate: "2026-12-31", seedMoney: 5000000, initialAmount: 5000000, participants: 850, maxParticipants: 1000, status: "WAITING", isOpen: true, isOfficial: false, target: "전체", hasPassword: true, password: "123456", dday: "D-5" },
      { id: 3, title: "제1회 우주항공 테마 단타대회", startDate: "2026-10-01", endDate: "2026-10-15", seedMoney: 10000000, initialAmount: 10000000, participants: 3200, maxParticipants: 5000, status: "FINISHED", isOpen: true, isOfficial: true, target: "우주항공 테마주", dday: "종료" },
      { id: 4, title: "삼성전자 수익률 대결", startDate: "2026-11-10", endDate: "2026-11-20", seedMoney: 5000000, initialAmount: 5000000, participants: 500, maxParticipants: 500, status: "ONGOING", isOpen: true, isOfficial: false, target: "삼성전자", dday: "D-3" }
    ];
  });

  const comp = competitions.find(c => c.id === compId) || {
    id: 1,
    title: "제1회 제로리스크 대학생 실전 투자 대회",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    seedMoney: 50000000,
    initialAmount: 50000000,
    participants: 1542,
    maxParticipants: 3000,
    status: "ONGOING",
    isOpen: true,
    isOfficial: true,
    target: "전체",
    dday: "D-15"
  };

  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const checkJoinStatus = async () => {
      try {
        const response = await api.get(`/competitions/${compId}/join-status`);
        setIsJoined(response.data.joined);
      } catch {
        setIsJoined(false);
      }
    };
    checkJoinStatus();
  }, [compId]);

  const handleJoin = async () => {
    try {
      await api.post(`/competitions/${compId}/join`);
      setIsJoined(true);
      const isOngoing = comp.status === "ONGOING" || comp.status === "진행중";
      showToast(isOngoing ? "🏆 대회 참가가 완료되었습니다!" : "🏆 대회 참가 신청이 완료되었습니다!");
    } catch (error: any) {
      const message = error.response?.data?.message ?? "대회 참가에 실패했습니다.";
      showToast(`⚠️ ${message}`);
    }
  };

  const isOngoing = comp.status === "ONGOING" || comp.status === "진행중";
  const isScheduled = comp.status === "WAITING" || comp.status === "예정";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center py-1 bg-transparent">
        <Link
          to="/competitions"
          className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로
        </Link>
        {isJoined ? null : (isOngoing || isScheduled) ? (
          <Button
            onClick={handleJoin}
            className="bg-brand text-white hover:bg-brand/90 transition cursor-pointer font-bold px-6 rounded-lg"
          >
            {isOngoing ? "대회 참가하기" : "대회 참가 신청"}
          </Button>
        ) : null}
      </div>

      <div className="bg-surface border border-border-color rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="bg-gradient-to-r from-brand to-[#007AFF] p-8 text-white relative">
          <div className="flex gap-2 items-center mb-1.5 flex-wrap">
            {comp.isOfficial && (
              <Badge className="bg-white text-brand border-transparent font-black">
                공식
              </Badge>
            )}
            <Badge className="bg-[#FF9500] text-white border-transparent">
              {comp.status === "ONGOING" || comp.status === "진행중" ? "진행중" : comp.status === "WAITING" || comp.status === "예정" ? "예정" : "종료"}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {comp.title}
          </h1>
          <p className="opacity-90 text-[14px]">
            {comp.description || "가장 높은 수익률을 기록하고 대회 1위에 도전하세요!"}
          </p>

          <div className="mt-8 flex gap-8 flex-wrap">
            <div>
              <span className="text-xs opacity-80 block mb-1">대회 기간</span>
              <span className="font-semibold">{comp.startDate} ~ {comp.endDate}</span>
            </div>
            <div>
              <span className="text-xs opacity-80 block mb-1">초기 투자금</span>
              <span className="font-semibold">{formatPrice(comp.initialAmount || comp.seedMoney)}원</span>
            </div>
            <div>
              <span className="text-xs opacity-80 block mb-1">
                대회 종목
              </span>
              <span className="font-semibold text-white">
                {comp.target || "전체"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card>
            <div className="flex px-6 pt-4 border-b border-border-color mb-4 shrink-0">
              {["랭킹", "채팅"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-3 font-bold border-b-2 transition-colors",
                    activeTab === tab
                      ? "border-brand text-brand"
                      : "border-transparent text-text-secondary hover:text-text-primary",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
            <CardContent className="p-0">
              {activeTab === "랭킹" && (
                <div>
                  <div className="px-6 py-4 bg-brand/5 border-l-[3px] border-l-brand flex justify-between items-center border-b border-border-color">
                    <div className="flex items-center gap-4">
                      <div className="font-bold w-12 text-brand">45위</div>
                      <div className="font-bold">나 (제로주린이)</div>
                    </div>
                    <div className="font-bold text-lg text-down">-12.40%</div>
                  </div>
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <div
                      key={rank}
                      className="flex justify-between items-center p-4 px-6 border-b border-border-color hover:bg-bg-main transition-colors last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="font-bold w-12 text-text-secondary">
                          {rank}위
                        </div>
                        <div className="font-bold">투자고수{rank}</div>
                      </div>
                      <div className="font-bold text-lg text-up">
                        +{Math.abs(100 - rank * 15).toFixed(2)}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "채팅" && (
                <div className="p-6 text-center text-text-secondary py-12">
                  <p>채팅 기능은 준비중입니다.</p>
                  <p className="text-sm mt-2">
                    곧 실시간 채팅으로 다른 참가자들과 소통할 수 있습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-4">내 참가 정보</h3>
              {isJoined ? (
                <div className="space-y-4">
                  <div className="bg-bg-main p-4 rounded-[16px] flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-secondary">
                      현재 순위
                    </span>
                    <span className="font-bold text-xl text-brand tracking-tight">
                      45위{" "}
                      <span className="text-sm text-text-secondary">
                        / 1,542명
                      </span>
                    </span>
                  </div>
                  <div className="bg-bg-main p-4 rounded-[16px] flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-secondary">
                      수익률
                    </span>
                    <span className="font-bold text-xl text-down">-12.40%</span>
                  </div>
                  <Link to="/stocks">
                    <Button className="w-full mt-2">대회 계좌로 거래하기</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    아직 대회에 참가하지 않았습니다.<br />
                    참가 시 실시간 랭킹 정보와 전용 모의투자 계좌가 개설됩니다.
                  </p>
                  <Button onClick={handleJoin} className="w-full cursor-pointer">
                    대회 참가하기
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-[#1C1C1E] text-white py-2.5 px-4 rounded-[12px] shadow-lg text-sm font-semibold z-[9999] animate-in fade-in slide-in-from-bottom-2 duration-300">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
