"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupAdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/setup-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "שגיאה");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-primary/30">
            💪
          </div>
          <h1 className="text-2xl font-black text-slate-800">הגדרת מנהל</h1>
          <p className="text-slate-500 text-sm mt-1">יצירת חשבון מנהל ראשי</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">שם מנהל</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הכנס שם"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3
                         text-slate-800 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary text-right"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="לפחות 4 תווים"
              required
              minLength={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3
                         text-slate-800 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary text-right"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600">אימות סיסמה</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="הכנס סיסמה שוב"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3
                         text-slate-800 placeholder-slate-400 focus:outline-none
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
            {loading ? "יוצר..." : "צור חשבון מנהל"}
          </button>
        </form>
      </div>
    </div>
  );
}
