import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { Input } from "@/src/shared/components/ui/Input";
import { Button } from "@/src/shared/components/ui/Button";
import { cn } from "@/src/shared/lib/utils";
import { useChatMessages } from "@/src/features/chat/lib/useChatMessages";
import { useChatSocket } from "@/src/features/chat/lib/useChatSocket";

interface CompetitionChatPanelProps {
  competitionId: number;
  myUserId: number | null;
}

export function CompetitionChatPanel({ competitionId, myUserId }: CompetitionChatPanelProps) {
  const [message, setMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const channelId = String(competitionId);
  const historyQuery = useChatMessages("COMPETITION", channelId);
  const { liveMessages, connected, sendMessage } = useChatSocket("COMPETITION", channelId);

  const historyMessages = [...(historyQuery.data?.content ?? [])].reverse();
  const allMessages = [...historyMessages, ...liveMessages];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
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
                    "px-4 py-2 rounded-[16px] text-sm max-w-[220px] break-words shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
                    isMe
                      ? "bg-brand text-white rounded-br-sm"
                      : "bg-surface border border-border-color rounded-bl-sm",
                  )}
                >
                  {msg.message}
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
        <div className="flex items-center relative">
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
  );
}
