"use client";

import { ExerciseStatus } from "@/types";
import { cn } from "@/lib/utils/cn";

interface StatusButtonsProps {
  onSelect: (status: ExerciseStatus) => void;
  selected?: ExerciseStatus;
  disabled?: boolean;
}

const buttons: {
  status: ExerciseStatus;
  label: string;
  sublabel: string;
  icon: string;
  classes: string;
  selectedClasses: string;
}[] = [
  {
    status: "SUCCESS",
    label: "הצלחה",
    sublabel: "כל הסטים",
    icon: "✓",
    classes:
      "bg-white dark:bg-slate-800 border-2 border-success text-success hover:bg-success-50",
    selectedClasses: "bg-success text-white border-success shadow-lg shadow-success/30",
  },
  {
    status: "PARTIAL",
    label: "חלקי",
    sublabel: "חלק מהסטים",
    icon: "~",
    classes:
      "bg-white dark:bg-slate-800 border-2 border-warning text-warning hover:bg-warning-50",
    selectedClasses:
      "bg-warning text-white border-warning shadow-lg shadow-warning/30",
  },
  {
    status: "FAIL",
    label: "כישלון",
    sublabel: "לא הצלחתי",
    icon: "✗",
    classes:
      "bg-white dark:bg-slate-800 border-2 border-danger text-danger hover:bg-danger-50",
    selectedClasses: "bg-danger text-white border-danger shadow-lg shadow-danger/30",
  },
];

export function StatusButtons({
  onSelect,
  selected,
  disabled = false,
}: StatusButtonsProps) {
  return (
    <div className="flex gap-3">
      {buttons.map(({ status, label, sublabel, icon, classes, selectedClasses }) => (
        <button
          key={status}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(status)}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1",
            "py-4 rounded-2xl font-semibold",
            "transition-all duration-150 active:scale-95 select-none",
            "min-h-[72px] md:min-h-[80px]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
            selected === status ? selectedClasses : classes
          )}
        >
          <span className="text-2xl font-bold leading-none">{icon}</span>
          <span className="text-sm font-bold">{label}</span>
          <span className="text-xs opacity-70 font-medium">{sublabel}</span>
        </button>
      ))}
    </div>
  );
}
