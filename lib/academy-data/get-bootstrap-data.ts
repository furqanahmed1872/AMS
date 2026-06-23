import { createServiceClient } from "@/lib/supabase/server";
import type {
  AcademyBootstrapData,
  ClassItem,
  Subject,
  Student,
  Test,
  Notification,
} from "./types";

interface ClassRow {
  id: string;
  name: string;
  section: string | null;
}

const displayName = (cls: ClassRow) =>
  cls.section ? `${cls.name} ${cls.section}` : cls.name;

/**
 * The "return academy all related data" step. Called once, server-side,
 * from app/app/layout.tsx — after the session check, before anything
 * renders. Everything a page could need (Students, Classes, Subjects,
 * Tests, Notifications, Dashboard stats) is fetched and shaped here, so
 * no individual page has to fetch or show its own loading state — see
 * app/app/loading.tsx for how that's enforced.
 */
export async function getAcademyBootstrapData(
  academyId: string,
): Promise<AcademyBootstrapData> {
  const supabase = createServiceClient();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [
    classesRes,
    subjectsRes,
    studentsRes,
    feeRecordsRes,
    avgScoreRes,
    attendanceRes,
    testsRes,
    testResultsRes,
    notificationsRes,
    todaysAttendanceRes,
  ] = await Promise.all([
    supabase
      .from("classes")
      .select("*")
      .eq("academy_id", academyId)
      .order("name"),
    supabase
      .from("subjects")
      .select("*")
      .eq("academy_id", academyId)
      .order("name"),
    supabase
      .from("students")
      .select("*")
      .eq("academy_id", academyId)
      .order("class_id")
      .order("roll_number"),
    supabase
      .from("fee_records")
      .select("student_id, status, amount_due")
      .eq("academy_id", academyId)
      .eq("month", month)
      .eq("year", year),
    supabase
      .from("v_student_test_average")
      .select("*")
      .eq("academy_id", academyId),
    supabase
      .from("v_student_attendance_percent")
      .select("*")
      .eq("academy_id", academyId),
    supabase
      .from("tests")
      .select("*")
      .eq("academy_id", academyId)
      .order("date", { ascending: false }),
    supabase
      .from("test_results")
      .select("test_id, marks_obtained, is_absent")
      .eq("academy_id", academyId),
    supabase
      .from("notifications")
      .select("*")
      .eq("academy_id", academyId)
      .eq("is_resolved", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("attendance_records")
      .select("status, class_id")
      .eq("academy_id", academyId)
      .eq("date", now.toISOString().split("T")[0]),
  ]);

  for (const res of [
    classesRes,
    subjectsRes,
    studentsRes,
    feeRecordsRes,
    avgScoreRes,
    attendanceRes,
    testsRes,
    testResultsRes,
    notificationsRes,
    todaysAttendanceRes,
  ]) {
    if (res.error)
      throw new Error(`Academy bootstrap query failed: ${res.error.message}`);
  }

  const classesRaw = classesRes.data ?? [];
  const subjectsRaw = subjectsRes.data ?? [];
  const studentsRaw = studentsRes.data ?? [];
  const feeRecords = feeRecordsRes.data ?? [];
  const avgScores = avgScoreRes.data ?? [];
  const attendancePercents = attendanceRes.data ?? [];
  const testsRaw = testsRes.data ?? [];
  const testResults = testResultsRes.data ?? [];
  const notificationsRaw = notificationsRes.data ?? [];
  const todaysAttendanceRaw = todaysAttendanceRes.data ?? [];

  // ---------- Lookup maps ----------
  const classById = new Map(classesRaw.map((c) => [c.id, c as ClassRow]));
  const subjectById = new Map(subjectsRaw.map((s) => [s.id, s]));
  const studentById = new Map(studentsRaw.map((s) => [s.id, s]));
  const feeStatusByStudent = new Map(
    feeRecords.map((f) => [f.student_id, f.status as "paid" | "unpaid"]),
  );
  const avgScoreByStudent = new Map(
    avgScores.map((a) => [a.student_id, Math.round(a.avg_score_percent ?? 0)]),
  );
  const attendanceByStudent = new Map(
    attendancePercents.map((a) => [
      a.student_id,
      Math.round(a.attendance_percent ?? 0),
    ]),
  );

  const activeStudentCountByClass = new Map<string, number>();
  for (const s of studentsRaw) {
    if (s.status === "active") {
      activeStudentCountByClass.set(
        s.class_id,
        (activeStudentCountByClass.get(s.class_id) ?? 0) + 1,
      );
    }
  }

  // ---------- Students ----------
  const students: Student[] = studentsRaw.map((s) => {
    const cls = classById.get(s.class_id);
    const feeStatus: Student["feeStatus"] =
      s.monthly_fee == null
        ? "not_set"
        : (feeStatusByStudent.get(s.id) ?? "unpaid");

    return {
      id: s.id,
      name: s.name,
      fatherName: s.father_name ?? "",
      rollNumber: s.roll_number,
      class: cls ? displayName(cls) : "",
      classId: s.class_id,
      phone: s.phone ?? "",
      address: s.address ?? "",
      admissionDate: s.admission_date,
      monthlyFee: s.monthly_fee,
      feeStatus,
      status: s.status,
      teacherRemarks: s.teacher_remarks ?? undefined,
      avgScore: avgScoreByStudent.get(s.id) ?? 0,
      attendancePercent: attendanceByStudent.get(s.id) ?? 0,
    };
  });

  // ---------- Classes ----------
  const classes: ClassItem[] = classesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    section: c.section ?? undefined,
    displayName: displayName(c),
    studentCount: activeStudentCountByClass.get(c.id) ?? 0,
  }));

  // ---------- Subjects ----------
  const subjects: Subject[] = subjectsRaw.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  // ---------- Tests ----------
  const enteredCountByTest = new Map<string, number>();
  for (const tr of testResults) {
    if (tr.marks_obtained != null || tr.is_absent) {
      enteredCountByTest.set(
        tr.test_id,
        (enteredCountByTest.get(tr.test_id) ?? 0) + 1,
      );
    }
  }

  const tests: Test[] = testsRaw.map((t) => {
    const cls = classById.get(t.class_id);
    const subject = subjectById.get(t.subject_id);
    return {
      id: t.id,
      name: t.name,
      subject: subject?.name ?? "",
      subjectId: t.subject_id,
      class: cls ? displayName(cls) : "",
      classId: t.class_id,
      date: t.date,
      totalMarks: t.total_marks,
      marksEntered: enteredCountByTest.get(t.id) ?? 0,
      totalStudents: activeStudentCountByClass.get(t.class_id) ?? 0,
    };
  });

  // ---------- Notifications ----------
  const notifications: Notification[] = notificationsRaw.map((n) => {
    const student = n.student_id ? studentById.get(n.student_id) : undefined;
    const cls = student ? classById.get(student.class_id) : undefined;
    return {
      id: n.id,
      type: n.type,
      message: n.message,
      studentName: student?.name ?? "",
      studentId: n.student_id ?? undefined,
      class: cls ? displayName(cls) : "",
      createdAt: n.created_at,
      isResolved: n.is_resolved,
    };
  });

  // ---------- Dashboard stats (PRD §11.2 — derived, never stored) ----------
  const collectedThisMonth = feeRecords
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + Number(f.amount_due), 0);
  const dueThisMonth = feeRecords
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + Number(f.amount_due), 0);

  return {
    classes,
    subjects,
    students,
    tests,
    notifications,
    dashboardStats: {
      activeStudents: students.filter((s) => s.status === "active").length,
      totalClasses: classes.length,
      totalTests: tests.length,
      collectedThisMonth,
      dueThisMonth,
      classesAttendanceTakenToday: new Set(
        todaysAttendanceRaw.map((a) => (a as { class_id: string }).class_id),
      ).size,
    },
    todaysAttendance: {
      present: todaysAttendanceRaw.filter((a) => a.status === "P").length,
      absent: todaysAttendanceRaw.filter((a) => a.status === "A").length,
      leave: todaysAttendanceRaw.filter((a) => a.status === "L").length,
    },
  };
}
