"use client";

import { useState, useEffect, useCallback } from "react";

export function useNotifications(intervalMs = 15000) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetchCount();

    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchCount();
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [fetchCount, intervalMs]);

  return { unreadCount, refresh: fetchCount };
}
