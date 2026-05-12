import { apiClient } from "@/services/api.client";

export type AuthResult = {
  user: { id: string; email: string };
  accessToken: string;
  refreshToken: string;
};

export const authService = {
  register: (payload: { email: string; password: string }) =>
    apiClient.post<AuthResult>("/auth/register", payload, { auth: false }),
  login: (payload: { email: string; password: string }) =>
    apiClient.post<AuthResult>("/auth/login", payload, { auth: false }),
  refresh: (payload: { refreshToken: string }) =>
    apiClient.post<AuthResult>("/auth/refresh", payload, { auth: false }),
  logout: () => apiClient.post<{ loggedOut: true }>("/auth/logout", {}, { auth: true }),
  me: () => apiClient.get<{ id: string; email: string }>("/users/me", { auth: true }),
};

