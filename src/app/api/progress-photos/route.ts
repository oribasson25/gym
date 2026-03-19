import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { format } from "date-fns";
import { z } from "zod";
import { getCurrentUser } from "@/lib/getCurrentUser";

const uploadSchema = z.object({
  photoBase64: z.string(),
  weightKg: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ photos: [] });

  const photos = await prisma.progressPhoto.findMany({
    where: { userId: user.id },
    orderBy: { takenAt: "desc" },
  });

  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const monthYear = format(new Date(), "yyyy-MM");

  const existing = await prisma.progressPhoto.findUnique({
    where: { userId_monthYear: { userId: user.id, monthYear } },
  });

  if (existing) {
    return NextResponse.json({ error: "תמונה כבר הועלתה החודש" }, { status: 409 });
  }

  const { url } = await uploadImage(parsed.data.photoBase64, "gym-progress");

  const photo = await prisma.progressPhoto.create({
    data: {
      userId: user.id,
      photoUrl: url,
      monthYear,
      weightKg: parsed.data.weightKg,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
