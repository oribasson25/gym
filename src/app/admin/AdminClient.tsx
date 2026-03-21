"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils/cn";
import { WORKOUT_TYPES, TYPE_TO_SLUG } from "@/types";

type UserRow = {
  id: string;
  name: string;
  role: string;
  hasPassword: boolean;
  createdAt: string;
};

export function AdminClient() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Create user form
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Plans management
  const [plansUserId, setPlansUserId] = useState<string | null>(null);

  // Reset password
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, password: newPassword }),
    });
    if (res.ok) {
      setNewName("");
      setNewPassword("");
      load();
    } else {
      const data = await res.json();
      setCreateError(data.error ?? "שגיאה");
    }
    setCreating(false);
  };

  const resetPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetting(true);
    setResetError(null);
    const res = await fetch(`/api/admin/users/${resetId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPassword }),
    });
    if (res.ok) {
      setResetId(null);
      setResetPassword("");
    } else {
      const data = await res.json();
      setResetError(data.error ?? "שגיאה");
    }
    setResetting(false);
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) load();
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`למחוק את המשתמש "${name}"?`)) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AppShell>
      <div className="px-4 pt-5 pb-4 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center
                       justify-center text-slate-500 active:scale-90 transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800">ניהול משתמשים</h1>
            <p className="text-slate-400 text-xs">הוספה, מחיקה ואיפוס סיסמאות</p>
          </div>
        </div>

        {/* Create user */}
        <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-100 space-y-3">
          <h2 className="font-bold text-slate-700 text-sm">הוסף משתמש חדש</h2>
          <form onSubmit={createUser} className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="שם משתמש"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3
                         text-slate-800 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary text-right text-sm"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="סיסמה (לפחות 4 תווים)"
              required
              minLength={4}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3
                         text-slate-800 placeholder-slate-400 focus:outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary text-right text-sm"
            />
            {createError && (
              <p className="text-sm text-red-500 text-center">{createError}</p>
            )}
            <button
              type="submit"
              disabled={creating}
              className="w-full bg-primary text-white font-bold py-3 rounded-2xl text-sm
                         active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {creating ? "יוצר..." : "+ הוסף משתמש"}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div className="bg-white rounded-3xl p-4 shadow-card border border-slate-100 space-y-3">
          <h2 className="font-bold text-slate-700 text-sm">משתמשים קיימים</h2>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="bg-slate-50 rounded-2xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center
                                      text-primary font-black text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-400">
                          {u.role === "ADMIN" ? "מנהל" : "משתמש"} ·{" "}
                          {u.hasPassword ? "יש סיסמה" : "אין סיסמה"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleRole(u.id, u.role)}
                        className={cn(
                          "text-xs font-semibold px-3 py-1.5 rounded-xl active:scale-90 transition-all",
                          u.role === "ADMIN"
                            ? "bg-primary-50 text-primary"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {u.role === "ADMIN" ? "מנהל" : "מתאמן"}
                      </button>
                      <button
                        onClick={() => { setResetId(u.id); setResetPassword(""); setResetError(null); }}
                        className="text-xs bg-amber-50 text-amber-600 font-semibold px-3 py-1.5 rounded-xl active:scale-90 transition-all"
                      >
                        סיסמה
                      </button>
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          className="text-xs bg-red-50 text-red-500 font-semibold px-3 py-1.5 rounded-xl active:scale-90 transition-all"
                        >
                          מחק
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Workout plans management */}
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => setPlansUserId(plansUserId === u.id ? null : u.id)}
                      className="text-xs bg-green-50 text-green-600 font-semibold px-3 py-1.5 rounded-xl active:scale-90 transition-all"
                    >
                      {plansUserId === u.id ? "סגור תוכניות" : "תוכניות אימון"}
                    </button>
                  </div>

                  {plansUserId === u.id && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {WORKOUT_TYPES.map((wt) => (
                        <Link
                          key={wt.type}
                          href={`/plans/${TYPE_TO_SLUG[wt.type]}?userId=${u.id}&userName=${encodeURIComponent(u.name)}`}
                          className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-white
                                     active:scale-95 transition-all"
                        >
                          <span className="text-lg">{wt.icon}</span>
                          <span className="text-xs font-semibold text-slate-700">{wt.labelHe}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Inline reset password */}
                  {resetId === u.id && (
                    <form onSubmit={resetPass} className="mt-3 flex gap-2">
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="סיסמה חדשה"
                        required
                        minLength={4}
                        autoFocus
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2
                                   text-slate-800 placeholder-slate-400 focus:outline-none
                                   focus:ring-2 focus:ring-primary/30 focus:border-primary text-right text-sm"
                      />
                      <button
                        type="submit"
                        disabled={resetting}
                        className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl
                                   active:scale-90 transition-all disabled:opacity-60"
                      >
                        {resetting ? "..." : "שמור"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetId(null)}
                        className="bg-slate-100 text-slate-500 text-sm font-bold px-3 py-2 rounded-xl active:scale-90 transition-all"
                      >
                        ✕
                      </button>
                    </form>
                  )}
                  {resetId === u.id && resetError && (
                    <p className="text-xs text-red-500 mt-1 text-center">{resetError}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
