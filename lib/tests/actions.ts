"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

// ─────────────────────────────────────────────
// CREATE TEST
// Returns the new test's id so the caller can
// redirect straight into the marks entry page.
// ─────────────────────────────────────────────
export async function createTestAction(form: {
  name: string;
  classId: string;
  subjectId: string;
  date: string;
  totalMarks: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Session expired." };

  const { name, classId, subjectId, date, totalMarks } = form;
  if (!name.trim()) return { success: false, error: "Test name is required." };
  if (!classId) return { success: false, error: "Please select a class." };
  if (!subjectId) return { success: false, error: "Please select a subject." };
  if (!date) return { success: false, error: "Date is required." };
  const marks = parseFloat(totalMarks);
  if (!marks || marks <= 0)
    return { success: false, error: "Total marks must be greater than 0." };

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("tests")
    .insert({
      academy_id: session.academyId,
      class_id: classId,
      subject_id: subjectId,
      name: name.trim(),
      date,
      total_marks: marks,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/app/tests");
  return { success: true, id: data.id };
}

// ─────────────────────────────────────────────
// LOAD EXISTING MARKS — for pre-fill on open
// Returns map of studentId -> { marks, isAbsent }
// ─────────────────────────────────────────────
export interface ExistingMark {
  marksObtained: number | null;
  isAbsent: boolean;
}

export async function getTestMarksAction(
  testId: string,
): Promise<Record<string, ExistingMark>> {
  const session = await getSession();
  if (!session) return {};

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("test_results")
    .select("student_id, marks_obtained, is_absent")
    .eq("test_id", testId)
    .eq("academy_id", session.academyId);

  const map: Record<string, ExistingMark> = {};
  for (const row of data ?? []) {
    map[row.student_id] = {
      marksObtained: row.marks_obtained,
      isAbsent: row.is_absent,
    };
  }
  return map;
}

// ─────────────────────────────────────────────
// SAVE MARKS — upsert on (test_id, student_id)
// ─────────────────────────────────────────────
export interface MarkEntry {
  studentId: string;
  marksObtained: number | null;
  isAbsent: boolean;
}

export async function saveMarksAction(
  testId: string,
  entries: MarkEntry[],
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Session expired." };

  if (entries.length === 0)
    return { success: false, error: "No entries to save." };

  const supabase = createServiceClient();
  const rows = entries.map((e) => ({
    academy_id: session.academyId,
    test_id: testId,
    student_id: e.studentId,
    marks_obtained: e.isAbsent ? null : e.marksObtained,
    is_absent: e.isAbsent,
  }));

  const { error } = await supabase
    .from("test_results")
    .upsert(rows, { onConflict: "test_id,student_id" });

  if (error) return { success: false, error: error.message };

  revalidatePath("/app/tests");
  revalidatePath("/app/results");
  revalidatePath("/app/test-record");
  return { success: true };
}

// ─────────────────────────────────────────────
// TEST RECORD — class + subject grid
// Returns students x tests matrix
// ─────────────────────────────────────────────
export interface TestRecordTest {
  id: string;
  name: string;
  totalMarks: number;
  date: string;
}

export interface TestRecordRow {
  studentId: string;
  name: string;
  rollNumber: number;
  // One entry per test, in same order as tests array
  // null = not entered yet, "absent" = marked absent
  cells: (number | "absent" | null)[];
}

export async function getTestRecordAction(
  classId: string,
  subjectId: string,
): Promise<{ tests: TestRecordTest[]; rows: TestRecordRow[] }> {
  const session = await getSession();
  if (!session) return { tests: [], rows: [] };

  const supabase = createServiceClient();

  const [testsRes, studentsRes] = await Promise.all([
    supabase
      .from("tests")
      .select("id, name, total_marks, date")
      .eq("class_id", classId)
      .eq("subject_id", subjectId)
      .eq("academy_id", session.academyId)
      .order("date"),
    supabase
      .from("students")
      .select("id, name, roll_number")
      .eq("class_id", classId)
      .eq("academy_id", session.academyId)
      .eq("status", "active")
      .order("roll_number"),
  ]);

  const tests = testsRes.data ?? [];
  const students = studentsRes.data ?? [];

  if (tests.length === 0 || students.length === 0) {
    return {
      tests: tests.map((t) => ({
        id: t.id,
        name: t.name,
        totalMarks: t.total_marks,
        date: t.date,
      })),
      rows: [],
    };
  }

  const testIds = tests.map((t) => t.id);
  const { data: resultsRaw } = await supabase
    .from("test_results")
    .select("test_id, student_id, marks_obtained, is_absent")
    .in("test_id", testIds)
    .eq("academy_id", session.academyId);

  // Build lookup: studentId:testId -> result
  const resultMap = new Map<
    string,
    { marks: number | null; isAbsent: boolean }
  >();
  for (const r of resultsRaw ?? []) {
    resultMap.set(`${r.student_id}:${r.test_id}`, {
      marks: r.marks_obtained,
      isAbsent: r.is_absent,
    });
  }

  const rows: TestRecordRow[] = students.map((s) => ({
    studentId: s.id,
    name: s.name,
    rollNumber: s.roll_number,
    cells: tests.map((t) => {
      const entry = resultMap.get(`${s.id}:${t.id}`);
      if (!entry) return null;
      if (entry.isAbsent) return "absent";
      return entry.marks;
    }),
  }));

  return {
    tests: tests.map((t) => ({
      id: t.id,
      name: t.name,
      totalMarks: t.total_marks,
      date: t.date,
    })),
    rows,
  };
}

// ─────────────────────────────────────────────
// RESULTS — ranked list for a single test
// ─────────────────────────────────────────────
export interface ResultRow {
  studentId: string;
  name: string;
  rollNumber: number;
  marks: number | null;
  totalMarks: number;
  isAbsent: boolean;
}

export async function getTestResultsAction(
  testId: string,
): Promise<ResultRow[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();

  const { data: test } = await supabase
    .from("tests")
    .select("total_marks, class_id")
    .eq("id", testId)
    .single();

  if (!test) return [];

  const { data: results } = await supabase
    .from("test_results")
    .select(
      "student_id, marks_obtained, is_absent, students(name, roll_number)",
    )
    .eq("test_id", testId)
    .eq("academy_id", session.academyId);

  return (results ?? []).map((r) => {
    const student = r.students as { name: string; roll_number: number };
    return {
      studentId: r.student_id,
      name: student.name,
      rollNumber: student.roll_number,
      marks: r.marks_obtained,
      totalMarks: test.total_marks,
      isAbsent: r.is_absent,
    };
  });
}
