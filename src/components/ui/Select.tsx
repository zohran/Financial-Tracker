import * as React from "react";
import { cn } from "@/components/ui/cn";

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string | null;
  options: SelectOption[];
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, id, options, ...props },
  ref,
) {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;

  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      ) : null}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "h-11 w-full rounded-2xl border bg-white px-4 text-sm shadow-sm outline-none transition",
          "border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20",
          "dark:border-slate-800 dark:bg-slate-900",
          error ? "border-danger focus:border-danger focus:ring-danger/20" : null,
          className,
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
});

