"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  SLUG_TO_TYPE,
  WORKOUT_TYPES,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
  WorkoutTypeSlug,
} from "@/types";
import { cn } from "@/lib/utils/cn";

type PlanExercise = {
  exerciseId: string;
  name: string;
  nameHe: string;
  muscleGroup: MuscleGroup;
  orderIndex: number;
  sets: number;
  reps: number;
  targetWeightKg: number;
};

type LibExercise = {
  id: string;
  name: string;
  nameHe: string;
  muscleGroup: MuscleGroup;
};

export default function PlanEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.type as WorkoutTypeSlug;
  const workoutType = SLUG_TO_TYPE[slug];
  const workoutInfo = WORKOUT_TYPES.find((wt) => wt.type === workoutType);
  const targetUserId = searchParams.get("userId");
  const targetUserName = searchParams.get("userName");

  const [planId, setPlanId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<PlanExercise[]>([]);
  const [allExercises, setAllExercises] = useState<Record<string, LibExercise[]>>({});
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin-only check
  useEffect(() => {
    fetch("/api/user").then(r => r.json()).then(data => {
      if (!data.user || data.user.role !== "ADMIN") {
        router.replace("/dashboard");
      }
    });
  }, [router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const plansUrl = targetUserId
        ? `/api/workout-plans?userId=${targetUserId}`
        : "/api/workout-plans";
      const [plansRes, exRes] = await Promise.all([
        fetch(plansUrl),
        fetch("/api/exercises"),
      ]);
      const { plans } = await plansRes.json();
      const { exercises: exList } = await exRes.json();

      console.log("plans loaded:", plans?.length, "workoutType:", workoutType);
      const plan = plans?.find((p: { workoutType: string }) => p.workoutType === workoutType);
      console.log("plan found:", plan?.id ?? "NOT FOUND");
      if (plan) {
        setPlanId(plan.id);
        setExercises(
          plan.exercises.map((pe: {
            exerciseId: string;
            exercise: { name: string; nameHe: string; muscleGroup: MuscleGroup };
            orderIndex: number;
            sets: number;
            reps: number;
            targetWeightKg: number;
          }) => ({
            exerciseId: pe.exerciseId,
            name: pe.exercise.name,
            nameHe: pe.exercise.nameHe,
            muscleGroup: pe.exercise.muscleGroup,
            orderIndex: pe.orderIndex,
            sets: pe.sets,
            reps: pe.reps,
            targetWeightKg: pe.targetWeightKg,
          }))
        );
      }

      const grouped: Record<string, LibExercise[]> = {};
      for (const ex of exList) {
        if (!grouped[ex.muscleGroup]) grouped[ex.muscleGroup] = [];
        grouped[ex.muscleGroup].push(ex);
      }
      setAllExercises(grouped);
    } finally {
      setLoading(false);
    }
  }, [workoutType, targetUserId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addExercise = (ex: LibExercise) => {
    if (exercises.some((e) => e.exerciseId === ex.id)) return;
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        name: ex.name,
        nameHe: ex.nameHe,
        muscleGroup: ex.muscleGroup,
        orderIndex: prev.length,
        sets: 3,
        reps: 10,
        targetWeightKg: 20,
      },
    ]);
    setShowPicker(false);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises((prev) =>
      prev.filter((e) => e.exerciseId !== exerciseId).map((e, i) => ({ ...e, orderIndex: i }))
    );
  };

  const updateField = (exerciseId: string, field: keyof PlanExercise, value: number) => {
    setExercises((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, [field]: value } : e))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      let res: Response;
      const userParam = targetUserId ? `?userId=${targetUserId}` : "";
      if (planId) {
        res = await fetch(`/api/workout-plans/${planId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercises }),
        });
      } else {
        res = await fetch(`/api/workout-plans${userParam}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workoutType, exercises }),
        });
      }
      if (!res.ok) {
        let msg = `שגיאה ${res.status}`;
        try {
          const errData = await res.json();
          msg = typeof errData.error === "string" ? errData.error : JSON.stringify(errData.error) ?? msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.plan?.id) setPlanId(data.plan.id);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        router.push("/dashboard");
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה בשמירת התוכנית");
    } finally {
      setSaving(false);
    }
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

  const filteredByGroup = workoutInfo.muscleGroups.map((group) => ({
    group,
    items: (allExercises[group] ?? []).filter(
      (ex) =>
        !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.nameHe.includes(search)
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center
                       justify-center text-slate-500 active:scale-90 transition-all
                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
          >
            ←
          </button>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: workoutInfo.bgColor }}
          >
            {workoutInfo.icon}
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">
              עריכת תוכנית
            </h1>
            <p className="text-slate-400 dark:text-slate-500 text-xs">
              {workoutInfo.labelHe}
              {targetUserName && ` · ${targetUserName}`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Exercise list */}
            <Card padding="sm" className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {exercises.length} תרגילים
                </p>
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1 text-sm text-primary font-semibold
                             bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                >
                  + הוסף
                </button>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <p className="text-3xl mb-2">➕</p>
                  <p className="text-sm">לחץ על "הוסף" כדי להוסיף תרגילים</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exercises.map((ex) => (
                    <div key={ex.exerciseId} className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{ex.name}</p>
                          <p className="text-slate-400 dark:text-slate-500 text-xs">{ex.nameHe}</p>
                        </div>
                        <button
                          onClick={() => removeExercise(ex.exerciseId)}
                          className="text-red-400 w-8 h-8 flex items-center justify-center
                                     rounded-lg bg-red-50 dark:bg-red-900/30 active:scale-90 transition-all"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Sets / Reps / Weight */}
                      <div className="space-y-2">
                        {/* Reps row */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-12">סטים</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateField(ex.exerciseId, "sets", Math.max(1, ex.sets - 1))}
                              className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 text-sm font-bold active:scale-90 transition-all"
                            >−</button>
                            <span className="w-8 text-center font-bold text-sm">{ex.sets}</span>
                            <button
                              onClick={() => updateField(ex.exerciseId, "sets", ex.sets + 1)}
                              className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 text-sm font-bold active:scale-90 transition-all"
                            >+</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-12">חזרות</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateField(ex.exerciseId, "reps", Math.max(1, ex.reps - 1))}
                              className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 text-sm font-bold active:scale-90 transition-all"
                            >−</button>
                            <span className="w-8 text-center font-bold text-sm">{ex.reps}</span>
                            <button
                              onClick={() => updateField(ex.exerciseId, "reps", ex.reps + 1)}
                              className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 text-sm font-bold active:scale-90 transition-all"
                            >+</button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 w-12">משקל</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateField(ex.exerciseId, "targetWeightKg", Math.max(0, ex.targetWeightKg - 2.5))}
                              className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 text-sm font-bold active:scale-90 transition-all"
                            >−</button>
                            <span className="w-16 text-center font-bold text-sm">{ex.targetWeightKg} ק״ג</span>
                            <button
                              onClick={() => updateField(ex.exerciseId, "targetWeightKg", ex.targetWeightKg + 2.5)}
                              className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-500 text-sm font-bold active:scale-90 transition-all"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {error && (
              <p className="text-sm text-danger font-medium text-center">{error}</p>
            )}

            {saved && (
              <p className="text-sm text-success font-semibold text-center">✓ נשמר בהצלחה</p>
            )}

            <Button fullWidth size="lg" loading={saving} onClick={handleSave}>
              שמור תוכנית
            </Button>
          </>
        )}
      </div>

      {/* Exercise picker modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">הוסף תרגיל</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">{workoutInfo.labelHe}</p>
            </div>
            <button
              onClick={() => setShowPicker(false)}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center
                         text-slate-500 dark:text-slate-400 active:scale-90 transition-all"
            >
              ✕
            </button>
          </div>

          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <input
              type="text"
              placeholder="חיפוש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3
                         text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredByGroup.map(({ group, items }) => (
              <div key={group}>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {MUSCLE_GROUP_LABELS[group]}
                </p>
                <div className="space-y-2">
                  {items.map((ex) => {
                    const added = exercises.some((e) => e.exerciseId === ex.id);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => addExercise(ex)}
                        disabled={added}
                        className={cn(
                          "w-full text-right p-3 rounded-2xl border transition-all active:scale-[0.98]",
                          added
                            ? "bg-primary-50 dark:bg-primary-900/30 border-primary/20 opacity-60"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/30"
                        )}
                      >
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{ex.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{ex.nameHe}</p>
                        {added && <span className="text-xs text-primary font-medium">✓ כבר נוסף</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
