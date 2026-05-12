"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <main className="flex-1">
          <div className="container-app py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
