import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Calendar, ChevronDown, ChevronUp, Bell, Megaphone } from "lucide-react";
import { Input } from "@/src/components/ui/Input";
import api from "@/src/lib/api";

interface NoticeItem {
  id: number;
  tag: "EVENT" | "GUIDE" | "MAINTENANCE";
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}

const TAG_LABELS: Record<string, string> = {
  EVENT: "이벤트",
  GUIDE: "안내",
  MAINTENANCE: "점검",
};

export function Notice() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"전체" | "GUIDE" | "MAINTENANCE" | "EVENT">("전체");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get("/announcements");
        setNotices(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAnnouncements();
  }, []);

  const filteredNotices = notices.filter((notice) => {
    const matchesTab = activeTab === "전체" || notice.tag === activeTab;
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[800px] mx-auto w-full px-4 sm:px-6 py-6 animate-in fade-in duration-500">
      {/* Header with Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          id="back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> 돌아가기
        </button>
      </div>

      {/* Hero Headline */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#191F28] tracking-tight">
          소식과 공지사항을<br />
          직접 확인해 보세요
        </h2>
      </div>

      {/* Search notice */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B95A1]" />
        <Input
          placeholder="궁금한 공지 키워드를 검색해 보세요"
          className="w-full h-[52px] pl-11 bg-white border-[#E5E8EB] rounded-xl text-[15px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Tabs */}
      <div className="flex border-b border-[#E5E8EB] mb-6 gap-5">
        {(["전체", "GUIDE", "MAINTENANCE", "EVENT"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedId(null);
            }}
            className={`font-extrabold text-[14.5px] pb-2.5 transition-all border-b-2 relative -bottom-[1px] cursor-pointer ${
              activeTab === tab
                ? "border-brand text-brand"
                : "border-transparent text-[#8B95A1] hover:text-[#4E5968]"
            }`}
          >
            {tab === "전체" ? "전체" : TAG_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Notice List */}
      <div className="space-y-3">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const isExpanded = expandedId === notice.id;
            return (
              <div
                key={notice.id}
                className={`bg-white rounded-3xl border transition-all ${
                  notice.isImportant
                    ? "border-brand border-[2px] shadow-sm"
                    : isExpanded
                      ? "border-[#F2F4F6] shadow-sm bg-[#F9FAFB]"
                      : "border-[#F2F4F6] hover:bg-[#F9FAFB] shadow-sm"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : notice.id)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10.5px] font-extrabold text-[#4E5968] bg-[#F2F4F6] px-2 py-0.5 rounded-md">
                        {TAG_LABELS[notice.tag]}
                      </span>
                      {notice.isImportant && (
                        <span className="text-[10.5px] font-extrabold text-brand bg-brand/10 px-2 py-0.5 rounded-md">
                          공지
                        </span>
                      )}
                    </div>
                    <h3 className={`font-extrabold text-[15px] sm:text-base leading-snug ${
                      notice.isImportant ? "text-[#191F28]" : "text-[#333D4B]"
                    }`}>
                      {notice.title}
                    </h3>
                    <div className="flex items-center text-xs text-[#8B95A1] font-medium gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{notice.createdAt.slice(0, 10).replaceAll("-", ".")}</span>
                    </div>
                  </div>

                  <div className="text-[#8B95A1] min-w-[24px] pt-1 flex justify-end">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-brand" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-6 pt-1 border-t border-[#E5E8EB] bg-[#F9FAFB] rounded-b-3xl animate-in slide-in-from-top-1 duration-200">
                    <p className="text-sm text-[#4E5968] font-medium leading-relaxed whitespace-pre-wrap pt-4">
                      {notice.content}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#F2F4F6] text-[#8B95A1] font-bold text-sm shadow-sm">
            등록된 공지사항이 존재하지 않습니다.
          </div>
        )}
      </div>
    </div>
  );
}
