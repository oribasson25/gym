import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { notifyUser } from "@/lib/notify";

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

  // Send notification to receiver (fire-and-forget)
  notifyUser({
    userId: receiverId,
    type: "CHAT_MESSAGE",
    title: `הודעה חדשה מ${user.name}`,
    body: content.trim().substring(0, 100),
    metadata: { senderId: user.id, senderName: user.name },
    url: user.role === "ADMIN" ? "/chat" : `/chat/${user.id}`,
  }).catch(() => {});

  return NextResponse.json({ message }, { status: 201 });
}
