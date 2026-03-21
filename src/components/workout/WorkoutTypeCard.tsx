"use client";

import { WorkoutTypeInfo } from "@/types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { TYPE_TO_SLUG } from "@/types";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface WorkoutTypeCardProps {
  info: WorkoutTypeInfo;
  lastSessionDate?: Date | null;
  isAdmin?: boolean;
}

export function WorkoutTypeCard({ info, lastSessionDate, isAdmin }: WorkoutTypeCardProps) {
  const slug = TYPE_TO_SLUG[info.type];

  return (
    <Card
      className="relative overflow-hidden"
      padding="none"
    >
      {/* Color strip */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1.5 rounded-r-3xl"
        style={{ backgroundColor: info.color }}
      />

      <div className="flex items-center gap-0">
        {/* Main tap area → workout */}
        <Link href={`/workout/${slug}`} className="flex-1 p-4 active:bg-slate-50 dark:active:bg-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: info.bgColor }}
            >
              {info.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{info.labelHe}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{info.description}</p>
              {lastSessionDate ? (
                <p className="text-xs text-slate-400 mt-1">
                  אחרון: {format(new Date(lastSessionDate), "d בMMM", { locale: he })}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">טרם אומן</p>
              )}
            </div>
          </div>
        </Link>

        {/* Edit plan button - admin only */}
        {isAdmin && (
          <Link
            href={`/plans/${slug}`}
            className={cn(
              "flex-shrink-0 w-12 h-12 mx-3 rounded-2xl flex items-center justify-center",
              "active:scale-90 transition-all"
            )}
            style={{ backgroundColor: info.bgColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" style={{ color: info.color }}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </Link>
        )}
      </div>
    </Card>
  );
}
