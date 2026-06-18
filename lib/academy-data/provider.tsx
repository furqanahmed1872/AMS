"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AcademyContextValue } from "./types";

const AcademyDataContext = createContext<AcademyContextValue | null>(null);

/**
 * Wraps everything rendered inside app/app/layout.tsx. By the time this
 * provider mounts, the full dataset has already been fetched server-side
 * (see get-bootstrap-data.ts) and loading.tsx has already been swapped
 * out — so every page below simply reads from context, no spinners,
 * no re-fetching, no waterfalls.
 */
export function AcademyDataProvider({
  value,
  children,
}: {
  value: AcademyContextValue;
  children: ReactNode;
}) {
  return <AcademyDataContext.Provider value={value}>{children}</AcademyDataContext.Provider>;
}

export function useAcademyData(): AcademyContextValue {
  const ctx = useContext(AcademyDataContext);
  if (!ctx) {
    throw new Error(
      "useAcademyData() must be called from a component rendered inside app/app/layout.tsx"
    );
  }
  return ctx;
}
