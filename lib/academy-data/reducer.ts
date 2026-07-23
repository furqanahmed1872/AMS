import type {
  AcademyBootstrapData,
  ClassItem,
  Student,
  Subject,
  Test,
  Notification,
} from "./types";
export interface DerivedStats {
  dashboardStats: {
    collectedThisMonth: number;
    dueThisMonth: number;
    classesAttendanceTakenToday: number;
  };
  todaysAttendance: { present: number; absent: number; leave: number };
  avgScoreByStudent: Record<string, number>;
  attendanceByStudent: Record<string, number>;
  feeStatusByStudent: Record<string, "paid" | "unpaid">;
  marksEnteredByTest: Record<string, number>;
}

export type EntityTable =
  | "students"
  | "classes"
  | "subjects"
  | "tests"
  | "notifications";

export type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";

export interface EntityPatchAction {
  type: "ENTITY_PATCH";
  table: EntityTable;
  event: RealtimeEvent;
  newRow: Record<string, unknown> | null;
  oldRow: Record<string, unknown> | null;
}

export interface DerivedMergeAction {
  type: "DERIVED_MERGE";
  patch: DerivedStats;
}

export type AcademyDataAction = EntityPatchAction | DerivedMergeAction;

const displayName = (name: string, section: string | null | undefined) =>
  section ? `${name} ${section}` : name;

/**
 * Replaces the old blind router.refresh() pattern. Entity tables
 * (students/classes/subjects/tests/notifications) are patched directly
 * from the realtime payload — no network call. attendance_records,
 * fee_records, and test_results feed derived numbers (avgScore,
 * attendancePercent, feeStatus, dashboardStats) that can't be computed
 * from a single row payload, so those arrive via DERIVED_MERGE, built
 * from the lightweight getAcademyDerivedStats() query in
 * get-derived-stats.ts instead of the full 10-query bootstrap.
 */
export function academyDataReducer(
  state: AcademyBootstrapData,
  action: AcademyDataAction,
): AcademyBootstrapData {
  if (action.type === "DERIVED_MERGE") {
    const { patch } = action;
    return {
      ...state,
      dashboardStats: { ...state.dashboardStats, ...patch.dashboardStats },
      todaysAttendance: patch.todaysAttendance,
      students: state.students.map((s) => ({
        ...s,
        avgScore: patch.avgScoreByStudent[s.id] ?? s.avgScore,
        attendancePercent:
          patch.attendanceByStudent[s.id] ?? s.attendancePercent,
        feeStatus:
          s.monthlyFee == null
            ? "not_set"
            : (patch.feeStatusByStudent[s.id] ?? s.feeStatus),
      })),
      tests: state.tests.map((t) => ({
        ...t,
        marksEntered: patch.marksEnteredByTest[t.id] ?? 0,
      })),
    };
  }

  const { table, event, newRow, oldRow } = action;
  switch (table) {
    case "classes":
      return { ...state, classes: patchClasses(state, event, newRow, oldRow) };
    case "subjects":
      return {
        ...state,
        subjects: patchSubjects(state, event, newRow, oldRow),
      };
    case "students":
      return {
        ...state,
        students: patchStudents(state, event, newRow, oldRow),
      };
    case "tests":
      return { ...state, tests: patchTests(state, event, newRow, oldRow) };
    case "notifications":
      return {
        ...state,
        notifications: patchNotifications(state, event, newRow, oldRow),
      };
    default:
      return state;
  }
}

function patchClasses(
  state: AcademyBootstrapData,
  event: RealtimeEvent,
  newRow: Record<string, unknown> | null,
  oldRow: Record<string, unknown> | null,
): ClassItem[] {
  if (event === "DELETE") {
    const id = oldRow?.id as string;
    return state.classes.filter((c) => c.id !== id);
  }
  const row = newRow as { id: string; name: string; section: string | null };
  const existing = state.classes.find((c) => c.id === row.id);
  const updated: ClassItem = {
    id: row.id,
    name: row.name,
    section: row.section ?? undefined,
    displayName: displayName(row.name, row.section),
    studentCount: existing?.studentCount ?? 0,
  };
  if (event === "INSERT") return [...state.classes, updated];
  return state.classes.map((c) => (c.id === row.id ? updated : c));
}

