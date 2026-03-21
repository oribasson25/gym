"use client";

import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="pb-24 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
