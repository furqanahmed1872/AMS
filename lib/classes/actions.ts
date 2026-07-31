"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { isAllBranches } from "@/lib/branches/types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Resolves which branch a newly created class belongs to. When the
 * session is scoped to a specific branch, that wins. When scoped to
 * "all", an explicit branchId is required unless the academy has exactly
 * one branch — in which case it's unambiguous.
 */
async function resolveBranchId(
  supabase: ReturnType<typeof createServiceClient>,
  academyId: string,
  sessionBranchId: string | undefined,
  explicitBranchId?: string,
): Promise<{ branchId: string | null; error?: string }> {
  if (explicitBranchId) return { branchId: explicitBranchId };
  if (!isAllBranches(sessionBranchId))
    return { branchId: sessionBranchId as string };

  const { data } = await supabase
    .from("branches")
    .select("id")
    .eq("academy_id", academyId)
    .eq("status", "active");

  if (!data?.length) return { branchId: null };
  if (data.length === 1) return { branchId: data[0].id };
  return {
    branchId: null,
    error: "Select a branch before adding a class.",
  };
}

export async function createClassAction(
  name: string,
  section: string,
  branchId?: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };

  const trimmedName = name.trim();
  if (!trimmedName) return { success: false, error: "Class name is required." };

  const supabase = createServiceClient();

  const resolved = await resolveBranchId(
    supabase,
    session.academyId,
    session.branchId,
    branchId,
  );
  if (resolved.error) return { success: false, error: resolved.error };

  const { error } = await supabase.from("classes").insert({
    academy_id: session.academyId,
    branch_id: resolved.branchId,
    name: trimmedName,
    section: section.trim() || null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "A class with this name and section already exists.",
      };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateClassAction(
  classId: string,
  name: string,
  section: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };

  const trimmedName = name.trim();
  if (!trimmedName) return { success: false, error: "Class name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("classes")
    .update({
      name: trimmedName,
      section: section.trim() || null,
    })
    .eq("id", classId)
    .eq("academy_id", session.academyId);

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "A class with this name and section already exists.",
      };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteClassAction(
  classId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId)
    .eq("academy_id", session.academyId);

  if (error) {
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "This class still has students enrolled — remove or reassign them first.",
      };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}
