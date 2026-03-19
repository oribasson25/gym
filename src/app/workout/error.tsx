"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Workout error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 gap-6">
      <div className="text-5xl">⚠️</div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800">משהו השתבש</h2>
        <p className="text-slate-500 text-sm mt-1">{error.message}</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={reset}
          className="w-full bg-primary text-white font-semibold rounded-full px-6 py-3 active:scale-95 transition-all"
        >
          נסה שוב
        </button>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full text-slate-500 font-medium rounded-full px-6 py-3 hover:bg-slate-100 active:scale-95 transition-all"
        >
          חזרה לדשבורד
        </button>
      </div>
    </div>
  );
}
