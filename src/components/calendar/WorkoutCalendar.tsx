"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CalendarDay, WORKOUT_TYPES, WorkoutType, ScheduledItem, TYPE_TO_SLUG } from "@/types";
import Link from "next/link";

const DAY_NAMES = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const DAY_NAMES_FULL = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface WorkoutCalendarProps {
  initialDays: CalendarDay[];
  initialStreak: number;
  initialScheduledMap: Record<string, ScheduledItem[]>;
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

export function WorkoutCalendar({ initialDays, initialStreak, initialScheduledMap }: WorkoutCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [days, setDays] = useState<CalendarDay[]>(initialDays);
  const [streak, setStreak] = useState(initialStreak);
  const [scheduledMap, setScheduledMap] = useState<Record<string, ScheduledItem[]>>(initialScheduledMap);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  // Schedule modals
  const [scheduleDate, setScheduleDate] = useState<string | null>(null);
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState<{ dayOfWeek: number; workoutType: string }[]>([]);
  const [savingRecurring, setSavingRecurring] = useState(false);

  // Scheduled day detail modal
  const [scheduledDayDate, setScheduledDayDate] = useState<string | null>(null);
  const [showAddMore, setShowAddMore] = useState(false);

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
        setScheduledMap(data.scheduledMap || {});
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const fetchRecurring = useCallback(async () => {
    try {
      const res = await fetch("/api/scheduled-workouts");
      if (res.ok) {
        const data = await res.json();
        setRecurringData(
          (data.recurring || []).map((r: { dayOfWeek: number; workoutType: string }) => ({
            dayOfWeek: r.dayOfWeek,
            workoutType: r.workoutType,
          }))
        );
      }
    } catch {
      // ignore
    }
  }, []);

  const goToPrev = () => {
    setDirection(-1);
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    setYear(newYear);
    setMonth(newMonth);
    fetchMonth(newYear, newMonth);
  };

  const goToNext = () => {
    if (isCurrentMonth) return;
    setDirection(1);
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    setYear(newYear);
    setMonth(newMonth);
    fetchMonth(newYear, newMonth);
  };

  // Schedule a specific date
  const handleScheduleDate = async (workoutType: WorkoutType, fromDayModal?: boolean) => {
    const targetDate = fromDayModal ? scheduledDayDate : scheduleDate;
    if (!targetDate) return;
    await fetch("/api/scheduled-workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutType, date: targetDate }),
    });
    if (fromDayModal) {
      setShowAddMore(false);
    } else {
      setScheduleDate(null);
    }
    await fetchMonth(year, month);
  };

  // Delete a specific scheduled workout
  const handleDeleteSchedule = async (id: string) => {
    await fetch(`/api/scheduled-workouts?id=${id}`, { method: "DELETE" });
    await fetchMonth(year, month);
  };

  // Delete ALL schedules
  const handleClearAll = async () => {
    await fetch("/api/scheduled-workouts?all=true", { method: "DELETE" });
    setScheduledDayDate(null);
    setRecurringData([]);
    await fetchMonth(year, month);
  };

  // Save recurring schedule
  const handleSaveRecurring = async (dayOfWeek: number, workoutType: string) => {
    setSavingRecurring(true);
    await fetch("/api/scheduled-workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutType, dayOfWeek }),
    });
    setRecurringData((prev) => {
      const filtered = prev.filter((r) => r.dayOfWeek !== dayOfWeek);
      return [...filtered, { dayOfWeek, workoutType }];
    });
    setSavingRecurring(false);
    fetchMonth(year, month);
  };

  const handleRemoveRecurring = async (dayOfWeek: number) => {
    const res = await fetch("/api/scheduled-workouts");
    if (res.ok) {
      const data = await res.json();
      const toDelete = (data.recurring || []).find(
        (r: { dayOfWeek: number; id: string }) => r.dayOfWeek === dayOfWeek
      );
      if (toDelete) {
        await fetch(`/api/scheduled-workouts?id=${toDelete.id}`, { method: "DELETE" });
        setRecurringData((prev) => prev.filter((r) => r.dayOfWeek !== dayOfWeek));
        fetchMonth(year, month);
      }
    }
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
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

  // Get data for the scheduled day modal
  const scheduledDayItems = scheduledDayDate ? (scheduledMap[scheduledDayDate] || []) : [];
  const scheduledDayWorkouts = scheduledDayDate ? (dayMap.get(scheduledDayDate)?.workouts || []) : [];

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
            {/* Recurring schedule button */}
            <button
              onClick={() => {
                fetchRecurring();
                setShowRecurring(true);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-90 transition-all"
              title="לוח זמנים קבוע"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
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
                return <div key={`empty-${i}`} className="h-11" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const calDay = dayMap.get(dateStr);
              const isToday = day === todayDate && month === todayMonth && year === todayYear;
              const hasWorkout = !!calDay && calDay.workouts.length > 0;
              const scheduled = scheduledMap[dateStr];
              const hasScheduled = !!scheduled && scheduled.length > 0;
              const isFuture = new Date(dateStr) >= new Date(today.toISOString().split("T")[0]);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => {
                    if (hasScheduled) {
                      // Open scheduled day detail modal
                      setScheduledDayDate(dateStr);
                      setShowAddMore(false);
                    } else if (hasWorkout) {
                      setSelectedDay(calDay);
                    } else if (isFuture || isToday) {
                      setScheduleDate(dateStr);
                    }
                  }}
                  className={cn(
                    "h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90",
                    isToday && "bg-primary/10 dark:bg-primary/20",
                    hasScheduled && !hasWorkout && "ring-2 ring-inset ring-primary/30 dark:ring-primary/40",
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
                  {hasWorkout ? (
                    <div className="flex gap-0.5">
                      {calDay.workouts.slice(0, 3).map((w, wi) => (
                        <div
                          key={wi}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: getWorkoutColor(w.workoutType) }}
                        />
                      ))}
                    </div>
                  ) : hasScheduled ? (
                    <div className="flex gap-0.5">
                      {scheduled.slice(0, 3).map((item, wi) => (
                        <div
                          key={wi}
                          className="w-1.5 h-1.5 rounded-full opacity-40"
                          style={{ backgroundColor: getWorkoutColor(item.workoutType) }}
                        />
                      ))}
                    </div>
                  ) : null}
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

      {/* Day detail modal (completed workouts only, no scheduled) */}
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

      {/* Scheduled day detail modal */}
      <Modal
        open={!!scheduledDayDate && !showAddMore}
        onClose={() => setScheduledDayDate(null)}
        title={scheduledDayDate ? `${parseInt(scheduledDayDate.split("-")[2])} ${HEBREW_MONTHS[parseInt(scheduledDayDate.split("-")[1]) - 1]}` : ""}
      >
        {scheduledDayDate && (
          <div className="space-y-4">
            {/* Scheduled workouts list */}
            {scheduledDayItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">אימונים מתוזמנים</p>
                {scheduledDayItems.map((item, idx) => {
                  const wasCompleted = scheduledDayWorkouts.some(
                    (w) => w.workoutType === item.workoutType
                  );
                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50"
                    >
                      <span className="text-2xl">{getWorkoutIcon(item.workoutType)}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {getWorkoutLabel(item.workoutType)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {wasCompleted ? (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                              </svg>
                              בוצע
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                              </svg>
                              ממתין
                            </span>
                          )}
                          {item.isRecurring && (
                            <span className="text-xs text-slate-300 dark:text-slate-500">
                              (קבוע)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!wasCompleted && TYPE_TO_SLUG[item.workoutType as WorkoutType] && (
                          <Link
                            href={`/workout/${TYPE_TO_SLUG[item.workoutType as WorkoutType]}`}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-white active:scale-90 transition-all"
                          >
                            התחל
                          </Link>
                        )}
                        <button
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-90"
                          title="מחק תזמון"
                        >
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022 1.005 11.36A2.75 2.75 0 007.77 20h4.46a2.75 2.75 0 002.75-2.689l1.006-11.36.148.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed workouts for this day */}
            {scheduledDayWorkouts.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase">אימונים שבוצעו</p>
                {scheduledDayWorkouts.map((w) => (
                  <div
                    key={w.sessionId}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-green-50 dark:bg-green-900/20"
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
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-500">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <Button
                fullWidth
                onClick={() => setShowAddMore(true)}
              >
                + הוסף אימון נוסף
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={handleClearAll}
                className="!text-red-500"
              >
                נקה את כל התזמונים
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add more workouts to scheduled day */}
      <Modal
        open={!!scheduledDayDate && showAddMore}
        onClose={() => setShowAddMore(false)}
        title="הוסף אימון"
      >
        <div className="space-y-2">
          {WORKOUT_TYPES.map((wt) => (
            <button
              key={wt.type}
              onClick={() => handleScheduleDate(wt.type, true)}
              className="flex items-center gap-3 w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 active:scale-[0.98] transition-all"
            >
              <span className="text-2xl">{wt.icon}</span>
              <div className="flex-1 text-right">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{wt.labelHe}</p>
                <p className="text-xs text-slate-400">{wt.description}</p>
              </div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wt.color }} />
            </button>
          ))}
        </div>
      </Modal>

      {/* Schedule specific date modal (for days without schedules) */}
      <Modal
        open={!!scheduleDate}
        onClose={() => setScheduleDate(null)}
        title={scheduleDate ? `תזמן אימון ל-${parseInt(scheduleDate.split("-")[2])} ${HEBREW_MONTHS[parseInt(scheduleDate.split("-")[1]) - 1]}` : ""}
      >
        <div className="space-y-2">
          {WORKOUT_TYPES.map((wt) => (
            <button
              key={wt.type}
              onClick={() => handleScheduleDate(wt.type)}
              className="flex items-center gap-3 w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50 active:scale-[0.98] transition-all"
            >
              <span className="text-2xl">{wt.icon}</span>
              <div className="flex-1 text-right">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{wt.labelHe}</p>
                <p className="text-xs text-slate-400">{wt.description}</p>
              </div>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wt.color }} />
            </button>
          ))}
        </div>
      </Modal>

      {/* Recurring schedule modal */}
      <Modal
        open={showRecurring}
        onClose={() => setShowRecurring(false)}
        title="לוח זמנים שבועי"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">בחר סוג אימון לכל יום בשבוע</p>
          {DAY_NAMES_FULL.map((dayName, dayIndex) => {
            const current = recurringData.find((r) => r.dayOfWeek === dayIndex);
            return (
              <div key={dayIndex} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-14 flex-shrink-0">
                  {dayName}
                </span>
                <select
                  value={current?.workoutType || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      handleSaveRecurring(dayIndex, val);
                    } else {
                      handleRemoveRecurring(dayIndex);
                    }
                  }}
                  disabled={savingRecurring}
                  className="flex-1 rounded-xl px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— יום חופש —</option>
                  {WORKOUT_TYPES.map((wt) => (
                    <option key={wt.type} value={wt.type}>
                      {wt.icon} {wt.labelHe}
                    </option>
                  ))}
                </select>
                {current && (
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getWorkoutColor(current.workoutType) }} />
                )}
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
