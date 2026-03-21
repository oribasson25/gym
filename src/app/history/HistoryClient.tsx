"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { StatusBadge, WorkoutTypeBadge } from "@/components/ui/Badge";
import { ExerciseStatus, WorkoutType, MuscleGroup } from "@/types";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type SessionExercise = {
  id: string;
  exerciseId: string;
  weightUsedKg: number;
  status: ExerciseStatus;
  sets: number;
  reps: number;
  exercise: {
    id: string;
    name: string;
    nameHe: string;
    muscleGroup: MuscleGroup;
  };
};

type Session = {
  id: string;
  workoutType: WorkoutType;
  startedAt: string;
  completedAt: string;
  difficultyRating: number | null;
  exercises: SessionExercise[];
};

interface HistoryClientProps {
  sessions: Session[];
  exercises: { id: string; name: string; nameHe: string; muscleGroup: MuscleGroup }[];
  viewingUserName?: string;
}

const TABS = ["היסטוריה", "גרף משקל"];

export function HistoryClient({ sessions, exercises, viewingUserName }: HistoryClientProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExerciseId, setSelectedExerciseId] = useState(
    exercises[0]?.id ?? ""
  );
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const selectedExercise = exercises.find((e) => e.id === selectedExerciseId);

  // Build chart data for selected exercise
  const chartData = sessions
    .filter((s) =>
      s.exercises.some((e) => e.exerciseId === selectedExerciseId)
    )
    .map((s) => {
      const ex = s.exercises.find((e) => e.exerciseId === selectedExerciseId)!;
      return {
        date: format(new Date(s.completedAt), "d/M"),
        weight: ex.weightUsedKg,
        status: ex.status,
      };
    })
    .reverse();

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            {viewingUserName ? `היסטוריה — ${viewingUserName}` : "היסטוריה"}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm">{sessions.length} אימונים מוקלטים</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                activeTab === i
                  ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: History */}
        {activeTab === 0 && (
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-4xl mb-3">🏋️</p>
                <p className="text-slate-500">עדיין אין אימונים מוקלטים</p>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card
                  key={session.id}
                  padding="sm"
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedSession(
                      expandedSession === session.id ? null : session.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <WorkoutTypeBadge type={session.workoutType} />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {format(new Date(session.completedAt), "d בMMM yyyy", {
                            locale: he,
                          })}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {session.exercises.length} תרגילים
                          {session.difficultyRating && (
                            <span className="mr-2">
                              · קושי {session.difficultyRating}/10
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-slate-400 dark:text-slate-500 transition-transform duration-200",
                        expandedSession === session.id && "rotate-180"
                      )}
                    >
                      ▾
                    </span>
                  </div>

                  {expandedSession === session.id && (
                    <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-3">
                      {session.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-700 dark:text-slate-200">{ex.exercise.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">
                              {ex.sets}×{ex.reps} · {ex.weightUsedKg} ק״ג
                            </p>
                          </div>
                          <StatusBadge status={ex.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* Tab: Weight Chart */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Exercise selector */}
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3
                         text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/30
                         focus:border-primary transition-all"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} — {ex.nameHe}
                </option>
              ))}
            </select>

            <Card>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">
                {selectedExercise?.name}
              </h3>
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
                התקדמות משקל (ק״ג)
              </p>

              {chartData.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <p>אין נתונים לתרגיל זה</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#94A3B8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      formatter={(v) => [`${v} ק״ג`, "משקל"]}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #E2E8F0",
                        fontSize: "13px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#6366F1"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#6366F1" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
