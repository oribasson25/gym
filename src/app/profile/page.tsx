"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, NumberInput } from "@/components/ui/Input";
import { useTheme } from "@/components/ThemeProvider";
import Image from "next/image";

type UserData = {
  name: string;
  role: string;
  age: number;
  weightKg: number;
  heightCm: number;
  photoUrl: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [form, setForm] = useState<UserData>({
    name: "",
    role: "USER",
    age: 25,
    weightKg: 75,
    heightCm: 175,
    photoUrl: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setForm(d.user);
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const bmi = user
    ? (user.weightKg / Math.pow(user.heightCm / 100, 2)).toFixed(1)
    : null;

  return (
    <AppShell userName={user?.name}>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4 space-y-5">
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">פרופיל</h1>

        {/* Avatar */}
        <Card className="flex flex-col items-center gap-4 text-center">
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-primary-50">
            {user?.photoUrl ? (
              <Image src={user.photoUrl} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-primary font-black">
                {user?.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user?.name}</h2>
            {bmi && (
              <p className="text-slate-400 text-sm">
                BMI: {bmi} · {user?.heightCm} ס״מ · {user?.weightKg} ק״ג
              </p>
            )}
          </div>
        </Card>

        {/* Edit form */}
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">עדכון פרטים</h3>

          <Input
            label="שם"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <NumberInput
            label="גיל"
            value={form.age}
            onChange={(v) => setForm((f) => ({ ...f, age: v }))}
            min={10}
            max={100}
            step={1}
            suffix="שנה"
          />
          <NumberInput
            label="משקל"
            value={form.weightKg}
            onChange={(v) => setForm((f) => ({ ...f, weightKg: v }))}
            min={30}
            max={300}
            step={0.5}
            suffix="ק״ג"
          />
          <NumberInput
            label="גובה"
            value={form.heightCm}
            onChange={(v) => setForm((f) => ({ ...f, heightCm: v }))}
            min={100}
            max={250}
            step={1}
            suffix="ס״מ"
          />

          {saved && (
            <p className="text-success text-sm font-semibold text-center">
              ✓ נשמר בהצלחה
            </p>
          )}

          <Button fullWidth loading={saving} onClick={handleSave}>
            שמור שינויים
          </Button>
        </Card>

        {/* Admin panel link */}
        {user?.role === "ADMIN" && (
          <button
            onClick={() => router.push("/admin")}
            className="w-full py-3 bg-indigo-50 dark:bg-indigo-950 text-primary text-sm font-semibold rounded-2xl active:scale-95 transition-all"
          >
            ניהול משתמשים
          </button>
        )}

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-between px-5 active:scale-[0.98] transition-all"
        >
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {theme === "dark" ? "מצב כהה" : "מצב בהיר"}
          </span>
          <div className="relative w-12 h-7 rounded-full bg-slate-200 dark:bg-primary transition-colors">
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                theme === "dark" ? "right-0.5" : "right-[22px]"
              }`}
            />
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={async () => {
            await fetch("/api/auth/select", { method: "DELETE" });
            router.push("/");
          }}
          className="w-full py-3 text-slate-400 text-sm font-medium active:scale-95 transition-all"
        >
          התנתק
        </button>
      </div>
    </AppShell>
  );
}
