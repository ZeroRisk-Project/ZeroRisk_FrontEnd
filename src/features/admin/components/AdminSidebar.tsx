import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/src/shared/lib/utils";
import { DEFAULT_PROFILE_IMAGE } from "@/src/shared/lib/constants";

type AdminTab = "dashboard" | "members" | "posts" | "reports" | "inquiries" | "competitions" | "logs" | "announcements" | "system-notices" | "notification-dlq";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  adminProfile: { nickname: string; email: string; profileImageUrl: string | null };
  totalReportsCount: number;
  totalInquiriesCount: number;
}

export function AdminSidebar({ activeTab, setActiveTab, adminProfile, totalReportsCount, totalInquiriesCount }: AdminSidebarProps) {
  return (
      <aside className="w-[265px] bg-white border-r border-[#E5E5EA] flex flex-col justify-between py-6 px-4 shrink-0 h-screen sticky top-0">
        <div>
          {/* Logo / Header */}
          <div className="px-2 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold text-[#4A5DF9]">제로리스크</span>
              <span className="bg-[#4A5DF9]/10 text-[#4A5DF9] text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded">ADMIN</span>
            </div>
            <p className="text-[#8E8E93] text-[12px] font-medium mt-1">관리자 페이지</p>
          </div>

          <div className="h-[1px] bg-[#E5E5EA] mb-6" />

          {/* Admin Profile Card */}
          <div className="bg-[#F2F2F7] rounded-[12px] p-3 flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <img
                src={adminProfile.profileImageUrl || DEFAULT_PROFILE_IMAGE}
                alt="admin"
                className="flex-shrink-0 w-9 h-9 rounded-full object-cover border border-[#E5E5EA]"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#1C1C1E] truncate">{adminProfile.nickname}</p>
                <p className="text-[11px] text-[#8E8E93] truncate">{adminProfile.email}</p>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {[
              { id: "dashboard", label: "대시보드", icon: "📊" },
              { id: "members", label: "회원 관리", icon: "👥" },
              { id: "posts", label: "게시글 관리", icon: "📝" },
              { id: "reports", label: "신고 관리", icon: "🚨", badge: totalReportsCount, badgeColor: "bg-[#FF3B30]" },
              { id: "inquiries", label: "문의 관리", icon: "💬", badge: totalInquiriesCount, badgeColor: "bg-[#FF9500]" },
              { id: "competitions", label: "대회 관리", icon: "🏆" },
              { id: "logs", label: "로그 모니터링", icon: "📋" },
              { id: "announcements", label: "공지사항", icon: "📢" },
              { id: "system-notices", label: "긴급 알림", icon: "🚨" },
              { id: "notification-dlq", label: "알림 실패 관리", icon: "📮" },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={cn(
                    "w-full h-11 flex items-center justify-between px-3.5 transition-all text-[14px]",
                    isActive
                      ? "bg-[#4A5DF9]/10 text-[#4A5DF9] !font-bold rounded-[12px]"
                      : "text-[#8E8E93] hover:text-[#1C1C1E] font-medium bg-transparent rounded-[12px]"
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[16px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && item.badge > 0 ? (
                    <span className={cn("w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0", item.badgeColor)}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="px-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-[13px] font-semibold text-[#8E8E93] hover:text-[#4A5DF9] transition-colors py-1 px-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>메인으로 돌아가기</span>
          </Link>
        </div>
      </aside>
  );
}
