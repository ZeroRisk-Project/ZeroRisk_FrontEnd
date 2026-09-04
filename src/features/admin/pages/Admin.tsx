import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle } from "lucide-react";
import api from "@/src/shared/lib/api";
import { Button } from "@/src/shared/components/ui/Button";
import { getAdminPosts, getAdminComments, AdminCommentResponse } from '@/src/features/moderation/api/moderation';
import { AdminSidebar } from "@/src/features/admin/components/AdminSidebar";
import { AdminDashboardTab } from "@/src/features/admin/components/AdminDashboardTab";
import { AdminLogsTab } from "@/src/features/admin/components/AdminLogsTab";
import { AdminMembersTab } from "@/src/features/user/components/AdminMembersTab";
import { AdminPostsTab } from "@/src/features/community/components/AdminPostsTab";
import { AdminReportsTab } from "@/src/features/report/components/AdminReportsTab";
import { AdminInquiriesTab } from "@/src/features/inquiry/components/AdminInquiriesTab";
import { AdminCompetitionsTab } from "@/src/features/competition/components/AdminCompetitionsTab";
import { AdminAnnouncementsTab } from "@/src/features/announcement/components/AdminAnnouncementsTab";
import { AdminSystemNoticesTab } from "@/src/features/systemnotice/components/AdminSystemNoticesTab";

// Interfaces
interface UserItem {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  userRole: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "QUIT";
  createdAt: string;
  accountNumMasked: string | null;
}

interface ReportItem {
  id: number;
  reporterNickname: string;
  targetType: "POST" | "COMMENT" | "CHAT" | "USER";
  targetId: number;
  targetPostId: number | null;
  reason: string;
  createdAt: string;
  status: "PENDING" | "PROCESSED" | "REJECTED";
}

interface InquiryItem {
  id: number;
  authorNickname: string;
  title: string;
  content: string;
  createdAt: string;
  status: "PENDING" | "ANSWERED";
  answer?: string;
  answeredAt?: string;
}

interface CompetitionItem {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  seedMoney: number;
  participants: number;
  status: "SCHEDULED" | "ONGOING" | "CALCULATING" | "ENDED";
  isOpen: boolean;
  isOfficial?: boolean;
  initialAmount?: number;
  maxParticipants?: number | string;
  target?: string;
  hasPassword?: boolean;
  password?: string;
  dday?: string;
}

interface ActivityLog {
  id: number;
  date: string;
  type: string;
  target: string;
  content: string;
  ip: string;
  userId?: number;
}

interface PostItem {
  id: number;
  author: string;
  title: string;
  content: string;
  date: string;
  views: number;
  likes: number;
  commentsCount: number;
  status: "ACTIVE" | "DELETED";
}

