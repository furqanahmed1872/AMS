"use server";

import { getSession, setActiveBranch } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Branch } from "./types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

interface BranchRow {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_primary: boolean;
  status: "active" | "inactive";
}

const toBranch = (r: BranchRow): Branch => ({
  id: r.id,
  name: r.name,
  address: r.address ?? undefined,
  phone: r.phone ?? undefined,
  isPrimary: r.is_primary,
  status: r.status,
});

/**
 * Reads every branch for an academy. Called from the bootstrap fetch so
 * the switcher renders without its own round-trip.
 */
export async function getBranchesForAcademy(
  academyId: string,
): Promise<Branch[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("branches")
    .select("id, name, address, phone, is_primary, status")
    .eq("academy_id", academyId)
    .order("is_primary", { ascending: false })
    .order("name");

  if (error || !data) return [];
  return (data as BranchRow[]).map(toBranch);
}

export async function createBranchAction(formData: {
  name: string;
  address: string;
  phone: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };
  if (session.role !== "admin")
    return { success: false, error: "Only admins can manage branches." };

  const name = formData.name.trim();
  if (!name) return { success: false, error: "Branch name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("branches").insert({
    academy_id: session.academyId,
    name,
    address: formData.address.trim() || null,
    phone: formData.phone.trim() || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/app");
  return { success: true };
}

export async function updateBranchAction(
  branchId: string,
  formData: {
    name: string;
    address: string;
    phone: string;
    status: "active" | "inactive";
  },
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };
  if (session.role !== "admin")
    return { success: false, error: "Only admins can manage branches." };

  const name = formData.name.trim();
  if (!name) return { success: false, error: "Branch name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("branches")
    .update({
      name,
      address: formData.address.trim() || null,
      phone: formData.phone.trim() || null,
      status: formData.status,
    })
    .eq("id", branchId)
    .eq("academy_id", session.academyId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/app");
  return { success: true };
}

export async function deleteBranchAction(
  branchId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };
  if (session.role !== "admin")
    return { success: false, error: "Only admins can manage branches." };

  const supabase = createServiceClient();

  const { data: branch } = await supabase
    .from("branches")
    .select("is_primary")
    .eq("id", branchId)
    .eq("academy_id", session.academyId)
    .single();

  if (branch?.is_primary)
    return {
      success: false,
      error: "The primary branch can't be deleted.",
    };

  const { error } = await supabase
    .from("branches")
    .delete()
    .eq("id", branchId)
    .eq("academy_id", session.academyId);

  if (error) {
    if (error.code === "23503")
      return {
        success: false,
        error:
          "This branch still has students or classes — move them to another branch first.",
      };
    return { success: false, error: error.message };
  }

  revalidatePath("/app");
  return { success: true };
}

/**
 * Switches the branch the current session is scoped to.
 *
 * Both admins and teachers can switch between any active branch in
 * their academy — this only changes which branch's data they're
 * looking at, it does NOT change what a teacher is allowed to see or
 * do (role-based restrictions like Fees/Fee Record being admin-only
 * are enforced separately, everywhere else, and are unaffected by
 * which branch is active).
 *
 * Only "all" (academy-wide, cross-branch view) is admin-only — a
 * teacher can look at any single branch, just not all of them at once.
 */
export async function switchBranchAction(
  branchId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  if (branchId === "all") {
    if (session.role !== "admin")
      return { success: false, error: "Only admins can view all branches." };
  } else {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("branches")
      .select("id, status")
      .eq("id", branchId)
      .eq("academy_id", session.academyId)
      .single();

    if (!data) return { success: false, error: "Branch not found." };
    if (data.status !== "active")
      return { success: false, error: "This branch is inactive." };
  }

  await setActiveBranch(branchId);
  revalidatePath("/app", "layout");
  return { success: true };
}
