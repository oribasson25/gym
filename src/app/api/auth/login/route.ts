import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, password } = await req.json();

  if (!name || !password) {
    return NextResponse.json({ error: "שם וסיסמה נדרשים" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { name: { equals: name } },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "שם או סיסמה שגויים" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "שם או סיסמה שגויים" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set("gym-user-id", user.id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
