import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Only works when no admin exists yet
export async function POST(req: NextRequest) {
  const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (adminExists) {
    return NextResponse.json({ error: "מנהל כבר קיים" }, { status: 409 });
  }

  const { name, password } = await req.json();
  if (!name || !password || password.length < 4) {
    return NextResponse.json({ error: "שם וסיסמה (לפחות 4 תווים) נדרשים" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, role: "ADMIN", passwordHash },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("gym-user-id", user.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
