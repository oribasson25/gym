import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeightSuggestion } from "@/lib/weight-suggestion";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ sessions: [] });

  const { searchParams } = new URL(req.url);
  const workoutType = searchParams.get("workoutType");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: user.id,
      ...(workoutType ? { workoutType } : {}),
      completedAt: { not: null },
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { startedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }

  const { workoutType } = await req.json();

  if (!workoutType) {
    return NextResponse.json({ error: "סוג אימון חסר" }, { status: 400 });
  }

  // Get the active plan for this workout type
  const plan = await prisma.workoutPlan.findFirst({
    where: { userId: user.id, workoutType, isActive: true },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!plan) {
    return NextResponse.json(
      { error: "לא נמצאה תוכנית לסוג אימון זה" },
      { status: 404 }
    );
  }

  if (plan.exercises.length === 0) {
    return NextResponse.json(
      { error: "התוכנית ריקה — הוסף תרגילים לפני תחילת האימון" },
      { status: 400 }
    );
  }

  // Build session exercises with weight suggestions
  const exercisesWithSuggestions = await Promise.all(
    plan.exercises.map(async (pe) => {
      const suggestion = await getWeightSuggestion(
        user.id,
        pe.exerciseId,
        workoutType,
        pe.targetWeightKg
      );
      return {
        pe,
        suggestion,
      };
    })
  );

  // Create session + all session exercises in one transaction
  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      planId: plan.id,
      workoutType,
      exercises: {
        create: exercisesWithSuggestions.map(({ pe, suggestion }) => ({
          exerciseId: pe.exerciseId,
          orderIndex: pe.orderIndex,
          sets: pe.sets,
          reps: pe.reps,
          weightUsedKg: suggestion.suggestedWeight,
          weightsPerSet: JSON.stringify(Array(pe.sets).fill(suggestion.suggestedWeight)),
          status: "PENDING",
        })),
      },
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  // Shape the response with suggestion data
  const exercises = session.exercises.map((se, i) => {
    const { suggestion } = exercisesWithSuggestions[i];
    return {
      sessionExerciseId: se.id,
      exerciseId: se.exerciseId,
      name: se.exercise.name,
      nameHe: se.exercise.nameHe,
      muscleGroup: se.exercise.muscleGroup,
      lottieFile: se.exercise.lottieFile,
      sets: se.sets,
      reps: se.reps,
      weightUsedKg: se.weightUsedKg,
      weightsPerSet: se.weightsPerSet ? JSON.parse(se.weightsPerSet) : Array(se.sets).fill(se.weightUsedKg),
      targetWeightKg: plan.exercises[i]?.targetWeightKg ?? 0,
      orderIndex: se.orderIndex,
      planExerciseId: plan.exercises[i]?.id ?? "",
      status: se.status,
      suggestion,
    };
  });

  return NextResponse.json({ session, exercises }, { status: 201 });
}
