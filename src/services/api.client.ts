import { useAppStore } from "@/store/app.store";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFail = { success: false; error: string; details?: unknown };
export type ApiResponse<T> = ApiSuccess<T> | ApiFail;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = path.startsWith("/api") ? path : `/api${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");

  if (init.auth !== false) {
    const token = useAppStore.getState().accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (!res.ok) {
    const msg = json && "error" in json ? json.error : `Request failed (${res.status})`;
    const details = json && "details" in json ? json.details : undefined;
    throw new ApiError(res.status, msg, details);
  }

  if (!json || (json as ApiFail).success === false) {
    throw new ApiError(500, (json as ApiFail)?.error ?? "Unexpected API response");
  }

  return (json as ApiSuccess<T>).data;
}

export const apiClient = {
  get: <T>(path: string, init?: RequestInit & { auth?: boolean }) =>
    request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestInit & { auth?: boolean }) =>
    request<T>(path, { ...init, method: "POST", body: JSON.stringify(body ?? {}) }),
  del: <T>(path: string, init?: RequestInit & { auth?: boolean }) =>
    request<T>(path, { ...init, method: "DELETE" }),
};

