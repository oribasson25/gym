"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input, NumberInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { WORKOUT_TYPES, WorkoutType, MuscleGroup, MUSCLE_GROUP_LABELS } from "@/types";
import Image from "next/image";
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

type Plan = {
  workoutType: WorkoutType;
  exercises: PlanExercise[];
};

type FormData = {
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  photoBase64: string;
  photoPreview: string;
  plans: Plan[];
};

const STEPS = ["פרטים אישיים", "תמונת פרופיל", "תוכנית אימונים"];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Record<string, { id: string; name: string; nameHe: string; muscleGroup: MuscleGroup }[]>>({});
  const [exercisesLoaded, setExercisesLoaded] = useState(false);

  const [form, setForm] = useState<FormData>({
    name: "",
    age: 25,
    weightKg: 75,
    heightCm: 175,
    photoBase64: "",
    photoPreview: "",
    plans: WORKOUT_TYPES.map((wt) => ({
      workoutType: wt.type,
      exercises: [],
    })),
  });

  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadExercises = async () => {
    if (exercisesLoaded) return;
    const res = await fetch("/api/exercises");
    const data = await res.json();
    const grouped: typeof exercises = {};
    for (const ex of data.exercises) {
      if (!grouped[ex.muscleGroup]) grouped[ex.muscleGroup] = [];
      grouped[ex.muscleGroup].push(ex);
    }
    setExercises(grouped);
    setExercisesLoaded(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm((f) => ({ ...f, photoBase64: base64, photoPreview: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const goNext = async () => {
    if (step === 1) {
      await loadExercises();
    }
    setStep((s) => s + 1);
  };

  const activePlan = form.plans[activePlanIndex];
  const activeWorkoutInfo = WORKOUT_TYPES[activePlanIndex];

  const addExercise = (ex: { id: string; name: string; nameHe: string; muscleGroup: MuscleGroup }) => {
    const alreadyAdded = activePlan.exercises.some((e) => e.exerciseId === ex.id);
    if (alreadyAdded) return;

    setForm((f) => {
      const newPlans = [...f.plans];
      const plan = { ...newPlans[activePlanIndex] };
      plan.exercises = [
        ...plan.exercises,
        {
          exerciseId: ex.id,
          name: ex.name,
          nameHe: ex.nameHe,
          muscleGroup: ex.muscleGroup,
          orderIndex: plan.exercises.length,
          sets: 3,
          reps: 10,
          targetWeightKg: 20,
        },
      ];
      newPlans[activePlanIndex] = plan;
      return { ...f, plans: newPlans };
    });
  };

  const removeExercise = (exerciseId: string) => {
    setForm((f) => {
      const newPlans = [...f.plans];
      const plan = { ...newPlans[activePlanIndex] };
      plan.exercises = plan.exercises
        .filter((e) => e.exerciseId !== exerciseId)
        .map((e, i) => ({ ...e, orderIndex: i }));
      newPlans[activePlanIndex] = plan;
      return { ...f, plans: newPlans };
    });
  };

  const updateExercise = (exerciseId: string, field: keyof PlanExercise, value: number) => {
    setForm((f) => {
      const newPlans = [...f.plans];
      const plan = { ...newPlans[activePlanIndex] };
      plan.exercises = plan.exercises.map((e) =>
        e.exerciseId === exerciseId ? { ...e, [field]: value } : e
      );
      newPlans[activePlanIndex] = plan;
      return { ...f, plans: newPlans };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          age: form.age,
          weightKg: form.weightKg,
          heightCm: form.heightCm,
          photoBase64: form.photoBase64 || undefined,
          plans: form.plans,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "שגיאה ביצירת פרופיל");
      }

      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setLoading(false);
    }
  };

  const allRelevantExercises = Object.entries(exercises)
    .filter(([group]) =>
      activeWorkoutInfo.muscleGroups.includes(group as MuscleGroup)
    )
    .flatMap(([, exs]) => exs)
    .filter(
      (ex) =>
        !exerciseSearch ||
        ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
        ex.nameHe.includes(exerciseSearch)
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-primary/30">
            💪
          </div>
          <h1 className="text-2xl font-black text-slate-800">Gym Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">הגדרה ראשונית</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-full h-1.5 rounded-full transition-all duration-300",
                  i <= step ? "bg-primary" : "bg-slate-200"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  i === step
                    ? "text-primary"
                    : i < step
                    ? "text-slate-500"
                    : "text-slate-300"
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0: Personal Details */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">פרטים אישיים</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    הנתונים האלה יעזרו לעקוב אחר ההתקדמות שלך
                  </p>
                </div>

                <Input
                  label="שם"
                  placeholder="הכנס שמך"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />

                <NumberInput
                  label="גיל"
                  value={form.age}
                  onChange={(v) => setForm((f) => ({ ...f, age: v }))}
                  min={10}
                  max={100}
                  step={1}
                  suffix="שנה"
                />
                <NumberInput
                  label="משקל"
                  value={form.weightKg}
                  onChange={(v) => setForm((f) => ({ ...f, weightKg: v }))}
                  min={30}
                  max={300}
                  step={0.5}
                  suffix="ק״ג"
                />
                <NumberInput
                  label="גובה"
                  value={form.heightCm}
                  onChange={(v) => setForm((f) => ({ ...f, heightCm: v }))}
                  min={100}
                  max={250}
                  step={1}
                  suffix="ס״מ"
                />

                <Button
                  fullWidth
                  disabled={!form.name.trim()}
                  onClick={goNext}
                >
                  הבא ←
                </Button>
              </Card>
            </motion.div>
          )}

          {/* STEP 1: Profile Photo */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <Card className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">תמונת פרופיל</h2>
                  <p className="text-slate-500 text-sm mt-1">אופציונלי — ניתן לדלג</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full h-48 rounded-3xl border-2 border-dashed",
                    "flex flex-col items-center justify-center gap-3",
                    "transition-all duration-150 active:scale-[0.98]",
                    form.photoPreview
                      ? "border-primary bg-primary-50"
                      : "border-slate-200 bg-slate-50 hover:border-primary hover:bg-primary-50"
                  )}
                >
                  {form.photoPreview ? (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden">
                      <Image
                        src={form.photoPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center text-3xl">
                        📷
                      </div>
                      <p className="text-slate-500 text-sm font-medium">
                        לחץ לבחירת תמונה
                      </p>
                    </>
                  )}
                </button>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(0)} className="flex-1">
                    → חזרה
                  </Button>
                  <Button onClick={goNext} className="flex-2">
                    {form.photoPreview ? "הבא ←" : "דלג ←"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Workout Plans */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <Card padding="sm">
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  תוכנית אימונים
                </h2>
                <p className="text-slate-500 text-sm">
                  הוסף תרגילים לכל סוג אימון
                </p>
              </Card>

              {/* Workout type tabs */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {WORKOUT_TYPES.map((wt, i) => (
                  <button
                    key={wt.type}
                    onClick={() => setActivePlanIndex(i)}
                    className={cn(
                      "flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-semibold",
                      "transition-all duration-150 active:scale-95",
                      activePlanIndex === i
                        ? "text-white shadow-md"
                        : "bg-white text-slate-500 border border-slate-200"
                    )}
                    style={
                      activePlanIndex === i
                        ? { backgroundColor: wt.color }
                        : {}
                    }
                  >
                    {wt.icon} {wt.labelHe}
                    {form.plans[i].exercises.length > 0 && (
                      <span
                        className={cn(
                          "mr-1 text-xs",
                          activePlanIndex === i ? "opacity-80" : "text-primary"
                        )}
                      >
                        ({form.plans[i].exercises.length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Active plan exercises */}
              <Card padding="sm" className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-600">
                    {activeWorkoutInfo.labelHe} — {activePlan.exercises.length} תרגילים
                  </p>
                  <button
                    onClick={() => setShowExercisePicker(true)}
                    className="flex items-center gap-1 text-sm text-primary font-semibold
                               bg-primary-50 px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                  >
                    + הוסף
                  </button>
                </div>

                {activePlan.exercises.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-3xl mb-2">➕</p>
                    <p className="text-sm">לחץ על "הוסף" כדי להוסיף תרגילים</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activePlan.exercises.map((ex) => (
                      <div
                        key={ex.exerciseId}
                        className="bg-slate-50 rounded-2xl p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">
                              {ex.name}
                            </p>
                            <p className="text-slate-400 text-xs">{ex.nameHe}</p>
                          </div>
                          <button
                            onClick={() => removeExercise(ex.exerciseId)}
                            className="text-red-400 hover:text-red-600 w-7 h-7 flex items-center
                                       justify-center rounded-lg hover:bg-red-50 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">סטים</label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateExercise(ex.exerciseId, "sets", Math.max(1, ex.sets - 1))}
                                className="w-7 h-7 bg-white rounded-lg border border-slate-200 text-sm font-bold active:scale-90"
                              >
                                −
                              </button>
                              <span className="flex-1 text-center font-bold text-sm">{ex.sets}</span>
                              <button
                                onClick={() => updateExercise(ex.exerciseId, "sets", ex.sets + 1)}
                                className="w-7 h-7 bg-white rounded-lg border border-slate-200 text-sm font-bold active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">חזרות</label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateExercise(ex.exerciseId, "reps", Math.max(1, ex.reps - 1))}
                                className="w-7 h-7 bg-white rounded-lg border border-slate-200 text-sm font-bold active:scale-90"
                              >
                                −
                              </button>
                              <span className="flex-1 text-center font-bold text-sm">{ex.reps}</span>
                              <button
                                onClick={() => updateExercise(ex.exerciseId, "reps", ex.reps + 1)}
                                className="w-7 h-7 bg-white rounded-lg border border-slate-200 text-sm font-bold active:scale-90"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 block mb-1">משקל</label>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateExercise(ex.exerciseId, "targetWeightKg", Math.max(0, ex.targetWeightKg - 2.5))}
                                className="w-7 h-7 bg-white rounded-lg border border-slate-200 text-sm font-bold active:scale-90"
                              >
                                −
                              </button>
                              <span className="flex-1 text-center font-bold text-xs">{ex.targetWeightKg}kg</span>
                              <button
                                onClick={() => updateExercise(ex.exerciseId, "targetWeightKg", ex.targetWeightKg + 2.5)}
                                className="w-7 h-7 bg-white rounded-lg border border-slate-200 text-sm font-bold active:scale-90"
                              >
                                +
                              </button>
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

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  → חזרה
                </Button>
                <Button
                  fullWidth
                  loading={loading}
                  onClick={handleSubmit}
                >
                  סיים והתחל ←
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercise Picker Modal */}
      {showExercisePicker && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800">הוסף תרגיל</h3>
              <p className="text-xs text-slate-400">{activeWorkoutInfo.labelHe}</p>
            </div>
            <button
              onClick={() => setShowExercisePicker(false)}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center
                         text-slate-500 active:scale-90 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <input
              type="text"
              placeholder="חיפוש תרגיל..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3
                         text-slate-800 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Exercise list grouped by muscle */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeWorkoutInfo.muscleGroups.map((group) => {
              const groupExs = (exercises[group] ?? []).filter(
                (ex) =>
                  !exerciseSearch ||
                  ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
                  ex.nameHe.includes(exerciseSearch)
              );
              if (groupExs.length === 0) return null;

              return (
                <div key={group}>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {MUSCLE_GROUP_LABELS[group]}
                  </p>
                  <div className="space-y-2">
                    {groupExs.map((ex) => {
                      const added = activePlan.exercises.some(
                        (e) => e.exerciseId === ex.id
                      );
                      return (
                        <button
                          key={ex.id}
                          onClick={() => {
                            addExercise(ex);
                            setShowExercisePicker(false);
                          }}
                          disabled={added}
                          className={cn(
                            "w-full text-right p-3 rounded-2xl border transition-all active:scale-[0.98]",
                            added
                              ? "bg-primary-50 border-primary/20 text-primary opacity-60"
                              : "bg-white border-slate-200 hover:border-primary hover:bg-primary-50"
                          )}
                        >
                          <p className="font-semibold text-sm text-slate-800">
                            {ex.name}
                          </p>
                          <p className="text-xs text-slate-400">{ex.nameHe}</p>
                          {added && (
                            <span className="text-xs text-primary font-medium">✓ כבר נוסף</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {allRelevantExercises.length === 0 && (
              <p className="text-center text-slate-400 py-8">לא נמצאו תרגילים</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
