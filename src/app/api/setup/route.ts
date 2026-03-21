import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { z } from "zod";

const WORKOUT_TYPES = ["FULL_BODY", "PUSH", "PULL", "LEGS", "CHEST_BACK", "SHOULDERS_ARMS"] as const;

const planExerciseSchema = z.object({
  exerciseId: z.string(),
  orderIndex: z.number().int(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  targetWeightKg: z.number().min(0),
});

const setupSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(1).max(120),
  weightKg: z.number().min(1).max(500),
  heightCm: z.number().min(50).max(300),
  photoBase64: z.string().optional(),
  plans: z.array(
    z.object({
      workoutType: z.enum(WORKOUT_TYPES),
      exercises: z.array(planExerciseSchema),
    })
  ),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = setupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, age, weightKg, heightCm, photoBase64, plans } = parsed.data;

  let photoUrl: string | undefined;
  if (photoBase64) {
    const uploaded = await uploadImage(photoBase64, "gym-profiles");
    photoUrl = uploaded.url;
  }

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, age, weightKg, heightCm, photoUrl },
    });

    for (const plan of plans) {
      if (plan.exercises.length === 0) continue;
      await tx.workoutPlan.create({
        data: {
          userId: newUser.id,
          workoutType: plan.workoutType,
          exercises: {
            create: plan.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              orderIndex: e.orderIndex,
              sets: e.sets,
              reps: e.reps,
              targetWeightKg: e.targetWeightKg,
            })),
          },
        },
      });
    }

    return newUser;
  });

  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set("gym-user-id", user.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
