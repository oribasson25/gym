import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await prisma.workoutSession.findUnique({
    where: { id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
      plan: true,
      user: { select: { name: true } },
    },
  });

  if (!session) {
    return NextResponse.json({ error: "אימון לא נמצא" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
