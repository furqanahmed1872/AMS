"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  DollarSign,
  Edit,
  MapPin,
  Phone,
  Share2,
  TrendingUp,
  User,
  UserMinus,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  getStudentAttendanceByMonth,
  getStudentFeeHistory,
  getStudentTestScores,
  updateStudentAction,
  type AttendanceByMonth,
  type FeeHistoryRow,
  type ScoreBySubject,
} from "@/lib/students/actions";
import { StudentCombinedCard } from "@/components/templates/share/StudentCombinedCard";
import { shareElementAsImage } from "@/lib/export/utils";
import { formatCurrency, formatDate } from "@/lib/utils";

// ─── Pure helpers (no hooks, no side-effects) ─────────────────────────────────

function scoreColorClass(pct: number): string {
  if (pct >= 75) return "text-emerald-400";
  if (pct >= 50) return "text-brand-400";
  if (pct >= 33) return "text-amber-400";
  return "text-rose-400";
}

function attendanceColorClass(pct: number): string {
  if (pct >= 80) return "text-emerald-400";
  if (pct >= 60) return "text-amber-400";
  return "text-rose-400";
}

function scoreHex(pct: number): string {
  if (pct >= 75) return "#4ade80";
  if (pct >= 50) return "#818cf8";
  if (pct >= 33) return "#fbbf24";
  return "#f87171";
}

