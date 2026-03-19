"use client";

import { cn } from "@/lib/utils/cn";
import { ExerciseStatus } from "@/types";

interface WorkoutProgressProps {
  total: number;
  current: number;
  statuses: ExerciseStatus[];
}

const statusColor: Record<ExerciseStatus, string> = {
  PENDING: "bg-slate-200",
  SUCCESS: "bg-success",
  PARTIAL: "bg-warning",
  FAIL: "bg-danger",
};

export function WorkoutProgress({
  total,
  current,
  statuses,
}: WorkoutProgressProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="space-y-3">
      {/* Dot indicators */}
      <div className="flex gap-1.5 justify-center flex-wrap">
        {Array.from({ length: total }).map((_, i) => {
          const status = statuses[i] ?? "PENDING";
          const isActive = i === current;
          return (
            <div
              key={i}
              className={cn(
                "rounded-full transition-all duration-300",
                isActive ? "w-6 h-2.5" : "w-2.5 h-2.5",
                i < current
                  ? statusColor[status]
                  : i === current
                  ? "bg-primary"
                  : "bg-slate-200"
              )}
            />
          );
        })}
      </div>

      {/* Text */}
      <p className="text-center text-sm text-slate-500 font-medium">
        תרגיל {current + 1} מתוך {total}
        <span className="mx-2 text-slate-300">·</span>
        <span className="text-primary font-semibold">{percent}%</span>
      </p>
    </div>
  );
}
