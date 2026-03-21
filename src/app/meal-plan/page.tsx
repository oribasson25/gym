"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FOOD_CATEGORY_LABELS, NUTRITION_GOAL_LABELS } from "@/types";
import type { FoodCategory, NutritionGoal } from "@/types";

type MealFood = {
  id: string;
  amountGrams: number;
  food: {
    id: string;
    name: string;
    nameHe: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    category: string;
  };
};

type Meal = {
  id: string;
  name: string;
  orderIndex: number;
  foods: MealFood[];
};

type MealPlanData = {
  id: string;
  goal: NutritionGoal;
  targetCalories: number;
  meals: Meal[];
};

function calcNutrient(food: MealFood["food"], grams: number, key: "caloriesPer100g" | "proteinPer100g" | "carbsPer100g" | "fatPer100g") {
  return Math.round((food[key] * grams) / 100);
}

export default function MealPlanPage() {
  const [plan, setPlan] = useState<MealPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [todayStr] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  useEffect(() => {
    async function load() {
      const [planRes, logRes] = await Promise.all([
        fetch("/api/meal-plans"),
        fetch(`/api/meal-log?date=${todayStr}`),
      ]);
      const planData = await planRes.json();
      const logData = await logRes.json();

      setPlan(planData.plan ?? null);

      const logMap: Record<string, boolean> = {};
      for (const log of logData.logs ?? []) {
        logMap[log.mealId] = log.eaten;
      }
      setLogs(logMap);
      setLoading(false);
    }
    load();
  }, [todayStr]);

  const toggleMeal = async (mealId: string) => {
    const newEaten = !logs[mealId];
    setLogs((prev) => ({ ...prev, [mealId]: newEaten }));

    await fetch("/api/meal-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId, date: todayStr, eaten: newEaten }),
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!plan) {
    return (
      <AppShell>
        <div className="px-4 pt-5 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-card border border-slate-100 dark:border-slate-700">
            <div className="text-4xl mb-3">🍽️</div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">אין תפריט תזונה</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">המנהל טרם יצר לך תפריט תזונה</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const totalCals = plan.meals.reduce(
    (sum, meal) => sum + meal.foods.reduce((s, f) => s + calcNutrient(f.food, f.amountGrams, "caloriesPer100g"), 0),
    0
  );
  const totalProtein = plan.meals.reduce(
    (sum, meal) => sum + meal.foods.reduce((s, f) => s + calcNutrient(f.food, f.amountGrams, "proteinPer100g"), 0),
    0
  );
  const totalCarbs = plan.meals.reduce(
    (sum, meal) => sum + meal.foods.reduce((s, f) => s + calcNutrient(f.food, f.amountGrams, "carbsPer100g"), 0),
    0
  );
  const totalFat = plan.meals.reduce(
    (sum, meal) => sum + meal.foods.reduce((s, f) => s + calcNutrient(f.food, f.amountGrams, "fatPer100g"), 0),
    0
  );

  const mealsCompleted = plan.meals.filter((m) => logs[m.id]).length;

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-black text-slate-800 dark:text-slate-100">תפריט תזונה</h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs">
            יעד: {NUTRITION_GOAL_LABELS[plan.goal]} · {plan.targetCalories} קלוריות
          </p>
        </div>

        {/* Summary card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-card border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">סיכום יומי</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {mealsCompleted}/{plan.meals.length} ארוחות
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded-2xl p-2">
              <p className="text-lg font-black text-orange-600 dark:text-orange-400">{totalCals}</p>
              <p className="text-[10px] text-orange-400 dark:text-orange-300">קלוריות</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-2">
              <p className="text-lg font-black text-red-600 dark:text-red-400">{totalProtein}g</p>
              <p className="text-[10px] text-red-400 dark:text-red-300">חלבון</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-2">
              <p className="text-lg font-black text-blue-600 dark:text-blue-400">{totalCarbs}g</p>
              <p className="text-[10px] text-blue-400 dark:text-blue-300">פחמימה</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-2xl p-2">
              <p className="text-lg font-black text-yellow-600 dark:text-yellow-400">{totalFat}g</p>
              <p className="text-[10px] text-yellow-400 dark:text-yellow-300">שומן</p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${plan.meals.length > 0 ? (mealsCompleted / plan.meals.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meals */}
        {plan.meals.map((meal) => {
          const mealCals = meal.foods.reduce((s, f) => s + calcNutrient(f.food, f.amountGrams, "caloriesPer100g"), 0);
          const eaten = !!logs[meal.id];

          return (
            <div
              key={meal.id}
              className={`bg-white dark:bg-slate-800 rounded-3xl shadow-card border transition-all ${
                eaten ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20" : "border-slate-100 dark:border-slate-700"
              }`}
            >
              {/* Meal header with check button */}
              <button
                onClick={() => toggleMeal(meal.id)}
                className="w-full flex items-center justify-between p-4 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold transition-all ${
                      eaten
                        ? "bg-green-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {eaten ? "✓" : meal.orderIndex + 1}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${eaten ? "text-green-700 dark:text-green-400" : "text-slate-800 dark:text-slate-100"}`}>
                      {meal.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{mealCals} קלוריות</p>
                  </div>
                </div>
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    eaten
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  }`}
                >
                  {eaten && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Food list */}
              <div className="px-4 pb-3 space-y-1">
                {meal.foods.map((mf) => (
                  <div
                    key={mf.id}
                    className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 dark:text-slate-500 w-6">
                        {FOOD_CATEGORY_LABELS[mf.food.category as FoodCategory]?.[0] ?? ""}
                      </span>
                      <span className={`text-sm ${eaten ? "text-green-700 dark:text-green-400" : "text-slate-700 dark:text-slate-200"}`}>
                        {mf.food.nameHe}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span>{mf.amountGrams}g</span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {calcNutrient(mf.food, mf.amountGrams, "caloriesPer100g")} kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
