import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

export type GlobalMonthFilter = "all-months" | "last-30-days" | "last-7-days";

type GlobalFilterContextValue = {
  monthFilter: GlobalMonthFilter;
  setMonthFilter: (value: GlobalMonthFilter) => void;
};

const GlobalFilterContext = createContext<GlobalFilterContextValue | null>(null);

export function GlobalFilterProvider({ children }: { children: ReactNode }) {
  const [monthFilter, setMonthFilter] = useState<GlobalMonthFilter>("all-months");

  const value = useMemo(
    () => ({
      monthFilter,
      setMonthFilter,
    }),
    [monthFilter],
  );

  return <GlobalFilterContext.Provider value={value}>{children}</GlobalFilterContext.Provider>;
}

export function useGlobalFilter() {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error("useGlobalFilter must be used within GlobalFilterProvider");
  }
  return context;
}
