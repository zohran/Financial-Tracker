"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app.store";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { transactionService, type Transaction } from "@/services/transaction.service";
import { accountService, type Account } from "@/services/account.service";

export default function TransactionsPage() {
  const router = useRouter();
  const toast = useToast();

  const accessToken = useAppStore((s) => s.accessToken);
  const businessId = useAppStore((s) => s.businessId);
  const filters = useAppStore((s) => s.filters);
  const setFilters = useAppStore((s) => s.setFilters);

  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [items, setItems] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [skip, setSkip] = React.useState(0);
  const [hasNext, setHasNext] = React.useState(false);

  const [openTx, setOpenTx] = React.useState(false);
  const [savingTx, setSavingTx] = React.useState(false);

  const [accountId, setAccountId] = React.useState<string>("");
  const [type, setType] = React.useState<"" | "INCOME" | "EXPENSE">("");

  React.useEffect(() => {
    if (!accessToken) router.replace("/login");
  }, [accessToken, router]);

  React.useEffect(() => {
    setSkip(0);
  }, [businessId, filters.range, filters.search, accountId, type]);

  const load = React.useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [acc, tx] = await Promise.all([
        accountService.list({ businessId, includeDeleted: false }),
        transactionService.list({
          businessId,
          range: filters.range,
          limit: 20,
          skip,
          accountId: accountId || undefined,
          type: type || undefined,
        }),
      ]);
      setAccounts(acc);
      setItems(tx);
      setHasNext(tx.length === 20);
    } catch {
      toast.push({ kind: "error", title: "Failed to load transactions" });
    } finally {
      setLoading(false);
    }
  }, [accountId, businessId, filters.range, skip, toast, type]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const accountOptions = [
    { value: "", label: "All accounts" },
    ...accounts.map((a) => ({ value: a._id, label: a.name })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Search, filter, and paginate across income and expenses.
          </p>
        </div>
        <Button onClick={() => setOpenTx(true)}>Add transaction</Button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">
        <Select
          label="Account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accountOptions}
        />
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          options={[
            { value: "", label: "All" },
            { value: "INCOME", label: "Income" },
            { value: "EXPENSE", label: "Expense" },
          ]}
        />
        <Input
          label="Search"
          placeholder="(Dashboard search will also apply later)"
          value={filters.search ?? ""}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/60" />
      ) : (
        <TransactionTable
          transactions={items}
          accounts={accounts}
          disablePrev={skip === 0}
          disableNext={!hasNext}
          onPrev={() => setSkip((s) => Math.max(0, s - 20))}
          onNext={() => setSkip((s) => s + 20)}
        />
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

