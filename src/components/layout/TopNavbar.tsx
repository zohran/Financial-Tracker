"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { BusinessSelector } from "@/components/layout/BusinessSelector";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAppStore, type DateRangePreset } from "@/store/app.store";
import { authService } from "@/services/auth.service";
import { useToast } from "@/components/ui/Toast";

const rangeOptions = [
  { value: "today", label: "Today" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "custom", label: "Custom" },
] as const;

export function TopNavbar() {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const clearSession = useAppStore((s) => s.clearSession);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);
  const user = useAppStore((s) => s.user);

  const showSearch = pathname === "/transactions" || pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
      <div className="container-app flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <BusinessSelector />
          <div className="hidden md:block">
            <Select
              aria-label="Date range"
              value={filters.range}
              onChange={(e) => setFilters({ range: e.target.value as DateRangePreset })}
              options={rangeOptions.map((o) => ({ value: o.value, label: o.label }))}
            />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {showSearch ? (
            <div className="hidden lg:block lg:min-w-[360px]">
              <Input
                aria-label="Search"
                placeholder="Search description, category..."
                value={filters.search ?? ""}
                onChange={(e) => setFilters({ search: e.target.value })}
              />
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-sm text-slate-600 dark:text-slate-300">
              {user ? user.email : "—"}
            </div>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await authService.logout();
                } catch {
                  // ignore
                }
                clearSession();
                toast.push({ kind: "info", title: "Signed out" });
                router.replace("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

