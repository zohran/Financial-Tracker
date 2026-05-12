"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app.store";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { AccountCard } from "@/components/dashboard/AccountCard";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { financialsService } from "@/services/financials.service";
import { accountService, type Account } from "@/services/account.service";
import { transactionService, type Transaction } from "@/services/transaction.service";

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const businessId = useAppStore((s) => s.businessId);
  const filters = useAppStore((s) => s.filters);
  const accessToken = useAppStore((s) => s.accessToken);

  const [dashboardLoading, setDashboardLoading] = React.useState(true);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [skip, setSkip] = React.useState(0);
  const [hasNext, setHasNext] = React.useState(false);

  const [openTx, setOpenTx] = React.useState(false);
  const [savingTx, setSavingTx] = React.useState(false);

  const [dashboard, setDashboard] = React.useState<{
    totals: { income: number; expense: number; net: number };
    accounts: Array<{
      accountId: string;
      name: string;
      type: string;
      isDeleted: boolean;
      openingBalance: number;
      balance: number;
    }>;
  } | null>(null);

  React.useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  const load = React.useCallback(async () => {
    if (!businessId) return;
    setDashboardLoading(true);
    try {
      const [dash, acc, tx] = await Promise.all([
        financialsService.dashboard({ businessId, range: filters.range }),
        accountService.list({ businessId, includeDeleted: true }),
        transactionService.list({ businessId, range: filters.range, limit: 10, skip }),
      ]);
      setDashboard({ totals: dash.totals, accounts: dash.accounts });
      setAccounts(acc);
      setTransactions(tx);
      setHasNext(tx.length === 10);
    } catch {
      toast.push({ kind: "error", title: "Failed to load dashboard" });
    } finally {
      setDashboardLoading(false);
    }
  }, [businessId, filters.range, skip, toast]);

  React.useEffect(() => {
    setSkip(0);
  }, [businessId, filters.range]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Account balances and recent transactions.
          </p>
        </div>
        <Button onClick={() => setOpenTx(true)}>Add transaction</Button>
      </div>

      {dashboardLoading || !dashboard ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
          <div className="h-24 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboard.accounts.map((a) => (
              <AccountCard
                key={a.accountId}
                name={a.name}
                type={a.type}
                balance={a.balance}
                openingBalance={a.openingBalance}
                isDeleted={a.isDeleted}
              />
            ))}
          </div>

          <FinancialSummary
            income={dashboard.totals.income}
            expense={dashboard.totals.expense}
            net={dashboard.totals.net}
          />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Recent transactions
              </h2>
              <Button variant="ghost" onClick={() => router.push("/transactions")}>
                View all
              </Button>
            </div>
            <TransactionTable
              transactions={transactions}
              accounts={accounts}
              disablePrev={skip === 0}
              disableNext={!hasNext}
              onPrev={() => setSkip((s) => Math.max(0, s - 10))}
              onNext={() => setSkip((s) => s + 10)}
            />
          </div>
        </>
      )}

      <TransactionModal
        open={openTx}
        onClose={() => setOpenTx(false)}
        accounts={accounts}
        submitting={savingTx}
        onSubmit={async (payload) => {
          if (!businessId) return;
          setSavingTx(true);
          try {
            await transactionService.create({ businessId, ...payload });
            toast.push({ kind: "success", title: "Transaction saved" });
            await load();
          } catch {
            toast.push({ kind: "error", title: "Failed to save transaction" });
          } finally {
            setSavingTx(false);
          }
        }}
      />
    </div>
  );
}
