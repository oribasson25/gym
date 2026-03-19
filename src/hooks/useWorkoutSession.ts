"use client";

import { useState, useCallback } from "react";
import { ActiveSessionExercise, ExerciseStatus } from "@/types";

interface WorkoutSessionState {
  sessionId: string | null;
  exercises: ActiveSessionExercise[];
  currentIndex: number;
  statuses: ExerciseStatus[];
  isComplete: boolean;
}

export function useWorkoutSession() {
  const [state, setState] = useState<WorkoutSessionState>({
    sessionId: null,
    exercises: [],
    currentIndex: 0,
    statuses: [],
    isComplete: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    async (workoutType: string): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workoutType }),
        });

        if (!res.ok) {
          let errMsg = "שגיאה ביצירת אימון";
          try {
            const data = await res.json();
            errMsg = data.error ?? errMsg;
          } catch {}
          throw new Error(errMsg);
        }

        const { session, exercises } = await res.json();

        setState({
          sessionId: session.id,
          exercises,
          currentIndex: 0,
          statuses: exercises.map(() => "PENDING" as ExerciseStatus),
          isComplete: false,
        });

        return session.id;
      } catch (e) {
        setError(e instanceof Error ? e.message : "שגיאה");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const markExercise = useCallback(
    async (status: ExerciseStatus, weightUsedKg: number) => {
      const { sessionId, exercises, currentIndex } = state;
      if (!sessionId) return;

      const exercise = exercises[currentIndex];
      if (!exercise) return;

      setLoading(true);
      try {
        await fetch(
          `/api/sessions/${sessionId}/exercises/${exercise.sessionExerciseId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status, weightUsedKg }),
          }
        );

        setState((prev) => {
          const newStatuses = [...prev.statuses];
          newStatuses[currentIndex] = status;

          const newExercises = [...prev.exercises];
          newExercises[currentIndex] = {
            ...newExercises[currentIndex],
            status,
            weightUsedKg,
          };

          const nextIndex = currentIndex + 1;
          const isComplete = nextIndex >= exercises.length;

          return {
            ...prev,
            exercises: newExercises,
            statuses: newStatuses,
            currentIndex: isComplete ? currentIndex : nextIndex,
            isComplete,
          };
        });
      } finally {
        setLoading(false);
      }
    },
    [state]
  );

  const completeSession = useCallback(
    async (difficultyRating: number): Promise<void> => {
      const { sessionId } = state;
      if (!sessionId) return;

      await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficultyRating }),
      });
    },
    [state]
  );

  const updateWeight = useCallback((index: number, weight: number) => {
    setState((prev) => {
      const newExercises = [...prev.exercises];
      newExercises[index] = { ...newExercises[index], weightUsedKg: weight };
      return { ...prev, exercises: newExercises };
    });
  }, []);

  const currentExercise = state.exercises[state.currentIndex] ?? null;

  return {
    ...state,
    currentExercise,
    loading,
    error,
    startSession,
    markExercise,
    completeSession,
    updateWeight,
  };
}
