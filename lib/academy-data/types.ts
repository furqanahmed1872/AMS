// Mirrors the interfaces in lib/dummy-data.ts on purpose — these are the
// shapes every page already renders against. Once a page is wired to
// useAcademyData(), its dummy-data import can be deleted.

import type { Branch, BranchScope } from "@/lib/branches/types";

export type Role = "admin" | "teacher";

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  rollNumber: number;
  class: string; // display name, e.g. "10th Blue"
  classId: string;
  phone: string;
  address: string;
  admissionDate: string;
  monthlyFee: number | null;
  feeStatus: "paid" | "unpaid" | "not_set";
  status: "active" | "inactive";
  teacherRemarks?: string;
  avgScore: number; // derived — PRD §11.2
  attendancePercent: number; // derived — PRD §11.2
  branchId: string | null;
}

export interface ClassItem {
  id: string;
  name: string;
  section?: string;
  displayName: string;
  studentCount: number; // derived
  branchId: string | null;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Test {
  id: string;
  name: string;
  subject: string;
  subjectId: string;
  class: string;
  classId: string;
  date: string;
  totalMarks: number;
  marksEntered: number; // derived
  totalStudents: number; // derived
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  studentName: string;
  studentId?: string;
  class: string;
  createdAt: string;
  isResolved: boolean;
}

export interface DashboardStats {
  activeStudents: number;
  totalClasses: number;
  totalTests: number;
  collectedThisMonth: number;
  dueThisMonth: number;
  classesAttendanceTakenToday: number;
}

// Today's attendance tally, academy-wide — backs the "Today's Attendance"
// card on the Dashboard. Was hardcoded (89/18/5) in the dummy UI.
export interface TodaysAttendance {
  present: number;
  absent: number;
  leave: number;
}

export interface AcademyBootstrapData {
  branches: Branch[];
  classes: ClassItem[];
  subjects: Subject[];
  students: Student[];
  tests: Test[];
  notifications: Notification[];
  dashboardStats: DashboardStats;
  todaysAttendance: TodaysAttendance;
}

// What the React context actually exposes: bootstrap data + session info.
export interface AcademyContextValue extends AcademyBootstrapData {
  role: Role;
  academyId: string;
  academyName: string;
  /** Branch the current session is scoped to — "all" means academy-wide. */
  branchId: BranchScope;
}
