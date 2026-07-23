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

function isEntityTable(table: WatchedTable): table is EntityTable {
  return (ENTITY_TABLES as readonly string[]).includes(table);
}

/**
 * Scoped, page-level replacement for the old global RealtimeProvider that
 * used to mount in app/app/layout.tsx and subscribe to all 8 tables for
 * every connected client, calling router.refresh() (a full 10-query
 * bootstrap re-fetch) on every single row event.
 *
 * Call this from whichever page needs live updates, passing only the
 * tables that page actually renders — e.g. Dashboard watches everything,
 * Classes only needs ["classes", "students"].
 *
 *   const { academyId } = useAcademyData();
 *   useRealtimeSync(academyId, ["students", "classes", "attendance_records"]);
 *
 * - Entity tables (students/classes/subjects/tests/notifications) patch
 *   context directly from the realtime payload — no network round trip.
 * - Derived tables (attendance_records/fee_records/test_results) debounce
 *   a single getAcademyDerivedStats() call (5 queries) instead of the old
 *   full-bootstrap refresh (10 queries) per row event.
 */
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
