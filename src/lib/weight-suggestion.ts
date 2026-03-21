import { prisma } from "./prisma";

export type WeightSuggestion = {
  suggestedWeight: number;
  lastWeight: number | null;
  lastStatus: string | null;
  lastDifficulty: number | null;
  reasoning: string;
};

function roundToHalf(value: number): number {
  return Math.round(value * 2) / 2;
}

export async function getWeightSuggestion(
  userId: string,
  exerciseId: string,
  workoutType: string,
  planTargetWeight: number
): Promise<WeightSuggestion> {
  const lastSession = await prisma.workoutSession.findFirst({
    where: {
      userId,
      workoutType,
      completedAt: { not: null },
    },
    orderBy: { completedAt: "desc" },
    include: {
      exercises: {
        where: { exerciseId },
      },
    },
  });

  const lastExercise = lastSession?.exercises[0] ?? null;

  if (!lastExercise) {
    return {
      suggestedWeight: planTargetWeight,
      lastWeight: null,
      lastStatus: null,
      lastDifficulty: null,
      reasoning: "אימון ראשון – משקל בסיס מהתוכנית",
    };
  }

  const lastWeight = lastExercise.weightUsedKg;
  const status = lastExercise.status;
  const difficulty = lastSession?.difficultyRating ?? null;

  let suggestedWeight = lastWeight;
  let reasoning = "";

  if (status === "FAIL") {
    suggestedWeight = roundToHalf(lastWeight * 0.9);
    reasoning = "תרגיל נכשל – ירידה של 10%";
  } else if (status === "PARTIAL") {
    suggestedWeight = lastWeight;
    reasoning = "הצלחה חלקית – שמירה על אותו משקל";
  } else if (difficulty !== null) {
    if (difficulty <= 3) {
      suggestedWeight = lastWeight + 10;
      reasoning = `קושי ${difficulty}/10 – העלאה של 10 ק״ג`;
    } else if (difficulty <= 6) {
      suggestedWeight = lastWeight + 5;
      reasoning = `קושי ${difficulty}/10 – העלאה של 5 ק״ג`;
    } else if (difficulty <= 8) {
      suggestedWeight = roundToHalf(lastWeight + 2.5);
      reasoning = `קושי ${difficulty}/10 – העלאה של 2.5 ק״ג`;
    } else {
      suggestedWeight = lastWeight;
      reasoning = `קושי ${difficulty}/10 – שמירה על אותו משקל`;
    }
  } else {
    suggestedWeight = lastWeight;
    reasoning = "שמירה על אותו משקל";
  }

  return {
    suggestedWeight,
    lastWeight,
    lastStatus: status,
    lastDifficulty: difficulty,
    reasoning,
  };
}

export async function updatePlanWeightsAfterSession(
  sessionId: string
): Promise<void> {
  const session = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      exercises: true,
      plan: {
        include: { exercises: true },
      },
    },
  });

  if (!session || !session.difficultyRating) return;

  for (const sessionExercise of session.exercises) {
    const planExercise = session.plan.exercises.find(
      (pe) => pe.exerciseId === sessionExercise.exerciseId
    );
    if (!planExercise) continue;

    const { suggestedWeight } = await getWeightSuggestion(
      session.userId,
      sessionExercise.exerciseId,
      session.workoutType,
      planExercise.targetWeightKg
    );

    await prisma.workoutPlanExercise.update({
      where: { id: planExercise.id },
      data: { targetWeightKg: suggestedWeight },
    });
  }
}
