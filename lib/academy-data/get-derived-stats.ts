"use server";

import { createServiceClient } from "@/lib/supabase/server";

export interface DerivedStats {
  dashboardStats: {
    collectedThisMonth: number;
    dueThisMonth: number;
    classesAttendanceTakenToday: number;
  };
  todaysAttendance: { present: number; absent: number; leave: number };
  avgScoreByStudent: Record<string, number>;
  attendanceByStudent: Record<string, number>;
  feeStatusByStudent: Record<string, "paid" | "unpaid">;
  marksEnteredByTest: Record<string, number>;
}

/**
 * Companion to getAcademyBootstrapData() — re-fetches only the 5 queries
 * whose numbers move when attendance_records, fee_records, or test_results
 * change. Used by useRealtimeSync() (components/providers/RealtimeProvider.tsx)
 * instead of the old router.refresh(), which re-ran the full 10-query
 * bootstrap on every single row event.
 */
export async function getAcademyDerivedStats(
  academyId: string,
): Promise<DerivedStats> {
  const supabase = createServiceClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const today = now.toISOString().split("T")[0];

  const [
    feeRes,
    avgScoreRes,
    attendancePctRes,
    testResultsRes,
    todaysAttendanceRes,
  ] = await Promise.all([
    supabase
      .from("fee_records")
      .select("student_id, status, amount_due")
      .eq("academy_id", academyId)
      .eq("month", month)
      .eq("year", year),
    supabase
      .from("v_student_test_average")
      .select("student_id, avg_score_percent")
      .eq("academy_id", academyId),
    supabase
      .from("v_student_attendance_percent")
      .select("student_id, attendance_percent")
      .eq("academy_id", academyId),
    supabase
      .from("test_results")
      .select("test_id, marks_obtained, is_absent")
      .eq("academy_id", academyId),
    supabase
      .from("attendance_records")
      .select("status, class_id")
      .eq("academy_id", academyId)
      .eq("date", today),
  ]);

  const feeRecords = feeRes.data ?? [];
  const todaysAttendanceRaw = todaysAttendanceRes.data ?? [];

  const feeStatusByStudent: Record<string, "paid" | "unpaid"> = {};
  for (const f of feeRecords) {
    feeStatusByStudent[f.student_id] = f.status as "paid" | "unpaid";
  }

  const avgScoreByStudent: Record<string, number> = {};
  for (const a of avgScoreRes.data ?? []) {
    avgScoreByStudent[a.student_id] = Math.round(a.avg_score_percent ?? 0);
  }

  const attendanceByStudent: Record<string, number> = {};
  for (const a of attendancePctRes.data ?? []) {
    attendanceByStudent[a.student_id] = Math.round(a.attendance_percent ?? 0);
  }

  const marksEnteredByTest: Record<string, number> = {};
  for (const tr of testResultsRes.data ?? []) {
    if (tr.marks_obtained != null || tr.is_absent) {
      marksEnteredByTest[tr.test_id] =
        (marksEnteredByTest[tr.test_id] ?? 0) + 1;
    }
  }

  return {
    dashboardStats: {
      collectedThisMonth: feeRecords
        .filter((f) => f.status === "paid")
        .reduce((sum, f) => sum + Number(f.amount_due), 0),
      dueThisMonth: feeRecords
        .filter((f) => f.status === "unpaid")
        .reduce((sum, f) => sum + Number(f.amount_due), 0),
      classesAttendanceTakenToday: new Set(
        todaysAttendanceRaw.map((a) => a.class_id as string),
      ).size,
    },
    todaysAttendance: {
      present: todaysAttendanceRaw.filter((a) => a.status === "P").length,
      absent: todaysAttendanceRaw.filter((a) => a.status === "A").length,
      leave: todaysAttendanceRaw.filter((a) => a.status === "L").length,
    },
    avgScoreByStudent,
    attendanceByStudent,
    feeStatusByStudent,
    marksEnteredByTest,
  };
}
