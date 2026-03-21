import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const foods = await prisma.food.findMany({
    orderBy: [{ category: "asc" }, { nameHe: "asc" }],
  });
  return NextResponse.json({ foods });
}

export async function POST(req: NextRequest) {
  const { nameHe, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, category } = await req.json();

  if (!nameHe || caloriesPer100g == null) {
    return NextResponse.json({ error: "שם וקלוריות הם שדות חובה" }, { status: 400 });
  }

  const food = await prisma.food.create({
    data: {
      name: `custom_${Date.now()}_${nameHe}`,
      nameHe,
      caloriesPer100g: Number(caloriesPer100g),
      proteinPer100g: Number(proteinPer100g ?? 0),
      carbsPer100g: Number(carbsPer100g ?? 0),
      fatPer100g: Number(fatPer100g ?? 0),
      category: category ?? "OTHER",
    },
  });

  return NextResponse.json({ food }, { status: 201 });
}
