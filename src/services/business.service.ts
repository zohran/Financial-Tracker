import { apiClient } from "@/services/api.client";

export type Business = {
  _id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const businessService = {
  list: () => apiClient.get<Business[]>("/business"),
  create: (payload: { name: string; description?: string }) =>
    apiClient.post<Business>("/business", payload),
};

