import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HistoryClient } from "./HistoryClient";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string; userName?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const params = await searchParams;

  // Admin can view other users' history
  let targetUserId = user.id;
  let targetUserName: string | undefined;
  if (params.userId && user.role === "ADMIN") {
    targetUserId = params.userId;
    targetUserName = params.userName;
  }

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: targetUserId, completedAt: { not: null } },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { orderIndex: "asc" },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 30,
  });

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, nameHe: true, muscleGroup: true },
  });

  return (
    <HistoryClient
      sessions={sessions as never}
      exercises={exercises}
      viewingUserName={targetUserName}
    />
  );
}
