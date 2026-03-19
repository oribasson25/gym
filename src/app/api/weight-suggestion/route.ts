import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeightSuggestion } from "@/lib/weight-suggestion";

export async function GET(req: NextRequest) {
  const user = await prisma.user.findFirst();
  if (!user) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("exerciseId");
  const workoutType = searchParams.get("workoutType");
  const planTarget = parseFloat(searchParams.get("planTarget") ?? "0");

  if (!exerciseId || !workoutType) {
    return NextResponse.json({ error: "פרמטרים חסרים" }, { status: 400 });
  }

  const suggestion = await getWeightSuggestion(
    user.id,
    exerciseId,
    workoutType,
    planTarget
  );

  return NextResponse.json({ suggestion });
}
