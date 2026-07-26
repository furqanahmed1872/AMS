"use client";

import { useEffect, useRef } from "react";
import {
  createClient,
  type RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { useAcademyDataDispatch } from "@/lib/academy-data/provider";
import { getAcademyDerivedStats } from "@/lib/academy-data/get-derived-stats";
import type { EntityTable } from "@/lib/academy-data/reducer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const ENTITY_TABLES: readonly EntityTable[] = [
  "students",
  "classes",
  "subjects",
  "tests",
  "notifications",
];

const DERIVED_TABLES = [
  "attendance_records",
  "fee_records",
  "test_results",
] as const;

export type WatchedTable = EntityTable | (typeof DERIVED_TABLES)[number];

const DERIVED_DEBOUNCE_MS = 800;
const REALTIME_TOKEN_COOKIE = "realtime_token";

function isEntityTable(table: WatchedTable): table is EntityTable {
  return (ENTITY_TABLES as readonly string[]).includes(table);
}

/**
 * Reads the academy-scoped JWT set by loginAction() (lib/auth/actions.ts).
 * Passing this to supabase.realtime.setAuth() lets RLS policies check
 * auth.jwt() ->> 'academy_id' against it, instead of granting anon a
 * blanket read across every academy's rows.
 */
function getRealtimeToken(): string | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REALTIME_TOKEN_COOKIE}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function useRealtimeSync(
  academyId: string,
  tables: WatchedTable[],
): void {
  const dispatch = useAcademyDataDispatch();
  const tablesKey = tables.slice().sort().join(",");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const watched = tablesKey.split(",").filter(Boolean) as WatchedTable[];
    if (!academyId || watched.length === 0) return;

    const token = getRealtimeToken();
    if (token) {
      supabase.realtime.setAuth(token);
    }

    const scheduleDerivedRefresh = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          const stats = await getAcademyDerivedStats(academyId);
          dispatch({ type: "DERIVED_MERGE", patch: stats });
        } catch {
          // Best-effort — a missed derived refresh self-corrects on next
          // event or next full page load, so we don't surface this to UI.
        }
      }, DERIVED_DEBOUNCE_MS);
    };

    const suffix = Math.random().toString(36).slice(2);
    const channels = watched.map((table) =>
      supabase
        .channel(`${table}:${academyId}:${suffix}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            filter: `academy_id=eq.${academyId}`,
          },
          (
            payload: RealtimePostgresChangesPayload<Record<string, unknown>>,
          ) => {
            if (isEntityTable(table)) {
              dispatch({
                type: "ENTITY_PATCH",
                table,
                event: payload.eventType,
                newRow: (payload.new as Record<string, unknown>) ?? null,
                oldRow: (payload.old as Record<string, unknown>) ?? null,
              });
            } else {
              scheduleDerivedRefresh();
            }
          },
        )
        .subscribe(),
    );

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
    // tablesKey (not tables) is the real dependency — keeps the effect from
    // re-subscribing when a page passes a fresh array literal each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academyId, tablesKey, dispatch]);
}
