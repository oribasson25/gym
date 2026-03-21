"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { WorkoutTypeCard } from "@/components/workout/WorkoutTypeCard";
import { Button } from "@/components/ui/Button";
import { WORKOUT_TYPES, WorkoutType } from "@/types";
import Link from "next/link";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface DashboardClientProps {
  userName: string;
  userRole: string;
  lastByType: Record<WorkoutType, Date | null>;
  needsPhotoReminder: boolean;
}

export function DashboardClient({
  userName,
  userRole,
  lastByType,
  needsPhotoReminder,
}: DashboardClientProps) {
  const [showPhotoModal, setShowPhotoModal] = useState(needsPhotoReminder);

  const today = format(new Date(), "EEEE, d בMMM", { locale: he });

  return (
    <AppShell userName={userName}>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-slate-400 text-sm">{today}</p>
            <h1 className="text-2xl font-black text-slate-800">
              שלום, {userName.split(" ")[0]} 👋
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {needsPhotoReminder && (
              <button
                onClick={() => setShowPhotoModal(true)}
                className="relative w-10 h-10 rounded-2xl bg-danger-50 flex items-center
                           justify-center text-danger active:scale-90 transition-all"
              >
                📷
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border-2 border-white" />
              </button>
            )}
            <Link
              href="/profile"
              className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center
                         justify-center text-primary font-bold text-lg active:scale-90 transition-all"
            >
              {userName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>

        {/* Section title */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-700">בחר סוג אימון</h2>
          <p className="text-slate-400 text-sm">המשקל המוצע יתבסס על האימון הקודם</p>
        </div>

        {/* Workout type cards */}
        <div className="space-y-3">
          {WORKOUT_TYPES.map((wt, i) => (
            <motion.div
              key={wt.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3 }}
            >
              <WorkoutTypeCard
                info={wt}
                lastSessionDate={lastByType[wt.type]}
                isAdmin={userRole === "ADMIN"}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Monthly Photo Reminder Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowPhotoModal(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 pb-8 shadow-2xl"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

              <div className="text-center space-y-3 mb-6">
                <div className="text-5xl mb-2">📷</div>
                <h3 className="text-xl font-black text-slate-800">
                  זמן לתמונת תקדמות!
                </h3>
                <p className="text-slate-500 text-sm">
                  היום ה-1 לחודש — צלם תמונה לפני הארוחה הראשונה,
                  באותה תאורה כמו בחודש שעבר.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => setShowPhotoModal(false)}
                >
                  אחר כך
                </Button>
                <Link href="/progress-photo" className="flex-1">
                  <Button fullWidth onClick={() => setShowPhotoModal(false)}>
                    צלם עכשיו 📷
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
