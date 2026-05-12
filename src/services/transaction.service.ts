import { apiClient } from "@/services/api.client";

export type Transaction = {
  _id: string;
  userId: string;
  businessId: string;
  accountId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string | null;
  category: string | null;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ListTransactionsQuery = {
  businessId: string;
  accountId?: string;
  type?: Transaction["type"];
  range?: "today" | "last7" | "last30" | "thisMonth" | "custom";
  from?: string;
  to?: string;
  category?: string;
  limit?: number;
  skip?: number;
};

export const transactionService = {
  list: (query: ListTransactionsQuery) => {
    const qs = new URLSearchParams(Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
      if (v === undefined || v === null || v === "") return acc;
      acc[k] = String(v);
      return acc;
    }, {}));
    return apiClient.get<Transaction[]>(`/transactions?${qs.toString()}`);
  },
  create: (payload: {
    businessId: string;
    accountId: string;
    type: Transaction["type"];
    amount: number;
    description?: string;
    occurredAt?: string;
  }) => apiClient.post<Transaction>("/transactions", payload),
};