function attendanceHex(pct: number): string {
  if (pct >= 80) return "#4ade80";
  if (pct >= 60) return "#fbbf24";
  return "#f87171";
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PerfTab = "scores" | "attendance";
type ActiveModal = "perf" | "fee" | null;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Scrollable cross-table: rows = subjects, columns = test names */
function ScoresTable({
  scores,
  avgScore,
}: {
  scores: ScoreBySubject[];
  avgScore: number;
}) {
  const allTestNames = useMemo(
    () =>
      Array.from(new Set(scores.flatMap((s) => s.tests.map((t) => t.name)))),
    [scores],
  );

  if (scores.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-white/30">
        No test results yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="min-w-[100px] whitespace-nowrap border-b border-r border-white/8 bg-surface-2 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
              Subject
            </th>
            {allTestNames.map((name) => (
              <th
                key={name}
                className="min-w-[72px] whitespace-nowrap border-b border-white/8 bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white/40"
              >
                {name}
              </th>
            ))}
            <th className="min-w-[60px] whitespace-nowrap border-b border-l border-white/8 bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white/40">
              Avg %
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {scores.map((s) => {
            const testMap = new Map(s.tests.map((t) => [t.name, t]));
            const ob = s.tests.reduce((a, t) => a + t.obtained, 0);
            const tot = s.tests.reduce((a, t) => a + t.total, 0);
            const avg = tot > 0 ? Math.round((ob / tot) * 100) : 0;

            return (
              <tr
                key={s.subject}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="whitespace-nowrap border-r border-white/8 px-3 py-2.5 font-medium text-white/80">
                  {s.subject}
                </td>
                {allTestNames.map((name) => {
                  const t = testMap.get(name);
                  if (!t)
                    return (
                      <td
                        key={name}
                        className="px-3 py-2.5 text-center text-white/20"
                      >
                        —
                      </td>
                    );
                  const pct =
                    t.total > 0 ? Math.round((t.obtained / t.total) * 100) : 0;
                  return (
                    <td key={name} className="px-3 py-2.5 text-center">
                      <span className="font-semibold text-white/80">
                        {t.obtained}
                      </span>
                      <span className="text-[10px] text-white/30">
                        /{t.total}
                      </span>
                      <br />
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: scoreHex(pct) }}
                      >
                        {pct}%
                      </span>
                    </td>
                  );
                })}
                <td className="border-l border-white/8 px-3 py-2.5 text-center">
                  <span
                    className="text-sm font-bold"
                    style={{ color: scoreHex(avg) }}
                  >
                    {avg}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="border-t-2 border-white/10 bg-surface-2">
            <td className="border-r border-white/8 px-3 py-2.5 text-xs font-semibold text-white/50">
              Overall
            </td>
            {allTestNames.map((name) => {
              let ob = 0,
                tot = 0;
              for (const s of scores) {
                const t = s.tests.find((t) => t.name === name);
                if (t) {
                  ob += t.obtained;
                  tot += t.total;
                }
              }
              const pct = tot > 0 ? Math.round((ob / tot) * 100) : null;
              return (
                <td key={name} className="px-3 py-2.5 text-center">
                  {pct !== null ? (
                    <span
                      className="text-xs font-bold"
                      style={{ color: scoreHex(pct) }}
                    >
                      {pct}%
                    </span>
                  ) : (
                    <span className="text-xs text-white/20">—</span>
                  )}
                </td>
              );
            })}
            <td className="border-l border-white/8 px-3 py-2.5 text-center">
              <span
                className="text-sm font-bold"
                style={{ color: scoreHex(avgScore) }}
              >
                {avgScore}%
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Cross-table: rows = Present/Absent/Days/%, columns = months */
function AttendanceTable({
  attendance,
  attendancePercent,
}: {
  attendance: AttendanceByMonth[];
  attendancePercent: number;
}) {
  if (attendance.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-white/30">
        No attendance records yet.
      </p>
    );
  }

  const totalPresent = attendance.reduce((s, m) => s + m.present, 0);
  const totalAbsent = attendance.reduce((s, m) => s + m.absent, 0);
  const totalDays = totalPresent + totalAbsent;

  // Shorten "January 2025" → "Jan '25"
  const shortLabel = (m: string) =>
    m.replace(/^(\w{3})\w*\s(\d{2})(\d{2})$/, "$1 '$3") || m.slice(0, 7);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="min-w-[80px] whitespace-nowrap border-b border-r border-white/8 bg-surface-2 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white/40" />
            {attendance.map((m) => (
              <th
                key={m.month}
                className="min-w-[56px] whitespace-nowrap border-b border-white/8 bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white/40"
              >
                {shortLabel(m.month)}
              </th>
            ))}
            <th className="min-w-[56px] whitespace-nowrap border-b border-l border-white/8 bg-surface-2 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white/40">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {/* Present */}
          <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
            <td className="whitespace-nowrap border-r border-white/8 px-3 py-3 text-xs font-semibold text-emerald-400">
              Present
            </td>
            {attendance.map((m) => (
              <td
                key={m.month}
                className="px-3 py-3 text-center font-semibold text-emerald-400"
              >
                {m.present}
              </td>
            ))}
            <td className="border-l border-white/8 px-3 py-3 text-center font-bold text-emerald-400">
              {totalPresent}
            </td>
          </tr>

          {/* Absent */}
          <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
            <td className="whitespace-nowrap border-r border-white/8 px-3 py-3 text-xs font-semibold text-rose-400">
              Absent
            </td>
            {attendance.map((m) => (
              <td
                key={m.month}
                className="px-3 py-3 text-center font-semibold text-rose-400"
              >
                {m.absent}
              </td>
            ))}
            <td className="border-l border-white/8 px-3 py-3 text-center font-bold text-rose-400">
              {totalAbsent}
            </td>
          </tr>

          {/* Total days */}
          <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
            <td className="whitespace-nowrap border-r border-white/8 px-3 py-3 text-xs font-semibold text-white/40">
              Days
            </td>
            {attendance.map((m) => (
              <td key={m.month} className="px-3 py-3 text-center text-white/50">
                {m.present + m.absent}
              </td>
            ))}
            <td className="border-l border-white/8 px-3 py-3 text-center font-bold text-white/50">
              {totalDays}
            </td>
          </tr>

          {/* Percentage */}
          <tr className="transition-colors hover:bg-white/[0.02]">
            <td className="whitespace-nowrap border-r border-white/8 px-3 py-3 text-xs font-semibold text-white/40">
              %
            </td>
            {attendance.map((m) => {
              const total = m.present + m.absent;
              const pct = total > 0 ? Math.round((m.present / total) * 100) : 0;
              return (
                <td key={m.month} className="px-3 py-3 text-center">
                  <span
                    className="text-sm font-bold"
                    style={{ color: attendanceHex(pct) }}
                  >
                    {pct}%
                  </span>
                </td>
              );
            })}
            <td className="border-l border-white/8 px-3 py-3 text-center">
              <span
                className="text-sm font-bold"
                style={{ color: attendanceHex(attendancePercent) }}
              >
                {attendancePercent}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** Fee history table */
function FeeTable({ feeHistory }: { feeHistory: FeeHistoryRow[] }) {
  if (feeHistory.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-white/30">
        No fee records yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-2">
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
              Month
            </th>
            <th className="w-28 px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-white/40">
              Amount
            </th>
            <th className="w-20 px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-white/40">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {feeHistory.map(({ month, due, status }) => (
            <tr key={month} className="transition-colors hover:bg-white/[0.02]">
              <td className="px-3 py-2.5 text-white/80">{month}</td>
              <td className="px-3 py-2.5 text-right text-white/60">
                {formatCurrency(due)}
              </td>
              <td className="px-3 py-2.5 text-right">
                <Badge variant={status}>
                  {status === "paid" ? "Paid" : "Unpaid"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const router = useRouter();
  const { role, students, academyName } = useAcademyData();
  const student = students.find((s) => s.id === id);

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [perfTab, setPerfTab] = useState<PerfTab>("scores");

  // ── Data state ────────────────────────────────────────────────────────────────
  const [scores, setScores] = useState<ScoreBySubject[] | null>(null);
  const [attendance, setAttendance] = useState<AttendanceByMonth[] | null>(
    null,
  );
  const [feeHistory, setFeeHistory] = useState<FeeHistoryRow[] | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // ── Action state ──────────────────────────────────────────────────────────────
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [sharing, setSharing] = useState(false);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const openPerfModal = useCallback(
    async (tab: PerfTab) => {
      setPerfTab(tab);
      setActiveModal("perf");
      if (scores && attendance) return;
      setModalLoading(true);
      const [s, a] = await Promise.all([
        scores ?? getStudentTestScores(id),
        attendance ?? getStudentAttendanceByMonth(id),
      ]);
      setScores(s);
      setAttendance(a);
      setModalLoading(false);
    },
    [id, scores, attendance],
  );

  const openFeeModal = useCallback(async () => {
    setActiveModal("fee");
    if (feeHistory) return;
    setModalLoading(true);
    setFeeHistory(await getStudentFeeHistory(id));
    setModalLoading(false);
  }, [id, feeHistory]);

  const closeModal = useCallback(() => setActiveModal(null), []);

  const handleShare = useCallback(async () => {
    if (!student) return;
    setSharing(true);
    const [s, a] = await Promise.all([
      scores ?? getStudentTestScores(id),
      attendance ?? getStudentAttendanceByMonth(id),
    ]);
    setScores(s);
    setAttendance(a);
    // Let React flush the state update so the hidden card re-renders with data
    await new Promise((r) => setTimeout(r, 80));
    await shareElementAsImage(
      "student-combined-share-card",
      `${student.name} — ${student.class}\nAvg Score: ${student.avgScore}% · Attendance: ${student.attendancePercent}%\n\nShared via Academy Management System`,
    );
    setSharing(false);
  }, [id, student, scores, attendance]);

  const handleDeactivate = useCallback(async () => {
    if (!student) return;
    setIsDeactivating(true);
    await updateStudentAction(id, {
      name: student.name,
      fatherName: student.fatherName,
      classId: student.classId,
      rollNumber: String(student.rollNumber),
      monthlyFee: String(student.monthlyFee ?? ""),
      admissionDate: student.admissionDate,
      phone: student.phone,
      address: student.address,
      teacherRemarks: student.teacherRemarks ?? "",
      status: "inactive",
    });
    setIsDeactivating(false);
    setShowDeactivate(false);
    router.refresh();
  }, [id, student, router]);

  // ── Guard ─────────────────────────────────────────────────────────────────────

  if (!student) {
    return (
      <div className="py-20 text-center text-white/40">
        Student not found.{" "}
        <Link href="/app/students" className="text-brand-400 hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const sColorClass = scoreColorClass(student.avgScore);
  const aColorClass = attendanceColorClass(student.attendancePercent);

  const profileFields = [
    {
      icon: <User size={14} />,
      label: "Father's Name",
      value: student.fatherName || "—",
    },
    { icon: <Phone size={14} />, label: "Phone", value: student.phone || "—" },
    {
      icon: <MapPin size={14} />,
      label: "Address",
      value: student.address || "—",
    },
    {
      icon: <BookOpen size={14} />,
      label: "Teacher Remarks",
      value: student.teacherRemarks || "No remarks",
    },
    ...(role === "admin" && student.monthlyFee
      ? [
          {
            icon: <DollarSign size={14} />,
            label: "Monthly Fee",
            value: formatCurrency(student.monthlyFee),
          },
        ]
      : []),
  ];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in space-y-4 pb-10">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <PageHeader
        title={student.name}
        subtitle={`${student.class} · Roll #${student.rollNumber}`}
        back={
          <Link href="/app/students">
            <button className="cursor-pointer rounded-xl p-2 transition-colors hover:bg-white/8">
              <ArrowLeft size={18} />
            </button>
          </Link>
        }
        actions={
          <div className="flex items-center gap-2">
            {role === "admin" && student.status === "active" && (
              <Button
                variant="ghost"
                size="sm"
                icon={<UserMinus size={14} />}
                onClick={() => setShowDeactivate(true)}
              >
                Deactivate
              </Button>
            )}
            <Link href={`/app/students/${id}/analytics`}>
              <Button variant="ghost" size="sm" icon={<BarChart3 size={14} />}>
                Analytics
              </Button>
            </Link>
            <Link href={`/app/students/${id}/edit`}>
              <Button variant="secondary" size="sm" icon={<Edit size={14} />}>
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* ── Identity card ─────────────────────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <Avatar name={student.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white">{student.name}</h2>
              <Badge
                variant={student.status === "active" ? "active" : "inactive"}
              >
                {student.status}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-white/50">
              {student.class} · Roll #{student.rollNumber}
            </p>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-xs text-white/40">Admitted</p>
            <p className="text-sm text-white/70">
              {formatDate(student.admissionDate)}
            </p>
          </div>
        </div>
      </Card>

      {/* ── Summary cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Performance card */}
        <Card
          hover
          className="cursor-pointer p-4"
          onClick={() => openPerfModal("scores")}
        >
          {/* Header row */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              Performance
            </span>
            <span className="text-[10px] text-brand-400/70">View →</span>
          </div>

          {/* Metrics — stacked so neither overflows on narrow cards */}
          <div className="flex flex-col gap-3">
            {/* Avg Score */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10">
                <TrendingUp size={14} className="text-brand-400" />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xl font-bold font-display leading-none ${sColorClass}`}
                >
                  {student.avgScore}%
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[10px] text-white/40">
                  Avg. Score
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-white/8" />

            {/* Attendance */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                <CalendarDays size={14} className="text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xl font-bold font-display leading-none ${aColorClass}`}
                >
                  {student.attendancePercent}%
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[10px] text-white/40">
                  Attendance
                </p>
              </div>
            </div>
          </div>

          {/* Share row */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 border-t border-white/6 pt-3 text-[10px] text-white/30 transition-colors hover:text-brand-400"
          >
            {sharing ? (
              <span className="text-brand-400">Sharing…</span>
            ) : (
              <>
                <Share2 size={11} />
                Share via WhatsApp
              </>
            )}
          </button>
        </Card>

        {/* Fee status card */}
        <Card
          hover={role === "admin" && student.feeStatus !== "not_set"}
          className={
            role === "admin" && student.feeStatus !== "not_set"
              ? "cursor-pointer p-4"
              : "p-4"
          }
          onClick={() =>
            role === "admin" &&
            student.feeStatus !== "not_set" &&
            openFeeModal()
          }
        >
          <div className="flex h-full flex-col items-center justify-center gap-1 py-2">
            <div
              className="mb-1 flex h-9 w-9 items-center justify-center rounded-xl"
              style={{
                background:
                  student.feeStatus === "paid"
                    ? "rgba(52,211,153,0.12)"
                    : student.feeStatus === "not_set"
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(248,113,113,0.12)",
              }}
            >
              <DollarSign
                size={15}
                className={
                  student.feeStatus === "paid"
                    ? "text-emerald-400"
                    : student.feeStatus === "not_set"
                      ? "text-white/30"
                      : "text-rose-400"
                }
              />
            </div>
            <p
              className={`font-display text-sm font-bold ${
                student.feeStatus === "paid"
                  ? "text-emerald-400"
                  : student.feeStatus === "not_set"
                    ? "text-white/40"
                    : "text-rose-400"
              }`}
            >
              {student.feeStatus === "not_set"
                ? "Not Set"
                : student.feeStatus === "paid"
                  ? "Paid"
                  : "Unpaid"}
            </p>
            <p className="text-[10px] text-white/40">Fee Status</p>
          </div>
        </Card>
      </div>

      {/* ── Profile details ───────────────────────────────────────────────────── */}
      <Card className="p-5">
        <h3 className="section-title mb-4">Profile Details</h3>
        <div className="space-y-0">
          {profileFields.map(({ icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-3 border-b border-white/5 py-3 last:border-0"
            >
              <span className="mt-0.5 text-white/30">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">{label}</p>
                <p className="mt-0.5 text-sm text-white/80">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ══ PERFORMANCE MODAL ════════════════════════════════════════════════ */}
      <Modal
        isOpen={activeModal === "perf"}
        onClose={closeModal}
        title="Performance Details"
        size="lg"
      >
        {/* Tab switcher */}
        <div className="mb-5 flex gap-1 rounded-xl bg-surface-2 p-1">
          {(["scores", "attendance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setPerfTab(tab)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                perfTab === tab
                  ? "bg-brand-500 text-white shadow-sm"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {tab === "scores" ? "Test Scores" : "Attendance"}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="max-h-[58vh] overflow-y-auto rounded-xl border border-white/8">
          {modalLoading ? (
            <p className="py-12 text-center text-sm text-white/30">Loading…</p>
          ) : perfTab === "scores" ? (
            <ScoresTable scores={scores ?? []} avgScore={student.avgScore} />
          ) : (
            <AttendanceTable
              attendance={attendance ?? []}
              attendancePercent={student.attendancePercent}
            />
          )}
        </div>

        {/* Share CTA */}
        <div className="mt-4 border-t border-white/8 pt-4">
          <Button
            variant="secondary"
            className="w-full"
            icon={<Share2 size={14} />}
            loading={sharing}
            onClick={handleShare}
          >
            Share via WhatsApp
          </Button>
        </div>
      </Modal>

      {/* ══ FEE HISTORY MODAL ════════════════════════════════════════════════ */}
      {role === "admin" && (
        <Modal
          isOpen={activeModal === "fee"}
          onClose={closeModal}
          title="Fee History"
          size="md"
        >
          {modalLoading || !feeHistory ? (
            <p className="py-10 text-center text-sm text-white/30">Loading…</p>
          ) : (
            <FeeTable feeHistory={feeHistory} />
          )}
        </Modal>
      )}

      {/* ══ DEACTIVATE CONFIRM ═══════════════════════════════════════════════ */}
      <ConfirmDialog
        isOpen={showDeactivate}
        onClose={() => setShowDeactivate(false)}
        onConfirm={handleDeactivate}
        loading={isDeactivating}
        title="Deactivate Student"
        message={`This will mark ${student.name} as inactive. They will no longer appear in attendance, fees, or active student lists. You can reactivate them from the Edit page at any time.`}
        confirmLabel="Deactivate"
        danger
      />

      {/* ══ HIDDEN WHATSAPP SHARE CARD (off-screen, html2canvas target) ══════ */}
      <StudentCombinedCard
        academyName={academyName}
        studentName={student.name}
        className={student.class}
        rollNumber={student.rollNumber}
        avgScore={student.avgScore}
        attendancePercent={student.attendancePercent}
        scores={scores ?? []}
        months={attendance ?? []}
      />
    </div>
  );
}
