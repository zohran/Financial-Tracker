"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export function AddAccountModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (payload: { name: string; type: "CASH" | "BANK" | "WALLET" | "CUSTOM" }) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<"CASH" | "BANK" | "WALLET" | "CUSTOM">("CUSTOM");

  const valid = name.trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add account"
      description="Create a new cash/bank/wallet source."
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
              await onSubmit({ name: name.trim(), type });
              setName("");
              setType("CUSTOM");
              onClose();
            }}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input label="Account name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meezan Bank" />
        <Select
          label="Type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          options={[
            { value: "CASH", label: "Cash" },
            { value: "BANK", label: "Bank" },
            { value: "WALLET", label: "Wallet" },
            { value: "CUSTOM", label: "Custom" },
          ]}
        />
      </div>
    </Modal>
  );
}

