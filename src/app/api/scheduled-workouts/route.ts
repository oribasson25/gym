import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

// GET — fetch all scheduled workouts (specific dates for a month + recurring)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ scheduled: [], recurring: [] });

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // YYYY-MM

  const now = new Date();
  const year = monthParam ? parseInt(monthParam.split("-")[0]) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam.split("-")[1]) - 1 : now.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);

  // Specific date schedules for the month
  const scheduled = await prisma.scheduledWorkout.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    orderBy: { date: "asc" },
  });

  // Recurring (dayOfWeek based)
  const recurring = await prisma.scheduledWorkout.findMany({
    where: {
      userId: user.id,
      dayOfWeek: { not: null },
      date: null,
    },
  });

  return NextResponse.json({ scheduled, recurring });
}

// POST — create a scheduled workout
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workoutType, date, dayOfWeek } = await req.json();

  if (!workoutType) {
    return NextResponse.json({ error: "workoutType is required" }, { status: 400 });
  }

  // Recurring schedule
  if (dayOfWeek !== undefined && dayOfWeek !== null) {
    // Remove existing recurring for same day+type
    await prisma.scheduledWorkout.deleteMany({
      where: {
        userId: user.id,
        dayOfWeek: dayOfWeek,
        date: null,
      },
    });

    const scheduled = await prisma.scheduledWorkout.create({
      data: {
        userId: user.id,
        workoutType,
        dayOfWeek,
        date: null,
      },
    });

    return NextResponse.json({ scheduled }, { status: 201 });
  }

  // Specific date schedule
  if (date) {
    const scheduled = await prisma.scheduledWorkout.create({
      data: {
        userId: user.id,
        workoutType,
        date: new Date(date),
      },
    });

    return NextResponse.json({ scheduled }, { status: 201 });
  }

  return NextResponse.json({ error: "date or dayOfWeek is required" }, { status: 400 });
}

// DELETE — remove a scheduled workout by id
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all");

  if (all === "true") {
    await prisma.scheduledWorkout.deleteMany({
      where: { userId: user.id },
    });
    return NextResponse.json({ success: true });
  }

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await prisma.scheduledWorkout.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}
