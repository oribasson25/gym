"use client";

import { cn } from "@/lib/utils/cn";

interface DifficultySliderProps {
  value: number;
  onChange: (value: number) => void;
}

const ratings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const getColor = (rating: number) => {
  if (rating <= 3) return { bg: "bg-success", text: "text-success", label: "קל מאוד" };
  if (rating <= 5) return { bg: "bg-success", text: "text-success", label: "קל" };
  if (rating === 6) return { bg: "bg-warning", text: "text-warning", label: "בינוני" };
  if (rating === 7) return { bg: "bg-warning", text: "text-warning", label: "מאתגר" };
  if (rating === 8) return { bg: "bg-danger", text: "text-danger", label: "קשה" };
  if (rating === 9) return { bg: "bg-danger", text: "text-danger", label: "קשה מאוד" };
  return { bg: "bg-danger", text: "text-danger", label: "מקסימלי" };
};

export function DifficultySlider({ value, onChange }: DifficultySliderProps) {
  const { text, label } = value ? getColor(value) : { text: "text-slate-400", label: "" };

  return (
    <div className="space-y-4">
      {/* Rating buttons */}
      <div className="flex gap-2">
        {ratings.map((rating) => {
          const { bg } = getColor(rating);
          const isSelected = value === rating;
          return (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className={cn(
                "flex-1 h-12 md:h-14 rounded-2xl font-bold text-base",
                "transition-all duration-150 active:scale-90 select-none",
                isSelected
                  ? cn(bg, "text-white shadow-lg scale-105")
                  : "bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
              )}
            >
              {rating}
            </button>
          );
        })}
      </div>

      {/* Label */}
      {value > 0 && (
        <div className="text-center">
          <span className={cn("text-2xl font-black", text)}>{value}/10</span>
          <span className="text-slate-500 text-base font-medium mr-2">— {label}</span>
          {value <= 3 && (
            <p className="text-xs text-slate-400 mt-1">
              המשקל יעלה ב-10 ק״ג באימון הבא
            </p>
          )}
          {value >= 4 && value <= 6 && (
            <p className="text-xs text-slate-400 mt-1">
              המשקל יעלה ב-5 ק״ג באימון הבא
            </p>
          )}
          {value >= 7 && value <= 8 && (
            <p className="text-xs text-slate-400 mt-1">
              המשקל יעלה ב-2.5 ק״ג באימון הבא
            </p>
          )}
          {value >= 9 && (
            <p className="text-xs text-slate-400 mt-1">
              המשקל יישאר זהה באימון הבא
            </p>
          )}
        </div>
      )}
    </div>
  );
}
