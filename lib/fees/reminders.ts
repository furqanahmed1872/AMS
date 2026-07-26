"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export interface UnpaidStudent {
  studentId: string;
  name: string;
  phone: string;
  className: string;
  amountDue: number;
}

/**
 * Students with no "paid" fee_records row for the given month/year,
 * scoped to the caller's academy. Covers both explicit "unpaid" rows
 * and students who have no row at all yet for that month.
 */
export async function getUnpaidStudentsAction(
  month: number,
  year: number,
): Promise<UnpaidStudent[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();

  const [studentsRes, paidRes, classesRes] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, phone, class_id, monthly_fee, status")
      .eq("academy_id", session.academyId)
      .eq("status", "active"),
    supabase
      .from("fee_records")
      .select("student_id")
      .eq("academy_id", session.academyId)
      .eq("month", month)
      .eq("year", year)
      .eq("status", "paid"),
    supabase
      .from("classes")
      .select("id, name, section")
      .eq("academy_id", session.academyId),
  ]);

  const paidIds = new Set((paidRes.data ?? []).map((r) => r.student_id));
  const classById = new Map(
    (classesRes.data ?? []).map((c) => [
      c.id,
      c.section ? `${c.name} ${c.section}` : c.name,
    ]),
  );

  return (studentsRes.data ?? [])
    .filter((s) => !paidIds.has(s.id) && s.monthly_fee != null)
    .map((s) => ({
      studentId: s.id,
      name: s.name,
      phone: s.phone ?? "",
      className: classById.get(s.class_id) ?? "",
      amountDue: s.monthly_fee,
    }));
}