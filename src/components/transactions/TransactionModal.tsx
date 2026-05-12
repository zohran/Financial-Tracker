"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Account } from "@/services/account.service";

export function TransactionModal({
  open,
  onClose,
  accounts,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  submitting: boolean;
  onSubmit: (payload: {
    amount: number;
    type: "INCOME" | "EXPENSE";
    accountId: string;
    description?: string;
  }) => Promise<void>;
}) {
  const [amount, setAmount] = React.useState<string>("");
  const [type, setType] = React.useState<"INCOME" | "EXPENSE">("INCOME");
  const [accountId, setAccountId] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");

  React.useEffect(() => {
    if (open && !accountId && accounts[0]?._id) setAccountId(accounts[0]._id);
  }, [open, accountId, accounts]);

  const amountNum = Number(amount);
  const valid = Number.isFinite(amountNum) && amountNum > 0 && accountId.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add transaction"
      description="Record an income or expense. Amount is always positive."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={submitting}
            disabled={!valid}
            onClick={async () => {
              if (!valid) return;
              await onSubmit({
                amount: amountNum,
                type,
                accountId,
                description: description.trim() ? description.trim() : undefined,
              });
              setAmount("");
              setDescription("");
              onClose();
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Amount"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as "INCOME" | "EXPENSE")}
          options={[
            { value: "INCOME", label: "Income" },
            { value: "EXPENSE", label: "Expense" },
          ]}
        />
        <Select
          label="Account"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          options={accounts
            .filter((a) => !a.isDeleted)
            .map((a) => ({ value: a._id, label: `${a.name} (${a.type})` }))}
        />
        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Client payment"
        />
      </div>
    </Modal>
  );
}

