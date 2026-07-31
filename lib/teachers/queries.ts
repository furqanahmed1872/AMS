"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import type { Teacher, AttendanceStatus, TeacherSalaryRow } from "./types";
import { ACADEMIC_MONTHS } from "@/lib/fees/types";

/** All teachers for the current academy. */
export async function getTeachersAction(): Promise<Teacher[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("teachers")
    .select("*")
    .eq("academy_id", session.academyId)
    .order("name");

  return (data ?? []).map((t) => ({
    id: t.id,
    academyId: t.academy_id,
    branchId: t.branch_id,
    name: t.name,
    phone: t.phone,
    subject: t.subject,
    monthlySalary: t.monthly_salary,
    joiningDate: t.joining_date,
    status: t.status,
  }));
}

/** This month's salary status (paid/unpaid) for all active teachers. */
export async function getTeacherSalaryStatusAction(
  month: number,
  year: number,
): Promise<Record<string, "paid" | "unpaid">> {
  const session = await getSession();
  if (!session) return {};

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("teacher_salary_records")
    .select("teacher_id, status")
    .eq("academy_id", session.academyId)
    .eq("month", month)
    .eq("year", year);

  const map: Record<string, "paid" | "unpaid"> = {};
  for (const row of data ?? []) {
    map[row.teacher_id] = row.status as "paid" | "unpaid";
  }
  return map;
}

/** Existing attendance statuses for all teachers on a given date. */
export async function getTeacherAttendanceForDateAction(
  date: string,
): Promise<Record<string, AttendanceStatus>> {
  const session = await getSession();
  if (!session) return {};

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("teacher_attendance_records")
    .select("teacher_id, status")
    .eq("academy_id", session.academyId)
    .eq("date", date);

  const map: Record<string, AttendanceStatus> = {};
  for (const row of data ?? []) map[row.teacher_id] = row.status;
  return map;
}

/** Yearly salary grid, reusing the same academic-year month layout as fees. */
export async function getTeacherSalaryRecordAction(
  startYear: number,
): Promise<TeacherSalaryRow[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();
  const monthYearPairs = ACADEMIC_MONTHS.map((m) => ({
    month: m.month,
    year: startYear + m.yearOffset,
  }));

  const [teachersRes, salaryRes] = await Promise.all([
    supabase
      .from("teachers")
      .select("id, name, subject")
      .eq("academy_id", session.academyId)
      .eq("status", "active")
      .order("name"),
    supabase
      .from("teacher_salary_records")
      .select("teacher_id, month, year, amount_due, status")
      .eq("academy_id", session.academyId)
      .or(
        monthYearPairs
          .map((p) => `and(month.eq.${p.month},year.eq.${p.year})`)
          .join(","),
      ),
  ]);

  const teachers = teachersRes.data ?? [];
  const salaryRows = salaryRes.data ?? [];

  const salaryMap = new Map<string, { amount_due: number; status: string }>();
  for (const row of salaryRows) {
    salaryMap.set(`${row.teacher_id}:${row.month}:${row.year}`, {
      amount_due: row.amount_due,
      status: row.status,
    });
  }

  return teachers.map((t) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    cells: monthYearPairs.map(({ month, year }) => {
      const entry = salaryMap.get(`${t.id}:${month}:${year}`);
      if (!entry) return null;
      if (entry.status === "paid") return entry.amount_due;
      return "X";
    }),
  }));
}
