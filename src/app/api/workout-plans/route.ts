import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getCurrentUser } from "@/lib/getCurrentUser";

const WORKOUT_TYPES = ["FULL_BODY", "PUSH", "PULL", "LEGS", "CHEST_BACK", "SHOULDERS_ARMS"] as const;

const planExerciseSchema = z.object({
  exerciseId: z.string(),
  orderIndex: z.number().int(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  targetWeightKg: z.number().min(0),
});

const createPlanSchema = z.object({
  workoutType: z.enum(WORKOUT_TYPES),
  exercises: z.array(planExerciseSchema),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ plans: [] });

  // Admin can view plans for a specific user
  let targetUserId = user.id;
  const requestedUserId = req.nextUrl.searchParams.get("userId");
  if (requestedUserId) {
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
    }
    targetUserId = requestedUserId;
  }

  const plans = await prisma.workoutPlan.findMany({
    where: { userId: targetUserId, isActive: true },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { workoutType: "asc" },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "רק מנהל יכול לשנות תוכניות אימון" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { workoutType, exercises } = parsed.data;

  // Admin can create plans for a specific user
  let targetUserId = user.id;
  const requestedUserId = req.nextUrl.searchParams.get("userId");
  if (requestedUserId) {
    targetUserId = requestedUserId;
  }

  // Deactivate existing plan of same type
  await prisma.workoutPlan.updateMany({
    where: { userId: targetUserId, workoutType },
    data: { isActive: false },
  });

  const plan = await prisma.workoutPlan.create({
    data: {
      userId: targetUserId,
      workoutType,
      exercises: {
        create: exercises.map((e) => ({
          exerciseId: e.exerciseId,
          orderIndex: e.orderIndex,
          sets: e.sets,
          reps: e.reps,
          targetWeightKg: e.targetWeightKg,
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

  return NextResponse.json({ plan }, { status: 201 });
}
