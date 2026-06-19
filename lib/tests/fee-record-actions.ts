"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import type { FeeRecordStudent } from "./types";
import { ACADEMIC_MONTHS } from "./types"; 

// Academic year: May of startYear through March of startYear+1
// e.g. "2025" covers May 2025 → March 2026

export async function getFeeRecordAction(
  classId: string,
  startYear: number, // e.g. 2025 for the 2025-26 academic year
): Promise<FeeRecordStudent[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();

  // Collect all (month, year) pairs we need
  const monthYearPairs = ACADEMIC_MONTHS.map((m) => ({
    month: m.month,
    year: startYear + m.yearOffset,
  }));

  const [studentsRes, feeRes] = await Promise.all([
    supabase
      .from("students")
      .select("id, name, roll_number")
      .eq("class_id", classId)
      .eq("academy_id", session.academyId)
      .eq("status", "active")
      .order("roll_number"),
    supabase
      .from("fee_records")
      .select("student_id, month, year, amount_due, status")
      .eq("academy_id", session.academyId)
      .or(
        monthYearPairs
          .map((p) => `and(month.eq.${p.month},year.eq.${p.year})`)
          .join(","),
      ),
  ]);

  const students = studentsRes.data ?? [];
  const feeRows = feeRes.data ?? [];

  // Build lookup: studentId + month + year -> row
  const feeMap = new Map<string, { amount_due: number; status: string }>();
  for (const row of feeRows) {
    feeMap.set(`${row.student_id}:${row.month}:${row.year}`, {
      amount_due: row.amount_due,
      status: row.status,
    });
  }

  return students.map((s) => ({
    id: s.id,
    name: s.name,
    rollNumber: s.roll_number,
    cells: monthYearPairs.map(({ month, year }) => {
      const entry = feeMap.get(`${s.id}:${month}:${year}`);
      if (!entry) return null; // no record for this month
      if (entry.status === "paid") return entry.amount_due; // show amount
      return "X"; // unpaid
    }),
  }));
}
