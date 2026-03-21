import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/AppShell";
import { ChatClient } from "@/components/chat/ChatClient";
import { ConversationListClient } from "@/components/chat/ConversationListClient";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  // ADMIN sees conversation list
  if (user.role === "ADMIN") {
    return (
      <AppShell>
        <ConversationListClient />
      </AppShell>
    );
  }

  // USER chats directly with the admin
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, name: true },
  });

  if (!admin) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-slate-400 text-sm">לא נמצא מאמן במערכת</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ChatClient
        currentUserId={user.id}
        partnerId={admin.id}
        partnerName={admin.name}
      />
    </AppShell>
  );
}
