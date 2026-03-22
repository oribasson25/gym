import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notify";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun..6=Sat

  // Start/end of today (UTC)
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Find specific date schedules for today
  const specificSchedules = await prisma.scheduledWorkout.findMany({
    where: { date: { gte: startOfDay, lte: endOfDay } },
    include: { user: { select: { id: true, name: true } } },
  });

  // Find recurring schedules for today's day of week
  const recurringSchedules = await prisma.scheduledWorkout.findMany({
    where: { dayOfWeek, date: null },
    include: { user: { select: { id: true, name: true } } },
  });

  const notified = new Set<string>();

  for (const schedule of [...specificSchedules, ...recurringSchedules]) {
    // Avoid duplicate notifications per user
    const key = `${schedule.userId}-${schedule.workoutType}`;
    if (notified.has(key)) continue;
    notified.add(key);

    await notifyUser({
      userId: schedule.userId,
      type: "WORKOUT_REMINDER",
      title: "תזכורת אימון",
      body: `יש לך אימון ${schedule.workoutType} מתוזמן להיום`,
      metadata: { workoutType: schedule.workoutType },
      url: "/dashboard",
    });
  }

  return NextResponse.json({ sent: notified.size });
}
