import * as React from "react";
import { cn } from "@/components/ui/cn";

export function Table({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft",
        "dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
      {...props}
    />
  );
}

export function TableInner({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-left text-sm", className)} {...props} />;
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "whitespace-nowrap border-b border-slate-200 px-4 py-3 text-sm text-slate-800 dark:border-slate-800 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

