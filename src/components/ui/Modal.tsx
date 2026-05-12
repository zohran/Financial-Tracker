import * as React from "react";
import { cn } from "@/components/ui/cn";

export type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Modal({ open, title, description, onClose, children, footer }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <div className="relative mx-auto flex min-h-full max-w-lg items-center px-4 py-10">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-full rounded-2xl border border-slate-200 bg-white shadow-soft",
            "dark:border-slate-800 dark:bg-slate-900",
          )}
        >
          {(title || description) && (
            <div className="border-b border-slate-200 p-6 dark:border-slate-800">
              {title ? <h2 className="text-base font-semibold">{title}</h2> : null}
              {description ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
              ) : null}
            </div>
          )}
          <div className="p-6">{children}</div>
          {footer ? (
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6 dark:border-slate-800">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

