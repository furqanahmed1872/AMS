"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { createSession, destroySession } from "@/lib/auth/session";
import type { Role } from "@/lib/academy-data/types";

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * The exact flow requested:
 *  1. Client submits { role, password } from the login form.
 *  2. Resolve the academy (v1 = single row; PRD §12.4 covers what changes
 *     once a second academy exists).
 *  3. Call the verify_role_password() Postgres function (defined in
 *     schema.sql) — it compares the password against academy_roles.password_hash
 *     using crypt(), entirely inside the database. The hash itself never
 *     leaves Supabase.
 *  4. On success, create the signed session cookie and log the login
 *     (session_logs — PRD §11.1) for the admin's visible login history.
 */
// AFTER
export async function loginAction(
  role: Role,
  password: string,
  academyId?: string
): Promise<LoginResult> {
  if (!password) {
    return { success: false, error: "Password is required." };
  }

  const supabase = createServiceClient();

  const query = supabase.from("academies").select("id, name");
  const { data: academy, error: academyError } = academyId
    ? await query.eq("id", academyId).eq("status", "active").single()
    : await query.limit(1).single();

  if (academyError || !academy) {
    return { success: false, error: "Academy could not be found." };
  }

  const { data: isValid, error: rpcError } = await supabase.rpc(
    "verify_role_password",
    { p_academy_id: academy.id, p_role: role, p_password: password }
  );

  if (rpcError || !isValid) {
    return { success: false, error: "Incorrect password." };
  }

  await createSession({ academyId: academy.id, academyName: academy.name, role });

  const forwardedFor = (await headers()).get("x-forwarded-for");
  await supabase.from("session_logs").insert({
    academy_id: academy.id,
    role,
    ip_address: forwardedFor?.split(",")[0]?.trim() ?? null,
  });

  return { success: true };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
}
