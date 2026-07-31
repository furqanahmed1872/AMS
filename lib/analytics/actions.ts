"use server";

import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/server";
import { isAllBranches, type BranchScope } from "@/lib/branches/types";
import type {
  AdminAnalytics,
  BranchPerformance,
  ClassPerformance,
  CollectionTrendPoint,
  TrendPoint,
} from "./types";

const MONTH_WINDOW = 12;

const monthKey = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

const monthLabel = (year: number, month: number) =>
  new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });

/** Ordered list of the last N months, oldest first. */
function recentMonths(count: number): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return out;
}

const pct = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/** Column/value pair spread into `.match()` on every branch-aware query. */
function branchFilter(
  academyId: string,
  branchId: BranchScope,
): Record<string, string> {
  return isAllBranches(branchId)
    ? { academy_id: academyId }
    : { academy_id: academyId, branch_id: branchId as string };
}

/**
 * Owner-level analytics. Read-only aggregation over existing tables —
 * no writes, no new views. Admin only; teachers get an empty payload.
 */
export async function getAdminAnalytics(): Promise<AdminAnalytics | null> {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;

  const supabase = createServiceClient();
  const academyId = session.academyId;
  const branchId: BranchScope = session.branchId ?? "all";

  const scope = branchFilter(academyId, branchId);
  const months = recentMonths(MONTH_WINDOW);
  const windowStart = new Date(months[0].year, months[0].month - 1, 1)
    .toISOString()
    .split("T")[0];

  const [
    branchesRes,
    classesRes,
    studentsRes,
    feeRes,
    attendanceRes,
    testResultsRes,
    testsRes,
  ] = await Promise.all([
    supabase
      .from("branches")
      .select("id, name")
      .eq("academy_id", academyId)
      .order("is_primary", { ascending: false })
      .order("name"),
    supabase
      .from("classes")
      .select("id, name, section, branch_id")
      .match(scope),
    supabase
      .from("students")
      .select("id, class_id, branch_id, status, admission_date")
      .match(scope),
    supabase
      .from("fee_records")
      .select("month, year, amount_due, status, branch_id")
      .match(scope),
    supabase
      .from("attendance_records")
      .select("date, status, student_id, class_id, branch_id")
      .match(scope)
      .gte("date", windowStart),
    supabase
      .from("test_results")
      .select("test_id, student_id, marks_obtained, is_absent, branch_id")
      .match(scope),
    supabase
      .from("tests")
      .select("id, class_id, total_marks, branch_id")
      .match(scope),
  ]);

  const branches = branchesRes.data ?? [];
  const classes = classesRes.data ?? [];
  const students = studentsRes.data ?? [];
  const fees = feeRes.data ?? [];
  const attendance = attendanceRes.data ?? [];
  const testResults = testResultsRes.data ?? [];
  const tests = testsRes.data ?? [];

  // ---------- Collection trend ----------
  const feeByMonth = new Map<string, { collected: number; due: number }>();
  for (const f of fees) {
    const k = monthKey(f.year, f.month);
    const bucket = feeByMonth.get(k) ?? { collected: 0, due: 0 };
    const amt = Number(f.amount_due) || 0;
    if (f.status === "paid") bucket.collected += amt;
    else bucket.due += amt;
    feeByMonth.set(k, bucket);
  }

  const collectionTrend: CollectionTrendPoint[] = months.map(
    ({ year, month }) => {
      const k = monthKey(year, month);
      const b = feeByMonth.get(k) ?? { collected: 0, due: 0 };
      return {
        key: k,
        label: monthLabel(year, month),
        collected: b.collected,
        due: b.due,
        value: pct(b.collected, b.collected + b.due),
      };
    },
  );

  // ---------- Attendance trend ----------
  const attByMonth = new Map<string, { present: number; total: number }>();
  for (const a of attendance) {
    const d = new Date(a.date);
    const k = monthKey(d.getFullYear(), d.getMonth() + 1);
    const b = attByMonth.get(k) ?? { present: 0, total: 0 };
    b.total += 1;
    if (a.status === "P") b.present += 1;
    attByMonth.set(k, b);
  }

  const attendanceTrend: TrendPoint[] = months.map(({ year, month }) => {
    const k = monthKey(year, month);
    const b = attByMonth.get(k) ?? { present: 0, total: 0 };
    return {
      key: k,
      label: monthLabel(year, month),
      value: pct(b.present, b.total),
    };
  });

  // ---------- Enrollment trend (cumulative active headcount) ----------
  const enrollmentTrend: TrendPoint[] = months.map(({ year, month }) => {
    const cutoff = new Date(year, month, 0); // last day of that month
    const count = students.filter(
      (s) => s.status === "active" && new Date(s.admission_date) <= cutoff,
    ).length;
    return {
      key: monthKey(year, month),
      label: monthLabel(year, month),
      value: count,
    };
  });

  // ---------- Per-student score / attendance maps ----------
  const totalMarksByTest = new Map(
    tests.map((t) => [t.id, Number(t.total_marks) || 0]),
  );
  const classByTest = new Map(tests.map((t) => [t.id, t.class_id]));

  const scoreByStudent = new Map<string, { obtained: number; total: number }>();
  for (const r of testResults) {
    if (r.is_absent || r.marks_obtained == null) continue;
    const total = totalMarksByTest.get(r.test_id) ?? 0;
    if (!total) continue;
    const b = scoreByStudent.get(r.student_id) ?? { obtained: 0, total: 0 };
    b.obtained += Number(r.marks_obtained);
    b.total += total;
    scoreByStudent.set(r.student_id, b);
  }

  const attByStudent = new Map<string, { present: number; total: number }>();
  for (const a of attendance) {
    const b = attByStudent.get(a.student_id) ?? { present: 0, total: 0 };
    b.total += 1;
    if (a.status === "P") b.present += 1;
    attByStudent.set(a.student_id, b);
  }

  const averageOf = (
    ids: string[],
    map: Map<string, { obtained?: number; present?: number; total: number }>,
    numeratorKey: "obtained" | "present",
  ) => {
    let num = 0;
    let den = 0;
    for (const id of ids) {
      const b = map.get(id);
      if (!b) continue;
      num += b[numeratorKey] ?? 0;
      den += b.total;
    }
    return pct(num, den);
  };

  // ---------- Branch performance ----------
  const branchPerformance: BranchPerformance[] = branches
    .filter((b) => isAllBranches(branchId) || b.id === branchId)
    .map((b) => {
      const branchStudents = students.filter(
        (s) => s.branch_id === b.id && s.status === "active",
      );
      const ids = branchStudents.map((s) => s.id);
      const branchFees = fees.filter((f) => f.branch_id === b.id);
      const collected = branchFees
        .filter((f) => f.status === "paid")
        .reduce((sum, f) => sum + (Number(f.amount_due) || 0), 0);
      const due = branchFees
        .filter((f) => f.status === "unpaid")
        .reduce((sum, f) => sum + (Number(f.amount_due) || 0), 0);

      return {
        branchId: b.id,
        branchName: b.name,
        activeStudents: branchStudents.length,
        collectionRate: pct(collected, collected + due),
        attendancePercent: averageOf(ids, attByStudent, "present"),
        avgScore: averageOf(ids, scoreByStudent, "obtained"),
        collected,
        due,
      };
    });

  // ---------- Class performance ----------
  const studentsByClass = new Map<string, string[]>();
  for (const s of students) {
    if (s.status !== "active") continue;
    const list = studentsByClass.get(s.class_id) ?? [];
    list.push(s.id);
    studentsByClass.set(s.class_id, list);
  }

  const classPerformance: ClassPerformance[] = classes
    .map((c) => {
      const ids = studentsByClass.get(c.id) ?? [];
      return {
        classId: c.id,
        className: c.section ? `${c.name} ${c.section}` : c.name,
        studentCount: ids.length,
        attendancePercent: averageOf(ids, attByStudent, "present"),
        avgScore: averageOf(ids, scoreByStudent, "obtained"),
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);

  // Keep classByTest referenced for future per-class test drilldowns
  void classByTest;

  // ---------- Totals ----------
  const lifetimeCollected = fees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + (Number(f.amount_due) || 0), 0);
  const outstanding = fees
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + (Number(f.amount_due) || 0), 0);

  const monthsWithFees = collectionTrend.filter((m) => m.collected + m.due > 0);
  const monthsWithAtt = attendanceTrend.filter((m) => m.value > 0);

  return {
    collectionTrend,
    attendanceTrend,
    enrollmentTrend,
    branchPerformance,
    classPerformance,
    totals: {
      lifetimeCollected,
      outstanding,
      avgCollectionRate: monthsWithFees.length
        ? Math.round(
            monthsWithFees.reduce((s, m) => s + m.value, 0) /
              monthsWithFees.length,
          )
        : 0,
      avgAttendance: monthsWithAtt.length
        ? Math.round(
            monthsWithAtt.reduce((s, m) => s + m.value, 0) /
              monthsWithAtt.length,
          )
        : 0,
    },
  };
}
