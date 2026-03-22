-- CreateTable
CREATE TABLE "ScheduledWorkout" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workoutType" TEXT NOT NULL,
    "date" DATE,
    "dayOfWeek" INTEGER,

    CONSTRAINT "ScheduledWorkout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduledWorkout_userId_date_idx" ON "ScheduledWorkout"("userId", "date");

-- CreateIndex
CREATE INDEX "ScheduledWorkout_userId_dayOfWeek_idx" ON "ScheduledWorkout"("userId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "ScheduledWorkout" ADD CONSTRAINT "ScheduledWorkout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
