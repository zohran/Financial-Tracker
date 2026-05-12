import { apiClient } from "@/services/api.client";

export type Account = {
  _id: string;
  userId: string;
  businessId: string;
  name: string;
  type: "CASH" | "BANK" | "WALLET" | "CUSTOM";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export const accountService = {
  list: (params: { businessId: string; includeDeleted?: boolean }) => {
    const qs = new URLSearchParams({
      businessId: params.businessId,
      includeDeleted: params.includeDeleted ? "true" : "false",
    });
    return apiClient.get<Account[]>(`/accounts?${qs.toString()}`);
  },
  create: (payload: { businessId: string; name: string; type: Account["type"] }) =>
    apiClient.post<Account>("/accounts", payload),
  softDelete: (accountId: string) => apiClient.del<{ deleted: true; id: string }>(`/accounts/${accountId}`),
};

