import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HistoryClient } from "./HistoryClient";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
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

  return <HistoryClient sessions={sessions as never} exercises={exercises} />;
}
