"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createClassAction(
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
  const { error } = await supabase.from("classes").insert({
    academy_id: session.academyId,
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
