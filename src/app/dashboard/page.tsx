import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardClient } from "./DashboardClient";
import { WorkoutType } from "@/types";
import { format } from "date-fns";
import { getCurrentUser } from "@/lib/getCurrentUser";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    select: { workoutType: true, completedAt: true },
  });

  const lastByType: Record<WorkoutType, Date | null> = {
    PUSH: null,
    PULL: null,
    LEGS: null,
    CHEST_BACK: null,
    SHOULDERS_ARMS: null,
  };

  for (const s of sessions) {
    if (!lastByType[s.workoutType] && s.completedAt) {
      lastByType[s.workoutType] = s.completedAt;
    }
  }

  const monthYear = format(new Date(), "yyyy-MM");
  const photoThisMonth = await prisma.progressPhoto.findUnique({
    where: { userId_monthYear: { userId: user.id, monthYear } },
  });

  const today = new Date();
  const isFirstOfMonth = today.getDate() === 1;
  const needsPhoto = isFirstOfMonth && !photoThisMonth;

  return (
    <DashboardClient
      userName={user.name}
      userRole={user.role}
      lastByType={lastByType}
      needsPhotoReminder={needsPhoto}
    />
  );
}
