"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app.store";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { businessService, type Business } from "@/services/business.service";

export default function BusinessesPage() {
  const router = useRouter();
  const toast = useToast();
  const accessToken = useAppStore((s) => s.accessToken);
  const setBusinessId = useAppStore((s) => s.setBusinessId);

  const [items, setItems] = React.useState<Business[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  React.useEffect(() => {
    setLoading(true);
    businessService
      .list()
      .then(setItems)
      .catch(() => toast.push({ kind: "error", title: "Failed to load businesses" }))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Businesses</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Multi-business switching is handled from the navbar. This page is future-ready.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="h-32 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((b) => (
                <div
                  key={b._id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <div className="text-sm font-semibold">{b.name}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {b.description ?? "—"}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setBusinessId(b._id);
                      toast.push({ kind: "success", title: "Business selected" });
                      router.push("/dashboard");
                    }}
                  >
                    Select
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

