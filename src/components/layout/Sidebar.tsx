"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "אימון", icon: "⚡" },
  { href: "/history", label: "היסטוריה", icon: "📊" },
  { href: "/progress-photo", label: "תמונות", icon: "📷" },
  { href: "/profile", label: "פרופיל", icon: "👤" },
];

export function Sidebar({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col w-64 bg-white border-l border-slate-100
                    shadow-card min-h-screen fixed right-0 top-0 z-30"
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white text-xl">
            💪
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg leading-tight">
              Gym Tracker
            </p>
            {userName && (
              <p className="text-slate-400 text-sm">{userName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl",
                "font-medium transition-all duration-150",
                active
                  ? "bg-primary-50 text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">Gym Tracker v1.0</p>
      </div>
    </aside>
  );
}
