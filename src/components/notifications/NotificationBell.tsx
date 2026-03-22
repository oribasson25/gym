"use client";

import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const { unreadCount, refresh } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center
                   justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-all"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        open={open}
        onClose={() => {
          setOpen(false);
          refresh();
        }}
      />
    </>
  );
}
