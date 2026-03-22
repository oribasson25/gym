"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/Modal";
import { CalendarDay, WORKOUT_TYPES } from "@/types";

const DAY_NAMES = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface WorkoutCalendarProps {
  initialDays: CalendarDay[];
  initialStreak: number;
}

function getWorkoutColor(workoutType: string): string {
  return WORKOUT_TYPES.find((wt) => wt.type === workoutType)?.color || "#6366F1";
}

function getWorkoutLabel(workoutType: string): string {
  return WORKOUT_TYPES.find((wt) => wt.type === workoutType)?.labelHe || workoutType;
}

function getWorkoutIcon(workoutType: string): string {
  return WORKOUT_TYPES.find((wt) => wt.type === workoutType)?.icon || "";
}

export function WorkoutCalendar({ initialDays, initialStreak }: WorkoutCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState<CalendarDay[]>(initialDays);
  const [streak, setStreak] = useState(initialStreak);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const monthStr = `${y}-${String(m + 1).padStart(2, "0")}`;
      const res = await fetch(`/api/sessions/calendar?month=${monthStr}`);
      if (res.ok) {
        const data = await res.json();
        setDays(data.days);
        setStreak(data.streak);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const goToPrev = () => {
    setDirection(-1);
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
      fetchMonth(year - 1, 11);
    } else {
      setMonth(month - 1);
      fetchMonth(year, month - 1);
    }
  };

  const goToNext = () => {
    if (isCurrentMonth) return;
    setDirection(1);
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
      fetchMonth(year + 1, 0);
    } else {
      setMonth(month + 1);
      fetchMonth(year, month + 1);
    }
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayMap = new Map<string, CalendarDay>();
  for (const d of days) {
    dayMap.set(d.date, d);
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  return (
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {HEBREW_MONTHS[month]} {year}
            </h3>
            {streak > 0 && (
              <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                {streak} ימים ברצף
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToNext}
              disabled={isCurrentMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 active:scale-90 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            <button
              onClick={goToPrev}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((name) => (
            <div key={name} className="text-center text-[11px] font-medium text-slate-400 py-1">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="h-10" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const calDay = dayMap.get(dateStr);
              const isToday = day === todayDate && month === todayMonth && year === todayYear;
              const hasWorkout = !!calDay && calDay.workouts.length > 0;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => hasWorkout && setSelectedDay(calDay)}
                  className={cn(
                    "h-10 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all",
                    hasWorkout && "active:scale-90 cursor-pointer",
                    isToday && "bg-primary/10 dark:bg-primary/20",
                    !hasWorkout && !isToday && "cursor-default"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm leading-none",
                      isToday ? "font-bold text-primary" : "text-slate-600 dark:text-slate-300",
                    )}
                  >
                    {day}
                  </span>
                  {hasWorkout && (
                    <div className="flex gap-0.5">
                      {calDay.workouts.slice(0, 3).map((w, wi) => (
                        <div
                          key={wi}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getWorkoutColor(w.workoutType) }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Day detail modal */}
      <Modal
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `${parseInt(selectedDay.date.split("-")[2])} ${HEBREW_MONTHS[parseInt(selectedDay.date.split("-")[1]) - 1]}` : ""}
      >
        {selectedDay && (
          <div className="space-y-3">
            {selectedDay.workouts.map((w) => (
              <div
                key={w.sessionId}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50"
              >
                <span className="text-2xl">{getWorkoutIcon(w.workoutType)}</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {getWorkoutLabel(w.workoutType)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {w.exerciseCount} תרגילים
                    {w.difficultyRating && ` · קושי ${w.difficultyRating}/10`}
                  </p>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getWorkoutColor(w.workoutType) }}
                />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
