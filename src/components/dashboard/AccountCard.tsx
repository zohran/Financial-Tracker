"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

export function AccountCard({
  name,
  openingBalance,
  balance,
  type,
  isDeleted,
}: {
  name: string;
  type: string;
  openingBalance: number;
  balance: number;
  isDeleted: boolean;
}) {
  const positive = balance >= 0;

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-x-0 top-0 h-1", positive ? "bg-success" : "bg-danger")} />
      <CardContent>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{name}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {type}
              {isDeleted ? " • Deleted" : ""}
            </div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Opening: <span className="font-medium text-slate-700 dark:text-slate-200">{formatMoney(openingBalance)}</span>
            </div>
          </div>
          <div
            className={cn(
              "text-lg font-semibold tracking-tight",
              positive ? "text-success" : "text-danger",
            )}
          >
            {formatMoney(balance)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}
