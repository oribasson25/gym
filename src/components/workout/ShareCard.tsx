"use client";

import { forwardRef } from "react";
import { WORKOUT_TYPES, WorkoutType, ExerciseStatus } from "@/types";

interface ShareExercise {
  nameHe: string;
  weightUsedKg: number;
  sets: number;
  reps: number;
  status: ExerciseStatus;
}

interface ShareCardProps {
  workoutType: WorkoutType;
  completedAt: string;
  exercises: ShareExercise[];
  difficultyRating: number;
  userName: string;
}

const STATUS_ICON: Record<ExerciseStatus, string> = {
  PENDING: "",
  SUCCESS: "V",
  PARTIAL: "~",
  FAIL: "X",
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ workoutType, completedAt, exercises, difficultyRating, userName }, ref) => {
    const wt = WORKOUT_TYPES.find((w) => w.type === workoutType);
    const color = wt?.color || "#6366F1";
    const date = new Date(completedAt).toLocaleDateString("he-IL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div
        ref={ref}
        dir="rtl"
        style={{
          width: 360,
          height: 640,
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 50%, ${color}99 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.06,
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, padding: "32px 24px", height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Branding */}
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, letterSpacing: 2 }}>
              GYM TRACKER
            </p>
          </div>

          {/* Workout type */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 56, marginBottom: 4 }}>{wt?.icon}</div>
            <h1 style={{ color: "white", fontSize: 28, fontWeight: 900, margin: 0 }}>
              {wt?.labelHe}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 }}>
              {date}
            </p>
          </div>

          {/* Exercises */}
          <div
            style={{
              flex: 1,
              background: "rgba(0,0,0,0.15)",
              borderRadius: 20,
              padding: "16px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              overflowY: "hidden",
            }}
          >
            {exercises.slice(0, 8).map((ex, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: i < exercises.length - 1 && i < 7 ? "1px solid rgba(255,255,255,0.15)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: ex.status === "SUCCESS" ? "rgba(34,197,94,0.4)" : ex.status === "FAIL" ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {STATUS_ICON[ex.status]}
                  </span>
                  <span style={{ color: "white", fontSize: 14, fontWeight: 600 }}>
                    {ex.nameHe}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>
                  {ex.weightUsedKg} kg · {ex.sets}x{ex.reps}
                </span>
              </div>
            ))}
          </div>

          {/* Difficulty */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: 24,
                    height: 6,
                    borderRadius: 3,
                    background: i < difficultyRating ? "white" : "rgba(255,255,255,0.2)",
                  }}
                />
              ))}
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 6 }}>
              {difficultyRating}/10 קושי
            </p>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
              {userName}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
