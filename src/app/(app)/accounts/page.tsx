"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useAppStore } from "@/store/app.store";
import { accountService, type Account } from "@/services/account.service";
import { AddAccountModal } from "@/components/accounts/AddAccountModal";

export default function AccountsPage() {
  const router = useRouter();
  const toast = useToast();

  const businessId = useAppStore((s) => s.businessId);
  const accessToken = useAppStore((s) => s.accessToken);

  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  const load = React.useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const list = await accountService.list({ businessId, includeDeleted });
      setAccounts(list);
    } catch {
      toast.push({ kind: "error", title: "Failed to load accounts" });
    } finally {
      setLoading(false);
    }
  }, [businessId, includeDeleted, toast]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage cash, bank, wallet accounts. Soft-deleted accounts stay in analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIncludeDeleted((v) => !v)}>
            {includeDeleted ? "Hide deleted" : "Show deleted"}
          </Button>
          <Button onClick={() => setOpen(true)}>Add account</Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-20 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
              <div className="h-20 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-600 dark:text-slate-300">
              No accounts yet. Create one to start tracking.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((a) => (
                <div
                  key={a._id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="neutral">{a.type}</Badge>
                      {a.isDeleted ? <Badge variant="warning">Deleted</Badge> : null}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={a.isDeleted}
                      onClick={async () => {
                        if (!confirm(`Soft delete "${a.name}"? It will remain in analytics.`)) return;
                        try {
                          await accountService.softDelete(a._id);
                          toast.push({ kind: "success", title: "Account deleted" });
                          await load();
                        } catch {
                          toast.push({ kind: "error", title: "Failed to delete account" });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddAccountModal
        open={open}
        onClose={() => setOpen(false)}
        submitting={saving}
        onSubmit={async (payload) => {
          if (!businessId) return;
          setSaving(true);
          try {
            await accountService.create({ businessId, ...payload });
            toast.push({ kind: "success", title: "Account created" });
            await load();
          } catch {
            toast.push({ kind: "error", title: "Failed to create account" });
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}

