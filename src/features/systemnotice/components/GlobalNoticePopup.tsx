import { useEffect, useState } from "react";
import api from "@/src/shared/lib/api";

const SEVERITY_META: Record<string, { label: string; color: string; icon: string }> = {
  MAINTENANCE: { label: "점검 안내", color: "bg-[#3182F6]", icon: "🛠️" },
  INCIDENT: { label: "장애 안내", color: "bg-[#FF3B30]", icon: "🚨" },
  NOTICE: { label: "알림", color: "bg-[#4A5DF9]", icon: "📢" },
};

const DISMISSED_KEY = "dismissed_system_notices";

export function GlobalNoticePopup() {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const fetchActiveNotices = async () => {
      try {
        const response = await api.get("/system-notices/active");
        const dismissed: number[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
        setNotices(response.data.filter((n: any) => !dismissed.includes(n.id)));
      } catch (error) {
        console.error(error);
      }
    };
    fetchActiveNotices();
  }, []);

  const handleDismiss = (id: number) => {
    const dismissed: number[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]");
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, id]));
    setNotices((prev) => prev.filter((n) => n.id !== id));
  };

  if (notices.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {notices.map((notice) => {
        const meta = SEVERITY_META[notice.severity] ?? SEVERITY_META.NOTICE;
        return (
          <div key={notice.id} className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-4 animate-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`${meta.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                  {meta.icon} {meta.label}
                </span>
              </div>
              <button onClick={() => handleDismiss(notice.id)} className="text-neutral-400 hover:text-neutral-600 text-sm">
                ✕
              </button>
            </div>
            <p className="font-bold text-sm text-neutral-900 mt-2">{notice.title}</p>
            <p className="text-[13px] text-neutral-600 mt-1 leading-relaxed">{notice.message}</p>
          </div>
        );
      })}
    </div>
  );
}
