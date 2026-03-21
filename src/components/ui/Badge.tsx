import { cn } from "@/lib/utils/cn";
import { ExerciseStatus, WorkoutType } from "@/types";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "ghost";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-600",
  primary: "bg-primary-50 text-primary-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  ghost: "bg-white text-slate-500 border border-slate-200",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ExerciseStatus }) {
  const map: Record<ExerciseStatus, { label: string; variant: BadgeVariant; icon: string }> = {
    PENDING: { label: "ממתין", variant: "ghost", icon: "⏳" },
    SUCCESS: { label: "הצלחה", variant: "success", icon: "✓" },
    PARTIAL: { label: "חלקי", variant: "warning", icon: "~" },
    FAIL: { label: "כישלון", variant: "danger", icon: "✗" },
  };
  const { label, variant, icon } = map[status];
  return (
    <Badge variant={variant}>
      {icon} {label}
    </Badge>
  );
}

export function WorkoutTypeBadge({ type }: { type: WorkoutType }) {
  const map: Record<WorkoutType, { label: string; variant: BadgeVariant }> = {
    FULL_BODY: { label: "גוף מלא", variant: "default" },
    PUSH: { label: "דחיפה", variant: "primary" },
    PULL: { label: "משיכה", variant: "primary" },
    LEGS: { label: "רגליים", variant: "success" },
    CHEST_BACK: { label: "חזה + גב", variant: "warning" },
    SHOULDERS_ARMS: { label: "כתפיים + ידיים", variant: "danger" },
  };
  const { label, variant } = map[type];
  return <Badge variant={variant}>{label}</Badge>;
}
