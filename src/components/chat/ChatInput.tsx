"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 px-3 py-2">
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="כתוב הודעה..."
          disabled={disabled}
          className={cn(
            "flex-1 rounded-full px-4 py-2.5 text-sm",
            "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100",
            "placeholder:text-slate-400 outline-none",
            "focus:ring-2 focus:ring-primary/30"
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || !text.trim()}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            "bg-primary text-white transition-all active:scale-90",
            "disabled:opacity-50 disabled:active:scale-100"
          )}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 rotate-180">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
