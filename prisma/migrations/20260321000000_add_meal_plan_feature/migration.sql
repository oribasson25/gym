-- CreateTable
CREATE TABLE "Food" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHe" TEXT NOT NULL,
    "caloriesPer100g" DOUBLE PRECISION NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbsPer100g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fatPer100g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,

    CONSTRAINT "Food_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "targetCalories" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanMeal" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "MealPlanMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanMealFood" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "amountGrams" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MealPlanMealFood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyMealLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "eaten" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyMealLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Food_name_key" ON "Food"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlan_userId_goal_key" ON "MealPlan"("userId", "goal");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanMeal_planId_orderIndex_key" ON "MealPlanMeal"("planId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanMealFood_mealId_foodId_key" ON "MealPlanMealFood"("mealId", "foodId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMealLog_userId_mealId_date_key" ON "DailyMealLog"("userId", "mealId", "date");

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanMeal" ADD CONSTRAINT "MealPlanMeal_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanMealFood" ADD CONSTRAINT "MealPlanMealFood_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "MealPlanMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanMealFood" ADD CONSTRAINT "MealPlanMealFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyMealLog" ADD CONSTRAINT "DailyMealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
