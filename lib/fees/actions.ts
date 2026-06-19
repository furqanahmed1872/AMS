"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Marks a student's fee for a given month/year as paid.
 * If no fee_record row exists yet for that month (fee records are
 * auto-generated, but edge cases can leave gaps), it inserts one.
 */
export async function markFeePaidAction(
  studentId: string,
  month: number,
  year: number,
  amountDue: number,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const supabase = createServiceClient();

  // Try to update an existing row first
  const { data: existing } = await supabase
    .from("fee_records")
    .select("id")
    .eq("student_id", studentId)
    .eq("month", month)
    .eq("year", year)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("fee_records")
      .update({ status: "paid", paid_date: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("academy_id", session.academyId);

    if (error) return { success: false, error: error.message };
  } else {
    // Insert a new record if one doesn't exist
    const { error } = await supabase.from("fee_records").insert({
      academy_id: session.academyId,
      student_id: studentId,
      month,
      year,
      amount_due: amountDue,
      status: "paid",
      paid_date: new Date().toISOString(),
    });

    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/app/fees");
  revalidatePath("/app/students");
  return { success: true };
}

/**
 * Generates fee_records for the current month for every active student
 * in the academy that doesn't already have one. Called by the Fees page
 * "Generate This Month" button — ensures all rows exist before marking.
 */
export async function generateMonthlyFeesAction(
  month: number,
  year: number,
): Promise<ActionResult & { generated: number }> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired.", generated: 0 };

  const supabase = createServiceClient();

  // Get all active students with a fee set
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, monthly_fee")
    .eq("academy_id", session.academyId)
    .eq("status", "active")
    .not("monthly_fee", "is", null);

  if (studentsError || !students)
    return { success: false, error: studentsError?.message, generated: 0 };

  // Get already-existing records for this month
  const { data: existing } = await supabase
    .from("fee_records")
    .select("student_id")
    .eq("academy_id", session.academyId)
    .eq("month", month)
    .eq("year", year);

  const existingIds = new Set((existing ?? []).map((r) => r.student_id));
  const toInsert = students
    .filter((s) => !existingIds.has(s.id))
    .map((s) => ({
      academy_id: session.academyId,
      student_id: s.id,
      month,
      year,
      amount_due: s.monthly_fee,
      status: "unpaid",
    }));

  if (toInsert.length === 0) return { success: true, generated: 0 };

  const { error } = await supabase.from("fee_records").insert(toInsert);
  if (error) return { success: false, error: error.message, generated: 0 };

  revalidatePath("/app/fees");
  return { success: true, generated: toInsert.length };
}