function patchSubjects(
  state: AcademyBootstrapData,
  event: RealtimeEvent,
  newRow: Record<string, unknown> | null,
  oldRow: Record<string, unknown> | null,
): Subject[] {
  if (event === "DELETE") {
    const id = oldRow?.id as string;
    return state.subjects.filter((s) => s.id !== id);
  }
  const row = newRow as { id: string; name: string };
  const updated: Subject = { id: row.id, name: row.name };
  if (event === "INSERT") return [...state.subjects, updated];
  return state.subjects.map((s) => (s.id === row.id ? updated : s));
}

function patchStudents(
  state: AcademyBootstrapData,
  event: RealtimeEvent,
  newRow: Record<string, unknown> | null,
  oldRow: Record<string, unknown> | null,
): Student[] {
  if (event === "DELETE") {
    const id = oldRow?.id as string;
    return state.students.filter((s) => s.id !== id);
  }
  const row = newRow as {
    id: string;
    class_id: string;
    roll_number: number;
    name: string;
    father_name: string | null;
    phone: string | null;
    address: string | null;
    admission_date: string;
    monthly_fee: number | null;
    status: "active" | "inactive";
    teacher_remarks: string | null;
  };
  const cls = state.classes.find((c) => c.id === row.class_id);
  const existing = state.students.find((s) => s.id === row.id);

  const feeStatus: Student["feeStatus"] =
    row.monthly_fee == null
      ? "not_set"
      : existing && existing.feeStatus !== "not_set"
        ? existing.feeStatus
        : "unpaid";

  const updated: Student = {
    id: row.id,
    name: row.name,
    fatherName: row.father_name ?? "",
    rollNumber: row.roll_number,
    class: cls ? cls.displayName : "",
    classId: row.class_id,
    phone: row.phone ?? "",
    address: row.address ?? "",
    admissionDate: row.admission_date,
    monthlyFee: row.monthly_fee,
    feeStatus,
    status: row.status,
    teacherRemarks: row.teacher_remarks ?? undefined,
    avgScore: existing?.avgScore ?? 0,
    attendancePercent: existing?.attendancePercent ?? 0,
  };

  if (event === "INSERT") return [...state.students, updated];
  return state.students.map((s) => (s.id === row.id ? updated : s));
}

function patchTests(
  state: AcademyBootstrapData,
  event: RealtimeEvent,
  newRow: Record<string, unknown> | null,
  oldRow: Record<string, unknown> | null,
): Test[] {
  if (event === "DELETE") {
    const id = oldRow?.id as string;
    return state.tests.filter((t) => t.id !== id);
  }
  const row = newRow as {
    id: string;
    class_id: string;
    subject_id: string;
    name: string;
    date: string;
    total_marks: number;
  };
  const cls = state.classes.find((c) => c.id === row.class_id);
  const subject = state.subjects.find((s) => s.id === row.subject_id);
  const existing = state.tests.find((t) => t.id === row.id);

  const updated: Test = {
    id: row.id,
    name: row.name,
    subject: subject?.name ?? "",
    subjectId: row.subject_id,
    class: cls ? cls.displayName : "",
    classId: row.class_id,
    date: row.date,
    totalMarks: row.total_marks,
    marksEntered: existing?.marksEntered ?? 0,
    totalStudents: cls?.studentCount ?? existing?.totalStudents ?? 0,
  };

  if (event === "INSERT") return [...state.tests, updated];
  return state.tests.map((t) => (t.id === row.id ? updated : t));
}

function patchNotifications(
  state: AcademyBootstrapData,
  event: RealtimeEvent,
  newRow: Record<string, unknown> | null,
  oldRow: Record<string, unknown> | null,
): Notification[] {
  // Bootstrap only ever loads is_resolved = false, so a row flipping to
  // resolved is treated as a removal, matching what the query would return.
  if (event === "DELETE") {
    const id = oldRow?.id as string;
    return state.notifications.filter((n) => n.id !== id);
  }
  const row = newRow as {
    id: string;
    type: string;
    student_id: string | null;
    message: string;
    is_resolved: boolean;
    created_at: string;
  };
  if (row.is_resolved) {
    return state.notifications.filter((n) => n.id !== row.id);
  }
  const student = row.student_id
    ? state.students.find((s) => s.id === row.student_id)
    : undefined;
  const updated: Notification = {
    id: row.id,
    type: row.type,
    message: row.message,
    studentName: student?.name ?? "",
    studentId: row.student_id ?? undefined,
    class: student?.class ?? "",
    createdAt: row.created_at,
    isResolved: row.is_resolved,
  };
  const exists = state.notifications.some((n) => n.id === row.id);
  if (!exists) return [updated, ...state.notifications];
  return state.notifications.map((n) => (n.id === row.id ? updated : n));
}
