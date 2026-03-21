import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { z } from "zod";

const updateExerciseSchema = z.object({
  exerciseId: z.string(),
  orderIndex: z.number().int(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  targetWeightKg: z.number().min(0),
});

const updatePlanSchema = z.object({
  exercises: z.array(updateExerciseSchema),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plan = await prisma.workoutPlan.findUnique({
    where: { id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!plan) return NextResponse.json({ error: "תוכנית לא נמצאה" }, { status: 404 });
  return NextResponse.json({ plan });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "רק מנהל יכול לשנות תוכניות אימון" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updatePlanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await prisma.workoutPlanExercise.deleteMany({ where: { planId: id } });

    const plan = await prisma.workoutPlan.update({
      where: { id },
      data: {
        exercises: {
          create: parsed.data.exercises.map((e) => ({
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

    return NextResponse.json({ plan });
  } catch (e) {
    console.error("PUT /api/workout-plans/[id] error:", e);
    const msg = e instanceof Error ? e.message : "שגיאת שרת";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
