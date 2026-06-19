"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function resolveNotificationAction(id: string): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const supabase = createServiceClient();
  await supabase
    .from("notifications")
    .update({ is_resolved: true })
    .eq("id", id)
    .eq("academy_id", session.academyId);

  revalidatePath("/app/notifications");
}
