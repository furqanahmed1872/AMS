"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createSubjectAction(name: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };

  const trimmedName = name.trim();
  if (!trimmedName)
    return { success: false, error: "Subject name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("subjects").insert({
    academy_id: session.academyId,
    name: trimmedName,
  });

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "This subject already exists." };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteSubjectAction(
  subjectId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return {
      success: false,
      error: "Your session has expired. Please sign in again.",
    };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId)
    .eq("academy_id", session.academyId);

  if (error) {
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "This subject is used by existing tests — remove those tests first.",
      };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}
