"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AttendanceStatus } from "./types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/** Creates a new teacher record for the current academy. */
export async function addTeacherAction(input: {
  name: string;
  phone?: string;
  subject?: string;
  monthlySalary?: number;
  branchId?: string | null;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("teachers").insert({
    academy_id: session.academyId,
    branch_id: input.branchId ?? null,
    name: input.name,
    phone: input.phone ?? null,
    subject: input.subject ?? null,
    monthly_salary: input.monthlySalary ?? null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/app/teachers");
  return { success: true };
}

/** Updates status (active/inactive) or core fields for a teacher. */
export async function updateTeacherAction(
  teacherId: string,
  input: Partial<{
    name: string;
    phone: string | null;
    subject: string | null;
    monthlySalary: number | null;
    status: "active" | "inactive";
  }>,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const supabase = createServiceClient();
  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) patch.name = input.name;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.subject !== undefined) patch.subject = input.subject;
  if (input.monthlySalary !== undefined)
    patch.monthly_salary = input.monthlySalary;
  if (input.status !== undefined) patch.status = input.status;

  const { error } = await supabase
    .from("teachers")
    .update(patch)
    .eq("id", teacherId)
    .eq("academy_id", session.academyId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/app/teachers");
  return { success: true };
}

/** Marks a teacher's daily attendance (upserts by teacher_id + date). */
export async function markTeacherAttendanceAction(
  teacherId: string,
  date: string,
  status: AttendanceStatus,
  branchId?: string | null,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("teacher_attendance_records").upsert(
    {
      academy_id: session.academyId,
      branch_id: branchId ?? null,
      teacher_id: teacherId,
      date,
      status,
    },
    { onConflict: "teacher_id,date" },
  );

  if (error) return { success: false, error: error.message };
  revalidatePath("/app/teachers");
  return { success: true };
}

/** Marks a teacher's salary for a given month/year as paid. */
export async function markTeacherSalaryPaidAction(
  teacherId: string,
  month: number,
  year: number,
  amountDue: number,
  branchId?: string | null,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("teacher_salary_records")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("month", month)
    .eq("year", year)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("teacher_salary_records")
      .update({ status: "paid", paid_date: new Date().toISOString() })
      .eq("id", existing.id)
      .eq("academy_id", session.academyId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("teacher_salary_records").insert({
      academy_id: session.academyId,
      branch_id: branchId ?? null,
      teacher_id: teacherId,
      month,
      year,
      amount_due: amountDue,
      status: "paid",
      paid_date: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/app/teachers");
  return { success: true };
}

/** Generates salary records for the given month for every active teacher missing one. */
export async function generateMonthlyTeacherSalariesAction(
  month: number,
  year: number,
): Promise<ActionResult & { generated: number }> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired.", generated: 0 };

  const supabase = createServiceClient();

  const { data: teachers, error: teachersError } = await supabase
    .from("teachers")
    .select("id, monthly_salary, branch_id")
    .eq("academy_id", session.academyId)
    .eq("status", "active")
    .not("monthly_salary", "is", null);

  if (teachersError || !teachers)
    return { success: false, error: teachersError?.message, generated: 0 };

  const { data: existing } = await supabase
    .from("teacher_salary_records")
    .select("teacher_id")
    .eq("academy_id", session.academyId)
    .eq("month", month)
    .eq("year", year);

  const existingIds = new Set((existing ?? []).map((r) => r.teacher_id));
  const toInsert = teachers
    .filter((t) => !existingIds.has(t.id))
    .map((t) => ({
      academy_id: session.academyId,
      branch_id: t.branch_id ?? null,
      teacher_id: t.id,
      month,
      year,
      amount_due: t.monthly_salary,
      status: "unpaid",
    }));

  if (toInsert.length === 0) return { success: true, generated: 0 };

  const { error } = await supabase
    .from("teacher_salary_records")
    .insert(toInsert);
  if (error) return { success: false, error: error.message, generated: 0 };

  revalidatePath("/app/teachers");
  return { success: true, generated: toInsert.length };
}
