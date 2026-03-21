"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { calculateTDEE } from "@/lib/calories";
import { NUTRITION_GOAL_LABELS, FOOD_CATEGORY_LABELS } from "@/types";
import type { NutritionGoal, FoodCategory } from "@/types";

type Food = {
  id: string;
  name: string;
  nameHe: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: string;
};

type MealDraft = {
  name: string;
  foods: { foodId: string; amountGrams: number; food?: Food }[];
};

function MealPlanEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") ?? "";
  const userName = searchParams.get("userName") ?? "";

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goal, setGoal] = useState<NutritionGoal>("BULK");
  const [targetCalories, setTargetCalories] = useState<number>(2500);
  const [meals, setMeals] = useState<MealDraft[]>([
    { name: "ארוחת בוקר", foods: [] },
    { name: "ארוחת ביניים", foods: [] },
    { name: "ארוחת צהריים", foods: [] },
    { name: "ארוחת ביניים 2", foods: [] },
    { name: "ארוחת ערב", foods: [] },
  ]);
  const [userData, setUserData] = useState<{ weightKg: number; heightCm: number; age: number } | null>(null);

  // Food picker state
  const [pickerMealIdx, setPickerMealIdx] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  useEffect(() => {
    async function load() {
      const [foodsRes, planRes] = await Promise.all([
        fetch("/api/foods"),
        fetch(`/api/meal-plans?userId=${userId}`),
      ]);
      const foodsData = await foodsRes.json();
      const planData = await planRes.json();

      setFoods(foodsData.foods ?? []);
      setUserData(planData.user ?? null);

      // Load existing plan if any
      if (planData.plan) {
        setGoal(planData.plan.goal);
        setTargetCalories(planData.plan.targetCalories);
        setMeals(
          planData.plan.meals.map((m: { name: string; foods: { food: Food; amountGrams: number }[] }) => ({
            name: m.name,
            foods: m.foods.map((f: { food: Food; amountGrams: number }) => ({
              foodId: f.food.id,
              amountGrams: f.amountGrams,
              food: f.food,
            })),
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  const addFoodToMeal = (mealIdx: number, food: Food) => {
    setMeals((prev) => {
      const updated = [...prev];
      const existing = updated[mealIdx].foods.find((f) => f.foodId === food.id);
      if (existing) return prev;
      updated[mealIdx] = {
        ...updated[mealIdx],
        foods: [...updated[mealIdx].foods, { foodId: food.id, amountGrams: 100, food }],
      };
      return updated;
    });
    setPickerMealIdx(null);
    setSearchQuery("");
  };

  const removeFoodFromMeal = (mealIdx: number, foodId: string) => {
    setMeals((prev) => {
      const updated = [...prev];
      updated[mealIdx] = {
        ...updated[mealIdx],
        foods: updated[mealIdx].foods.filter((f) => f.foodId !== foodId),
      };
      return updated;
    });
  };

  const updateFoodAmount = (mealIdx: number, foodId: string, grams: number) => {
    setMeals((prev) => {
      const updated = [...prev];
      updated[mealIdx] = {
        ...updated[mealIdx],
        foods: updated[mealIdx].foods.map((f) =>
          f.foodId === foodId ? { ...f, amountGrams: grams } : f
        ),
      };
      return updated;
    });
  };

  const addMeal = () => {
    setMeals((prev) => [...prev, { name: `ארוחה ${prev.length + 1}`, foods: [] }]);
  };

  const removeMeal = (idx: number) => {
    setMeals((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateMealName = (idx: number, name: string) => {
    setMeals((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], name };
      return updated;
    });
  };

  const save = async () => {
    setSaving(true);
    const body = {
      userId,
      goal,
      targetCalories,
      meals: meals
        .filter((m) => m.foods.length > 0)
        .map((m, i) => ({
          name: m.name,
          orderIndex: i,
          foods: m.foods.map((f) => ({ foodId: f.foodId, amountGrams: f.amountGrams })),
        })),
    };

    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin");
    }
    setSaving(false);
  };

  const tdee = userData ? calculateTDEE(userData.weightKg, userData.heightCm, userData.age) : 0;

  const totalCals = meals.reduce(
    (sum, meal) =>
      sum +
      meal.foods.reduce(
        (s, f) => s + Math.round(((f.food?.caloriesPer100g ?? 0) * f.amountGrams) / 100),
        0
      ),
    0
  );
  const totalProtein = meals.reduce(
    (sum, meal) =>
      sum +
      meal.foods.reduce(
        (s, f) => s + Math.round(((f.food?.proteinPer100g ?? 0) * f.amountGrams) / 100),
        0
      ),
    0
  );

  const filteredFoods = foods.filter((f) => {
    const matchesSearch = searchQuery === "" || f.nameHe.includes(searchQuery) || f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AppShell>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 active:scale-90 transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800">תפריט תזונה</h1>
            <p className="text-slate-400 text-xs">{decodeURIComponent(userName)}</p>
          </div>
        </div>

        {/* User stats & goal */}
        <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-100 space-y-3">
          {userData && (
            <div className="flex gap-3 text-center">
              <div className="flex-1 bg-slate-50 rounded-2xl p-2">
                <p className="text-sm font-bold text-slate-700">{userData.weightKg} ק"ג</p>
                <p className="text-[10px] text-slate-400">משקל</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-2">
                <p className="text-sm font-bold text-slate-700">{userData.heightCm} ס"מ</p>
                <p className="text-[10px] text-slate-400">גובה</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-2">
                <p className="text-sm font-bold text-slate-700">{tdee}</p>
                <p className="text-[10px] text-slate-400">TDEE</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {(["BULK", "CUT"] as NutritionGoal[]).map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  goal === g
                    ? g === "BULK"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {NUTRITION_GOAL_LABELS[g]}
              </button>
            ))}
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-slate-400">יעד קלוריות</p>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(Math.max(0, Number(e.target.value)))}
              className="w-32 text-center text-2xl font-black text-primary bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-slate-400">
              TDEE: {tdee}
            </p>
          </div>
        </div>

        {/* Current total */}
        <div className="bg-white rounded-3xl p-3 shadow-card border border-slate-100 flex items-center justify-between">
          <div className="text-sm">
            <span className="font-bold text-slate-700">סה"כ: </span>
            <span className={`font-black ${totalCals > targetCalories ? "text-red-500" : "text-green-600"}`}>
              {totalCals}
            </span>
            <span className="text-slate-400"> / {targetCalories} kcal</span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-slate-700">חלבון: </span>
            <span className="font-black text-blue-600">{totalProtein}g</span>
          </div>
        </div>

        {/* Meals */}
        {meals.map((meal, mealIdx) => {
          const mealCals = meal.foods.reduce(
            (s, f) => s + Math.round(((f.food?.caloriesPer100g ?? 0) * f.amountGrams) / 100),
            0
          );
          return (
            <div key={mealIdx} className="bg-white rounded-3xl p-4 shadow-card border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  value={meal.name}
                  onChange={(e) => updateMealName(mealIdx, e.target.value)}
                  className="font-bold text-slate-800 text-sm bg-transparent border-none focus:outline-none text-right flex-1"
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{mealCals} kcal</span>
                  <button
                    onClick={() => removeMeal(mealIdx)}
                    className="text-xs text-red-400 active:scale-90 transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Foods in this meal */}
              {meal.foods.map((mf) => (
                <div key={mf.foodId} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2">
                  <button
                    onClick={() => removeFoodFromMeal(mealIdx, mf.foodId)}
                    className="text-red-400 text-xs active:scale-90"
                  >
                    ✕
                  </button>
                  <span className="flex-1 text-sm text-slate-700 text-right">{mf.food?.nameHe ?? mf.foodId}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={mf.amountGrams}
                      onChange={(e) => updateFoodAmount(mealIdx, mf.foodId, Math.max(1, Number(e.target.value)))}
                      className="w-16 text-center bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-slate-400">g</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold w-14 text-left">
                    {Math.round(((mf.food?.caloriesPer100g ?? 0) * mf.amountGrams) / 100)}
                  </span>
                </div>
              ))}

              {/* Add food button */}
              <button
                onClick={() => { setPickerMealIdx(mealIdx); setSearchQuery(""); setSelectedCategory("ALL"); }}
                className="w-full py-2 border-2 border-dashed border-slate-200 rounded-2xl text-sm text-slate-400 font-semibold active:scale-[0.98] transition-all"
              >
                + הוסף מזון
              </button>
            </div>
          );
        })}

        {/* Add meal button */}
        <button
          onClick={addMeal}
          className="w-full py-3 bg-slate-100 rounded-2xl text-sm font-bold text-slate-500 active:scale-[0.98] transition-all"
        >
          + הוסף ארוחה
        </button>

        {/* Save */}
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-4 bg-primary text-white font-black rounded-2xl text-sm active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {saving ? "שומר..." : "שמור תפריט"}
        </button>
      </div>

      {/* Food picker modal */}
      {pickerMealIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800">בחר מזון</h3>
                <button
                  onClick={() => setPickerMealIdx(null)}
                  className="text-slate-400 text-lg active:scale-90"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש מזון..."
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-right
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {/* Category filter */}
              <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedCategory("ALL")}
                  className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
                    selectedCategory === "ALL" ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  הכל
                </button>
                {Object.entries(FOOD_CATEGORY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
                      selectedCategory === key ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-1">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => addFoodToMeal(pickerMealIdx, food)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all"
                >
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{food.nameHe}</p>
                    <p className="text-xs text-slate-400">{food.name}</p>
                  </div>
                  <div className="text-left text-xs text-slate-400">
                    <p className="font-semibold text-slate-600">{food.caloriesPer100g} kcal</p>
                    <p>ח:{food.proteinPer100g} פ:{food.carbsPer100g} ש:{food.fatPer100g}</p>
                  </div>
                </button>
              ))}
              {filteredFoods.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">לא נמצאו תוצאות</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function MealPlanEditPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    }>
      <MealPlanEditor />
    </Suspense>
  );
}
