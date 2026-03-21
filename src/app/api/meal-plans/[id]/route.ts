import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "רק מנהל יכול למחוק תפריטים" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.mealPlan.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
