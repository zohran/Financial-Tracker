"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { LayoutDashboard, ArrowLeftRight, Wallet, Building2 } from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/transactions", label: "Transactions", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { href: "/accounts", label: "Accounts", icon: <Wallet className="h-4 w-4" /> },
  { href: "/businesses", label: "Businesses", icon: <Building2 className="h-4 w-4" /> },
];

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950",
        collapsed ? "w-[76px]" : "w-[280px]",
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white shadow-soft">
            FT
          </div>
          {!collapsed ? (
            <div>
              <div className="text-sm font-semibold">Financial Tracker</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Multi-business</div>
            </div>
          ) : null}
        </div>
        <button
          aria-label="Toggle sidebar"
          onClick={onToggle}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50",
            "dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
            collapsed ? "rotate-180" : null,
          )}
        >
          <span className="text-lg leading-none">‹</span>
        </button>
      </div>

      <nav className="px-2 py-2">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900",
              )}
            >
              <span className="grid h-8 w-8 place-items-center">{item.icon}</span>
              {!collapsed ? <span className="font-medium">{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        {!collapsed ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Tip: Use date range + search in the navbar to filter transactions quickly.
          </div>
        ) : null}
      </div>
    </aside>
  );
}

