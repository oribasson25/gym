import { PrismaClient } from "@prisma/client";
type MuscleGroup = string;

const prisma = new PrismaClient();

type ExerciseSeed = {
  name: string;
  nameHe: string;
  muscleGroup: MuscleGroup;
  lottieFile: string;
};

const exercises: ExerciseSeed[] = [
  // ── CHEST ──────────────────────────────────────────────────────────────
  { name: "Barbell Bench Press", nameHe: "לחיצת חזה עם מוט", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Incline Barbell Press", nameHe: "לחיצת חזה שיפוע עליון", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Decline Barbell Press", nameHe: "לחיצת חזה שיפוע תחתון", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Dumbbell Bench Press", nameHe: "לחיצת חזה משקולות", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Incline Dumbbell Press", nameHe: "לחיצת חזה שיפוע עם משקולות", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Machine Chest Press", nameHe: "לחיצת חזה במכונה", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Cable Chest Press", nameHe: "לחיצת חזה בכבלים", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Pec Deck", nameHe: "פרפר במכונה", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Cable Fly High to Low", nameHe: "פרפר כבלים מלמעלה למטה", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Cable Fly Low to High", nameHe: "פרפר מלמטה למעלה", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Cable Cross Over", nameHe: "קרוס כבלים", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Plate Press", nameHe: "לחיצה עם פלטה", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Incline Cable Fly", nameHe: "פרפר בשיפוע", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Decline Cable Fly", nameHe: "פרפר תחתון", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },
  { name: "Chest Stretch Cable", nameHe: "מתיחת חזה בכבל", muscleGroup: "CHEST", lottieFile: "/animations/chest.json" },

  // ── BACK ───────────────────────────────────────────────────────────────
  { name: "Lat Pulldown", nameHe: "פולי עליון", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Close Grip Pulldown", nameHe: "פולי עליון אחיזה צרה", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Wide Grip Pulldown", nameHe: "פולי רחב", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Seated Cable Row", nameHe: "חתירה בכבל", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Chest Supported Row", nameHe: "חתירה נתמכת חזה", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "T-Bar Row", nameHe: "חתירה T", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Smith Machine Row", nameHe: "חתירה בסמית", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Deadlift", nameHe: "דדליפט", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Rack Pull", nameHe: "משיכה מהראק", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Straight Arm Pulldown", nameHe: "פולי ידיים ישרות", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Sumo Deadlift", nameHe: "דדליפט סומו", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Good Morning", nameHe: "בוקר טוב", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Pendlay Row", nameHe: "חתירה פנדלי", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Low Row Cable", nameHe: "חתירה נמוכה", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "High Row Cable", nameHe: "חתירה גבוהה", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Landmine Row", nameHe: "חתירה לנדמיין", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Trap Bar Deadlift", nameHe: "דדליפט טראפ בר", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Cable Pull Through", nameHe: "משיכת אגן", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Machine Row", nameHe: "חתירה במכונה", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Lat Stretch Machine", nameHe: "מתיחת גב", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Spine Stretch", nameHe: "מתיחת גב", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Band Pull Apart", nameHe: "פתיחת גומייה", muscleGroup: "BACK", lottieFile: "/animations/back.json" },
  { name: "Reverse Pec Deck", nameHe: "פרפר אחורי", muscleGroup: "BACK", lottieFile: "/animations/back.json" },

  // ── LEGS ───────────────────────────────────────────────────────────────
  { name: "Barbell Squat", nameHe: "סקוואט עם מוט", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Smith Machine Squat", nameHe: "סקוואט בסמית", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Leg Press", nameHe: "לחיצת רגליים", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Hack Squat Machine", nameHe: "מכונת האק סקוואט", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Leg Extension", nameHe: "פשיטת ברכיים", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Lying Leg Curl", nameHe: "כפיפת ברכיים בשכיבה", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Seated Leg Curl", nameHe: "כפיפת ברכיים בישיבה", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Romanian Deadlift", nameHe: "דדליפט רומני", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Smith Lunges", nameHe: "מכרעים בסמית", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Front Squat", nameHe: "סקוואט קדמי", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Barbell Lunge", nameHe: "מכרעים עם מוט", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Cable Lunge", nameHe: "מכרעים בכבל", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Cable Squat", nameHe: "סקוואט בכבל", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Band Assisted Squat", nameHe: "סקוואט גומייה", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Landmine Squat", nameHe: "סקוואט לנדמיין", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Stability Ball Leg Curl", nameHe: "כדור רגליים", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Weighted Step Up", nameHe: "עלייה עם משקל", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Hamstring Stretch Machine", nameHe: "מתיחה ירך אחורית", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Quad Stretch Standing", nameHe: "מתיחה קדמית", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },
  { name: "Hip Flexor Stretch", nameHe: "כופפי ירך", muscleGroup: "LEGS", lottieFile: "/animations/legs.json" },

  // ── CALVES ─────────────────────────────────────────────────────────────
  { name: "Standing Calf Raise", nameHe: "תאומים בעמידה", muscleGroup: "CALVES", lottieFile: "/animations/legs.json" },
  { name: "Smith Calf Raise", nameHe: "תאומים בסמית", muscleGroup: "CALVES", lottieFile: "/animations/legs.json" },
  { name: "Seated Calf Raise", nameHe: "תאומים ישיבה", muscleGroup: "CALVES", lottieFile: "/animations/legs.json" },
  { name: "Donkey Calf Raise", nameHe: "תאומים חמור", muscleGroup: "CALVES", lottieFile: "/animations/legs.json" },
  { name: "Calf Stretch Machine", nameHe: "מתיחת תאומים", muscleGroup: "CALVES", lottieFile: "/animations/legs.json" },

  // ── SHOULDERS ──────────────────────────────────────────────────────────
  { name: "Barbell Shoulder Press", nameHe: "לחיצת כתפיים מוט", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Dumbbell Shoulder Press", nameHe: "לחיצת כתפיים משקולות", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Machine Shoulder Press", nameHe: "מכונת כתפיים", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Lateral Raise Dumbbell", nameHe: "הרחקה לצדדים", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Cable Lateral Raise", nameHe: "הרחקה בכבל", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Front Raise Plate", nameHe: "הרמה קדמית עם פלטה", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Rear Delt Machine", nameHe: "כתף אחורית במכונה", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Face Pull", nameHe: "משיכת פנים", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Smith Shoulder Press", nameHe: "לחיצה בסמית", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Shrugs Barbell", nameHe: "הרמת כתפיים", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Push Press", nameHe: "לחיצה עם תנופה", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Cable Front Raise", nameHe: "הרמה קדמית", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Cable Rear Delt", nameHe: "כתף אחורית", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Cable Upright Row", nameHe: "חתירה צרה בכבל", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Plate Raise", nameHe: "הרמת פלטה", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Landmine Press", nameHe: "לחיצה לנדמיין", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Cable Shrug", nameHe: "טרפזים בכבל", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Barbell Shrug", nameHe: "טרפזים", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },
  { name: "Shoulder Stretch Band", nameHe: "כתף גומייה", muscleGroup: "SHOULDERS", lottieFile: "/animations/shoulders.json" },

  // ── BICEPS ─────────────────────────────────────────────────────────────
  { name: "Barbell Curl", nameHe: "כפיפה עם מוט", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "EZ Bar Curl", nameHe: "כפיפה מוט W", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Dumbbell Curl", nameHe: "כפיפה משקולות", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Hammer Curl", nameHe: "פטיש", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Cable Curl", nameHe: "כפיפה בכבל", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Preacher Curl Machine", nameHe: "מכונת כומר", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Incline Dumbbell Curl", nameHe: "כפיפה בשיפוע", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Concentration Curl", nameHe: "כפיפה מרוכזת", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Reverse Barbell Curl", nameHe: "כפיפה הפוכה", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },
  { name: "Rope Cable Curl", nameHe: "כפיפה עם חבל", muscleGroup: "BICEPS", lottieFile: "/animations/biceps.json" },

  // ── TRICEPS ────────────────────────────────────────────────────────────
  { name: "Cable Pushdown", nameHe: "פשיטה בכבל", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Rope Pushdown", nameHe: "חבל", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Straight Bar Pushdown", nameHe: "מוט ישר", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Overhead Cable Extension", nameHe: "פשיטה מעל הראש בכבל", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Dumbbell Overhead Extension", nameHe: "פשיטה משקולת", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Skull Crushers", nameHe: "פשיטה בשכיבה", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Close Grip Bench Press", nameHe: "לחיצה אחיזה צרה", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Machine Triceps Press", nameHe: "מכונה", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Kickback Dumbbell", nameHe: "פשיטה לאחור", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Dip Machine", nameHe: "מקבילים במכונה", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },
  { name: "Triceps Stretch Overhead", nameHe: "יד אחורית", muscleGroup: "TRICEPS", lottieFile: "/animations/triceps.json" },

  // ── ABS ────────────────────────────────────────────────────────────────
  { name: "Cable Crunch", nameHe: "כפיפות בכבל", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Machine Crunch", nameHe: "מכונת בטן", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Hanging Leg Raise", nameHe: "הרמת רגליים במתח", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Captain Chair", nameHe: "מתקן בטן", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Decline Sit Up", nameHe: "עליות בטן בשיפוע", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Weighted Crunch", nameHe: "כפיפות עם משקל", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Cable Twist", nameHe: "טוויסט בכבל", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Ab Roller", nameHe: "גלגל בטן", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Plank Weighted", nameHe: "פלאנק עם משקל", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Side Cable Crunch", nameHe: "כפיפה צדית בכבל", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Cable Woodchopper", nameHe: "חיתוך עץ", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },
  { name: "Stability Ball Crunch", nameHe: "כדור", muscleGroup: "ABS", lottieFile: "/animations/abs.json" },

  // ── GLUTES ─────────────────────────────────────────────────────────────
  { name: "Hip Thrust Machine", nameHe: "מכונת ישבן", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Glute Kickback Machine", nameHe: "מכונת בעיטות", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Hip Abduction Machine", nameHe: "הרחקה", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Hip Adduction Machine", nameHe: "קירוב", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Smith Hip Thrust", nameHe: "דחיפת אגן", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Cable Kickback", nameHe: "בעיטה בכבל", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Barbell Hip Thrust", nameHe: "דחיפת אגן", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Reverse Hyper Machine", nameHe: "גב תחתון", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Back Extension Machine", nameHe: "זוקפי גב", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },
  { name: "Glute Stretch Bench", nameHe: "מתיחת ישבן", muscleGroup: "GLUTES", lottieFile: "/animations/glutes.json" },

  // ── CARDIO ─────────────────────────────────────────────────────────────
  { name: "Treadmill Running", nameHe: "ריצה על הליכון", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Treadmill Walking", nameHe: "הליכה", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Incline Walking", nameHe: "הליכה בשיפוע", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Stairmaster", nameHe: "מדרגות", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Elliptical", nameHe: "אליפטיקל", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Stationary Bike", nameHe: "אופניים", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Spin Bike", nameHe: "אופני ספינינג", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Rowing Machine", nameHe: "חתירה", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Ski Erg", nameHe: "סקי ארג", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },
  { name: "Assault Bike", nameHe: "אופניים אינטנסיביים", muscleGroup: "CARDIO", lottieFile: "/animations/cardio.json" },

  // ── FUNCTIONAL ─────────────────────────────────────────────────────────
  { name: "Kettlebell Swing", nameHe: "סווינג", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Farmer Walk Dumbbells", nameHe: "הליכת חקלאי", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Sled Push", nameHe: "דחיפת מזחלת", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Sled Pull", nameHe: "משיכת מזחלת", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Battle Ropes", nameHe: "חבלים", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Medicine Ball Slam", nameHe: "זריקה לרצפה", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Wall Ball", nameHe: "זריקה לקיר", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Box Jump", nameHe: "קופסה", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Dumbbell Snatch", nameHe: "סנאץ׳ משקולת", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Barbell Clean", nameHe: "קלין", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Power Clean", nameHe: "פאוור קלין", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Hang Clean", nameHe: "קלין תלוי", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },
  { name: "Trap Bar Carry", nameHe: "הליכה טראפ בר", muscleGroup: "FUNCTIONAL", lottieFile: "/animations/functional.json" },

  // ── OTHER ──────────────────────────────────────────────────────────────
  { name: "Assisted Pull Up Machine", nameHe: "מתח בעזרה", muscleGroup: "OTHER", lottieFile: "/animations/back.json" },
  { name: "Assisted Dip Machine", nameHe: "מקבילים בעזרה", muscleGroup: "OTHER", lottieFile: "/animations/triceps.json" },
];

async function main() {
  console.log("Seeding exercises...");

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    });
  }

  console.log(`Seeded ${exercises.length} exercises successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
