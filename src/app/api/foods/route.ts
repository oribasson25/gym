import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const foods = await prisma.food.findMany({
    orderBy: [{ category: "asc" }, { nameHe: "asc" }],
  });
  return NextResponse.json({ foods });
}
