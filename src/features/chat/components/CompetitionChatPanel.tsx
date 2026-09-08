import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, ImagePlus, X } from "lucide-react";
import { Input } from "@/src/shared/components/ui/Input";
import { Button } from "@/src/shared/components/ui/Button";
import { cn, toImageSrc } from "@/src/shared/lib/utils";
import { uploadImage } from "@/src/features/community/api/posts";
import { useChatMessages } from "@/src/features/chat/lib/useChatMessages";
import { useChatSocket } from "@/src/features/chat/lib/useChatSocket";

interface CompetitionChatPanelProps {
  competitionId: number;
  myUserId: number | null;
}

export function CompetitionChatPanel({ competitionId, myUserId }: CompetitionChatPanelProps) {
  const [message, setMessage] = useState("");
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const channelId = String(competitionId);
  const historyQuery = useChatMessages("COMPETITION", channelId);
  const { liveMessages, connected, sendMessage, disconnectReason } = useChatSocket("COMPETITION", channelId);

  const historyMessages = [...(historyQuery.data?.content ?? [])].reverse();
  const allMessages = [...historyMessages, ...liveMessages];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = () => {
    if (!message.trim() && !pendingImageUrl) return;
    sendMessage(message, pendingImageUrl);
    setMessage("");
    setPendingImageUrl(null);
  };

  const handleChatImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setPendingImageUrl(url);
    } catch (error) {
      console.error("이미지 업로드 실패", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bg-main/50">
        {allMessages.map((msg) => {
          const isMe = msg.authorId === myUserId;
          const time = new Date(msg.createdAt).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
            >
              {!isMe && (
                <Link
                  to={`/users/${encodeURIComponent(msg.authorNickname)}`}
                  className="text-xs text-text-secondary hover:underline font-semibold mb-1 ml-1 transition-colors cursor-pointer"
                >
                  {msg.authorNickname}
                </Link>
              )}
              <div className="flex items-end gap-1.5">
                {isMe && (
                  <span className="text-[10px] text-text-secondary">{time}</span>
                )}
                <div
                  className={cn(
                    "rounded-[16px] max-w-[220px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden",
                    isMe
                      ? "bg-brand text-white rounded-br-sm"
                      : "bg-surface border border-border-color rounded-bl-sm",
                    msg.imageUrl ? "p-1" : "px-4 py-2 text-sm break-words",
                  )}
                >
                  {msg.imageUrl && (
                    <a href={toImageSrc(msg.imageUrl)} target="_blank" rel="noopener noreferrer">
                      <img
                        src={toImageSrc(msg.imageUrl)}
                        alt="첨부 이미지"
                        className="max-w-full rounded-[12px]"
                      />
                    </a>
                  )}
                  {msg.message && (
                    <span className={cn(msg.imageUrl && "block px-3 py-2 text-sm")}>{msg.message}</span>
                  )}
                </div>
                {!isMe && (
                  <span className="text-[10px] text-text-secondary">{time}</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      <div className="p-3 border-t border-border-color bg-surface shrink-0 rounded-b-[16px]">
        {disconnectReason ? (
          <p className="text-center text-sm text-down py-2 font-medium">{disconnectReason}</p>
        ) : (
          <div className="space-y-2">
            {pendingImageUrl && (
              <div className="relative w-16 h-16 rounded-[12px] overflow-hidden border border-border-color">
                <img src={toImageSrc(pendingImageUrl)} alt="첨부 예정 이미지" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPendingImageUrl(null)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 relative">
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                disabled={!connected || uploadingImage || !!pendingImageUrl}
                className="shrink-0 w-9 h-9 rounded-[12px] border border-border-color flex items-center justify-center text-text-secondary hover:bg-bg-main transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ImagePlus className="w-4 h-4" />
              </button>
              <input
                ref={chatFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleChatImageSelect}
              />
              <div className="flex-1 relative">
                <Input
                  className="pr-12 bg-bg-main border-border-color focus-visible:ring-brand shadow-sm rounded-[16px] py-6"
                  placeholder={connected ? "메시지 입력..." : "연결 중..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend();
                    }
                  }}
                  disabled={!connected}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!connected}
                  className="absolute right-1.5 top-1.5 bottom-1.5 w-9 h-9 rounded-[12px] bg-brand text-white border-transparent hover:bg-brand/90"
                >
                  <Send className="w-4 h-4 ml-[-2px]" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
