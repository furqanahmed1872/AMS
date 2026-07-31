"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { branchIdForClass } from "@/lib/branches/scope";
import { isAllBranches, type BranchScope } from "@/lib/branches/types";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

// Separate from lib/tests — this is a date-sheet entry, not a test/marks
// record. No FK to tests.id: a schedule is usually published before
// marks entry starts, and some papers are graded outside the Tests module
// entirely.
//
// Targeting model:
//   classId set                  -> only that class's students
//   classId null, branchId set   -> every student in that branch
//   classId null, branchId null  -> academy-wide, every student
export interface ExamScheduleEntry {
  id: string;
  classId: string | null;
  className: string | null; // null = not scoped to one class
  branchId: string | null;
  branchName: string | null; // null = not scoped to one branch (or single-branch academy)
  subjectId: string;
  subjectName: string;
  examName: string;
  examDate: string; // ISO date, e.g. "2026-12-10"
  startTime: string | null; // "HH:MM" or null
  endTime: string | null;
  venue: string | null;
  notes: string | null;
  createdByRole: "admin" | "teacher";
  createdAt: string;
}

// ─────────────────────────────────────────────
// LIST — every scheduled paper for the academy, soonest first.
// Fetched client-side on mount (same pattern as Notices) — this is a
// new, low-traffic module with no bootstrap-data entry and no
// realtime subscription.
// ─────────────────────────────────────────────
export async function getExamScheduleAction(): Promise<ExamScheduleEntry[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("exam_schedule")
    .select(
      "id, exam_name, exam_date, start_time, end_time, venue, notes, created_by_role, created_at, classes(name, section), subjects(name), branches(name), class_id, subject_id, branch_id",
    )
    .eq("academy_id", session.academyId)
    .order("exam_date", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => {
    const cls = (Array.isArray(row.classes) ? row.classes[0] : row.classes) as {
      name: string;
      section: string | null;
    } | null;
    const subject = (
      Array.isArray(row.subjects) ? row.subjects[0] : row.subjects
    ) as { name: string } | null;
    const branch = (
      Array.isArray(row.branches) ? row.branches[0] : row.branches
    ) as { name: string } | null;

    return {
      id: row.id,
      classId: row.class_id,
      className: cls ? [cls.name, cls.section].filter(Boolean).join(" ") : null,
      branchId: row.branch_id,
      branchName: branch?.name ?? null,
      subjectId: row.subject_id,
      subjectName: subject?.name ?? "—",
      examName: row.exam_name,
      examDate: row.exam_date,
      startTime: row.start_time,
      endTime: row.end_time,
      venue: row.venue,
      notes: row.notes,
      createdByRole: row.created_by_role as "admin" | "teacher",
      createdAt: row.created_at,
    };
  });
}

// ─────────────────────────────────────────────
// CREATE / UPDATE shared shape.
// classId === "" means "no specific class" — targeting then falls to
// branchId ("" means "no specific branch either" -> academy-wide).
// ─────────────────────────────────────────────
export interface ExamScheduleForm {
  classId: string; // "" = not scoped to a class
  branchId: string; // "" = not scoped to a branch (ignored if classId is set)
  subjectId: string;
  examName: string;
  examDate: string;
  startTime: string; // "" if not set
  endTime: string; // "" if not set
  venue: string;
  notes: string;
}

interface ResolvedTarget {
  classId: string | null;
  branchId: string | null;
}

/**
 * Turns the form's class/branch picks into the pair actually stored.
 * A class always wins and its real branch is looked up (so the row's
 * branch_id can never disagree with its class's branch, same rule
 * lib/branches/scope.ts already enforces elsewhere). With no class,
 * whatever branch was explicitly picked in the form is used as-is —
 * "" resolves to null, i.e. academy-wide.
 */
async function resolveTarget(
  supabase: ReturnType<typeof createServiceClient>,
  academyId: string,
  classId: string,
  branchId: string,
): Promise<ResolvedTarget> {
  if (classId) {
    const resolvedBranch = await branchIdForClass(supabase, academyId, classId);
    return { classId, branchId: resolvedBranch };
  }
  return { classId: null, branchId: branchId || null };
}

function validateForm(form: ExamScheduleForm): string | null {
  const { subjectId, examName, examDate, startTime, endTime } = form;
  if (!subjectId) return "Please select a subject.";
  if (!examName.trim()) return "Exam name is required.";
  if (!examDate) return "Exam date is required.";
  if (startTime && endTime && endTime <= startTime)
    return "End time must be after start time.";
  return null;
}

