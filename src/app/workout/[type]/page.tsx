"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { ExerciseAnimation } from "@/components/exercise/ExerciseAnimation";
import { StatusButtons } from "@/components/exercise/StatusButtons";
import { WorkoutProgress } from "@/components/workout/WorkoutProgress";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { SLUG_TO_TYPE, ExerciseStatus, WORKOUT_TYPES } from "@/types";
import { WorkoutTypeSlug } from "@/types";
import { cn } from "@/lib/utils/cn";

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.type as WorkoutTypeSlug;
  const workoutType = SLUG_TO_TYPE[slug];
  const workoutInfo = WORKOUT_TYPES.find((wt) => wt.type === workoutType);

  const {
    sessionId,
    exercises,
    currentIndex,
    statuses,
    isComplete,
    currentExercise,
    loading,
    error,
    startSession,
    markExercise,
    updateWeight,
  } = useWorkoutSession();

  const [started, setStarted] = useState(false);
  const [direction, setDirection] = useState(1);
  const prevIndex = useRef(0);

  useEffect(() => {
    if (currentIndex > prevIndex.current) setDirection(1);
    else if (currentIndex < prevIndex.current) setDirection(-1);
    prevIndex.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (isComplete && sessionId) {
      router.push(`/workout/summary?sessionId=${sessionId}`);
    }
  }, [isComplete, sessionId, router]);

  const handleStart = async () => {
    const id = await startSession(workoutType);
    if (id) setStarted(true);
  };

  const handleMark = async (status: ExerciseStatus) => {
    if (!currentExercise) return;
    await markExercise(status, currentExercise.weightUsedKg);
  };

  if (!workoutInfo) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500 dark:text-slate-400">סוג אימון לא נמצא</p>
        </div>
      </AppShell>
    );
  }

  // Pre-start screen
  if (!started) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 w-full"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto"
              style={{ backgroundColor: workoutInfo.bgColor }}
            >
              {workoutInfo.icon}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {workoutInfo.labelHe}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{workoutInfo.description}</p>
            </div>

            {error && (
              <Card padding="sm" className="bg-danger-50 border-danger/20">
                <p className="text-danger text-sm font-medium">{error}</p>
              </Card>
            )}

            <div className="flex flex-col gap-3 w-full">
              <Button
                fullWidth
                size="lg"
                loading={loading}
                onClick={handleStart}
                style={{ backgroundColor: workoutInfo.color }}
                className="shadow-xl"
              >
                התחל אימון ▶
              </Button>
              <Button variant="ghost" fullWidth onClick={() => router.back()}>
                ← חזרה
              </Button>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  if (started && exercises.length === 0) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[80vh] gap-5">
          <div className="text-5xl">📋</div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">אין תרגילים בתוכנית</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">הוסף תרגילים לתוכנית לפני תחילת האימון</p>
          </div>
          <Button onClick={() => router.push(`/plans/${slug}`)}>
            ערוך תוכנית
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!currentExercise) return null;

  return (
    <AppShell>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 min-h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: workoutInfo.bgColor }}
          >
            {workoutInfo.icon}
          </div>
          <div className="flex-1">
            <WorkoutProgress
              total={exercises.length}
              current={currentIndex}
              statuses={statuses}
            />
          </div>
          <button
            onClick={() => {
              if (confirm("לצאת מהאימון? ההתקדמות לא תישמר.")) {
                router.push("/dashboard");
              }
            }}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center
                       text-slate-400 dark:text-slate-500 active:scale-90 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Exercise card with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Card padding="none" className="overflow-hidden">
              {/* Animation area */}
              <div className="flex justify-center p-6 pb-4">
                <ExerciseAnimation
                  muscleGroup={currentExercise.muscleGroup}
                  lottieFile={currentExercise.lottieFile}
                  size="lg"
                />
              </div>

              {/* Exercise info */}
              <div className="px-6 pb-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {currentExercise.name}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{currentExercise.nameHe}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                    {currentExercise.sets} סטים × {currentExercise.reps} חזרות
                  </p>
                </div>

                {/* Weight selector */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">משקל לאימון</p>
                    {currentExercise.suggestion && (
                      <SuggestionBadge
                        lastWeight={currentExercise.suggestion.lastWeight}
                        lastStatus={currentExercise.suggestion.lastStatus}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateWeight(
                          currentIndex,
                          Math.max(0, currentExercise.weightUsedKg - 2.5)
                        )
                      }
                      className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center
                                 justify-center text-slate-600 dark:text-slate-300 font-bold text-xl active:scale-90 transition-all"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-100">
                        {currentExercise.weightUsedKg}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-base font-medium mr-1">ק״ג</span>
                    </div>
                    <button
                      onClick={() =>
                        updateWeight(
                          currentIndex,
                          currentExercise.weightUsedKg + 2.5
                        )
                      }
                      className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center
                                 justify-center text-slate-600 dark:text-slate-300 font-bold text-xl active:scale-90 transition-all"
                    >
                      +
                    </button>
                  </div>
                  {currentExercise.suggestion?.reasoning && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                      {currentExercise.suggestion.reasoning}
                    </p>
                  )}
                </div>

                {/* Status buttons */}
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 text-center">
                    איך הלך התרגיל?
                  </p>
                  <StatusButtons
                    onSelect={handleMark}
                    disabled={loading}
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function SuggestionBadge({
  lastWeight,
  lastStatus,
}: {
  lastWeight: number | null;
  lastStatus: ExerciseStatus | null;
}) {
  if (!lastWeight) return <span className="text-xs text-slate-400 dark:text-slate-500">אימון ראשון</span>;

  const statusIcon = lastStatus === "SUCCESS" ? "✓" : lastStatus === "PARTIAL" ? "~" : lastStatus === "FAIL" ? "✗" : "";
  const statusColor =
    lastStatus === "SUCCESS"
      ? "text-success"
      : lastStatus === "PARTIAL"
      ? "text-warning"
      : "text-danger";

  return (
    <span className={cn("text-xs font-semibold", statusColor)}>
      {statusIcon} {lastWeight} ק״ג לפני
    </span>
  );
}
