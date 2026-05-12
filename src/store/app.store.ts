import { create } from "zustand";

export type User = { id: string; email: string } | null;

export type DateRangePreset = "today" | "last7" | "last30" | "thisMonth" | "custom";

export type Filters = {
  range: DateRangePreset;
  from?: string;
  to?: string;
  search?: string;
};

type State = {
  user: User;
  accessToken: string | null;
  refreshToken: string | null;
  businessId: string | null;
  filters: Filters;
  hydrate: () => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearSession: () => void;
  setBusinessId: (businessId: string) => void;
  setFilters: (patch: Partial<Filters>) => void;
};

const STORAGE_KEY = "ft.session.v1";

export const useAppStore = create<State>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  businessId: null,
  filters: { range: "last7" },

  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<State>;
      set({
        user: parsed.user ?? null,
        accessToken: parsed.accessToken ?? null,
        refreshToken: parsed.refreshToken ?? null,
        businessId: parsed.businessId ?? null,
        filters: parsed.filters ?? { range: "last7" },
      });
    } catch {
      // ignore corrupt storage
    }
  },

  setTokens: ({ accessToken, refreshToken }) => {
    set({ accessToken, refreshToken });
    persist(get());
  },

  clearSession: () => {
    set({ user: null, accessToken: null, refreshToken: null, businessId: null });
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  },

  setBusinessId: (businessId) => {
    set({ businessId });
    persist(get());
  },

  setFilters: (patch) => {
    set((s) => ({ filters: { ...s.filters, ...patch } }));
    persist(get());
  },
}));

function persist(state: State) {
  if (typeof window === "undefined") return;
  const payload = {
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    businessId: state.businessId,
    filters: state.filters,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

