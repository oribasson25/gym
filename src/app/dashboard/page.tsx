import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { WorkoutType, CalendarDay } from "@/types";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    select: { workoutType: true, completedAt: true },
  });

  const lastByType: Record<WorkoutType, Date | null> = {
    FULL_BODY: null,
    PUSH: null,
    PULL: null,
    LEGS: null,
    CHEST_BACK: null,
    SHOULDERS_ARMS: null,
  };

  for (const s of sessions) {
    if (!lastByType[s.workoutType] && s.completedAt) {
      lastByType[s.workoutType] = s.completedAt;
    }
  }

  const monthYear = format(new Date(), "yyyy-MM");
  const photoThisMonth = await prisma.progressPhoto.findUnique({
    where: { userId_monthYear: { userId: user.id, monthYear } },
  });

  const today = new Date();
  const isFirstOfMonth = today.getDate() === 1;
  const needsPhoto = isFirstOfMonth && !photoThisMonth;

  // Calendar data for current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const calendarSessions = await prisma.workoutSession.findMany({
    where: {
      userId: user.id,
      completedAt: { gte: startOfMonth, lte: endOfMonth },
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

  const dayMap = new Map<string, CalendarDay["workouts"]>();
  for (const s of calendarSessions) {
    if (!s.completedAt) continue;
    const dateStr = s.completedAt.toISOString().split("T")[0];
    const existing = dayMap.get(dateStr) || [];
    existing.push({
      sessionId: s.id,
      workoutType: s.workoutType as WorkoutType,
      exerciseCount: s._count.exercises,
      difficultyRating: s.difficultyRating,
    });
    dayMap.set(dateStr, existing);
  }

  const calendarDays: CalendarDay[] = Array.from(dayMap.entries()).map(([date, workouts]) => ({
    date,
    workouts,
  }));

  // Calculate streak
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

  const workoutDates = new Set<string>();
  for (const s of recentSessions) {
    if (s.completedAt) workoutDates.add(s.completedAt.toISOString().split("T")[0]);
  }

  let streak = 0;
  const checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);
  const todayStr = checkDate.toISOString().split("T")[0];
  if (!workoutDates.has(todayStr)) checkDate.setDate(checkDate.getDate() - 1);

  while (workoutDates.has(checkDate.toISOString().split("T")[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Scheduled workouts for the calendar
  const scheduledSpecific = await prisma.scheduledWorkout.findMany({
    where: { userId: user.id, date: { gte: startOfMonth, lte: endOfMonth } },
  });
  const scheduledRecurring = await prisma.scheduledWorkout.findMany({
    where: { userId: user.id, dayOfWeek: { not: null }, date: null },
  });

  const scheduledMap: Record<string, string[]> = {};
  for (const s of scheduledSpecific) {
    if (s.date) {
      const dateStr = s.date.toISOString().split("T")[0];
      if (!scheduledMap[dateStr]) scheduledMap[dateStr] = [];
      scheduledMap[dateStr].push(s.workoutType);
    }
  }
  for (const r of scheduledRecurring) {
    if (r.dayOfWeek === null) continue;
    const d = new Date(startOfMonth);
    while (d <= endOfMonth) {
      if (d.getDay() === r.dayOfWeek) {
        const dateStr = d.toISOString().split("T")[0];
        if (!scheduledMap[dateStr]) scheduledMap[dateStr] = [];
        scheduledMap[dateStr].push(r.workoutType);
      }
      d.setDate(d.getDate() + 1);
    }
  }

  return (
    <DashboardClient
      userName={user.name}
      userRole={user.role}
      lastByType={lastByType}
      needsPhotoReminder={needsPhoto}
      calendarDays={calendarDays}
      streak={streak}
      scheduledMap={scheduledMap}
    />
  );
}
