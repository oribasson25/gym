import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, role: true, createdAt: true, passwordHash: true },
  });

  return NextResponse.json({
    users: users.map((u) => ({ ...u, hasPassword: !!u.passwordHash, passwordHash: undefined })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "אין הרשאה" }, { status: 403 });

  const { name, password } = await req.json();
  if (!name || !password || password.length < 4) {
    return NextResponse.json({ error: "שם וסיסמה (לפחות 4 תווים) נדרשים" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { name } });
  if (existing) {
    return NextResponse.json({ error: "משתמש עם שם זה כבר קיים" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, passwordHash, role: "USER" },
    select: { id: true, name: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
