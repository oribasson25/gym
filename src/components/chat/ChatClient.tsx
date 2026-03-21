"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
};

interface ChatClientProps {
  currentUserId: string;
  partnerId: string;
  partnerName: string;
}

export function ChatClient({ currentUserId, partnerId, partnerName }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCreatedAt = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(
    async (after?: string) => {
      const params = new URLSearchParams({ partnerId });
      if (after) params.set("after", after);

      try {
        const res = await fetch(`/api/messages?${params}`);
        if (!res.ok) return;
        const data = await res.json();
        const newMessages: Message[] = data.messages;

        if (newMessages.length > 0) {
          lastCreatedAt.current = newMessages[newMessages.length - 1].createdAt;

          if (after) {
            setMessages((prev) => [...prev, ...newMessages]);
          } else {
            setMessages(newMessages);
          }
          setTimeout(scrollToBottom, 100);
        }
      } catch {
        // silently ignore
      }
    },
    [partnerId, scrollToBottom]
  );

  // Initial load
  useEffect(() => {
    fetchMessages().then(() => setLoading(false));
  }, [fetchMessages]);

  // Polling
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible" && lastCreatedAt.current) {
        fetchMessages(lastCreatedAt.current);
      }
    }, 3000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  const handleSend = async (content: string) => {
    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      receiverId: partnerId,
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);
    lastCreatedAt.current = tempMessage.createdAt;
    setTimeout(scrollToBottom, 50);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: partnerId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMessage.id ? data.message : m))
        );
      }
    } catch {
      // keep optimistic message
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 py-3">
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 text-center">
          {partnerName}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-20">
            אין הודעות עדיין. שלח הודעה ראשונה!
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            createdAt={msg.createdAt}
            isMine={msg.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}
