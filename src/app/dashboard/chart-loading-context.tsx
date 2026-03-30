"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ChartLoadingContextValue {
  isChartLoading: boolean;
  setChartLoading: (value: boolean) => void;
}

const ChartLoadingContext = createContext<ChartLoadingContextValue | null>(null);

/** Lets the operator filter signal loading while RSC refreshes chart data after URL change. */
export function ChartLoadingProvider({ children }: { children: ReactNode }) {
  const [isChartLoading, setChartLoading] = useState(false);
  const value = useMemo(
    () => ({ isChartLoading, setChartLoading }),
    [isChartLoading],
  );

  return (
    <ChartLoadingContext.Provider value={value}>
      {children}
    </ChartLoadingContext.Provider>
  );
}

export function useDashboardChartLoading(): ChartLoadingContextValue {
  const ctx = useContext(ChartLoadingContext);
  if (!ctx) {
    return {
      isChartLoading: false,
      setChartLoading: (_value: boolean) => undefined,
    };
  }
  return ctx;
}
