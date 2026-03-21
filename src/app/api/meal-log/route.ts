import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { z } from "zod";

const toggleSchema = z.object({
  mealId: z.string(),
  date: z.string(), // "YYYY-MM-DD"
  eaten: z.boolean(),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "חסר תאריך" }, { status: 400 });
  }

  const logs = await prisma.dailyMealLog.findMany({
    where: {
      userId: user.id,
      date: new Date(date),
    },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 });

  const body = await req.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { mealId, date, eaten } = parsed.data;
  const dateObj = new Date(date);

  const log = await prisma.dailyMealLog.upsert({
    where: {
      userId_mealId_date: {
        userId: user.id,
        mealId,
        date: dateObj,
      },
    },
    update: { eaten },
    create: {
      userId: user.id,
      mealId,
      date: dateObj,
      eaten,
    },
  });

  return NextResponse.json({ log });
}
