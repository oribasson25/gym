"use client";

import { cn } from "@/lib/utils/cn";

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isMine: boolean;
}

export function MessageBubble({ content, createdAt, isMine }: MessageBubbleProps) {
  const time = new Date(createdAt).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isMine
            ? "bg-primary text-white rounded-bl-sm"
            : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-br-sm border border-slate-100 dark:border-slate-600"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isMine ? "text-white/70" : "text-slate-400"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
