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

  const [comp, setComp] = useState<any>(null);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await api.get(`/competitions/${compId}`);
        setComp(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCompetition();
  }, [compId]);

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

  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [rankings, setRankings] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyUserId = async () => {
      try {
        const response = await api.get("/users/me");
        setMyUserId(response.data.userId);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMyUserId();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await api.get(`/competitions/${compId}/rankings`);
      setRankings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [compId]);

  const myRanking = rankings.find((r) => r.userId === myUserId);

  const handleJoin = async () => {
    try {
      await api.post(`/competitions/${compId}/join`);
      setIsJoined(true);
      await fetchRankings();
      const isOngoing = comp.status === "ONGOING";
      showToast(isOngoing ? "대회 참가가 완료되었습니다!" : "대회 참가 신청이 완료되었습니다!");
    } catch (error: any) {
      const message = error.response?.data?.message ?? "대회 참가에 실패했습니다.";
      showToast(message);
    }
  };

  const handleCancelParticipation = async () => {
    try {
      await api.delete(`/competitions/${compId}/join`);
      setIsJoined(false);
      await fetchRankings();
      showToast("대회 참가를 취소했습니다.");
    } catch (error: any) {
      const message = error.response?.data?.message ?? "참가 취소에 실패했습니다.";
      showToast(message);
    }
  };

  if (!comp) {
    return <div className="py-20 text-center text-text-secondary text-sm">불러오는 중...</div>;
  }

  const isOngoing = comp.status === "ONGOING";
  const isScheduled = comp.status === "SCHEDULED";
  const isCalculating = comp.status === "CALCULATING";
  const isEnded = comp.status === "ENDED";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center py-1 bg-transparent">
        <Link
          to="/competitions"
          className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로
        </Link>
        {isJoined || isOngoing ? null : isScheduled ? (
          <Button
            onClick={handleJoin}
            className="bg-brand text-white hover:bg-brand/90 transition cursor-pointer font-bold px-6 rounded-lg"
          >
            대회 참가 신청
          </Button>
        ) : null}
      </div>

      <div className="bg-surface border border-border-color rounded-[16px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="bg-gradient-to-r from-brand to-[#007AFF] p-8 text-white relative">
          <div className="flex gap-2 items-center mb-1.5 flex-wrap">
            <Badge className="bg-[#FF9500] text-white border-transparent">
              {comp.status === "ONGOING" ? "진행중" : comp.status === "SCHEDULED" ? "예정" : comp.status === "CALCULATING" ? "결과 집계중" : "종료"}
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
              <span className="font-semibold">{comp.startAt?.slice(0, 10)} ~ {comp.endAt?.slice(0, 10)}</span>
            </div>
            <div>
              <span className="text-xs opacity-80 block mb-1">초기 투자금</span>
              <span className="font-semibold">{formatPrice(comp.seedMoney)}원</span>
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
                  {rankings.length === 0 ? (
                    <div className="p-10 text-center text-text-secondary text-sm">
                      아직 순위 정보가 없습니다.
                    </div>
                  ) : (
                    rankings.map((r, idx) => {
                      const isMe = r.userId === myUserId;
                      const isPositive = Number(r.returnRate) >= 0;
                      const isTied =
                        rankings[idx - 1]?.rank === r.rank ||
                        rankings[idx + 1]?.rank === r.rank;
                      return (
                        <div
                          key={r.userId}
                          className={cn(
                            "flex justify-between items-center p-4 px-6 border-b border-border-color transition-colors last:border-0",
                            isMe ? "bg-brand/5 border-l-[3px] border-l-brand" : "hover:bg-bg-main"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("font-bold flex items-center gap-1.5", isMe ? "text-brand" : "text-text-secondary")}>
                              <span>{r.rank}위</span>
                              {isTied && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#8E8E93]/15 text-[#8E8E93]">
                                  동점
                                </span>
                              )}
                            </div>
                            <div className="font-bold">{isMe ? `나 (${r.nickname})` : r.nickname}</div>
                          </div>
                          <div className={cn("font-bold text-lg", isPositive ? "text-up" : "text-down")}>
                            {formatPercent(r.returnRate)}
                          </div>
                        </div>
                      );
                    })
                  )}
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
                      {myRanking ? `${myRanking.rank}위` : "-"}{" "}
                      <span className="text-sm text-text-secondary">
                        / {rankings.length}명
                      </span>
                    </span>
                  </div>
                  <div className="bg-bg-main p-4 rounded-[16px] flex justify-between items-center">
                    <span className="text-sm font-semibold text-text-secondary">
                      수익률
                    </span>
                    <span className={cn("font-bold text-xl", myRanking && Number(myRanking.returnRate) >= 0 ? "text-up" : "text-down")}>
                      {myRanking ? formatPercent(myRanking.returnRate) : "-"}
                    </span>
                  </div>
                  {isScheduled ? (
                    <Button
                      onClick={handleCancelParticipation}
                      variant="outline"
                      className="w-full mt-2 cursor-pointer"
                    >
                      참가 취소
                    </Button>
                  ) : (
                    !isEnded && !isCalculating && (
                      <Link to="/stocks">
                        <Button className="w-full mt-2">대회 계좌로 거래하기</Button>
                      </Link>
                    )
                  )}
                </div>
              ) : isOngoing ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    이미 시작된 대회는 참가할 수 없습니다.
                  </p>
                </div>
              ) : isCalculating ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    결과를 집계하고 있습니다.
                  </p>
                </div>
              ) : isEnded ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    종료된 대회입니다.
                  </p>
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
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-[#1C1C1E] text-white py-2.5 px-4 rounded-[12px] shadow-lg text-sm font-semibold z-[9999] animate-in fade-in slide-in-from-top-2 duration-300">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
