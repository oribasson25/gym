// Mifflin-St Jeor equation for BMR
// Then multiply by activity factor for TDEE
export function calculateBMR(weightKg: number, heightCm: number, age: number, isMale = true): number {
  if (isMale) {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
}

export function calculateTDEE(weightKg: number, heightCm: number, age: number, isMale = true): number {
  const bmr = calculateBMR(weightKg, heightCm, age, isMale);
  // Moderate activity factor (training 3-5 days/week)
  return Math.round(bmr * 1.55);
}

export function calculateTargetCalories(
  weightKg: number,
  heightCm: number,
  age: number,
  goal: "BULK" | "CUT"
): number {
  const tdee = calculateTDEE(weightKg, heightCm, age);
  if (goal === "BULK") {
    return tdee + 300;
  }
  return tdee - 400;
}
