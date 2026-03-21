import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { calculateTargetCalories } from "@/lib/calories";
import { z } from "zod";

const mealFoodSchema = z.object({
  foodId: z.string(),
  amountGrams: z.number().min(1),
});

const mealSchema = z.object({
  name: z.string().min(1),
  orderIndex: z.number().int(),
  foods: z.array(mealFoodSchema),
});

const createMealPlanSchema = z.object({
  userId: z.string(),
  goal: z.enum(["BULK", "CUT"]),
  meals: z.array(mealSchema),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const requestedUserId = req.nextUrl.searchParams.get("userId");
  let targetUserId = user.id;

  if (requestedUserId) {
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });
    }
    targetUserId = requestedUserId;
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }

  const plan = await prisma.mealPlan.findFirst({
    where: { userId: targetUserId, isActive: true },
    include: {
      meals: {
        include: {
          foods: { include: { food: true } },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  const tdee = calculateTargetCalories(targetUser.weightKg, targetUser.heightCm, targetUser.age, "BULK");
  const tdeeNeutral = tdee - 300; // undo the bulk surplus to get neutral TDEE

  return NextResponse.json({ plan, tdee: tdeeNeutral, user: { weightKg: targetUser.weightKg, heightCm: targetUser.heightCm, age: targetUser.age } });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "רק מנהל יכול ליצור תפריטים" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createMealPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { userId, goal, meals } = parsed.data;

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }

  const targetCalories = calculateTargetCalories(targetUser.weightKg, targetUser.heightCm, targetUser.age, goal);

  // Deactivate existing plans for this user
  await prisma.mealPlan.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      goal,
      targetCalories,
      meals: {
        create: meals.map((m) => ({
          name: m.name,
          orderIndex: m.orderIndex,
          foods: {
            create: m.foods.map((f) => ({
              foodId: f.foodId,
              amountGrams: f.amountGrams,
            })),
          },
        })),
      },
    },
    include: {
      meals: {
        include: {
          foods: { include: { food: true } },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
