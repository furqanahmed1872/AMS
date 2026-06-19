"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export type AttendanceStatus = "P" | "A" | "L";

export interface DailyRecord {
  studentId: string;
  status: AttendanceStatus;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────
// LOAD — existing records for a class on a given date
// Called every time the date or class changes in the daily view.
// Returns a map of studentId -> status so the UI can pre-fill toggles.
// ─────────────────────────────────────────────────────────────────
export async function getAttendanceForDateAction(
  classId: string,
  date: string, // "YYYY-MM-DD"
): Promise<Record<string, AttendanceStatus>> {
  const session = await getSession();
  if (!session) return {};

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("attendance_records")
    .select("student_id, status")
    .eq("class_id", classId)
    .eq("date", date)
    .eq("academy_id", session.academyId);

  const map: Record<string, AttendanceStatus> = {};
  for (const row of data ?? []) {
    map[row.student_id] = row.status as AttendanceStatus;
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────
// SAVE — upsert a full day's attendance for a class
// Upserts on (student_id, date) so re-saving the same day updates
// rather than duplicating (PRD §6.1.4).
// ─────────────────────────────────────────────────────────────────
export async function saveAttendanceAction(
  classId: string,
  date: string,
  records: DailyRecord[],
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  if (records.length === 0)
    return { success: false, error: "No records to save." };

  const supabase = createServiceClient();

  const rows = records.map((r) => ({
    academy_id: session.academyId,
    student_id: r.studentId,
    class_id: classId,
    date,
    status: r.status,
  }));

  const { error } = await supabase
    .from("attendance_records")
    .upsert(rows, { onConflict: "student_id,date" });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────
// MONTHLY — full grid for the monthly record table
// Returns: per-student, per-day status map for the whole month.
// ─────────────────────────────────────────────────────────────────
export interface MonthlyStudentRow {
  studentId: string;
  name: string;
  rollNumber: number;
  feeStatus: "paid" | "unpaid" | "not_set";
  days: Record<number, AttendanceStatus>; // day-of-month -> status
}

export async function getMonthlyAttendanceAction(
  classId: string,
  month: number,
  year: number,
): Promise<MonthlyStudentRow[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();

  // Date range for the month
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const [studentsRes, attendanceRes, feeRes] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, roll_number, monthly_fee")
      .eq("class_id", classId)
      .eq("academy_id", session.academyId)
      .eq("status", "active")
      .order("roll_number"),
    supabase
      .from("attendance_records")
      .select("student_id, date, status")
      .eq("class_id", classId)
      .eq("academy_id", session.academyId)
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("fee_records")
      .select("student_id, status")
      .eq("academy_id", session.academyId)
      .eq("month", month)
      .eq("year", year)
      .in(
        "student_id",
        // We'll fill this in after we know the student ids — but supabase
        // doesn't support subqueries, so we fetch all and filter client-side
        [],
      ),
  ]);

  const students = studentsRes.data ?? [];
  const attendanceRaw = attendanceRes.data ?? [];

  // Fetch fee records for just this class's students
  const studentIds = students.map((s) => s.id);
  const feeRecordsRes = await supabase
    .from("fee_records")
    .select("student_id, status")
    .eq("academy_id", session.academyId)
    .eq("month", month)
    .eq("year", year)
    .in(
      "student_id",
      studentIds.length > 0
        ? studentIds
        : ["00000000-0000-0000-0000-000000000000"],
    );

  const feeByStudent = new Map(
    (feeRecordsRes.data ?? []).map((r) => [
      r.student_id,
      r.status as "paid" | "unpaid",
    ]),
  );

  // Build day map per student
  const daysByStudent: Record<string, Record<number, AttendanceStatus>> = {};
  for (const row of attendanceRaw) {
    if (!daysByStudent[row.student_id]) daysByStudent[row.student_id] = {};
    const dayNum = new Date(row.date).getDate();
    daysByStudent[row.student_id][dayNum] = row.status as AttendanceStatus;
  }

  return students.map((s) => {
    const feeStatus: MonthlyStudentRow["feeStatus"] =
      s.monthly_fee == null ? "not_set" : (feeByStudent.get(s.id) ?? "unpaid");
    return {
      studentId: s.id,
      name: s.name,
      rollNumber: s.roll_number,
      feeStatus,
      days: daysByStudent[s.id] ?? {},
    };
  });
}
