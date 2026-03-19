import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updatePlanWeightsAfterSession } from "@/lib/weight-suggestion";
import { z } from "zod";

const completeSchema = z.object({
  difficultyRating: z.number().int().min(1).max(10),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const parsed = completeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Mark session as complete
  const session = await prisma.workoutSession.update({
    where: { id },
    data: {
      completedAt: new Date(),
      difficultyRating: parsed.data.difficultyRating,
    },
  });

  // Update plan weights based on performance
  await updatePlanWeightsAfterSession(id);

  return NextResponse.json({ session });
}
