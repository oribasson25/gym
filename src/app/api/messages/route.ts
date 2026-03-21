import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const partnerId = searchParams.get("partnerId");
  const after = searchParams.get("after");

  if (!partnerId) {
    return NextResponse.json({ error: "partnerId is required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: partnerId },
        { senderId: partnerId, receiverId: user.id },
      ],
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  // Mark unread messages from partner as read
  await prisma.message.updateMany({
    where: {
      senderId: partnerId,
      receiverId: user.id,
      read: false,
    },
    data: { read: true },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId, content } = await req.json();

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: "receiverId and content are required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId,
      content: content.trim(),
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
