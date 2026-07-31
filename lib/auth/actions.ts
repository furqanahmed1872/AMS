"use server";

import { headers, cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession, destroySession } from "@/lib/auth/session";
import type { Role } from "@/lib/academy-data/types";

export interface LoginResult {
  success: boolean;
  error?: string;
}

const REALTIME_TOKEN_COOKIE = "realtime_token";
const REALTIME_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

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

  // Scope the new session to the academy's primary branch by default.
  // Admins can widen to "all" (or switch) from the branch switcher.
  const { data: primaryBranch } = await supabase
    .from("branches")
    .select("id")
    .eq("academy_id", matchedAcademy.id)
    .eq("is_primary", true)
    .maybeSingle();

  await createSession({
    academyId: matchedAcademy.id,
    academyName: matchedAcademy.name,
    role,
    branchId: role === "admin" ? "all" : (primaryBranch?.id ?? "all"),
  });

  // Realtime auth: a short-lived JWT carrying academy_id, so RLS policies
  // on the realtime tables can scope SELECT to auth.jwt() ->> 'academy_id'
  // instead of granting anon a blanket read across every academy. This
  // token is readable by client JS on purpose (RealtimeProvider needs it
  // in the browser) — it only grants read access to this one academy's
  // rows, nothing more, and expires in 7 days.
  const realtimeToken = jwt.sign(
    {
      academy_id: matchedAcademy.id,
      role: "authenticated",
    },
    process.env.SUPABASE_JWT_SECRET!,
    { expiresIn: "7d" },
  );

  const cookieStore = await cookies();
  cookieStore.set(REALTIME_TOKEN_COOKIE, realtimeToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REALTIME_TOKEN_MAX_AGE,
    path: "/",
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
  const cookieStore = await cookies();
  cookieStore.delete(REALTIME_TOKEN_COOKIE);
}
