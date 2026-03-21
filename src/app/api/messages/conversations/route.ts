import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all users (trainees)
  const trainees = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // For each trainee, get last message and unread count
  const conversations = await Promise.all(
    trainees.map(async (trainee) => {
      const lastMessage = await prisma.message.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId: trainee.id },
            { senderId: trainee.id, receiverId: user.id },
          ],
        },
        orderBy: { createdAt: "desc" },
      });

      const unreadCount = await prisma.message.count({
        where: {
          senderId: trainee.id,
          receiverId: user.id,
          read: false,
        },
      });

      return {
        userId: trainee.id,
        userName: trainee.name,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt,
              isFromMe: lastMessage.senderId === user.id,
            }
          : null,
        unreadCount,
      };
    })
  );

  // Sort: unread first, then by last message date
  conversations.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return NextResponse.json({ conversations });
}
