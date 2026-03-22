import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, all } = await req.json();

  if (all) {
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
  } else if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
