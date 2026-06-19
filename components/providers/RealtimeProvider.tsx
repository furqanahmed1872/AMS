"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const WATCHED_TABLES = [
  "students",
  "attendance_records",
  "fee_records",
  "test_results",
  "notifications",
  "classes",
  "subjects",
  "tests",
];

export function RealtimeProvider({
  academyId,
  children,
}: {
  academyId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const channels = WATCHED_TABLES.map((table) =>
      supabase
        .channel(`${table}:${academyId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            filter: `academy_id=eq.${academyId}`,
          },
          () => {
            router.refresh();
          },
        )
        .subscribe(),
    );

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [academyId, router]);

  return <>{children}</>;
}
