"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <div className="container-app flex min-h-[calc(100vh-4rem)] items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white shadow-soft">
                FT
              </span>
              <span className="text-sm font-semibold tracking-tight">Financial Tracker</span>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
            </CardHeader>
            <CardContent>
              {children}
              <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
                {footer}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

