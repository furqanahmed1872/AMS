"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession, destroySession } from "@/lib/auth/session";
import type { Role } from "@/lib/academy-data/types";

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function loginAction(
  role: Role,
  password: string,
  academyId?: string,
): Promise<LoginResult> {
  if (!password) {
    return { success: false, error: "Password is required." };
  }

  const supabase = createServiceClient();
  let matchedAcademy: { id: string; name: string } | null = null;

  if (academyId) {
    // Direct link flow — verify against specific academy only
    const { data, error } = await supabase
      .from("academies")
      .select("id, name")
      .eq("id", academyId)
      .eq("status", "active")
      .single();

    if (error || !data) {
      return { success: false, error: "Academy not found or inactive." };
    }

    const { data: isValid } = await supabase.rpc("verify_role_password", {
      p_academy_id: data.id,
      p_role: role,
      p_password: password,
    });

    if (!isValid) {
      return { success: false, error: "Incorrect password." };
    }

    matchedAcademy = data;
  } else {
    // Normal login — search all active academies for matching password
    const { data: academies, error: listError } = await supabase
      .from("academies")
      .select("id, name")
      .eq("status", "active");

    if (listError || !academies?.length) {
      return { success: false, error: "No active academies found." };
    }

    for (const academy of academies) {
      const { data: isValid } = await supabase.rpc("verify_role_password", {
        p_academy_id: academy.id,
        p_role: role,
        p_password: password,
      });
      if (isValid) {
        matchedAcademy = academy;
        break;
      }
    }

    if (!matchedAcademy) {
      return { success: false, error: "Incorrect password." };
    }
  }

  await createSession({
    academyId: matchedAcademy.id,
    academyName: matchedAcademy.name,
    role,
  });

  const forwardedFor = (await headers()).get("x-forwarded-for");
  await supabase.from("session_logs").insert({
    academy_id: matchedAcademy.id,
    role,
    ip_address: forwardedFor?.split(",")[0]?.trim() ?? null,
  });

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}
