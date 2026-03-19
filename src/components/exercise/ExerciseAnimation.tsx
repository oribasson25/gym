"use client";

import { MuscleGroup } from "@/types";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils/cn";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const MUSCLE_COLORS: Record<MuscleGroup, { bg: string; accent: string; emoji: string }> = {
  CHEST: { bg: "#FEE2E2", accent: "#EF4444", emoji: "💪" },
  BACK: { bg: "#E0E7FF", accent: "#6366F1", emoji: "🏋️" },
  LEGS: { bg: "#D1FAE5", accent: "#10B981", emoji: "🦵" },
  SHOULDERS: { bg: "#FEF3C7", accent: "#F59E0B", emoji: "🎯" },
  BICEPS: { bg: "#FCE7F3", accent: "#EC4899", emoji: "💪" },
  TRICEPS: { bg: "#EDE9FE", accent: "#8B5CF6", emoji: "🔥" },
  ABS: { bg: "#FFF7ED", accent: "#F97316", emoji: "⚡" },
  CARDIO: { bg: "#ECFEFF", accent: "#06B6D4", emoji: "🏃" },
  FUNCTIONAL: { bg: "#F0FDF4", accent: "#22C55E", emoji: "🧰" },
  GLUTES: { bg: "#FDF4FF", accent: "#A855F7", emoji: "🍑" },
  CALVES: { bg: "#F0FDF4", accent: "#84CC16", emoji: "🦶" },
  OTHER: { bg: "#F8FAFC", accent: "#64748B", emoji: "🏅" },
};

interface ExerciseAnimationProps {
  lottieFile?: string;
  muscleGroup: MuscleGroup;
  size?: "sm" | "md" | "lg";
  className?: string;
  animationData?: object;
}

const sizeClasses = {
  sm: "w-24 h-24",
  md: "w-40 h-40 md:w-52 md:h-52",
  lg: "w-56 h-56 md:w-72 md:h-72",
};

export function ExerciseAnimation({
  lottieFile,
  muscleGroup,
  size = "lg",
  className,
  animationData,
}: ExerciseAnimationProps) {
  const { bg, accent, emoji } = MUSCLE_COLORS[muscleGroup];

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-3xl overflow-hidden",
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: bg }}
    >
      {animationData ? (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          className="w-full h-full"
        />
      ) : (
        <PlaceholderAnimation emoji={emoji} accent={accent} bg={bg} />
      )}
    </div>
  );
}

function PlaceholderAnimation({
  emoji,
  accent,
  bg,
}: {
  emoji: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Pulsing rings */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="w-3/4 h-3/4 rounded-full opacity-20 animate-ping"
          style={{ backgroundColor: accent }}
        />
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div
          className="w-1/2 h-1/2 rounded-full opacity-10 animate-pulse"
          style={{ backgroundColor: accent }}
        />
      </div>

      {/* Emoji */}
      <span
        className="relative text-5xl select-none animate-bounce-slow"
        style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" }}
      >
        {emoji}
      </span>
    </div>
  );
}
