"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { Button } from "@/components/ui/Button";

export function PushOptIn() {
  const { permissionState, isSubscribed, loading, subscribe } = usePushSubscription();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Only show if push is supported, not yet decided, and not previously dismissed
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("PushManager" in window)) return;

    const wasDismissed = localStorage.getItem("push-dismissed") === "true";
    if (!wasDismissed && Notification.permission === "default") {
      setDismissed(false);
    }
  }, []);

  if (dismissed || permissionState !== "default" || isSubscribed) return null;

  const handleDismiss = () => {
    localStorage.setItem("push-dismissed", "true");
    setDismissed(true);
  };

  const handleEnable = async () => {
    await subscribe();
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 flex items-center gap-3"
      >
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            רוצה לקבל התראות?
          </p>
          <p className="text-xs text-slate-400">
            תזכורות אימון והודעות חדשות ישירות לטלפון
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="text-xs text-slate-400 px-2 py-1"
          >
            לא עכשיו
          </button>
          <Button
            onClick={handleEnable}
            disabled={loading}
            className="!text-xs !px-3 !py-1.5"
          >
            {loading ? "..." : "הפעל"}
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
