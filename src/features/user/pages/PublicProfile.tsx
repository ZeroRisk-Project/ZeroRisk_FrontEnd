import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, X, Lock, Info } from "lucide-react";
import { cn, formatPrice } from "@/src/shared/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/shared/components/ui/Card";
import { Button } from "@/src/shared/components/ui/Button";
import { Badge } from "@/src/shared/components/ui/Badge";
import api from "@/src/shared/lib/api";
import { DEFAULT_PROFILE_IMAGE } from "@/src/shared/lib/constants";
import { getFollowers, getFollowings, FollowUserResponse } from "@/src/features/follow/api/follows";
import { useAuth } from "@/src/shared/context/AuthContext";

const COMPETITION_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "예정",
  ONGOING: "진행중",
  CALCULATING: "결과 집계중",
  ENDED: "종료",
};

const formatPeriod = (startAt?: string, endAt?: string) => {
  if (!startAt || !endAt) return "-";
  const fmt = (iso: string) => iso.slice(2, 10).replaceAll("-", ".");
  return `${fmt(startAt)} ~ ${fmt(endAt)}`;
};

// 백엔드가 내려주는 tradedAt(ISO 문자열)을 "N분 전"/"N시간 전"/"N일 전"으로 변환
const formatRelativeTime = (isoString: string) => {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}시간 전`;
  return `${Math.floor(diffMinutes / 1440)}일 전`;
};

// 비공개 설정된 항목 자리에 표시하는 공통 placeholder - UI를 아예 숨기지 않고 상태를 알려준다
const renderPrivateNotice = (label: string) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-text-secondary">
    <Lock className="w-5 h-5" />
    <span className="text-sm font-medium">{label} 비공개로 설정된 항목이에요</span>
  </div>
);

export function PublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: viewer } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  // 팔로워/팔로잉 목록 모달
  const [followModalType, setFollowModalType] = useState<"followers" | "followings" | null>(null);
  const [followModalUsers, setFollowModalUsers] = useState<FollowUserResponse[]>([]);
  const [followModalLoading, setFollowModalLoading] = useState(false);

  // 나와 수익률 비교 모달
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    if (!id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/profiles/${id}`);
        setProfile(response.data);
      } catch (error) {
        console.error(error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleFollowToggle = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await api.delete(`/follows/${profile.userId}`);
      } else {
        await api.post(`/follows/${profile.userId}`);
      }
      // 팔로우 상태와 카운트를 다시 서버에서 받아와 정확히 갱신
      const response = await api.get(`/profiles/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowModal = async (type: "followers" | "followings") => {
    if (!id) return;

    setFollowModalType(type);
    setFollowModalLoading(true);
    try {
      const response = type === "followers" ? await getFollowers(Number(id)) : await getFollowings(Number(id));
      setFollowModalUsers(response.content);
    } catch (error) {
      console.error("팔로워/팔로잉 목록 조회 실패", error);
      setFollowModalUsers([]);
    } finally {
      setFollowModalLoading(false);
    }
  };

  const closeFollowModal = () => {
    setFollowModalType(null);
    setFollowModalUsers([]);
  };

  // Share profile link action
  const handleShareProfile = () => {
    const profileLink = window.location.href;
    navigator.clipboard.writeText(profileLink);
    alert(`공유 링크가 클립보드에 복사되었습니다!\n${profileLink}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40 text-text-secondary text-sm font-medium">
        불러오는 중...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-40 text-text-secondary text-sm font-medium">
        존재하지 않는 프로필입니다
      </div>
    );
  }

  const goldCount = profile.competitionHistory.filter((c: any) => c.rankPosition === 1).length;
  const silverCount = profile.competitionHistory.filter((c: any) => c.rankPosition === 2).length;
  const bronzeCount = profile.competitionHistory.filter((c: any) => c.rankPosition === 3).length;

  return (
    <div className="flex flex-col gap-4 px-2 lg:px-6 py-4 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      {/* TOP LEVEL NAVIGATION ACCENT */}
      <div className="flex items-center" id="profile-navigation-breadcrumb">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> 돌아가기
        </button>
      </div>

      {/* =========================================================================
          SECTION A: PROFILE HEADER CARD
          ========================================================================= */}
      <Card id="profile-header-card" className="relative overflow-hidden w-full">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6 relative">
            <div className="w-20 h-20 rounded-full border-2 border-surface bg-bg-main shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={profile.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                alt="avatar"
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-xl font-bold text-text-primary">
                  {profile.nickname}
                </h2>
                <Badge className="bg-text-secondary/10 text-text-secondary py-0 text-[10px] h-4 px-1 border-transparent font-bold">
                  {`Lv.${profile.userLevel}`}
                </Badge>
                {profile.isMe && (
                  <Badge className="bg-text-secondary/10 text-text-secondary border-transparent py-0 h-[18px] px-1.5 text-[10px] font-bold">
                    본인
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                <span className="text-sm text-text-secondary font-medium">
                  가입일 {profile.createdAt ? profile.createdAt.slice(0, 10).replaceAll("-", ".") : "-"}
                </span>
                <span className="text-sm text-text-secondary font-medium">
                  <button
                    onClick={() => openFollowModal("followers")}
                    className="hover:underline hover:text-text-primary transition-colors cursor-pointer"
                  >
                    팔로워 {profile.followerCount}
                  </button>
                  {" · "}
                  <button
                    onClick={() => openFollowModal("followings")}
                    className="hover:underline hover:text-text-primary transition-colors cursor-pointer"
                  >
                    팔로잉 {profile.followingCount}
                  </button>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:absolute md:top-0 md:right-0">
              {!profile.isMe ? (
                <>
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={cn(
                      "px-4 py-2 rounded-full font-bold text-sm transition cursor-pointer disabled:opacity-60",
                      profile.isFollowing
                        ? "bg-neutral-100 text-neutral-700"
                        : "bg-brand text-white",
                    )}
                  >
                    {profile.isFollowing ? "팔로잉" : "팔로우"}
                  </button>
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="bg-brand hover:bg-brand/90 text-white border-transparent px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    나와 수익률 비교
                  </button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleShareProfile}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  프로필 공유
                </Button>
              )}
            </div>
          </div>

          {/* 통계 4칸: 누적 수익률 / 평균 수익률 / 총 체결 주문수 / 승률 - 항목별 공개 설정에 따라 비공개 표시 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border-color">
            <div className="border border-border-color rounded-[14px] p-4 flex flex-col min-h-[88px] bg-bg-main/40">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors"
                title="지금까지의 누적 수익률"
              >
                <span className="text-sm font-bold">누적 수익률</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="mt-auto text-right">
                {!profile.returnRateVisible ? (
                  <span className="text-sm font-semibold text-text-secondary">비공개</span>
                ) : profile.returnRate?.targetReturnRate == null ? (
                  <span className="text-sm font-semibold text-text-secondary">-</span>
                ) : (
                  <span
                    className={cn(
                      "text-xl font-extrabold tabular-nums",
                      profile.returnRate.targetReturnRate >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {profile.returnRate.targetReturnRate >= 0 ? "+" : ""}
                    {profile.returnRate.targetReturnRate}%
                  </span>
                )}
              </div>
            </div>

            <div className="border border-border-color rounded-[14px] p-4 flex flex-col min-h-[88px] bg-bg-main/40">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors"
                title="현재 보유 중인 종목들의 평가수익률 평균"
              >
                <span className="text-sm font-bold">평균 수익률</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="mt-auto text-right">
                {!profile.statsVisible ? (
                  <span className="text-sm font-semibold text-text-secondary">비공개</span>
                ) : profile.stats?.avgReturnRate == null ? (
                  <span className="text-sm font-semibold text-text-secondary">-</span>
                ) : (
                  <span
                    className={cn(
                      "text-xl font-extrabold tabular-nums",
                      profile.stats.avgReturnRate >= 0 ? "text-up" : "text-down",
                    )}
                  >
                    {profile.stats.avgReturnRate >= 0 ? "+" : ""}
                    {profile.stats.avgReturnRate}%
                  </span>
                )}
              </div>
            </div>

            <div className="border border-border-color rounded-[14px] p-4 flex flex-col min-h-[88px] bg-bg-main/40">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors"
                title="지금까지 체결된 매수·매도 주문 수"
              >
                <span className="text-sm font-bold">총 체결 주문수</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="mt-auto text-right">
                {!profile.statsVisible ? (
                  <span className="text-sm font-semibold text-text-secondary">비공개</span>
                ) : (
                  <span className="text-xl font-extrabold tabular-nums">
                    {profile.stats.totalTradeCount}건
                  </span>
                )}
              </div>
            </div>

            <div className="border border-border-color rounded-[14px] p-4 flex flex-col min-h-[88px] bg-bg-main/40">
              <div
                className="flex items-center gap-1 text-text-secondary cursor-help hover:text-text-primary transition-colors"
                title="현재 보유 종목 중 평가손익이 플러스인 종목의 비율"
              >
                <span className="text-sm font-bold">승률</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="mt-auto text-right">
                {!profile.statsVisible ? (
                  <span className="text-sm font-semibold text-text-secondary">비공개</span>
                ) : profile.stats?.winRate == null ? (
                  <span className="text-sm font-semibold text-text-secondary">-</span>
                ) : (
                  <span className="text-xl font-extrabold tabular-nums">{profile.stats.winRate}%</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          SECTION: PORTFOLIO + RECENT TRADES
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card id="profile-portfolio-card">
          <CardHeader className="pb-3 border-b border-border-color flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">포트폴리오</CardTitle>

            {/* 현금/주식 비중 칩 - 대회 참가 기록 타이틀 옆 트로피 요약 바와 같은 스타일, 비공개면 숨김 */}
            {profile.portfolioVisible && (
              <div className="flex gap-4 border border-border-color rounded-[10px] bg-bg-main px-4 py-2 items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-text-secondary">현금</span>
                  <strong className="text-sm font-extrabold tabular-nums">
                    {profile.portfolio.cashRatio}%
                  </strong>
                </div>
                <div className="w-[1px] h-6 bg-border-color"></div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-text-secondary">주식</span>
                  <strong className="text-sm font-extrabold tabular-nums">
                    {profile.portfolio.stockRatio}%
                  </strong>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {!profile.portfolioVisible ? (
              renderPrivateNotice("포트폴리오는")
            ) : (
              <div className="flex flex-col gap-4">
                {profile.portfolio.stocks.length === 0 ? (
                  <div className="text-center text-text-secondary text-sm py-6">
                    보유 중인 종목이 없어요
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {profile.portfolio.stocks.map((stock: any) => (
                      <div key={stock.stockName} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-sm font-bold text-text-primary truncate">
                          {stock.stockName}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-bg-main overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, stock.weight))}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-sm font-bold tabular-nums text-text-secondary">
                          {stock.weight}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card id="profile-trades-card">
          <CardHeader className="pb-3 border-b border-border-color">
            <CardTitle className="text-lg font-bold">최근 거래내역</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!profile.tradesVisible ? (
              <div className="p-6">{renderPrivateNotice("거래내역은")}</div>
            ) : profile.recentTrades.length === 0 ? (
              <div className="py-10 text-center text-text-secondary text-sm">
                최근 거래 내역이 없어요
              </div>
            ) : (
              <div className="divide-y divide-border-color">
                {profile.recentTrades.map((trade: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "border-transparent py-0 px-1.5 text-xs font-bold",
                          trade.side === "BUY" ? "bg-up/10 text-up" : "bg-down/10 text-down",
                        )}
                      >
                        {trade.side === "BUY" ? "매수" : "매도"}
                      </Badge>
                      <span className="font-bold text-text-primary">{trade.stockName}</span>
                    </div>
                    <span className="text-xs text-text-secondary">{formatRelativeTime(trade.tradedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          SECTION C: COMPETITION RECORD
          ========================================================================= */}
      <Card id="profile-competitions-log-card">
        <CardHeader className="pb-3 border-b border-border-color flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">
            대회 참가 기록
          </CardTitle>

          {/* 3-Column trophy summary bar integrated into title row - 비공개면 숨김 */}
          {profile.competitionsVisible && (
            <div className="flex gap-4 border border-border-color rounded-[10px] bg-bg-main px-4 py-2 items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">🥇</span>
                <strong className="text-sm font-extrabold text-up tabular-nums">{goldCount}회</strong>
              </div>
              <div className="w-[1px] h-6 bg-border-color"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">🥈</span>
                <strong className="text-sm font-extrabold text-down tabular-nums">{silverCount}회</strong>
              </div>
              <div className="w-[1px] h-6 bg-border-color"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">🥉</span>
                <strong className="text-sm font-extrabold text-amber-600 tabular-nums">{bronzeCount}회</strong>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className={profile.competitionsVisible ? "p-0" : "p-6"}>
          {!profile.competitionsVisible ? (
            renderPrivateNotice("대회 참가 기록은")
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-bg-main border-b border-border-color text-sm font-bold text-text-secondary">
                    <th className="py-3.5 px-6 text-center">대회 기간</th>
                    <th className="py-3.5 px-4 text-center">상태</th>
                    <th className="py-3.5 px-6">참가 대회명</th>
                    <th className="py-3.5 px-4 text-right">시드머니</th>
                    <th className="py-3.5 px-4 text-right">수익률</th>
                    <th className="py-3.5 px-6 text-center">순위</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {profile.competitionHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-text-secondary text-sm">
                        참가한 대회가 없습니다
                      </td>
                    </tr>
                  ) : (
                    profile.competitionHistory.map((item: any) => (
                      <tr
                        key={item.competitionId}
                        className="hover:bg-bg-main/50 transition-colors text-sm font-medium"
                      >
                        <td className="py-4 px-6 text-center text-text-secondary tabular-nums">
                          {formatPeriod(item.startAt, item.endAt)}
                        </td>
                        <td className="py-4 px-4 text-center select-none font-bold">
                          {item.status === "ONGOING" ? (
                            <span className="text-brand">진행중</span>
                          ) : item.status === "SCHEDULED" ? (
                            <span className="text-text-primary">예정</span>
                          ) : (
                            <span className="text-text-secondary font-medium">
                              {COMPETITION_STATUS_LABELS[item.status] ?? "종료"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold text-text-primary max-w-[200px] truncate">
                          {item.title}
                        </td>
                        <td className="py-4 px-4 text-right font-medium text-text-secondary tabular-nums">
                          {item.seedMoney != null ? `${formatPrice(item.seedMoney)}원` : "-"}
                        </td>
                        <td className="py-4 px-4 text-right font-bold tabular-nums">
                          {item.status === "SCHEDULED" ? (
                            <span className="text-text-secondary font-semibold">-</span>
                          ) : (
                            <span className={item.returnRate >= 0 ? "text-up" : "text-down"}>
                              {item.returnRate >= 0 ? `+${item.returnRate}%` : `${item.returnRate}%`}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.rankPosition ? (
                            <span className="text-neutral-900 font-extrabold tabular-nums">
                              {item.rankPosition}위
                            </span>
                          ) : (
                            <span className="text-text-secondary font-semibold">진행중</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =========================================================================
          FOLLOW LIST MODAL
          ========================================================================= */}
      {followModalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-border-color flex flex-col gap-4 max-h-[70vh]">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">
                {followModalType === "followers" ? "팔로워" : "팔로잉"}
              </h3>
              <button
                onClick={closeFollowModal}
                className="w-8 h-8 rounded-full bg-bg-main hover:bg-border-color flex items-center justify-center transition cursor-pointer text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex flex-col gap-1 -mx-2">
              {followModalLoading ? (
                <p className="text-center text-sm text-text-secondary py-8">불러오는 중...</p>
              ) : followModalUsers.length === 0 ? (
                <p className="text-center text-sm text-text-secondary py-8">
                  {followModalType === "followers" ? "팔로워가 없습니다" : "팔로잉이 없습니다"}
                </p>
              ) : (
                followModalUsers.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => {
                      closeFollowModal();
                      navigate(`/users/${user.userId}`);
                    }}
                    className="flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-bg-main transition-colors text-left cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-bg-main border border-border-color shrink-0 overflow-hidden">
                      <img
                        src={user.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                        alt={user.nickname}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="font-bold text-sm text-text-primary">{user.nickname}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COMPARE RETURN RATE MODAL
          ========================================================================= */}
      {showCompareModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setShowCompareModal(false)}
        >
          <div
            className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-border-color flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-text-primary">수익률 비교</h3>
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-8 h-8 rounded-full bg-bg-main hover:bg-border-color flex items-center justify-center transition cursor-pointer text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!profile.returnRateVisible ? (
              renderPrivateNotice("수익률은")
            ) : profile.returnRate?.targetReturnRate == null ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                아직 집계된 수익률 데이터가 없어요
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-center border border-border-color rounded-[16px] overflow-hidden bg-bg-main">
                    <div className="text-sm font-bold text-text-primary py-2.5 px-2 border-b border-border-color truncate">
                      {profile.nickname}
                    </div>
                    <div className="py-4">
                      <span
                        className={cn(
                          "text-2xl font-extrabold tabular-nums",
                          profile.returnRate.targetReturnRate >= 0 ? "text-up" : "text-down",
                        )}
                      >
                        {profile.returnRate.targetReturnRate >= 0 ? "+" : ""}
                        {profile.returnRate.targetReturnRate}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 text-center border border-border-color rounded-[16px] overflow-hidden bg-bg-main">
                    <div className="text-sm font-bold text-text-primary py-2.5 px-2 border-b border-border-color truncate">
                      {viewer?.nickname ?? "나"}
                    </div>
                    <div className="py-4">
                      {profile.returnRate.viewerReturnRate == null ? (
                        <span className="text-sm font-semibold text-text-secondary">데이터 없음</span>
                      ) : (
                        <span
                          className={cn(
                            "text-2xl font-extrabold tabular-nums",
                            profile.returnRate.viewerReturnRate >= 0 ? "text-up" : "text-down",
                          )}
                        >
                          {profile.returnRate.viewerReturnRate >= 0 ? "+" : ""}
                          {profile.returnRate.viewerReturnRate}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {profile.returnRate.viewerReturnRate == null ? (
                  <div className="text-center text-xs text-text-secondary">
                    내 수익률 데이터가 아직 없어 비교할 수 없어요
                  </div>
                ) : (
                  <div className="text-center text-sm font-bold text-text-primary">
                    {profile.nickname}님이 나보다{" "}
                    <span
                      className={cn(
                        profile.returnRate.targetReturnRate - profile.returnRate.viewerReturnRate >= 0
                          ? "text-up"
                          : "text-down",
                      )}
                    >
                      {Math.abs(profile.returnRate.targetReturnRate - profile.returnRate.viewerReturnRate).toFixed(2)}
                      %p
                    </span>{" "}
                    {profile.returnRate.targetReturnRate - profile.returnRate.viewerReturnRate >= 0
                      ? "높아요"
                      : "낮아요"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
