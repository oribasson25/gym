"use client";

import { cn } from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef, useState, useEffect } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? `input-${Math.random().toString(36).slice(2)}` : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 dark:bg-slate-800 dark:border-slate-600",
            "text-slate-800 placeholder-slate-400 dark:text-slate-100",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
            "transition-all duration-150",
            error && "border-danger focus:ring-danger/30 focus:border-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  error?: string;
  className?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 0.5,
  suffix,
  error,
  className,
}: NumberInputProps) {
  // Keep a local string so the user can freely type without the value jumping
  const [raw, setRaw] = useState(String(value));

  // Sync from parent only when not focused
  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  const commit = (str: string) => {
    const parsed = parseFloat(str);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(clamped);
      setRaw(String(clamped));
    } else {
      setRaw(String(value));
    }
  };

  const decrement = () => {
    const next = parseFloat((value - step).toFixed(4));
    const clamped = Math.max(min, next);
    onChange(clamped);
    setRaw(String(clamped));
  };

  const increment = () => {
    const next = parseFloat((value + step).toFixed(4));
    const clamped = Math.min(max, next);
    onChange(clamped);
    setRaw(String(clamped));
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>
      )}
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-2xl px-2 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        {/* Decrement — physically first in DOM, shown on right in RTL via flex-row-reverse */}
        <button
          type="button"
          onClick={decrement}
          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center
                     text-slate-600 dark:text-slate-200 font-bold text-xl active:bg-slate-100 dark:active:bg-slate-600 transition-all active:scale-90 select-none flex-shrink-0"
        >
          −
        </button>

        {/* Value + suffix in the center */}
        <div className="flex-1 flex items-center justify-center gap-1">
          <input
            type="text"
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(raw);
            }}
            dir="ltr"
            className="w-16 text-center bg-transparent text-slate-800 dark:text-slate-100 font-bold text-lg
                       focus:outline-none border-none p-0 leading-none"
          />
          {suffix && (
            <span className="text-slate-400 text-sm font-medium">{suffix}</span>
          )}
        </div>

        {/* Increment */}
        <button
          type="button"
          onClick={increment}
          className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center
                     text-slate-600 dark:text-slate-200 font-bold text-xl active:bg-slate-100 dark:active:bg-slate-600 transition-all active:scale-90 select-none flex-shrink-0"
        >
          +
        </button>
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
    </div>
  );
}
