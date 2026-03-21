import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
};

export function Card({
  children,
  className,
  padding = "md",
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-3xl shadow-card border border-slate-100 dark:bg-slate-800 dark:border-slate-700",
        hover && "transition-shadow duration-200 hover:shadow-card-hover cursor-pointer",
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
