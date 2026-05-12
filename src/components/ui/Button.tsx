import * as React from "react";
import { cn } from "@/components/ui/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-soft hover:bg-blue-700 dark:hover:bg-blue-600",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800",
  danger:
    "bg-danger text-white hover:bg-red-700 dark:hover:bg-red-600",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          <span>Loading</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
});

