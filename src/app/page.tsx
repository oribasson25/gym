import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { LoginPage } from "./LoginPage";

export default async function RootPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("gym-user-id")?.value;

  // If cookie set and user valid → go to dashboard
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) redirect("/dashboard");
  }

  // If no admin exists yet → setup admin first
  const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminExists) redirect("/setup-admin");

  return <LoginPage />;
}
