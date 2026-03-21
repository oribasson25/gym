import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ChatClient } from "@/components/chat/ChatClient";

export default async function AdminChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/");

  const { userId } = await params;

  const trainee = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });

  if (!trainee) redirect("/chat");

  return (
    <AppShell>
      <ChatClient
        currentUserId={user.id}
        partnerId={trainee.id}
        partnerName={trainee.name}
      />
    </AppShell>
  );
}
