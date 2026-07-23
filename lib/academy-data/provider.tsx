"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  type Dispatch,
} from "react";
import type { AcademyContextValue, AcademyBootstrapData } from "./types";
import { academyDataReducer, type AcademyDataAction } from "./reducer";

const AcademyDataContext = createContext<AcademyContextValue | null>(null);
const AcademyDataDispatchContext =
  createContext<Dispatch<AcademyDataAction> | null>(null);

/**
 * Wraps everything rendered inside app/app/layout.tsx. The initial value
 * still comes from the server-side bootstrap fetch (get-bootstrap-data.ts)
 * — nothing changes about first load. What's new: the bootstrap data now
 * lives in a reducer, so useRealtimeSync() (see
 * components/providers/RealtimeProvider.tsx) can patch individual rows in
 * from realtime events instead of the old approach, which threw the whole
 * dataset away and re-fetched it on every table change via router.refresh().
 */
export function AcademyDataProvider({
  value,
  children,
}: {
  value: AcademyContextValue;
  children: ReactNode;
}) {
  const { role, academyId, academyName, ...bootstrap } = value;
  const [data, dispatch] = useReducer(
    academyDataReducer,
    bootstrap as AcademyBootstrapData,
  );

  const merged: AcademyContextValue = { ...data, role, academyId, academyName };

  return (
    <AcademyDataDispatchContext.Provider value={dispatch}>
      <AcademyDataContext.Provider value={merged}>
        {children}
      </AcademyDataContext.Provider>
    </AcademyDataDispatchContext.Provider>
  );
}

export function useAcademyData(): AcademyContextValue {
  const ctx = useContext(AcademyDataContext);
  if (!ctx) {
    throw new Error(
      "useAcademyData() must be called from a component rendered inside app/app/layout.tsx",
    );
  }
  return ctx;
}

/** Internal — used by useRealtimeSync() to push patches into the context. */
export function useAcademyDataDispatch(): Dispatch<AcademyDataAction> {
  const ctx = useContext(AcademyDataDispatchContext);
  if (!ctx) {
    throw new Error(
      "useAcademyDataDispatch() must be called from a component rendered inside app/app/layout.tsx",
    );
  }
  return ctx;
}
