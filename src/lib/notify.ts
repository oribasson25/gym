import { prisma } from "./prisma";
import { sendPushToUser } from "./pushNotification";

interface NotifyParams {
  userId: string;
  type: "CHAT_MESSAGE" | "WORKOUT_REMINDER";
  title: string;
  body: string;
  metadata?: Record<string, string>;
  url?: string;
}

export async function notifyUser({ userId, type, title, body, metadata, url }: NotifyParams) {
  // Create in-app notification
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  // Send push notification (fire-and-forget)
  sendPushToUser(userId, { title, body, url: url || "/dashboard" }).catch(() => {});
}
