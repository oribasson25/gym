"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { DifficultySlider } from "@/components/workout/DifficultySlider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ShareCard } from "@/components/workout/ShareCard";
import { useShareWorkout } from "@/hooks/useShareWorkout";
import { WorkoutType, ExerciseStatus } from "@/types";

type SessionData = {
  workoutType: WorkoutType;
  completedAt: string;
  difficultyRating: number;
  exercises: {
    exercise: { nameHe: string };
    weightUsedKg: number;
    sets: number;
    reps: number;
    status: ExerciseStatus;
  }[];
  user?: { name: string };
};

function SummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { shareWorkout, isGenerating } = useShareWorkout(cardRef);
  const redirectTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup redirect timer
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleSave = async () => {
    if (!sessionId || rating === 0) return;
    setLoading(true);

    await fetch(`/api/sessions/${sessionId}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficultyRating: rating }),
    });

    // Fetch session data for share card
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setSessionData({
          ...data.session,
          difficultyRating: rating,
        });
      }
    } catch {
      // ignore
    }

    setSaved(true);
    setLoading(false);
  };

  const handleShare = async () => {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);
    await shareWorkout();
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className="text-8xl"
        >
          🏆
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">כל הכבוד!</h2>
          <p className="text-slate-500 dark:text-slate-400">האימון נשמר בהצלחה</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 w-full max-w-sm"
        >
          {sessionData && (
            <Button
              fullWidth
              size="lg"
              loading={isGenerating}
              onClick={handleShare}
            >
              שתף אימון
            </Button>
          )}
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push("/dashboard")}
          >
            חזור לדשבורד
          </Button>
        </motion.div>

        {/* Hidden share card for capture */}
        {sessionData && (
          <div style={{ position: "fixed", left: -9999, top: 0 }}>
            <ShareCard
              ref={cardRef}
              workoutType={sessionData.workoutType}
              completedAt={sessionData.completedAt}
              exercises={sessionData.exercises.map((e) => ({
                nameHe: e.exercise.nameHe,
                weightUsedKg: e.weightUsedKg,
                sets: e.sets,
                reps: e.reps,
                status: e.status,
              }))}
              difficultyRating={sessionData.difficultyRating}
              userName={sessionData.user?.name || ""}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="text-6xl mb-4">💪</div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">סיימת את האימון!</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          דרג את רמת הקושי כדי שנוכל להתאים את האימון הבא
        </p>
      </motion.div>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
            רמת קושי
          </h2>
          <p className="text-slate-400 text-sm">1 = קל מאוד · 10 = מקסימלי</p>
        </div>
        <DifficultySlider value={rating} onChange={setRating} />
      </Card>

      {rating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center"
        >
          {rating <= 3 && (
            <p className="text-sm text-success font-semibold">
              המשקל יעלה ב-10 ק״ג באימון הבא 📈
            </p>
          )}
          {rating >= 4 && rating <= 6 && (
            <p className="text-sm text-success font-semibold">
              המשקל יעלה ב-5 ק״ג באימון הבא 📈
            </p>
          )}
          {rating >= 7 && rating <= 8 && (
            <p className="text-sm text-primary font-semibold">
              המשקל יעלה ב-2.5 ק״ג באימון הבא 💪
            </p>
          )}
          {rating >= 9 && (
            <p className="text-sm text-slate-500 font-medium">
              המשקל יישאר זהה באימון הבא ⚡
            </p>
          )}
        </motion.div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          fullWidth
          size="lg"
          disabled={rating === 0}
          loading={loading}
          onClick={handleSave}
        >
          שמור אימון ✓
        </Button>
        <Button
          variant="ghost"
          fullWidth
          onClick={() => router.push("/dashboard")}
        >
          דלג ← חזור לדשבורד
        </Button>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <SummaryContent />
      </Suspense>
    </AppShell>
  );
}
