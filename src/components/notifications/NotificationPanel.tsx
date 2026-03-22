"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata: string | null;
  createdAt: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "עכשיו";
  if (diffMin < 60) return `לפני ${diffMin} דק׳`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `לפני ${diffHrs} שע׳`;
  const diffDays = Math.floor(diffHrs / 24);
  return `לפני ${diffDays} ימים`;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=30");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const markAllRead = async () => {
    await fetch("/api/notifications/read", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (notif: Notification) => {
    // Mark as read
    if (!notif.read) {
      await fetch("/api/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      });
    }

    // Navigate based on type
    if (notif.type === "CHAT_MESSAGE") {
      router.push("/chat");
    } else {
      router.push("/dashboard");
    }
    onClose();
  };

  const getIcon = (type: string) => {
    if (type === "CHAT_MESSAGE") return "💬";
    if (type === "WORKOUT_REMINDER") return "🏋️";
    return "🔔";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col"
          >
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mt-3 mb-2" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">התראות</h3>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-medium text-primary active:opacity-70"
                >
                  סמן הכל כנקרא
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">אין התראות</p>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full flex items-start gap-3 p-3 rounded-2xl text-right transition-all active:scale-[0.98] ${
                      notif.read
                        ? "bg-slate-50 dark:bg-slate-700/30"
                        : "bg-primary/5 dark:bg-primary/10"
                    }`}
                  >
                    <span className="text-xl mt-0.5">{getIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${notif.read ? "text-slate-600 dark:text-slate-300" : "text-slate-800 dark:text-slate-100"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{notif.body}</p>
                      <p className="text-[10px] text-slate-300 dark:text-slate-500 mt-1">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
