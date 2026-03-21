// SQLite doesn't support Prisma enums — using string unions instead
export type WorkoutType = "FULL_BODY" | "PUSH" | "PULL" | "LEGS" | "CHEST_BACK" | "SHOULDERS_ARMS";
export type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "LEGS"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "ABS"
  | "CARDIO"
  | "FUNCTIONAL"
  | "GLUTES"
  | "CALVES"
  | "OTHER";
export type ExerciseStatus = "PENDING" | "SUCCESS" | "PARTIAL" | "FAIL";

export type WorkoutTypeInfo = {
  type: WorkoutType;
  label: string;
  labelHe: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  muscleGroups: MuscleGroup[];
  icon: string;
};

export const WORKOUT_TYPES: WorkoutTypeInfo[] = [
  {
    type: "FULL_BODY",
    label: "Full Body",
    labelHe: "גוף מלא",
    description: "כל קבוצות השרירים",
    color: "#0EA5E9",
    bgColor: "#F0F9FF",
    textColor: "#0369A1",
    muscleGroups: ["CHEST", "BACK", "LEGS", "SHOULDERS", "BICEPS", "TRICEPS", "ABS", "GLUTES", "CALVES"],
    icon: "🏆",
  },
  {
    type: "PUSH",
    label: "Push",
    labelHe: "דחיפה",
    description: "חזה · כתפיים · טריצפס",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    textColor: "#4338CA",
    muscleGroups: ["CHEST", "SHOULDERS", "TRICEPS"],
    icon: "💪",
  },
  {
    type: "PULL",
    label: "Pull",
    labelHe: "משיכה",
    description: "גב · ביצפס",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    textColor: "#6D28D9",
    muscleGroups: ["BACK", "BICEPS"],
    icon: "🏋️",
  },
  {
    type: "LEGS",
    label: "Legs",
    labelHe: "רגליים",
    description: "ירכיים · עגלים · ישבן",
    color: "#10B981",
    bgColor: "#ECFDF5",
    textColor: "#065F46",
    muscleGroups: ["LEGS", "GLUTES", "CALVES"],
    icon: "🦵",
  },
  {
    type: "CHEST_BACK",
    label: "Chest + Back",
    labelHe: "חזה + גב",
    description: "חזה · גב עליון ותחתון",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    textColor: "#92400E",
    muscleGroups: ["CHEST", "BACK"],
    icon: "🎯",
  },
  {
    type: "SHOULDERS_ARMS",
    label: "Shoulders + Arms",
    labelHe: "כתפיים + ידיים",
    description: "כתפיים · ביצפס · טריצפס",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    textColor: "#991B1B",
    muscleGroups: ["SHOULDERS", "BICEPS", "TRICEPS"],
    icon: "🔥",
  },
];

export type WorkoutTypeSlug =
  | "full-body"
  | "push"
  | "pull"
  | "legs"
  | "chest-back"
  | "shoulders-arms";

export const SLUG_TO_TYPE: Record<WorkoutTypeSlug, WorkoutType> = {
  "full-body": "FULL_BODY",
  push: "PUSH",
  pull: "PULL",
  legs: "LEGS",
  "chest-back": "CHEST_BACK",
  "shoulders-arms": "SHOULDERS_ARMS",
};

export const TYPE_TO_SLUG: Record<WorkoutType, WorkoutTypeSlug> = {
  FULL_BODY: "full-body",
  PUSH: "push",
  PULL: "pull",
  LEGS: "legs",
  CHEST_BACK: "chest-back",
  SHOULDERS_ARMS: "shoulders-arms",
};

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: "חזה",
  BACK: "גב",
  LEGS: "רגליים",
  SHOULDERS: "כתפיים",
  BICEPS: "יד קדמית",
  TRICEPS: "יד אחורית",
  ABS: "בטן",
  CARDIO: "אירובי",
  FUNCTIONAL: "פונקציונלי",
  GLUTES: "ישבן",
  CALVES: "עגלים",
  OTHER: "אחר",
};

// Prisma model shapes (re-exported for convenience)
export type Exercise = {
  id: string;
  name: string;
  nameHe: string;
  muscleGroup: MuscleGroup;
  lottieFile: string;
  description: string | null;
};

export type WorkoutPlan = {
  id: string;
  userId: string;
  workoutType: WorkoutType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionExercise = {
  id: string;
  sessionId: string;
  exerciseId: string;
  orderIndex: number;
  sets: number;
  reps: number;
  weightUsedKg: number;
  status: ExerciseStatus;
};

export type WorkoutSession = {
  id: string;
  userId: string;
  planId: string;
  workoutType: WorkoutType;
  startedAt: Date;
  completedAt: Date | null;
  difficultyRating: number | null;
};

export type ProgressPhoto = {
  id: string;
  userId: string;
  photoUrl: string;
  takenAt: Date;
  monthYear: string;
  weightKg: number | null;
  notes: string | null;
};

export type ActiveSessionExercise = Exercise & {
  sessionExerciseId: string;
  sets: number;
  reps: number;
  weightUsedKg: number;
  targetWeightKg: number;
  orderIndex: number;
  planExerciseId: string;
  status: ExerciseStatus;
  suggestion?: {
    suggestedWeight: number;
    lastWeight: number | null;
    lastStatus: ExerciseStatus | null;
    lastDifficulty: number | null;
    reasoning: string;
  };
};
