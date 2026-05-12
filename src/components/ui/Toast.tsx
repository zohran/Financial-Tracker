import * as React from "react";
import { cn } from "@/components/ui/cn";

type ToastKind = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  kind: ToastKind;
  title: string;
  message?: string;
};

type ToastContextValue = {
  push: (t: Omit<ToastItem, "id">) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    const item: ToastItem = { id, ...t };
    setItems((prev) => [item, ...prev].slice(0, 4));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-2xl border bg-white p-4 shadow-soft",
              "dark:border-slate-800 dark:bg-slate-900",
              t.kind === "success" ? "border-success/30" : null,
              t.kind === "error" ? "border-danger/30" : null,
              t.kind === "info" ? "border-primary/30" : null,
            )}
          >
            <div className="text-sm font-semibold">{t.title}</div>
            {t.message ? (
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t.message}</div>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

