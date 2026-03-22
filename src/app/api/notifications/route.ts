import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const cursor = searchParams.get("cursor");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });

  return NextResponse.json({ notifications, unreadCount });
}