export function Admin() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "members" | "posts" | "reports" | "inquiries" | "competitions" | "logs" | "announcements" | "system-notices">("dashboard");

  const queryClient = useQueryClient();

  // App States representing mockup database
  const reportsQuery = useQuery({
    queryKey: ["admin", "reports"],
    queryFn: () => api.get("/admin/reports", { params: { size: 100 } }),
    retry: false,
  });
  const reports = reportsQuery.data?.data.content ?? [];
  const fetchReports = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
  };

  const adminProfileQuery = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: () => api.get("/users/me"),
    retry: false,
  });
  const adminProfile = adminProfileQuery.data
    ? {
        nickname: adminProfileQuery.data.data.nickname,
        email: adminProfileQuery.data.data.email,
        profileImageUrl: adminProfileQuery.data.data.profileImageUrl,
      }
    : { nickname: "", email: "", profileImageUrl: null };

  const dashboardQuery = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get("/admin/dashboard"),
    retry: false,
  });

  const serverHealthQuery = useQuery({
    queryKey: ["admin", "health"],
    queryFn: () => api.get("/admin/dashboard/health"),
    retry: false,
  });
  const serverHealth = serverHealthQuery.data
    ? serverHealthQuery.data.data
    : serverHealthQuery.isError
      ? { webServerUp: false, databaseUp: false }
      : null;

  // 10초마다 폴링(refetchInterval)해서 응답시간 지표를 갱신 - 기존 setInterval(fetchMetrics, 10000)과 동일.
  // dashboardSummary는 /admin/dashboard 응답에 /admin/metrics의 응답시간 필드를 얹은 값이라, 두 쿼리를 합쳐서 파생시킨다.
  const metricsQuery = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => api.get("/admin/metrics"),
    refetchInterval: 10000,
    retry: false,
  });
  const dashboardSummary = dashboardQuery.data
    ? {
        ...dashboardQuery.data.data,
        ...(metricsQuery.data
          ? {
              latestResponseTimeMs: metricsQuery.data.data.latestResponseTimeMs,
              averageResponseTimeMs: metricsQuery.data.data.averageResponseTimeMs,
            }
          : {}),
      }
    : null;
  const metricsHistory = metricsQuery.data?.data.points ?? [];

  const inquiriesQuery = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: () => api.get("/admin/inquiries", { params: { size: 100 } }),
    retry: false,
  });
  const inquiries = inquiriesQuery.data?.data.content ?? [];
  const fetchInquiries = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
  };

  const competitionsQuery = useQuery({
    queryKey: ["admin", "competitions"],
    queryFn: () => api.get("/competitions", { params: { size: 100 } }),
    retry: false,
  });
  const competitions = competitionsQuery.data?.data.content ?? [];
  const fetchAdminCompetitions = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "competitions"] });
  };

  const logsQuery = useQuery({
    queryKey: ["admin", "logs"],
    queryFn: () => api.get("/admin/action-logs", { params: { size: 100 } }),
    retry: false,
  });
  const logs = logsQuery.data?.data.content ?? [];

  // Announcements State
  const announcementsQuery = useQuery({
    queryKey: ["admin", "announcements"],
    queryFn: () => api.get("/announcements"),
    retry: false,
  });
  const announcements = announcementsQuery.data?.data ?? [];
  const fetchAnnouncements = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
  };

  const [announcementModal, setAnnouncementModal] = useState<{ isOpen: boolean; announcement: any | null }>({ isOpen: false, announcement: null });
  const [announcementForm, setAnnouncementForm] = useState({ tag: "GUIDE", title: "", content: "", isImportant: false });

  const openAnnouncementCreate = () => {
    setAnnouncementForm({ tag: "GUIDE", title: "", content: "", isImportant: false });
    setAnnouncementModal({ isOpen: true, announcement: null });
  };

  const openAnnouncementEdit = (announcement: any) => {
    setAnnouncementForm({
      tag: announcement.tag,
      title: announcement.title,
      content: announcement.content,
      isImportant: announcement.isImportant,
    });
    setAnnouncementModal({ isOpen: true, announcement });
  };

  const handleAnnouncementSubmit = async () => {
    try {
      if (announcementModal.announcement) {
        await api.put(`/admin/announcements/${announcementModal.announcement.id}`, announcementForm);
        triggerToast("공지사항이 수정되었습니다.");
      } else {
        await api.post("/admin/announcements", announcementForm);
        triggerToast("공지사항이 등록되었습니다.");
      }
      await fetchAnnouncements();
      setAnnouncementModal({ isOpen: false, announcement: null });
    } catch (error: any) {
      triggerToast(`⚠️ ${error.response?.data?.message ?? "저장에 실패했습니다."}`);
    }
  };

  const handleAnnouncementDelete = async (id: number) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      await fetchAnnouncements();
      triggerToast("공지사항이 삭제되었습니다.");
    } catch (error: any) {
      triggerToast(`⚠️ ${error.response?.data?.message ?? "삭제에 실패했습니다."}`);
    }
  };

  // System Notices State
  const systemNoticesQuery = useQuery({
    queryKey: ["admin", "systemNotices"],
    queryFn: () => api.get("/admin/system-notices"),
    retry: false,
  });
  const systemNotices = systemNoticesQuery.data?.data ?? [];
  const fetchSystemNotices = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "systemNotices"] });
  };

  const [systemNoticeModal, setSystemNoticeModal] = useState(false);
  const [systemNoticeForm, setSystemNoticeForm] = useState({ severity: "MAINTENANCE", title: "", message: "" });

  const openSystemNoticeCreate = () => {
    setSystemNoticeForm({ severity: "MAINTENANCE", title: "", message: "" });
    setSystemNoticeModal(true);
  };

  const handleSystemNoticeSubmit = async () => {
    try {
      await api.post("/admin/system-notices", systemNoticeForm);
      triggerToast("긴급 알림이 활성화되었습니다.");
      await fetchSystemNotices();
      setSystemNoticeModal(false);
    } catch (error: any) {
      triggerToast(`⚠️ ${error.response?.data?.message ?? "등록에 실패했습니다."}`);
    }
  };

  const handleSystemNoticeDeactivate = async (id: number) => {
    try {
      await api.patch(`/admin/system-notices/${id}/deactivate`);
      await fetchSystemNotices();
      triggerToast("긴급 알림이 종료되었습니다.");
    } catch (error: any) {
      triggerToast(`⚠️ ${error.response?.data?.message ?? "종료에 실패했습니다."}`);
    }
  };

  // User Activity Logs (activityModal) State
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityLogsLoading, setActivityLogsLoading] = useState(false);

  const openActivityModal = async (user: UserItem | null) => {
    setActivityModal({ isOpen: true, user });
    setActivityLogsLoading(true);
    try {
      const response = await api.get(`/admin/users/${user?.id}/activity-logs`);
      setActivityLogs(response.data);
    } catch (error) {
      console.error(error);
      setActivityLogs([]);
    } finally {
      setActivityLogsLoading(false);
    }
  };

  // Competition Participants State
  const [compParticipants, setCompParticipants] = useState<{ [compId: number]: any[] }>({});

  // Competition Participant modal states
  const [selectedCompForParticipants, setSelectedCompForParticipants] = useState<CompetitionItem | null>(null);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);

  // User Row Context Dropdown menu mapping values
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    user: UserItem | null;
  }>({ isOpen: false, x: 0, y: 0, user: null });

  useEffect(() => {
    localStorage.setItem("admin_activity_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (contextMenu.isOpen) {
        setContextMenu(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [contextMenu.isOpen]);

  // 서버에 실제로 남기는 로그가 아니라, 관리자가 방금 한 행동을 화면에 즉시 반영하는 로컬 echo다.
  // logs가 useQuery 캐시로 옮겨갔으므로, 캐시를 직접 patch해서 같은 효과(맨 앞에 즉시 추가)를 낸다.
  const logAdminAction = (type: string, target: string, content: string) => {
    const newLog: ActivityLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type,
      target,
      content,
      ip: "127.0.0.1" // 로컬 관리자 IP 세션
    };
    queryClient.setQueryData(["admin", "logs"], (prev: any) => {
      const prevContent = prev?.data?.content ?? [];
      return { ...prev, data: { ...(prev?.data ?? {}), content: [newLog, ...prevContent] } };
    });
  };

  const [posts, setPosts] = useState<PostItem[]>([]);

  const postsQuery = useQuery({
    queryKey: ["admin", "posts"],
    queryFn: () => getAdminPosts(),
    enabled: activeTab === 'posts',
    retry: false,
  });

  // posts는 탭 내부(모더레이션 처리 등)에서 setPosts로 직접 로컬 수정도 하므로, 조회 성공 시에만
  // 로컬 state를 서버 값으로 채워넣는다 - 이후의 로컬 수정은 그대로 유지됨.
  useEffect(() => {
    if (postsQuery.data) {
      setPosts(postsQuery.data.content);
    }
  }, [postsQuery.data]);

  // General States
  const [loading, setLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Posts State Actions
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postFilterTab, setPostFilterTab] = useState<"ALL" | "ACTIVE" | "DELETED">("ALL");
  const [selectedPostDetail, setSelectedPostDetail] = useState<PostItem | null>(null);
  const [postComments, setPostComments] = useState<AdminCommentResponse[]>([]);

  const postCommentsQuery = useQuery({
    queryKey: ["admin", "postComments", selectedPostDetail?.id],
    queryFn: () => getAdminComments(selectedPostDetail!.id),
    enabled: !!selectedPostDetail,
    retry: false,
  });

  // postComments도 탭에서 setPostComments로 직접 로컬 수정하므로 posts와 동일한 패턴.
  useEffect(() => {
    if (!selectedPostDetail) {
      setPostComments([]);
      return;
    }
    if (postCommentsQuery.data) {
      setPostComments(postCommentsQuery.data);
    }
  }, [selectedPostDetail, postCommentsQuery.data]);

  // Report Detail view Modal
  const [reportDetailModal, setReportDetailModal] = useState<{ isOpen: boolean; report: ReportItem | null }>({ isOpen: false, report: null });

  // 1. Members State Actions
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "SUSPENDED" | "QUIT">("ALL");
  const [filterRole, setFilterRole] = useState<"ALL" | "USER" | "ADMIN">("ALL");

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const usersQuery = useQuery({
    queryKey: ["admin", "users", debouncedSearchQuery, filterStatus],
    queryFn: () =>
      api.get("/admin/users", {
        params: {
          keyword: debouncedSearchQuery || undefined,
          status: filterStatus !== "ALL" ? filterStatus : undefined,
          size: 100,
        },
      }),
    retry: false,
  });
  const users = usersQuery.data?.data.content ?? [];
  const fetchUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "users", debouncedSearchQuery, filterStatus] });
  };

  // Suspension Modal
  const [suspensionModal, setSuspensionModal] = useState<{ isOpen: boolean; userId: number | null }>({ isOpen: false, userId: null });
  const [suspensionTime, setSuspensionTime] = useState("-1");
  const [suspensionReason, setSuspensionReason] = useState("");

  // Competition Edit Modal
  const [editCompModal, setEditCompModal] = useState<{ isOpen: boolean; competition: any | null }>({ isOpen: false, competition: null });
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editMaxParticipants, setEditMaxParticipants] = useState("");
  const [editError, setEditError] = useState("");

  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editStartDate || !editEndDate) {
      setEditError("필수 항목을 입력해주세요.");
      return;
    }
    try {
      await api.put(`/admin/competitions/${editCompModal.competition.id}`, {
        title: editTitle,
        description: editDescription,
        startAt: `${editStartDate}T00:00:00`,
        endAt: `${editEndDate}T23:59:59`,
        isPublic: editIsPublic,
        maxParticipants: editMaxParticipants.trim() === "" ? null : parseInt(editMaxParticipants),
      });
      await fetchAdminCompetitions();
      triggerToast(`${editTitle} 대회 정보가 수정되었습니다.`);
      setEditCompModal({ isOpen: false, competition: null });
    } catch (error: any) {
      setEditError(error.response?.data?.message ?? "수정에 실패했습니다.");
    }
  };

  // Activity Log Modal
  const [activityModal, setActivityModal] = useState<{ isOpen: boolean; user: UserItem | null }>({ isOpen: false, user: null });

  // 2. Reports State Actions
  const [reportFilterTab, setReportFilterTab] = useState<"전체" | "PENDING" | "PROCESSED" | "REJECTED">("전체");

  const REPORT_STATUS_LABELS: Record<string, string> = {
    PENDING: "미처리",
    PROCESSED: "처리완료",
    REJECTED: "반려",
  };

  const TARGET_TYPE_LABELS: Record<string, string> = {
    POST: "게시글",
    COMMENT: "댓글",
    CHAT: "채팅",
    USER: "회원",
  };

  // 3. Inquiries State Actions
  const [inquiryFilterTab, setInquiryFilterTab] = useState<"전체" | "PENDING" | "ANSWERED">("전체");
  const [answerModal, setAnswerModal] = useState<{ isOpen: boolean; inquiry: InquiryItem | null }>({ isOpen: false, inquiry: null });
  const [answerText, setAnswerText] = useState("");

  // 5. Log Monitoring Pagination Filter
  const [logMonitoringTab, setLogMonitoringTab] = useState<"전체" | "CREATE" | "UPDATE" | "DELETE" | "SUSPEND" | "UNSUSPEND" | "PROCESS" | "REJECT" | "ANSWER">("전체");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logPage, setLogPage] = useState(1);

  const ACTION_TYPE_LABELS: Record<string, string> = {
    CREATE: "생성",
    UPDATE: "수정",
    DELETE: "삭제",
    SUSPEND: "정지",
    UNSUSPEND: "정지해제",
    PROCESS: "신고처리",
    REJECT: "신고반려",
    ANSWER: "문의답변",
  };

  const ANNOUNCEMENT_TAG_LABELS: Record<string, string> = {
    EVENT: "이벤트",
    GUIDE: "안내",
    MAINTENANCE: "점검",
  };

  const SYSTEM_NOTICE_SEVERITY_LABELS: Record<string, string> = {
    MAINTENANCE: "점검",
    INCIDENT: "장애",
    NOTICE: "알림",
  };

  // Simulate Load effect when moving tabs
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Helper selectors
  const totalInquiriesCount = dashboardSummary?.pendingInquiryCount ?? 0;
  const totalReportsCount = dashboardSummary?.pendingReportCount ?? 0;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}분`;
    return `${hours}시간 ${minutes}분`;
  };

  const buildSvgPath = (points: any[]) => {
    if (points.length === 0) return { line: "", area: "" };

    const maxMs = Math.max(...points.map(p => p.responseTimeMs), 200);
    const width = 500;
    const height = 150;
    const stepX = points.length > 1 ? width / (points.length - 1) : 0;

    const coords = points.map((p, i) => {
      const x = i * stepX;
      const y = height - (p.responseTimeMs / maxMs) * height;
      return { x, y };
    });

    const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x},${c.y}`).join(" ");
    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return { line: linePath, area: areaPath };
  };

  return (
    <div className="flex bg-[#FDFDFD] min-h-screen text-[#1C1C1E] font-sans overflow-x-hidden antialiased">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminProfile={adminProfile}
        totalReportsCount={totalReportsCount}
        totalInquiriesCount={totalInquiriesCount}
      />

      {/* RIGHT MAIN CONTENT AREA - Scrollable */}
      <main id="admin-content-viewport" className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-7 flex flex-col">
        {/* Floating Notification Toast */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 bg-[#1C1C1E] text-white rounded-[12px] px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center gap-2 border border-[#E5E5EA]/20 animate-in fade-in duration-200">
            <CheckCircle className="w-4.5 h-4.5 text-[#34C759]" />
            <span className="text-[13px] font-medium">{toastMsg}</span>
          </div>
        )}

        {/* View Content Renderer */}
        {loading ? (
          /* SKELETON SHIMMER LOADING PREVIEW */
          <div id="loading-shimmer-container" className="flex flex-col gap-6 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="w-40 h-7 rounded-[8px] animate-shimmer" />
                <div className="w-64 h-4 rounded-[6px] animate-shimmer" />
              </div>
              <div className="w-32 h-10 rounded-[12px] animate-shimmer" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[105px] bg-white rounded-[16px] border border-[#E5E5EA] p-5 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-16 h-3 rounded animate-shimmer" />
                    <div className="w-8 h-8 rounded-full animate-shimmer" />
                  </div>
                  <div className="w-24 h-6 rounded animate-shimmer" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-[300px] bg-white rounded-[16px] border border-[#E5E5EA] p-6 flex flex-col justify-between">
                <div className="w-48 h-5 rounded animate-shimmer" />
                <div className="w-full h-44 rounded animate-shimmer" />
              </div>
              <div className="h-[300px] bg-white rounded-[16px] border border-[#E5E5EA] p-6 flex flex-col justify-between">
                <div className="w-32 h-5 rounded animate-shimmer" />
                <div className="w-full h-44 rounded animate-shimmer" />
              </div>
            </div>
          </div>
        ) : emptyState ? (
          /* EMPTY STATE PREVIEW */
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-[16.5px] border border-[#E5E5EA] text-center p-8 self-stretch my-auto">
            <div className="w-[72px] h-[72px] rounded-full bg-[#F2F2F7] flex items-center justify-center text-[#8E8E93] mb-4">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <h3 className="text-[17px] font-bold text-[#1C1C1E] mb-1.5">내역이 존재하지 않습니다</h3>
            <p className="text-[13px] text-[#8E8E93] max-w-sm mb-6 leading-relaxed">
              조회 조건에 만족하는 정보나 등록된 이벤트 기록이 발견되지 않았습니다. 다른 필터 조건을 선택하거나 나중에 다시 확인해주십시오.
            </p>
            <Button
              onClick={() => setEmptyState(false)}
              className="bg-[#4A5DF9] hover:bg-[#4A5DF9]/90 text-white rounded-[12px] text-[13px] font-bold px-4"
            >
              기본 데이터 복구
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === "dashboard" && (
              <AdminDashboardTab
                dashboardSummary={dashboardSummary}
                serverHealth={serverHealth}
                metricsHistory={metricsHistory}
                totalReportsCount={totalReportsCount}
                totalInquiriesCount={totalInquiriesCount}
              />
            )}

            {activeTab === "members" && (
              <AdminMembersTab
                users={users}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterRole={filterRole}
                setFilterRole={setFilterRole}
                fetchUsers={fetchUsers}
                triggerToast={triggerToast}
                suspensionModal={suspensionModal}
                setSuspensionModal={setSuspensionModal}
                suspensionTime={suspensionTime}
                setSuspensionTime={setSuspensionTime}
                suspensionReason={suspensionReason}
                setSuspensionReason={setSuspensionReason}
                activityModal={activityModal}
                setActivityModal={setActivityModal}
                activityLogs={activityLogs}
                activityLogsLoading={activityLogsLoading}
                openActivityModal={openActivityModal}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
              />
            )}

            {activeTab === "posts" && (
              <AdminPostsTab
                posts={posts}
                setPosts={setPosts}
                postSearchQuery={postSearchQuery}
                setPostSearchQuery={setPostSearchQuery}
                postFilterTab={postFilterTab}
                setPostFilterTab={setPostFilterTab}
                selectedPostDetail={selectedPostDetail}
                setSelectedPostDetail={setSelectedPostDetail}
                postComments={postComments}
                setPostComments={setPostComments}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === "reports" && (
              <AdminReportsTab
                reports={reports}
                fetchReports={fetchReports}
                triggerToast={triggerToast}
                reportFilterTab={reportFilterTab}
                setReportFilterTab={setReportFilterTab}
                reportDetailModal={reportDetailModal}
                setReportDetailModal={setReportDetailModal}
              />
            )}

            {activeTab === "inquiries" && (
              <AdminInquiriesTab
                inquiries={inquiries}
                inquiryFilterTab={inquiryFilterTab}
                setInquiryFilterTab={setInquiryFilterTab}
                answerModal={answerModal}
                setAnswerModal={setAnswerModal}
                answerText={answerText}
                setAnswerText={setAnswerText}
                fetchInquiries={fetchInquiries}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === "competitions" && (
              <AdminCompetitionsTab
                competitions={competitions}
                fetchAdminCompetitions={fetchAdminCompetitions}
                triggerToast={triggerToast}
                logAdminAction={logAdminAction}
                compParticipants={compParticipants}
                setCompParticipants={setCompParticipants}
                selectedCompForParticipants={selectedCompForParticipants}
                setSelectedCompForParticipants={setSelectedCompForParticipants}
                participantsModalOpen={participantsModalOpen}
                setParticipantsModalOpen={setParticipantsModalOpen}
                editCompModal={editCompModal}
                setEditCompModal={setEditCompModal}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editDescription={editDescription}
                setEditDescription={setEditDescription}
                editStartDate={editStartDate}
                setEditStartDate={setEditStartDate}
                editEndDate={editEndDate}
                setEditEndDate={setEditEndDate}
                editIsPublic={editIsPublic}
                setEditIsPublic={setEditIsPublic}
                editMaxParticipants={editMaxParticipants}
                setEditMaxParticipants={setEditMaxParticipants}
                editError={editError}
                setEditError={setEditError}
                handleEditSubmit={handleEditSubmit}
              />
            )}

            {activeTab === "logs" && (
              <AdminLogsTab
                logs={logs}
                logMonitoringTab={logMonitoringTab}
                setLogMonitoringTab={setLogMonitoringTab}
                logSearchQuery={logSearchQuery}
                setLogSearchQuery={setLogSearchQuery}
                logPage={logPage}
                setLogPage={setLogPage}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === "announcements" && (
              <AdminAnnouncementsTab
                announcements={announcements}
                openAnnouncementCreate={openAnnouncementCreate}
                openAnnouncementEdit={openAnnouncementEdit}
                handleAnnouncementDelete={handleAnnouncementDelete}
                announcementModal={announcementModal}
                setAnnouncementModal={setAnnouncementModal}
                announcementForm={announcementForm}
                setAnnouncementForm={setAnnouncementForm}
                handleAnnouncementSubmit={handleAnnouncementSubmit}
              />
            )}

            {activeTab === "system-notices" && (
              <AdminSystemNoticesTab
                systemNotices={systemNotices}
                openSystemNoticeCreate={openSystemNoticeCreate}
                handleSystemNoticeDeactivate={handleSystemNoticeDeactivate}
                systemNoticeModal={systemNoticeModal}
                setSystemNoticeModal={setSystemNoticeModal}
                systemNoticeForm={systemNoticeForm}
                setSystemNoticeForm={setSystemNoticeForm}
                handleSystemNoticeSubmit={handleSystemNoticeSubmit}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