const DUPLICATE_ERROR =
  "This subject already has an exam scheduled under that name for the same class/branch scope.";

// ─────────────────────────────────────────────
// CREATE — add a paper to the date sheet.
// ─────────────────────────────────────────────
export async function createExamScheduleAction(
  form: ExamScheduleForm,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const validationError = validateForm(form);
  if (validationError) return { success: false, error: validationError };

  const supabase = createServiceClient();
  const target = await resolveTarget(
    supabase,
    session.academyId,
    form.classId,
    form.branchId,
  );

  const { data, error } = await supabase
    .from("exam_schedule")
    .insert({
      academy_id: session.academyId,
      branch_id: target.branchId,
      class_id: target.classId,
      subject_id: form.subjectId,
      exam_name: form.examName.trim(),
      exam_date: form.examDate,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      venue: form.venue.trim() || null,
      notes: form.notes.trim() || null,
      created_by_role: session.role,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505")
      return { success: false, error: DUPLICATE_ERROR };
    return { success: false, error: error.message };
  }

  revalidatePath("/app/exam-schedule");
  return { success: true, id: data.id };
}

// ─────────────────────────────────────────────
// UPDATE — edit a scheduled paper (reschedule, change venue, retarget).
// ─────────────────────────────────────────────
export async function updateExamScheduleAction(
  id: string,
  form: ExamScheduleForm,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const validationError = validateForm(form);
  if (validationError) return { success: false, error: validationError };

  const supabase = createServiceClient();
  const target = await resolveTarget(
    supabase,
    session.academyId,
    form.classId,
    form.branchId,
  );

  const { error } = await supabase
    .from("exam_schedule")
    .update({
      class_id: target.classId,
      branch_id: target.branchId,
      subject_id: form.subjectId,
      exam_name: form.examName.trim(),
      exam_date: form.examDate,
      start_time: form.startTime || null,
      end_time: form.endTime || null,
      venue: form.venue.trim() || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("academy_id", session.academyId);

  if (error) {
    if (error.code === "23505")
      return { success: false, error: DUPLICATE_ERROR };
    return { success: false, error: error.message };
  }

  revalidatePath("/app/exam-schedule");
  return { success: true };
}

// ─────────────────────────────────────────────
// DELETE — remove a scheduled paper (admin only, enforced in UI + here).
// ─────────────────────────────────────────────
export async function deleteExamScheduleAction(
  id: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  if (session.role !== "admin")
    return {
      success: false,
      error: "Only admins can delete exam schedule entries.",
    };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("exam_schedule")
    .delete()
    .eq("id", id)
    .eq("academy_id", session.academyId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/app/exam-schedule");
  return { success: true };
}

// ─────────────────────────────────────────────
// PARENT PORTAL — upcoming exams visible to one student, resolved by
// the same class > branch > academy-wide precedence used to store them.
// Mirrors how getParentDashboardData() already filters notices by
// `class_id === null || class_id === studentClassId`, one level deeper.
// ─────────────────────────────────────────────
export interface StudentExamNotice {
  examName: string;
  subjectName: string;
  className: string | null;
  examDate: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  notes: string | null;
}

export async function getUpcomingExamsForStudent(
  academyId: string,
  studentClassId: string,
  studentBranchId: string | null,
): Promise<StudentExamNotice[]> {
  const supabase = createServiceClient();
  const todayIso = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("exam_schedule")
    .select(
      "exam_name, exam_date, start_time, end_time, venue, notes, class_id, branch_id, classes(name, section), subjects(name)",
    )
    .eq("academy_id", academyId)
    .gte("exam_date", todayIso)
    .order("exam_date", { ascending: true });

  if (error || !data) return [];

  return data
    .filter((row) => {
      if (row.class_id) return row.class_id === studentClassId;
      if (row.branch_id) return row.branch_id === studentBranchId;
      return true; // academy-wide
    })
    .map((row) => {
      const cls = (
        Array.isArray(row.classes) ? row.classes[0] : row.classes
      ) as { name: string; section: string | null } | null;
      const subject = (
        Array.isArray(row.subjects) ? row.subjects[0] : row.subjects
      ) as { name: string } | null;

      return {
        examName: row.exam_name,
        subjectName: subject?.name ?? "—",
        className: cls
          ? [cls.name, cls.section].filter(Boolean).join(" ")
          : null,
        examDate: row.exam_date,
        startTime: row.start_time,
        endTime: row.end_time,
        venue: row.venue,
        notes: row.notes,
      };
    });
}
    