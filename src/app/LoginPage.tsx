"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "שגיאה בכניסה");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-primary/30">
            💪
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Gym Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">כניסה למערכת</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-card border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">שם משתמש</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס שם"
              required
              autoComplete="username"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3
                         text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary text-right"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הכנס סיסמה"
              required
              autoComplete="current-password"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3
                         text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary text-right"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-2xl
                       active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? "נכנס..." : "כניסה"}
          </button>
        </form>
      </div>
    </div>
  );
}
