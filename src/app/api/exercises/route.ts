import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const muscleGroups = searchParams.getAll("muscleGroup");

  const exercises = await prisma.exercise.findMany({
    where:
      muscleGroups.length > 0
        ? { muscleGroup: { in: muscleGroups } }
        : undefined,
    orderBy: [{ muscleGroup: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ exercises });
}
