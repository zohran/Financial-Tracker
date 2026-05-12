"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableInner, Th, Td } from "@/components/ui/Table";
import type { Account } from "@/services/account.service";
import type { Transaction } from "@/services/transaction.service";

export function TransactionTable({
  transactions,
  accounts,
  onNext,
  onPrev,
  disablePrev,
  disableNext,
}: {
  transactions: Transaction[];
  accounts: Account[];
  onNext: () => void;
  onPrev: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}) {
  const accountNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const a of accounts) map.set(a._id, a.name);
    return map;
  }, [accounts]);

  return (
    <div className="space-y-3">
      <Table className="overflow-x-auto">
        <TableInner>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th className="text-right">Amount</Th>
              <Th>Account</Th>
              <Th>Description</Th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <Td colSpan={5} className="py-10 text-center text-slate-500 dark:text-slate-400">
                  No transactions yet.
                </Td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t._id}>
                  <Td>{formatDate(t.occurredAt)}</Td>
                  <Td>
                    <Badge variant={t.type === "INCOME" ? "success" : "danger"}>{t.type}</Badge>
                  </Td>
                  <Td className="text-right font-medium">
                    {formatMoney(t.amount)}
                  </Td>
                  <Td className="text-slate-600 dark:text-slate-300">
                    {accountNameById.get(t.accountId) ?? "—"}
                  </Td>
                  <Td className="max-w-[220px] truncate text-slate-600 dark:text-slate-300 sm:max-w-[340px]">
                    {t.description ?? "—"}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableInner>
      </Table>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onPrev} disabled={disablePrev}>
          Prev
        </Button>
        <Button variant="secondary" onClick={onNext} disabled={disableNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

