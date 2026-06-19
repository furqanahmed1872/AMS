"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ─────────────────────────────────────────────
// CREATE STUDENT
// ─────────────────────────────────────────────
export async function createStudentAction(formData: {
  name: string;
  fatherName: string;
  classId: string;
  rollNumber: string;
  monthlyFee: string;
  admissionDate: string;
  phone: string;
  address: string;
}): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const {
    name,
    fatherName,
    classId,
    rollNumber,
    monthlyFee,
    admissionDate,
    phone,
    address,
  } = formData;

  if (!name.trim())
    return { success: false, error: "Student name is required." };
  if (!classId) return { success: false, error: "Please select a class." };
  if (!rollNumber) return { success: false, error: "Roll number is required." };
  if (!admissionDate)
    return { success: false, error: "Admission date is required." };

  const supabase = createServiceClient();

  // Auto-assign roll number if not provided
  let finalRollNumber = parseInt(rollNumber, 10);
  if (!finalRollNumber || isNaN(finalRollNumber)) {
    const { data: existing } = await supabase
      .from("students")
      .select("roll_number")
      .eq("class_id", classId)
      .order("roll_number", { ascending: false })
      .limit(1)
      .single();
    finalRollNumber = existing ? existing.roll_number + 1 : 1;
  }

  const { error } = await supabase.from("students").insert({
    academy_id: session.academyId,
    class_id: classId,
    name: name.trim(),
    father_name: fatherName.trim() || null,
    roll_number: finalRollNumber,
    monthly_fee: monthlyFee ? parseFloat(monthlyFee) : null,
    admission_date: admissionDate,
    phone: phone.trim() || null,
    address: address.trim() || null,
    added_by_role: session.role,
  });

  if (error) {
    if (error.code === "23505")
      return {
        success: false,
        error: "Roll number already taken in this class.",
      };
    return { success: false, error: error.message };
  }

  revalidatePath("/app/students");
  return { success: true };
}

// ─────────────────────────────────────────────
// UPDATE STUDENT
// ─────────────────────────────────────────────
export async function updateStudentAction(
  studentId: string,
  formData: {
    name: string;
    fatherName: string;
    classId: string;
    rollNumber: string;
    monthlyFee: string;
    admissionDate: string;
    phone: string;
    address: string;
    teacherRemarks: string;
    status: "active" | "inactive";
  },
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const {
    name,
    fatherName,
    classId,
    rollNumber,
    monthlyFee,
    admissionDate,
    phone,
    address,
    teacherRemarks,
    status,
  } = formData;

  if (!name.trim())
    return { success: false, error: "Student name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("students")
    .update({
      name: name.trim(),
      father_name: fatherName.trim() || null,
      class_id: classId,
      roll_number: parseInt(rollNumber, 10),
      monthly_fee: monthlyFee ? parseFloat(monthlyFee) : null,
      admission_date: admissionDate,
      phone: phone.trim() || null,
      address: address.trim() || null,
      teacher_remarks: teacherRemarks.trim() || null,
      status,
    })
    .eq("id", studentId)
    .eq("academy_id", session.academyId);

  if (error) {
    if (error.code === "23505")
      return {
        success: false,
        error: "Roll number already taken in this class.",
      };
    return { success: false, error: error.message };
  }

  revalidatePath("/app/students");
  revalidatePath(`/app/students/${studentId}`);
  return { success: true };
}

// ─────────────────────────────────────────────
// DELETE STUDENT
// ─────────────────────────────────────────────
export async function deleteStudentAction(
  studentId: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session)
    return { success: false, error: "Session expired. Please sign in again." };

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId)
    .eq("academy_id", session.academyId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/app/students");
  return { success: true };
}

// ─────────────────────────────────────────────
// PER-STUDENT DETAIL QUERIES (for profile modals)
// These are called from the profile page for the
// modal drilldowns that need per-student DB queries
// ─────────────────────────────────────────────
export interface ScoreBySubject {
  subject: string;
  tests: { name: string; obtained: number; total: number }[];
}

export async function getStudentTestScores(
  studentId: string,
): Promise<ScoreBySubject[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("test_results")
    .select(
      "marks_obtained, is_absent, tests(name, total_marks, subjects(name))",
    )
    .eq("student_id", studentId)
    .eq("academy_id", session.academyId)
    .not("marks_obtained", "is", null);

  if (!data) return [];

  const grouped: Record<string, ScoreBySubject> = {};
  for (const row of data) {
    const test = row.tests as {
      name: string;
      total_marks: number;
      subjects: { name: string };
    };
    const subjectName = test.subjects.name;
    if (!grouped[subjectName])
      grouped[subjectName] = { subject: subjectName, tests: [] };
    grouped[subjectName].tests.push({
      name: test.name,
      obtained: row.marks_obtained ?? 0,
      total: test.total_marks,
    });
  }

  return Object.values(grouped);
}

export interface AttendanceByMonth {
  month: string;
  present: number;
  absent: number;
}

export async function getStudentAttendanceByMonth(
  studentId: string,
): Promise<AttendanceByMonth[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("attendance_records")
    .select("date, status")
    .eq("student_id", studentId)
    .eq("academy_id", session.academyId)
    .order("date");

  if (!data) return [];

  const grouped: Record<string, { present: number; absent: number }> = {};
  for (const row of data) {
    const key = new Date(row.date).toLocaleDateString("en-PK", {
      month: "long",
      year: "numeric",
    });
    if (!grouped[key]) grouped[key] = { present: 0, absent: 0 };
    if (row.status === "P") grouped[key].present++;
    else grouped[key].absent++;
  }

  return Object.entries(grouped).map(([month, counts]) => ({
    month,
    ...counts,
  }));
}

export interface FeeHistoryRow {
  month: string;
  due: number;
  status: "paid" | "unpaid";
}

export async function getStudentFeeHistory(
  studentId: string,
): Promise<FeeHistoryRow[]> {
  const session = await getSession();
  if (!session) return [];

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("fee_records")
    .select("month, year, amount_due, status")
    .eq("student_id", studentId)
    .eq("academy_id", session.academyId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (!data) return [];

  return data.map((row) => ({
    month: new Date(row.year, row.month - 1).toLocaleDateString("en-PK", {
      month: "long",
      year: "numeric",
    }),
    due: row.amount_due,
    status: row.status as "paid" | "unpaid",
  }));
}
