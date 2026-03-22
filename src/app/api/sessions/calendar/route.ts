import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { CalendarDay, ScheduledItem } from "@/types";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ days: [], streak: 0 });

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // YYYY-MM

  const now = new Date();
  const year = monthParam ? parseInt(monthParam.split("-")[0]) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam.split("-")[1]) - 1 : now.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: user.id,
      completedAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    select: {
      id: true,
      workoutType: true,
      completedAt: true,
      difficultyRating: true,
      _count: { select: { exercises: true } },
    },
    orderBy: { completedAt: "asc" },
  });

  // Group by date
  const dayMap = new Map<string, CalendarDay["workouts"]>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const dateStr = s.completedAt.toISOString().split("T")[0];
    const existing = dayMap.get(dateStr) || [];
    existing.push({
      sessionId: s.id,
      workoutType: s.workoutType as CalendarDay["workouts"][0]["workoutType"],
      exerciseCount: s._count.exercises,
      difficultyRating: s.difficultyRating,
    });
    dayMap.set(dateStr, existing);
  }

  const days: CalendarDay[] = Array.from(dayMap.entries()).map(([date, workouts]) => ({
    date,
    workouts,
  }));

  // Calculate streak (consecutive days ending today or yesterday)
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today has a workout, if not start from yesterday
  const todayStr = today.toISOString().split("T")[0];
  const allDatesWithWorkouts = new Set<string>();

  // Fetch recent sessions for streak (last 60 days)
  const recentSessions = await prisma.workoutSession.findMany({
    where: {
      userId: user.id,
      completedAt: {
        gte: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
        not: null,
      },
    },
    select: { completedAt: true },
  });

  for (const s of recentSessions) {
    if (s.completedAt) {
      allDatesWithWorkouts.add(s.completedAt.toISOString().split("T")[0]);
    }
  }

  let checkDate = new Date(today);
  // If today has no workout, start from yesterday
  if (!allDatesWithWorkouts.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (allDatesWithWorkouts.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Fetch scheduled workouts for this month
  const scheduledSpecific = await prisma.scheduledWorkout.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });

  const scheduledRecurring = await prisma.scheduledWorkout.findMany({
    where: {
      userId: user.id,
      dayOfWeek: { not: null },
      date: null,
    },
  });

  // Build scheduled map: date string -> ScheduledItem[]
  const scheduledMap: Record<string, ScheduledItem[]> = {};

  for (const s of scheduledSpecific) {
    if (s.date) {
      const dateStr = s.date.toISOString().split("T")[0];
      if (!scheduledMap[dateStr]) scheduledMap[dateStr] = [];
      scheduledMap[dateStr].push({ id: s.id, workoutType: s.workoutType, isRecurring: false });
    }
  }

  // Expand recurring into dates for the month
  for (const r of scheduledRecurring) {
    if (r.dayOfWeek === null) continue;
    const d = new Date(startOfMonth);
    while (d <= endOfMonth) {
      if (d.getDay() === r.dayOfWeek) {
        const dateStr = d.toISOString().split("T")[0];
        if (!scheduledMap[dateStr]) scheduledMap[dateStr] = [];
        scheduledMap[dateStr].push({ id: r.id, workoutType: r.workoutType, isRecurring: true });
      }
      d.setDate(d.getDate() + 1);
    }
  }

  return NextResponse.json({ days, streak, scheduledMap });
}
