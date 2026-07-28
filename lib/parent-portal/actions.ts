"use server";

import { createServiceClient } from "@/lib/supabase/server";
import {
  createParentSession,
  getParentSession,
  destroyParentSession,
} from "./session";
import type {
  ParentDashboardData,
  SubjectScore,
  AttendanceDay,
  ParentNotice,
} from "./types";

export interface ParentLoginResult {
  success: boolean;
  error?: string;
}

/**
 * Verifies a parent's PIN against the student identified by their share
 * token (from the /parent/<token> URL). Read-only: the RPC only SELECTs.
 */
export async function parentLoginAction(
  shareToken: string,
  pin: string,
): Promise<ParentLoginResult> {
  if (!pin || pin.length < 4) {
    return { success: false, error: "Enter the PIN provided by your academy." };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .rpc("verify_parent_access", { p_share_token: shareToken, p_pin: pin })
    .single();

  if (error || !data) {
    return { success: false, error: "Incorrect PIN." };
  }

  const row = data as { student_id: string; academy_id: string };
  await createParentSession({
    studentId: row.student_id,
    academyId: row.academy_id,
  });

  return { success: true };
}

/**
 * Read-only dashboard fetch, scoped to a single student via the signed
 * parent session. Fully separate data path from AcademyDataProvider /
 * RealtimeProvider — no shared state, no writes.
 *
 * `shareToken` is the token from the current URL — if it belongs to a
 * different student than the active session (e.g. a parent with two
 * children opens the second child's link while still logged into the
 * first), the session is ignored and null is returned so the caller
 * falls back to the PIN form for the new student.
 */
export async function getParentDashboardData(
  shareToken: string,
): Promise<ParentDashboardData | null> {
  const session = await getParentSession();
  if (!session) return null;

  const supabase0 = createServiceClient();
  const { data: tokenOwner } = await supabase0
    .from("students")
    .select("id")
    .eq("parent_share_token", shareToken)
    .maybeSingle();

  if (!tokenOwner || tokenOwner.id !== session.studentId) return null;

  const supabase = supabase0;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [
    studentRes,
    attendanceRes,
    testAvgRes,
    currentFeeRes,
    feeHistoryRes,
    testResultsRes,
    attendanceDaysRes,
    subjectsRes,
    noticesRes,
  ] = await Promise.all([
    supabase
      .from("students")
      .select("name, roll_number, class_id, monthly_fee")
      .eq("id", session.studentId)
      .single(),
    supabase
      .from("v_student_attendance_percent")
      .select("attendance_percent")
      .eq("student_id", session.studentId)
      .maybeSingle(),
    supabase
      .from("v_student_test_average")
      .select("avg_score_percent")
      .eq("student_id", session.studentId)
      .maybeSingle(),
    supabase
      .from("fee_records")
      .select("status, amount_due")
      .eq("student_id", session.studentId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle(),
    supabase
      .from("fee_records")
      .select("month, year, amount_due, status, paid_date")
      .eq("student_id", session.studentId)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(12),
    supabase
      .from("test_results")
      .select(
        "marks_obtained, is_absent, tests(name, total_marks, subjects(name))",
      )
      .eq("student_id", session.studentId)
      .not("marks_obtained", "is", null),
    supabase
      .from("attendance_records")
      .select("date, status")
      .eq("student_id", session.studentId)
      .gte("date", `${year}-${String(month).padStart(2, "0")}-01`)
      .lte("date", `${year}-${String(month).padStart(2, "0")}-31`),
    supabase.from("subjects").select("name, class_id"),
    supabase
      .from("notices")
      .select("class_id, title, message, created_at")
      .eq("academy_id", session.academyId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (studentRes.error || !studentRes.data) return null;

  const { data: classRow } = await supabase
    .from("classes")
    .select("name, section")
    .eq("id", studentRes.data.class_id)
    .maybeSingle();

  const className = classRow
    ? classRow.section
      ? `${classRow.name} ${classRow.section}`
      : classRow.name
    : "";

  const currentMonthFeeStatus: ParentDashboardData["currentMonthFeeStatus"] =
    studentRes.data.monthly_fee == null
      ? "not_set"
      : (currentFeeRes.data?.status ?? "unpaid");

  const subjects = (subjectsRes.data ?? [])
    .filter((s) => s.class_id === studentRes.data.class_id)
    .map((s) => s.name);

  const scoreGrouped: Record<string, SubjectScore> = {};
  for (const row of testResultsRes.data ?? []) {
    const test = row.tests as unknown as {
      name: string;
      total_marks: number;
      subjects: { name: string } | { name: string }[] | null;
    };
    if (!test?.subjects) continue;
    const subjectName = Array.isArray(test.subjects)
      ? test.subjects[0]?.name
      : test.subjects.name;
    if (!subjectName) continue;
    if (!scoreGrouped[subjectName]) {
      scoreGrouped[subjectName] = { subject: subjectName, tests: [] };
    }
    scoreGrouped[subjectName].tests.push({
      name: test.name,
      obtained: row.marks_obtained ?? 0,
      total: test.total_marks,
    });
  }

  const attendanceDays: AttendanceDay[] = (attendanceDaysRes.data ?? []).map(
    (r) => ({ date: r.date, status: r.status as AttendanceDay["status"] }),
  );

  const notices: ParentNotice[] = (noticesRes.data ?? [])
    .filter(
      (n) => n.class_id === null || n.class_id === studentRes.data.class_id,
    )
    .map((n) => ({
      title: n.title,
      message: n.message,
      createdAt: n.created_at,
    }));

  return {
    studentName: studentRes.data.name,
    rollNumber: studentRes.data.roll_number,
    className,
    subjects,
    monthlyFee: studentRes.data.monthly_fee,
    currentMonthFeeStatus,
    attendancePercent: attendanceRes.data?.attendance_percent ?? null,
    attendanceDays,
    testAverage: testAvgRes.data?.avg_score_percent ?? null,
    subjectScores: Object.values(scoreGrouped),
    feeHistory: feeHistoryRes.data ?? [],
    notices,
  };
}

export async function parentLogoutAction(): Promise<void> {
  await destroyParentSession();
}
