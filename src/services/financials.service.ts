import { apiClient } from "@/services/api.client";

export type DashboardResult = {
  businessId: string;
  range: { from: string | null; to: string | null };
  totals: { income: number; expense: number; net: number };
  accounts: Array<{
    accountId: string;
    name: string;
    type: string;
    isDeleted: boolean;
    openingBalance: number;
    income: number;
    expense: number;
    balance: number;
  }>;
};

export const financialsService = {
  dashboard: (query: { businessId: string; range?: string; from?: string; to?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
        if (!v) return acc;
        acc[k] = v;
        return acc;
      }, {}),
    );
    return apiClient.get<DashboardResult>(`/financials/dashboard?${qs.toString()}`);
  },
};
