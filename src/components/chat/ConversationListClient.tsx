"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Conversation = {
  userId: string;
  userName: string;
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  unreadCount: number;
};

export function ConversationListClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchConversations().then(() => setLoading(false));
  }, [fetchConversations]);

  // Polling
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchConversations();
      }
    }, 5000);
    return () => clearInterval(id);
  }, [fetchConversations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6">
        הודעות
      </h1>

      {conversations.length === 0 && (
        <p className="text-center text-slate-400 text-sm mt-10">
          אין מתאמנים במערכת
        </p>
      )}

      <div className="space-y-2">
        {conversations.map((conv) => {
          const timeStr = conv.lastMessage
            ? new Date(conv.lastMessage.createdAt).toLocaleDateString("he-IL", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <Link
              key={conv.userId}
              href={`/chat/${conv.userId}`}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98]",
                "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700",
                conv.unreadCount > 0 && "border-primary/30 bg-primary-50/30 dark:bg-primary-900/10"
              )}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-lg">
                  {conv.userName.charAt(0)}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn(
                    "font-semibold text-slate-800 dark:text-slate-100",
                    conv.unreadCount > 0 && "font-bold"
                  )}>
                    {conv.userName}
                  </h3>
                  {timeStr && (
                    <span className="text-xs text-slate-400 flex-shrink-0 mr-2">
                      {timeStr}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className={cn(
                    "text-sm truncate mt-0.5",
                    conv.unreadCount > 0
                      ? "text-slate-700 dark:text-slate-300 font-medium"
                      : "text-slate-400"
                  )}>
                    {conv.lastMessage.isFromMe && "את/ה: "}
                    {conv.lastMessage.content}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {conv.unreadCount > 0 && (
                <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
