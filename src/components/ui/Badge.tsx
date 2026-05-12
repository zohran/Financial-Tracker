import * as React from "react";
import { cn } from "@/components/ui/cn";

type Variant = "success" | "danger" | "warning" | "neutral";

export function Badge({
  className,
  variant = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warning: "bg-warning/10 text-warning",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

