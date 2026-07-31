import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { isAllBranches, type BranchScope } from "./types";

type ServiceClient = ReturnType<typeof createServiceClient>;

/**
 * Single source of truth for "which branch does this row belong to".
 *
 * Classes carry the authoritative branch_id; everything downstream
 * (students, attendance, tests, results, fees, notices) inherits it, so
 * a row can never end up in a different branch than its class.
 */
export async function branchIdForClass(
  supabase: ServiceClient,
  academyId: string,
  classId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("classes")
    .select("branch_id")
    .eq("id", classId)
    .eq("academy_id", academyId)
    .single();

  return data?.branch_id ?? null;
}

/** Same, for a student. Used where only a student id is in hand (fees). */
export async function branchIdForStudent(
  supabase: ServiceClient,
  academyId: string,
  studentId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("students")
    .select("branch_id")
    .eq("id", studentId)
    .eq("academy_id", academyId)
    .single();

  return data?.branch_id ?? null;
}

/**
 * Falls back to the session's branch when it's pinned to one, else the
 * academy's only branch. Returns null when genuinely ambiguous.
 */
export async function fallbackBranchId(
  supabase: ServiceClient,
  academyId: string,
  sessionBranchId: BranchScope | undefined,
): Promise<string | null> {
  if (!isAllBranches(sessionBranchId)) return sessionBranchId as string;

  const { data } = await supabase
    .from("branches")
    .select("id")
    .eq("academy_id", academyId)
    .eq("status", "active");

  return data?.length === 1 ? data[0].id : null;
}
