"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type UserSummary = {
  id: string;
  name: string;
  photoUrl: string | null;
};

export function UserPicker({ users }: { users: UserSummary[] }) {
  const router = useRouter();

  const selectUser = async (userId: string) => {
    await fetch("/api/auth/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-primary/30">
            💪
          </div>
          <h1 className="text-2xl font-black text-slate-800">Gym Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">מי מתאמן היום?</p>
        </div>

        {/* Users */}
        <div className="space-y-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => selectUser(user.id)}
              className="w-full flex items-center gap-4 bg-white rounded-3xl p-4 shadow-card
                         border border-slate-100 active:scale-[0.98] transition-all text-right"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary-50 flex-shrink-0 flex items-center justify-center">
                {user.photoUrl ? (
                  <Image src={user.photoUrl} alt={user.name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-2xl font-black text-primary">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="flex-1 font-bold text-slate-800 text-lg">{user.name}</span>
              <span className="text-slate-300 text-xl">←</span>
            </button>
          ))}
        </div>

        {/* Add new user */}
        <Link
          href="/setup"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full
                     border-2 border-dashed border-slate-300 text-slate-400 font-semibold
                     active:scale-[0.98] transition-all"
        >
          + הוסף משתמש חדש
        </Link>
      </div>
    </div>
  );
}
