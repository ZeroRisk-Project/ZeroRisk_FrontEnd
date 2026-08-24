import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { cn, formatPrice } from "@/src/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import api from "@/src/lib/api";
import { DEFAULT_PROFILE_IMAGE } from "@/src/lib/constants";

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

export function PublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

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
                  팔로워 {profile.followerCount} · 팔로잉 {profile.followingCount}
                </span>
              </div>
            </div>

            {!profile.isMe ? (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={cn(
                  "md:absolute md:top-0 md:right-0 px-4 py-2 rounded-full font-bold text-sm transition cursor-pointer disabled:opacity-60",
                  profile.isFollowing
                    ? "bg-neutral-100 text-neutral-700"
                    : "bg-brand text-white",
                )}
              >
                {profile.isFollowing ? "팔로잉" : "팔로우"}
              </button>
            ) : (
              <Button
                variant="outline"
                onClick={handleShareProfile}
                className="md:absolute md:top-0 md:right-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                프로필 공유
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          SECTION C: COMPETITION RECORD
          ========================================================================= */}
      <Card id="profile-competitions-log-card">
        <CardHeader className="pb-3 border-b border-border-color flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">
            대회 참가 기록
          </CardTitle>

          {/* 3-Column trophy summary bar integrated into title row */}
          <div className="flex gap-4 border border-border-color rounded-[10px] bg-bg-main px-4 py-2 text-center items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">🥇</span>
              <div className="flex flex-col items-start translate-y-[0.5px]">
                <strong className="text-xs font-extrabold text-up tabular-nums leading-none">
                  {goldCount}회
                </strong>
                <span className="text-[9px] text-text-secondary mt-0.5">
                  우승
                </span>
              </div>
            </div>
            <div className="w-[1px] h-6 bg-border-color"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">🥈</span>
              <div className="flex flex-col items-start translate-y-[0.5px]">
                <strong className="text-xs font-extrabold text-down tabular-nums leading-none">
                  {silverCount}회
                </strong>
                <span className="text-[9px] text-text-secondary mt-0.5">
                  준우승
                </span>
              </div>
            </div>
            <div className="w-[1px] h-6 bg-border-color"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-base leading-none">🥉</span>
              <div className="flex flex-col items-start translate-y-[0.5px]">
                <strong className="text-xs font-extrabold text-amber-600 tabular-nums leading-none">
                  {bronzeCount}회
                </strong>
                <span className="text-[9px] text-text-secondary mt-0.5">
                  포디움 안착
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-bg-main border-b border-border-color text-xs font-bold text-text-secondary">
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
                      className="hover:bg-bg-main/50 transition-colors text-xs font-medium"
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
                        {item.rankPosition === 1 ? (
                          <Badge className="bg-amber-100 text-amber-800 border-transparent py-0 px-2 font-bold select-none whitespace-nowrap">
                            🥇 1위
                          </Badge>
                        ) : item.rankPosition === 2 ? (
                          <Badge className="bg-slate-100 text-slate-800 border-transparent py-0 px-2 font-bold select-none whitespace-nowrap">
                            🥈 2위
                          </Badge>
                        ) : item.rankPosition === 3 ? (
                          <Badge className="bg-amber-50 text-amber-700 border-transparent py-0 px-2 font-bold select-none whitespace-nowrap">
                            🥉 3위
                          </Badge>
                        ) : item.rankPosition ? (
                          <span className="text-text-secondary font-semibold tabular-nums">
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
        </CardContent>
      </Card>
    </div>
  );
}
