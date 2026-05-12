"use client";

import * as React from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { useAppStore } from "@/store/app.store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useAppStore((s: any) => s.hydrate);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  return <ToastProvider>{children}</ToastProvider>;
}
