"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

export function FinancialSummary({
  income,
  expense,
  net,
}: {
  income: number;
  expense: number;
  net: number;
}) {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Total income" value={formatMoney(income)} tone="success" />
        <Stat label="Total expense" value={formatMoney(expense)} tone="danger" />
        <Stat label="Net" value={formatMoney(net)} tone={net >= 0 ? "success" : "danger"} />
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className={cn("mt-1 text-lg font-semibold", tone === "success" ? "text-success" : "text-danger")}>
        {value}
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

