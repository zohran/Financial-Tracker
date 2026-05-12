"use client";

import * as React from "react";
import { businessService, type Business } from "@/services/business.service";
import { useAppStore } from "@/store/app.store";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export function BusinessSelector() {
  const toast = useToast();
  const businessId = useAppStore((s) => s.businessId);
  const setBusinessId = useAppStore((s) => s.setBusinessId);

  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await businessService.list();
      setBusinesses(list);
      if (!businessId && list[0]?._id) setBusinessId(list[0]._id);
    } finally {
      setLoading(false);
    }
  }, [businessId, setBusinessId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const options = [
    { value: "", label: loading ? "Loading businesses..." : "Select business", disabled: true },
    ...businesses.map((b) => ({ value: b._id, label: b.name })),
  ];

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-[220px]">
        <Select
          aria-label="Select business"
          value={businessId ?? ""}
          onChange={(e) => setBusinessId(e.target.value)}
          options={options}
          disabled={loading || businesses.length === 0}
        />
      </div>
      <Button variant="secondary" onClick={() => setOpen(true)} size="md">
        New
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create business"
        description="Add another business and switch instantly."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={saving}
              onClick={async () => {
                if (!name.trim()) return;
                setSaving(true);
                try {
                  const created = await businessService.create({ name: name.trim() });
                  setName("");
                  setOpen(false);
                  toast.push({ kind: "success", title: "Business created" });
                  await load();
                  setBusinessId(created._id);
                } catch (e) {
                  toast.push({ kind: "error", title: "Failed to create business" });
                } finally {
                  setSaving(false);
                }
              }}
            >
              Create
            </Button>
          </>
        }
      >
        <Input label="Business name" value={name} onChange={(e) => setName(e.target.value)} />
      </Modal>
    </div>
  );
}

