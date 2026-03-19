import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "SUCCESS", "PARTIAL", "FAIL"]),
  weightUsedKg: z.number().min(0),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; exerciseId: string }> }
) {
  const { exerciseId } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const sessionExercise = await prisma.sessionExercise.update({
    where: { id: exerciseId },
    data: {
      status: parsed.data.status,
      weightUsedKg: parsed.data.weightUsedKg,
    },
  });

  return NextResponse.json({ sessionExercise });
}
