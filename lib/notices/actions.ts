"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface Notice {
  id: string;
  classId: string | null;
  title: string;
  message: string;
  createdByRole: "admin" | "teacher";
  createdAt: string;
}

// ─────────────────────────────────────────────
// LIST — all notices for the academy, newest first.
// Called once on page load; no realtime subscription (isolated feature,
// low write frequency, doesn't need the RealtimeProvider sync pattern).
// ─────────────────────────────────────────────
export async function getNoticesAction(): Promise<Notice[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("notices")
    .select("id, class_id, title, message, created_by_role, created_at")
    .eq("academy_id", session.academyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((n) => ({
    id: n.id,
    classId: n.class_id,
    title: n.title,
    message: n.message,
    createdByRole: n.created_by_role as "admin" | "teacher",
    createdAt: n.created_at,
  }));
}

// ─────────────────────────────────────────────
// CREATE — compose a new notice, optionally scoped to one class.
// ─────────────────────────────────────────────
export async function createNoticeAction(formData: {
  classId: string | null; // null = academy-wide
  title: string;
  message: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const { classId, title, message } = formData;

  if (!title.trim()) return { success: false, error: "Title is required." };
  if (!message.trim()) return { success: false, error: "Message is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("notices").insert({
    academy_id: session.academyId,
    class_id: classId,
    title: title.trim(),
    message: message.trim(),
    created_by_role: session.role,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/app/notices");
  return { success: true };
}

// ─────────────────────────────────────────────
// DELETE — remove a notice (admin only, enforced in UI + here).
// ─────────────────────────────────────────────
export async function deleteNoticeAction(
  noticeId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  if (session.role !== "admin")
    return { success: false, error: "Only admins can delete notices." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("notices")
    .delete()
    .eq("id", noticeId)
    .eq("academy_id", session.academyId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/app/notices");
  return { success: true };
}
